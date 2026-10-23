from __future__ import annotations

from datetime import datetime, timezone


def _priority_from_score(score: int) -> str:
    if score >= 85:
        return 'Critical'
    if score >= 70:
        return 'High'
    if score >= 40:
        return 'Medium'
    return 'Low'


def _mock_ai_result(description: str, issue_type: str, latitude: float, longitude: float, created_at: str, nearby_complaints: list[dict]) -> dict:
    text = (description or '').lower()
    keywords = {
        'pothole': ['pothole', 'road', 'crack', 'asphalt', 'bump'],
        'blocked_drain': ['drain', 'block', 'clog', 'water', 'stagnant', 'sewage'],
        'garbage': ['garbage', 'trash', 'waste', 'dump', 'litter', 'bin'],
        'broken_streetlight': ['streetlight', 'light', 'lamp', 'dark', 'pole'],
        'water_leakage': ['leak', 'pipe', 'water', 'burst', 'dripping', 'wet'],
        'other': ['sign', 'tree', 'traffic', 'danger', 'unsafe']
    }

    category = issue_type if issue_type in keywords else 'other'
    score = 0.65
    if any(word in text for word in keywords[category]):
        score += 0.2
    if nearby_complaints:
        score += 0.07
    if 'urgent' in text or 'burst' in text or 'deep' in text:
        score += 0.08

    score = min(score, 0.98)
    priority_score = int(round((score * 100) if category != 'other' else 62))
    explanation = 'The report is consistent with the selected category and surrounding local conditions.'

    if 'drain' in text and 'blocked' in text:
        explanation = 'Drain blockage is likely causing water buildup and drainage issues in the area.'
    elif 'pothole' in text or 'crack' in text:
        explanation = 'Road surface damage is visible and likely to affect traffic flow and pedestrian safety.'
    elif 'garbage' in text or 'trash' in text:
        explanation = 'Waste accumulation is visible and may be creating a public hygiene and sanitation risk.'
    elif 'light' in text or 'lamp' in text:
        explanation = 'The public lighting issue appears to reduce visibility and safety after dusk.'
    elif 'leak' in text or 'pipe' in text:
        explanation = 'A water utility problem is likely causing wastage or surface disruption.'

    duplicate_id = None
    related = []
    if nearby_complaints:
        duplicate_id = nearby_complaints[0].get('id')
        related = [item.get('id') for item in nearby_complaints[:3] if item.get('id')]

    return {
        'category': {
            'pothole': 'Pothole',
            'blocked_drain': 'Blocked Drain',
            'garbage': 'Garbage',
            'broken_streetlight': 'Broken Streetlight',
            'water_leakage': 'Water Leakage',
            'other': 'Other'
        }.get(category, 'Other'),
        'confidence': round(score, 2),
        'priority_score': priority_score,
        'priority_level': _priority_from_score(priority_score),
        'explanation': explanation,
        'is_uncertain': score < 0.6,
        'possible_duplicate_of': duplicate_id,
        'related_issues': related,
    }


def analyze_complaint(description: str, issue_type: str, latitude: float, longitude: float, created_at: str, nearby_complaints: list[dict]) -> dict:
    try:
        try:
            import ai_engine  # type: ignore
        except Exception:
            ai_engine = None

        if ai_engine is not None and hasattr(ai_engine, 'analyze_complaint'):
            result = ai_engine.analyze_complaint(
                description=description,
                issue_type=issue_type,
                latitude=latitude,
                longitude=longitude,
                created_at=created_at,
                nearby_complaints=nearby_complaints,
            )
            if isinstance(result, dict):
                normalized = dict(result)
                normalized.setdefault('category', 'Other')
                normalized.setdefault('confidence', 0.65)
                normalized.setdefault('priority_score', 50)
                normalized.setdefault('priority_level', 'Medium')
                normalized.setdefault('explanation', 'AI analysis completed successfully.')
                normalized.setdefault('is_uncertain', False)
                normalized.setdefault('possible_duplicate_of', None)
                normalized.setdefault('related_issues', [])
                if not 0 <= float(normalized.get('confidence', 0)) <= 1:
                    normalized['confidence'] = 0.65
                return normalized
    except Exception:
        pass

    fallback = _mock_ai_result(description, issue_type, latitude, longitude, created_at, nearby_complaints)
    fallback['explanation'] = fallback['explanation'] + ' AI fallback was used because the live service was unavailable.' if fallback['confidence'] >= 0.6 else 'Analysis was unavailable for this report and a fallback review was assigned.'
    if fallback['confidence'] < 0.6:
        fallback['is_uncertain'] = True
        fallback['explanation'] = 'Analysis was unavailable for this report and a cautious fallback review was assigned.'
    return fallback
