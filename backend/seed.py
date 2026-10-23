from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

sample_complaints = [
    {
        'issue_type': 'pothole',
        'description': 'Large pothole near Hampankatta bus stop causing scooter damage.',
        'photo_url': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
        'latitude': 12.8746,
        'longitude': 74.8460,
        'address': 'Hampankatta, Mangaluru, Karnataka',
        'location_source': 'manual_pin',
        'status': 'In Progress',
        'ai': { 'category': 'Pothole', 'confidence': 0.94, 'priority_score': 88, 'priority_level': 'High', 'explanation': 'Road damage near a busy bus stop creates a safety risk.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'blocked_drain',
        'description': 'Blocked drain near market road with stagnant rainwater.',
        'photo_url': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
        'latitude': 12.8924,
        'longitude': 74.8471,
        'address': 'Kankanady Market Road, Mangaluru',
        'location_source': 'device_gps',
        'status': 'Submitted',
        'ai': { 'category': 'Blocked Drain', 'confidence': 0.83, 'priority_score': 74, 'priority_level': 'Medium', 'explanation': 'Drain obstruction is causing pooling water and sanitation concern.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'garbage',
        'description': 'Overflowing garbage bin outside the school gate.',
        'photo_url': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b',
        'latitude': 12.8608,
        'longitude': 74.8404,
        'address': 'Pumpwell, Mangaluru, Karnataka',
        'location_source': 'device_gps',
        'status': 'Resolved',
        'ai': { 'category': 'Garbage', 'confidence': 0.96, 'priority_score': 62, 'priority_level': 'Medium', 'explanation': 'Overflowing waste bins were likely due to missed collection schedule.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'broken_streetlight',
        'description': 'Streetlight not working on the road divider near Kadri.',
        'photo_url': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
        'latitude': 12.8824,
        'longitude': 74.8442,
        'address': 'Kadri Road, Mangaluru',
        'location_source': 'manual_pin',
        'status': 'Under Review',
        'ai': { 'category': 'Broken Streetlight', 'confidence': 0.76, 'priority_score': 63, 'priority_level': 'Medium', 'explanation': 'Reported streetlight outage may reduce night visibility and safety.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'water_leakage',
        'description': 'Water leaking from a damaged pipe and pooling outside the gate.',
        'photo_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        'latitude': 12.9050,
        'longitude': 74.8503,
        'address': 'Balmatta, Mangaluru, Karnataka',
        'location_source': 'photo_exif',
        'status': 'In Progress',
        'ai': { 'category': 'Water Leakage', 'confidence': 0.89, 'priority_score': 83, 'priority_level': 'High', 'explanation': 'Continuous leakage indicates a utility line issue requiring immediate attention.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'garbage',
        'description': 'Open dumping by the drain near PVS Circle.',
        'photo_url': 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab',
        'latitude': 12.8932,
        'longitude': 74.8427,
        'address': 'PVS Circle, Mangaluru',
        'location_source': 'manual_pin',
        'status': 'Under Review',
        'ai': { 'category': 'Garbage', 'confidence': 0.78, 'priority_score': 71, 'priority_level': 'Medium', 'explanation': 'Waste disposal near a drain creates an environmental and sanitation risk.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'other',
        'description': 'Traffic sign board tilted near the junction.',
        'photo_url': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef',
        'latitude': 12.8669,
        'longitude': 74.8578,
        'address': 'Kulshekar Junction, Mangaluru',
        'location_source': 'manual_pin',
        'status': 'Submitted',
        'ai': { 'category': 'Road Safety Signage', 'confidence': 0.72, 'priority_score': 58, 'priority_level': 'Medium', 'explanation': 'Visibility issue affects traffic sign recognition at junction.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'blocked_drain',
        'description': 'Drain clogged by silt and leaves causing water backup.',
        'photo_url': 'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
        'latitude': 12.8780,
        'longitude': 74.8360,
        'address': 'Derebail Main Road, Mangaluru',
        'location_source': 'device_gps',
        'status': 'Resolved',
        'ai': { 'category': 'Blocked Drain', 'confidence': 0.93, 'priority_score': 76, 'priority_level': 'High', 'explanation': 'Standing water indicates a severe drain blockage requiring cleaning.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'water_leakage',
        'description': 'Pipe burst near the school leads to waterlogging.',
        'photo_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        'latitude': 12.8888,
        'longitude': 74.8509,
        'address': 'Near Ladyhill, Mangaluru',
        'location_source': 'manual_pin',
        'status': 'In Progress',
        'ai': { 'category': 'Water Leakage', 'confidence': 0.67, 'priority_score': 92, 'priority_level': 'Critical', 'explanation': 'Visible pipe burst with water pooling indicates an urgent utility issue.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'broken_streetlight',
        'description': 'Multiple streetlights are dark along the park road.',
        'photo_url': 'https://images.unsplash.com/photo-1500106061081-df3d3802bf98',
        'latitude': 12.8741,
        'longitude': 74.8386,
        'address': 'Panjimogaru Park Road, Mangaluru',
        'location_source': 'manual_pin',
        'status': 'Under Review',
        'ai': { 'category': 'Broken Streetlight', 'confidence': 0.59, 'priority_score': 64, 'priority_level': 'Medium', 'explanation': 'Streetlight outage is visible but may require field verification.', 'is_uncertain': True, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'pothole',
        'description': 'Road surface cracks on a residential curve after rain.',
        'photo_url': 'https://images.unsplash.com/photo-1534545883629-4d904daad1f4',
        'latitude': 12.8827,
        'longitude': 74.8355,
        'address': 'Gokarnanath Road, Mangaluru',
        'location_source': 'manual_pin',
        'status': 'Submitted',
        'ai': { 'category': 'Pothole', 'confidence': 0.58, 'priority_score': 55, 'priority_level': 'Low', 'explanation': 'Road defect is present but low certainty and may need inspection.', 'is_uncertain': True, 'possible_duplicate_of': None, 'related_issues': [] }
    },
    {
        'issue_type': 'garbage',
        'description': 'Open household waste dumped beside a vacant plot.',
        'photo_url': 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab',
        'latitude': 12.8755,
        'longitude': 74.8448,
        'address': 'Kulshekar, Mangaluru',
        'location_source': 'manual_pin',
        'status': 'Submitted',
        'ai': { 'category': 'Garbage', 'confidence': 0.81, 'priority_score': 67, 'priority_level': 'Medium', 'explanation': 'Waste near a public area creates sanitation and breeding risks.', 'is_uncertain': False, 'possible_duplicate_of': None, 'related_issues': [] }
    }
]


def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError('SUPABASE_URL and SUPABASE_KEY must be set in the environment.')

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    for item in sample_complaints:
        payload = {
            'id': str(uuid4()),
            'issue_type': item['issue_type'],
            'description': item['description'],
            'photo_url': item['photo_url'],
            'latitude': item['latitude'],
            'longitude': item['longitude'],
            'address': item['address'],
            'location_source': item['location_source'],
            'status': item['status'],
            'created_at': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            'ai': json.dumps(item['ai']) if isinstance(item['ai'], dict) else item['ai'],
        }
        client.table('complaints').insert(payload).execute()
    print(f'Inserted {len(sample_complaints)} sample complaints.')


if __name__ == '__main__':
    main()
