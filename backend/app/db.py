import uuid
from datetime import datetime, timedelta, timezone

from supabase import Client, create_client

from app.config import settings


def get_supabase_client() -> Client:
    if not settings.supabase_url or not settings.supabase_key:
        raise RuntimeError('Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_KEY in your environment.')
    return create_client(settings.supabase_url, settings.supabase_key)


def normalize_status(status: str | None) -> str | None:
    if status is None:
        return None
    valid = {'Submitted', 'Under Review', 'In Progress', 'Resolved'}
    return status if status in valid else None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def upload_photo_to_supabase(file_obj, file_name: str, bucket_name: str | None = None) -> str:
    client = get_supabase_client()
    bucket = bucket_name or settings.supabase_bucket
    object_path = f'complaints/{uuid.uuid4().hex}_{file_name}'
    file_bytes = file_obj.read()
    file_obj.seek(0)

    client.storage.from_(bucket).upload(
        path=object_path,
        file=file_bytes,
        file_options={'content-type': file_obj.content_type or 'application/octet-stream'},
    )
    public_url = client.storage.from_(bucket).get_public_url(object_path)
    return public_url


def get_recent_nearby_complaints(issue_type: str, latitude: float, longitude: float, hours: int = 168) -> list[dict]:
    client = get_supabase_client()
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    rows = client.table('complaints').select('*').eq('issue_type', issue_type).gte('created_at', cutoff).execute()
    items = rows.data if rows and getattr(rows, 'data', None) else []
    return [item for item in items if haversine_km(latitude, longitude, float(item['latitude']), float(item['longitude'])) <= 0.1]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import asin, cos, radians, sin, sqrt

    radius_km = 6371.0
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lon2 - lon1)
    a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
    return 2 * radius_km * asin(sqrt(a))


def insert_complaint(record: dict) -> dict:
    client = get_supabase_client()
    result = client.table('complaints').insert(record).execute()
    if not result.data:
        raise RuntimeError('Complaint could not be stored.')
    return result.data[0]


def append_status_history(complaint_id: str, status: str, changed_by: str = 'system') -> dict:
    client = get_supabase_client()
    result = client.table('status_history').insert({
        'complaint_id': complaint_id,
        'status': status,
        'changed_by': changed_by,
        'changed_at': datetime.now(timezone.utc).isoformat(),
    }).execute()
    if not result.data:
        raise RuntimeError('Status history could not be recorded.')
    return result.data[0]


def fetch_complaints(status: str | None = None, issue_type: str | None = None, search: str | None = None, limit: int = 50, offset: int = 0) -> list[dict]:
    client = get_supabase_client()
    query = client.table('complaints').select('*').order('created_at', desc=True)

    if status:
        query = query.eq('status', status)
    if issue_type:
        query = query.eq('issue_type', issue_type)

    rows = query.execute()
    items = rows.data if rows and getattr(rows, 'data', None) else []

    if search:
        term = search.lower()
        items = [item for item in items if term in (item.get('description', '') + ' ' + item.get('address', '')).lower()]

    return items[offset:offset + limit]


def fetch_complaint_by_id(complaint_id: str) -> dict | None:
    client = get_supabase_client()
    rows = client.table('complaints').select('*').eq('id', complaint_id).limit(1).execute()
    items = rows.data if rows and getattr(rows, 'data', None) else []
    return items[0] if items else None


def fetch_status_history(complaint_id: str) -> list[dict]:
    client = get_supabase_client()
    rows = client.table('status_history').select('*').eq('complaint_id', complaint_id).order('changed_at', desc=False).execute()
    return rows.data if rows and getattr(rows, 'data', None) else []


def update_complaint_status(complaint_id: str, status: str, changed_by: str) -> dict:
    client = get_supabase_client()
    result = client.table('complaints').update({'status': status}).eq('id', complaint_id).execute()
    if not result.data:
        raise RuntimeError('Complaint was not found.')
    return result.data[0]


def fetch_stats() -> dict:
    client = get_supabase_client()
    rows = client.table('complaints').select('*').execute()
    items = rows.data if rows and getattr(rows, 'data', None) else []

    by_status = {}
    by_category = {}
    by_priority = {}

    for item in items:
        status = item.get('status', 'Submitted')
        category = item.get('issue_type', 'other')
        ai = item.get('ai') or {}
        priority = ai.get('priority_level', 'Low')

        by_status[status] = by_status.get(status, 0) + 1
        by_category[category] = by_category.get(category, 0) + 1
        by_priority[priority] = by_priority.get(priority, 0) + 1

    return {
        'total': len(items),
        'by_status': by_status,
        'by_category': by_category,
        'by_priority_level': by_priority,
    }


def fetch_hotspots() -> list[dict]:
    client = get_supabase_client()
    rows = client.table('complaints').select('*').execute()
    items = rows.data if rows and getattr(rows, 'data', None) else []
    clusters: dict[tuple[str, float, float], dict] = {}

    for item in items:
        category = item.get('issue_type', 'other')
        rounded_lat = round(float(item['latitude']), 3)
        rounded_lng = round(float(item['longitude']), 3)
        key = (category, rounded_lat, rounded_lng)
        cluster = clusters.setdefault(key, {'category': category, 'lat_bucket': rounded_lat, 'lng_bucket': rounded_lng, 'count': 0})
        cluster['count'] += 1

    output = []
    for cluster in clusters.values():
        output.append({
            'category': cluster['category'],
            'lat_bucket': cluster['lat_bucket'],
            'lng_bucket': cluster['lng_bucket'],
            'count': cluster['count'],
            'center_latitude': cluster['lat_bucket'],
            'center_longitude': cluster['lng_bucket'],
        })

    return sorted(output, key=lambda item: (-item['count'], item['category']))
