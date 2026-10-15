# Calendar App

A standalone microservice for managing calendar events, built to work with the EDITH AI orchestrator.

## Features

- ✅ Create, read, update, and delete events
- ✅ Support for event types (meeting, exam, appointment, etc.)
- ✅ Recurring events (yearly, monthly, weekly)
- ✅ Event notes and timestamps
- ✅ Simple REST API

## Quick Start

### Requirements

- Python 3.12+
- Docker + Docker Compose (optional, for containerized runs)

### Setup

```bash
git clone https://github.com/Luissoares11/calendar-app
cd calendar-service
```

Create a `.env` file in the repository root (see [Environment Variables](#environment-variables)).

### Environment Variables

```env
CALENDAR_API_TOKEN=your_secret_token
TIMEZONE=Europe/Lisbon
DATABASE_PATH=data/calendar.db
```

`CALENDAR_API_TOKEN` is also baked into the frontend bundle at build time, so the browser sends it with each request.

### Running Locally (Python)

The backend serves the API only. To serve the UI too, build `frontend/` and set `FRONTEND_DIR` to its `dist/` folder.

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn server.main:app --host 0.0.0.0 --port 8010
```

For frontend development, run the Vite dev server in `frontend/` alongside the backend. It proxies `/events`, `/auth` and `/health` to `localhost:8010`. The UI shows a login page; enter the value of `CALENDAR_API_TOKEN` to get a session cookie. Set `COOKIE_SECURE=true` when serving over HTTPS.

### Running Locally (Docker)

From the repository root:

```bash
docker compose build
docker compose up -d
```

The image builds the frontend and serves it from the same port as the API, at http://localhost:8010. The port is bound to `127.0.0.1` only, so the app is reachable from the server itself, not from the network. To access it from other devices, publish it with Tailscale serve:

```bash
sudo tailscale serve --bg --https=8444 http://127.0.0.1:8010
```

Use a free HTTPS port (check with `sudo ss -tlnp`). Do not use `tailscale funnel` or `tailscale serve reset`, since these affect other apps on the machine.

## API Reference

### Base URL

```
http://localhost:8010
```

### Authentication

All endpoints (except `/health`) require a Bearer token:

```
Authorization: Bearer <CALENDAR_API_TOKEN>
```

### Endpoints

#### `GET /health`

Health check (no auth required).

**Response:**

```json
{
  "status": "ok",
  "service": "calendar"
}
```

#### `POST /events`

Create a new event.

**Request:**

```json
{
  "action": "add",
  "title": "University Meeting",
  "type": "meeting",
  "date": "2026-09-05",
  "time": "14:30",
  "notes": "Discuss project plans",
  "recurrence": "none"
}
```

**Response:**

```json
{
  "success": true,
  "event_id": "uuid-here",
  "message": "Added 💼 Meeting 'University Meeting' on 05 Sep at 14:30."
}
```

#### `GET /events?list=true&days=30`

List upcoming events.

**Query Parameters:**

- `list=true` — Required. Enable listing.
- `days=30` — Look ahead this many days (default: 30).
- `past=true` — Show past events instead of upcoming.
- `all=true` — Show all events (ignores date filters).

**Response:**

```json
{
  "success": true,
  "events": [
    {
      "id": "event-uuid",
      "title": "University Meeting",
      "type": "meeting",
      "type_label": "💼 Meeting",
      "start_time": "2026-09-05T14:30:00+01:00",
      "end_time": "2026-09-05T15:30:00+01:00",
      "notes": "Discuss project plans",
      "recurrence": null,
      "created_at": "2026-09-04T10:00:00"
    }
  ],
  "total": 1,
  "message": "Found 1 event(s)."
}
```

#### `POST /events/edit`

Update an existing event. You can update any combination of fields: title, date, time, description (notes), or event type.

**Request (minimal - update description only):**

```json
{
  "action": "edit",
  "title": "University Meeting",
  "new_notes": "Updated description for the meeting"
}
```

**Request (full - update multiple fields):**

```json
{
  "action": "edit",
  "title": "University Meeting",
  "new_title": "Updated Meeting",
  "new_date": "2026-09-06",
  "new_time": "15:00",
  "new_notes": "Discuss project plans and budget",
  "new_type": "meeting"
}
```

**Available Fields to Update:**

- `new_title` — Update event title (optional)
- `new_date` — Update event date (optional, formats: `DD/MM/YYYY`, `YYYY-MM-DD`)
- `new_time` — Update event time (optional, format: `HH:MM`)
- `new_notes` — Update event description (optional)
- `new_type` — Update event type (optional, see [Event Types](#event-types))

**Response:**

```json
{
  "success": true,
  "message": "Updated event 'Updated Meeting'."
}
```

#### `POST /events/delete`

Delete an event by title (fuzzy match).

**Request:**

```json
{
  "action": "delete",
  "title": "University Meeting"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Removed event 'University Meeting'."
}
```

## Common Use Cases

### Editing Event Descriptions

Update the description/notes of an existing event:

```json
{
  "action": "edit",
  "title": "Team Standup",
  "new_notes": "Daily sync: discuss blockers and plan day"
}
```

### Updating Multiple Fields

Change the date, time, and description at once:

```json
{
  "action": "edit",
  "title": "Project Deadline",
  "new_date": "2026-10-15",
  "new_time": "17:00",
  "new_notes": "Final submission for Q4 project"
}
```

### Changing Event Type

Update the event type with a new emoji:

```json
{
  "action": "edit",
  "title": "Doctor Checkup",
  "new_type": "appointment",
  "new_notes": "Annual physical examination"
}
```

## Event Types

Supported event types (with emoji):

- `exam` — 🎓 Exam
- `appointment` — 🏥 Appointment
- `birthday` — 🎂 Birthday
- `meeting` — 💼 Meeting
- `deadline` — ⚠️ Deadline
- `other` — 📅 Event

## Date Formats

Supported date formats:

- `DD/MM/YYYY` (e.g., `05/09/2026`)
- `YYYY-MM-DD` (e.g., `2026-09-05`)
- `DD-MM-YYYY` (e.g., `05-09-2026`)

Time format: `HH:MM` (e.g., `14:30`)

## Development

### Running Tests

```bash
pytest tests/ -v
```

All tests pass ✅ (10/10)

Tests cover:
- ✅ `created_at` field in event responses
- ✅ Monthly recurrence calculation
- ✅ Leap year handling for Feb 29
- ✅ Event CRUD operations
- ✅ Integration workflows

### Project Structure

```
calendar-service/
├── backend/
│   ├── app/
│   │   ├── database.py      # SQLite setup & connection
│   │   ├── utils.py         # Helper functions
│   │   ├── models.py        # Pydantic models
│   │   └── features/
│   │       └── calendar.py  # Calendar business logic
│   ├── server/
│   │   ├── main.py          # FastAPI app
│   │   ├── auth.py          # Token verification
│   │   └── routers/
│   │       └── events.py    # Event endpoints
│   ├── tests/
│   ├── Dockerfile           # Builds the frontend and runs the backend
│   └── requirements.txt
├── frontend/                # React + Vite UI (built into the backend image)
├── .github/workflows/       # CI
├── docker-compose.yml
├── .env
└── README.md
```

## Future Work

- [ ] Event reminders and notifications
- [ ] Recurring event exceptions (skip specific occurrences)
- [ ] Event attachments/links

## License

MIT
