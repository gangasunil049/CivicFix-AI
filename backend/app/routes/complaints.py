from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError

from app.db import (
    append_status_history,
    fetch_complaint_by_id,
    fetch_complaints,
    fetch_hotspots,
    fetch_stats,
    fetch_status_history,
    get_recent_nearby_complaints,
    haversine_km,
    insert_complaint,
    normalize_status,
    now_iso,
    update_complaint_status,
    upload_photo_to_supabase,
)
from app.models import ComplaintCreate, ComplaintRecord, ComplaintStatusUpdate, ComplaintStatus
from app.services.ai_service import analyze_complaint
from app.services.exif_service import extract_exif_details

router = APIRouter(prefix='/complaints', tags=['Complaints'])


def format_complaint(record: dict) -> dict:
    ai = record.get('ai') or {}
    if not isinstance(ai, dict):
        ai = {}
    complaint = {
        'id': str(record.get('id')),
        'issue_type': record.get('issue_type', 'other'),
        'description': record.get('description', ''),
        'photo_url': record.get('photo_url'),
        'latitude': float(record.get('latitude', 0.0)),
        'longitude': float(record.get('longitude', 0.0)),
        'address': record.get('address', ''),
        'location_source': record.get('location_source', 'manual_pin'),
        'status': record.get('status', 'Submitted'),
        'created_at': record.get('created_at') or now_iso(),
        'ai': {
            'category': ai.get('category', 'Other'),
            'confidence': float(ai.get('confidence', 0.0)),
            'priority_score': int(ai.get('priority_score', 0)),
            'priority_level': ai.get('priority_level', 'Low'),
            'explanation': ai.get('explanation', 'AI analysis unavailable.'),
            'is_uncertain': bool(ai.get('is_uncertain', False)),
            'possible_duplicate_of': ai.get('possible_duplicate_of'),
            'related_issues': ai.get('related_issues', []) or [],
        }
    }
    return complaint


def validate_image(file: UploadFile | None) -> None:
    if file is None:
        return
    if file.content_type and 'image/' not in file.content_type:
        raise HTTPException(status_code=400, detail='Only image files are allowed.')
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail='Photo exceeds 10 MB limit.')


@router.get('/health', include_in_schema=False)
async def health() -> dict:
    return {'ok': True, 'service': 'civicfix-api'}


@router.post('', response_model=dict)
async def create_complaint(
    issue_type: Annotated[str, Form(...)],
    description: Annotated[str, Form(...)],
    latitude: Annotated[float, Form(...)],
    longitude: Annotated[float, Form(...)],
    address: Annotated[str, Form(...)],
    location_source: Annotated[str, Form(default='manual_pin')],
    photo: UploadFile | None = File(default=None),
):
    try:
        ComplaintCreate.model_validate({
            'issue_type': issue_type,
            'description': description,
            'latitude': latitude,
            'longitude': longitude,
            'address': address,
            'location_source': location_source,
        })
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc

    validate_image(photo)

    photo_url = None
    external_location_source = location_source

    if photo is not None:
        photo_bytes = await photo.read()
        if len(photo_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail='Photo exceeds 10 MB limit.')
        if photo.filename and not photo.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            raise HTTPException(status_code=400, detail='Unsupported image format.')
        try:
            uploaded = upload_photo_to_supabase(type('FileObj', (), {'read': lambda self: photo_bytes, 'content_type': photo.content_type or 'image/jpeg'})(), photo.filename or 'upload.jpg')
            photo_url = uploaded
        except Exception as exc:
            raise HTTPException(status_code=500, detail='Photo upload failed.') from exc

        exif_values = extract_exif_details(photo_bytes)
        if 'latitude' in exif_values and 'longitude' in exif_values:
            latitude = float(exif_values['latitude'])
            longitude = float(exif_values['longitude'])
            external_location_source = 'photo_exif'

    nearby = get_recent_nearby_complaints(issue_type, latitude, longitude)
    ai = analyze_complaint(description, issue_type, latitude, longitude, now_iso(), nearby)

    complaint_record = {
        'id': str(__import__('uuid').uuid4()),
        'issue_type': issue_type,
        'description': description,
        'photo_url': photo_url,
        'latitude': float(latitude),
        'longitude': float(longitude),
        'address': address,
        'location_source': external_location_source,
        'status': 'Submitted',
        'created_at': now_iso(),
        'ai': ai,
    }

    saved = insert_complaint(complaint_record)
    append_status_history(saved['id'], 'Submitted', 'citizen')
    return format_complaint(saved)


@router.get('', response_model=list[dict])
async def list_complaints(
    status: str | None = None,
    issue_type: str | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    items = fetch_complaints(status=status, issue_type=issue_type, search=search, limit=limit, offset=offset)
    return [format_complaint(item) for item in items]


@router.get('/{complaint_id}', response_model=dict)
async def get_complaint_by_id(complaint_id: str):
    complaint = fetch_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail='Complaint not found.')
    history = fetch_status_history(complaint_id)
    payload = format_complaint(complaint)
    payload['status_history'] = history
    return payload


@router.patch('/{complaint_id}/status', response_model=dict)
async def update_status(complaint_id: str, payload: ComplaintStatusUpdate):
    if payload.status not in {'Submitted', 'Under Review', 'In Progress', 'Resolved'}:
        raise HTTPException(status_code=400, detail='Invalid status value.')

    complaint = fetch_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail='Complaint not found.')

    updated = update_complaint_status(complaint_id, payload.status, payload.changed_by)
    append_status_history(complaint_id, payload.status, payload.changed_by)
    return format_complaint(updated)


@router.get('/stats', response_model=dict)
async def complaint_stats():
    return fetch_stats()


@router.get('/hotspots', response_model=list[dict])
async def complaint_hotspots():
    return fetch_hotspots()
