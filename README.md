# CivicFix AI

CivicFix AI is a civic issue reporting frontend for a 24-hour hackathon. It lets citizens report infrastructure problems, review issue summaries, and understand AI-assisted classification and prioritisation.

## Tech stack

- React + Vite
- Tailwind CSS
- React Router
- React Leaflet + OpenStreetMap
- Lucide React
- Mock API layer designed to be replaced later with a real backend

## Quick start

1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Open the local Vite URL in the browser.

## Environment variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=true
```

- Set `VITE_USE_MOCK=true` to use the in-memory mock API.
- Set `VITE_USE_MOCK=false` to point at a live backend using the same API contract.

## Mock vs real backend

The API layer lives in `src/api/complaints.js` and exposes:

- `getComplaints()`
- `getComplaintById(id)`
- `createComplaint(formData)`

When mock mode is active, the frontend uses realistic sample complaints around Mangaluru, Karnataka. When real mode is active, it calls:

- `GET /complaints`
- `GET /complaints/{id}`
- `POST /complaints` using multipart form data

This boundary makes the frontend easy to swap to a real backend without changing the pages or components.

## Shared complaint data format

Use this exact contract for each complaint object:

```json
{
  "id": "string",
  "issue_type": "pothole | blocked_drain | garbage | broken_streetlight | water_leakage | other",
  "description": "string",
  "photo_url": "string | null",
  "latitude": 12.94,
  "longitude": 74.84,
  "address": "string",
  "status": "Submitted | Under Review | In Progress | Resolved",
  "created_at": "ISO date string",
  "ai": {
    "category": "string",
    "confidence": 0.9,
    "priority_score": 80,
    "priority_level": "Low | Medium | High | Critical",
    "explanation": "string",
    "is_uncertain": false,
    "possible_duplicate_of": "string | null",
    "related_issues": ["string"]
  }
}
```

## Project structure

- `src/api/complaints.js` — backend abstraction and mock data
- `src/components` — reusable UI pieces like badges, map, cards, and form blocks
- `src/pages` — home, report, complaints, and detail views
- `src/App.jsx` — router and application shell
- `src/index.css` — Tailwind and global styles

## Notes for the hackathon

- The app is mobile-first and responsive.
- The report form includes map-based location picking and browser geolocation.
- The mock AI logic generates classifications, confidence levels, and priorities for rapid demos.
- The app is designed so future backend integration only requires updating the API layer.
