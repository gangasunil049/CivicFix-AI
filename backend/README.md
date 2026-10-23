# CivicFix AI Backend

A FastAPI backend for the CivicFix AI civic issue reporting platform. It validates incoming complaints, uploads photos to Supabase Storage, extracts GPS metadata from images, runs AI prioritisation with a safe fallback, and stores the complaint data in Supabase.

## Requirements

- Python 3.11+
- A Supabase project with Postgres enabled
- A public Storage bucket named `complaint-photos`

## Setup

1. Create a virtual environment:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy the sample config:

```bash
cp .env.example .env
```

4. Fill in your Supabase values in `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-or-service-role-key
SUPABASE_BUCKET=complaint-photos
FRONTEND_ORIGIN=http://localhost:5173
```

5. Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. Open the docs:

- http://localhost:8000/docs
- http://localhost:8000/redoc

## Supabase schema

Run the SQL in `backend/schema.sql` inside the Supabase SQL editor.

## Seed sample data

```bash
python seed.py
```

## API endpoints

### Health

```bash
curl http://localhost:8000/health
```

### Create a complaint

```bash
curl -X POST http://localhost:8000/complaints \
  -F "issue_type=pothole" \
  -F "description=Large pothole outside the school gate with a deep crack." \
  -F "latitude=12.8746" \
  -F "longitude=74.8460" \
  -F "address=Hampankatta, Mangaluru, Karnataka" \
  -F "location_source=manual_pin" \
  -F "photo=@/path/to/image.jpg"
```

### List complaints

```bash
curl "http://localhost:8000/complaints?status=Submitted&issue_type=pothole&limit=10&offset=0"
```

### Get one complaint

```bash
curl http://localhost:8000/complaints/{complaint_id}
```

### Update complaint status

```bash
curl -X PATCH http://localhost:8000/complaints/{complaint_id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress","changed_by":"ward-admin"}'
```

### Stats

```bash
curl http://localhost:8000/complaints/stats
```

### Hotspots

```bash
curl http://localhost:8000/complaints/hotspots
```

### Search by filters

```bash
curl "http://localhost:8000/complaints?search=drain&limit=20"
```

## Notes

- Photos are limited to 10 MB and must be valid image files.
- GPS metadata is extracted from EXIF if available; otherwise the form coordinates are kept.
- The AI service tries to import `ai_engine` first and automatically falls back to a safe mock model if it fails.
- The frontend CORS origin is configured for `http://localhost:5173` and `*` for quick local development.
