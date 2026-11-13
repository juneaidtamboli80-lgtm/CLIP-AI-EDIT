# ClipForge

Turn one long video into a week of vertical clips. ClipForge transcribes long-form
content, finds the moments worth posting, reframes them to 9:16 with speaker tracking,
and gives you a caption-first editor built for Shorts, Reels and TikTok.

> **Phase 1 status:** the full UI shell and the API contract are built. The pipeline
> (download → transcribe → highlight scoring → render) runs in **simulation mode**:
> the backend returns deterministic demo clips so the product can be exercised
> end-to-end without Whisper, yt-dlp or FFmpeg. Nothing in the UI pretends that real
> AI processing has happened.

---

## What is in the box

### Product UI

- **Dashboard** — usage stats, create card (YouTube link or file upload), live pipeline card, recent projects.
- **New project** — source selection, language/aspect/clip-length settings, summary, simulated processing overlay.
- **Projects library** — search, status filters, sorting, grid/list views, delete confirmation.
- **Project detail** — source player stand-in, transcript with search, scored clip cards.
- **Clip editor** — trim/split timeline, live 9:16 preview, 12 caption presets, full caption
  customisation, click-a-word correction, multi-language subtitles (burned/soft/dual),
  aspect/background/logo/music, silence removal, speed, intro/outro, undo/redo, auto-save,
  keyboard shortcuts.
- **Export dialog** — 720p/1080p, fps/bitrate, single or ZIP, real SRT/VTT download.
- **Templates** — workflow presets by content type.
- **Brand kit** — colors, fonts, logo monogram, watermark, default caption preset, live preview.
- **Settings** — profile, workspace defaults, processing, notifications, billing/usage, API keys, danger zone.
- **Global** — command palette (`⌘K` / `/`), dark/light theme, responsive sidebar, loading skeletons, 404.

### Backend

- FastAPI app with the full Phase 1 API surface.
- SQLAlchemy models for projects, clips, transcript cues and render jobs.
- SQLite by default; PostgreSQL ready via `DATABASE_URL`.
- Local storage abstraction with an S3-compatible adapter stub.
- Chunked upload endpoint that speaks the protocol already used by the frontend client.
- Celery app + task seams for `process_project` and `render_clip`.
- Seeded demo project so `GET /api/projects` is useful on first boot.

### Tooling

- Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, Framer Motion.
- Hand-built shadcn-style primitives (button, card, badge, input, dialog, tabs, switch, slider, progress, toast).
- Docker Compose with web, api, worker, Redis and PostgreSQL.
- Termux/Android compatibility patch for Next.js SWC (see [Termux notes](#termux--android)).

---

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Python 3.12+, FastAPI, SQLAlchemy 2, Pydantic v2 |
| Queue | Celery + Redis |
| Database | SQLite (dev) / PostgreSQL (Docker, production) |
| Media | FFmpeg, yt-dlp, faster-whisper (Phase 2+) |
| Storage | Local `/storage` with S3-ready abstraction |

---

## Repository layout

```text
clip-ai-edit/
├── frontend/                     # Next.js app
│   ├── app/                      # routes: dashboard, new, projects, editor, templates, brand-kit, settings
│   ├── components/
│   │   ├── ui/                   # design-system primitives
│   │   ├── layout/               # shell, sidebar, topbar, command palette
│   │   ├── dashboard/ new/ projects/ editor/ templates/ brand-kit/ settings/
│   ├── lib/                      # types, mock data, API client, caption presets, editor state
│   ├── scripts/patch-next-termux.mjs
│   └── Dockerfile
├── backend/                      # FastAPI app
│   ├── app/
│   │   ├── api/routes/           # health, projects, clips, subtitles
│   │   ├── services/             # simulated pipeline, subtitle formatting
│   │   ├── workers/              # Celery app + tasks
│   │   ├── config.py database.py models.py schemas.py storage.py main.py
│   ├── requirements.txt          # core API deps
│   ├── requirements-postgres.txt # psycopg for Docker
│   ├── requirements-ai.txt       # Phase 2+ heavy deps (optional)
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── package.json                  # convenience scripts
└── README.md
```

---

## Quick start (local)

### 1. Prerequisites

- Node.js 20+ and npm
- Python 3.11+ (3.12 recommended)
- Optional: Redis (only needed if you disable eager Celery)
- Optional for later phases: `ffmpeg`, `yt-dlp`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local        # optional; mock mode is the default
npm run dev
```

Open <http://localhost:3000>. The UI reads local mock data (`NEXT_PUBLIC_USE_MOCK=true`),
so it works without the backend.

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API docs: <http://localhost:8000/docs>
- Health: <http://localhost:8000/api/health>
- The database is created automatically at `backend/clipforge.db`, with one demo project.

### 4. Run both (two terminals)

```bash
# terminal 1 — from the repo root, with backend/.venv activated
npm run dev:api

# terminal 2
npm run dev:web
```

> The root `dev:api` script changes into `backend/` before starting uvicorn. Activate
> the virtualenv first (`source backend/.venv/bin/activate`) or call uvicorn directly
> with `backend/.venv/bin/python`.

### 5. Celery worker (optional in Phase 1)

Eager mode is on by default (`CELERY_TASK_ALWAYS_EAGER=true`), so projects are analysed
inline and Redis is not required. To exercise the queue:

```bash
redis-server                       # or: docker run -p 6379:6379 redis:7-alpine

# backend/.env
CELERY_TASK_ALWAYS_EAGER=false

# terminal 3
cd backend && celery -A app.workers.celery_app.celery_app worker --loglevel=info
```

---

## Docker Compose

```bash
docker compose up --build
```

| Service | URL / role |
| --- | --- |
| `web` | <http://localhost:3000> |
| `api` | <http://localhost:8000> · docs at `/docs` |
| `worker` | Celery worker (simulation mode) |
| `redis` | broker + result backend |
| `db` | PostgreSQL 16 |

The API and worker share the `media-data` volume at `/data`. Set
`SIMULATION_MODE=false` only after the real pipeline exists.

Stop and remove volumes:

```bash
docker compose down -v
```

---

## Environment variables

### Frontend (`frontend/.env.local`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI base URL |
| `NEXT_PUBLIC_USE_MOCK` | `true` | Phase 1 reads mock data; set `false` when pages are wired to the API |

### Backend (`backend/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./clipforge.db` | SQLAlchemy URL (PostgreSQL: `postgresql+psycopg://...`) |
| `STORAGE_BACKEND` | `local` | `local` or `s3` |
| `STORAGE_ROOT` | `./storage` | Local media root (mounted at `/media`) |
| `STORAGE_PUBLIC_URL` | `http://localhost:8000/media` | Public base URL for stored objects |
| `REDIS_URL` | `redis://localhost:6379/0` | Celery broker/backend |
| `CELERY_TASK_ALWAYS_EAGER` | `true` | Run tasks inline without Redis |
| `SIMULATION_MODE` | `true` | Deterministic demo analysis instead of real AI |
| `SEED_DEMO_DATA` | `true` | Insert a demo project on first boot |
| `MAX_UPLOAD_SIZE` | `2147483648` | 2 GB upload cap |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Comma-separated allowed origins |

See `backend/.env.example` for the full list, including S3 and LLM settings.

---

## API

All routes are prefixed with `/api`. Responses use camelCase to match the frontend types.

| Method | Endpoint | Status | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/health` | ✅ | Service status + simulation flag |
| `GET` | `/api/projects` | ✅ | List projects |
| `POST` | `/api/projects/youtube` | ✅ | Validate URL, create project, enqueue analysis |
| `POST` | `/api/projects/upload` | ✅ | Chunked upload + finalize (see below) |
| `GET` | `/api/projects/{id}` | ✅ | Project + clips + transcript |
| `DELETE` | `/api/projects/{id}` | ✅ | Delete project and stored source |
| `GET` | `/api/clips/{id}` | ✅ | Clip detail |
| `PATCH` | `/api/clips/{id}/edit` | ✅ | Trim, title, aspect, captions, arbitrary editor settings |
| `POST` | `/api/clips/{id}/render` | ✅ | Creates a render job (completes without media in Phase 1) |
| `GET` | `/api/clips/{id}/download` | ⚠️ | Returns `409` until FFmpeg export lands in Phase 6 |
| `POST` | `/api/subtitles/translate` | ✅ | SRT + VTT, marked `simulated: true` |

### Chunked upload protocol

`frontend/lib/api.ts` slices files into 5 MB chunks and posts multipart fields:

```text
uploadId, chunkIndex, totalChunks, filename, chunk   # per chunk
uploadId, filename, complete=true, totalChunks       # finalize
```

The API stores parts in the OS temp directory, verifies the total size, assembles the
file into storage, creates the project and enqueues analysis. The frontend UI currently
simulates progress; wiring it to this endpoint is part of Phase 2.

### Quick API smoke test

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/projects

curl -X POST http://localhost:8000/api/projects/youtube \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","aspectRatio":"9:16","clipLength":30}'
```

With eager Celery + simulation mode the project comes back `ready` with demo clips.

---

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` / `/` | Command palette |
| `N` | New project |
| `⌘⇧L` | Toggle theme |
| `Space` | Play/pause in the editor |
| `⌘Z` / `⌘⇧Z` | Undo / redo |
| `⌘S` | Save (editor auto-saves; brand kit saves explicitly) |
| `←` / `→` | Step the playhead |

---

## Termux / Android

Next.js 14 does not publish a native `@next/swc-android-arm64` binary, so a plain
`next build` fails on Termux. This repo handles it in two ways:

1. `next.config.mjs` enables `experimental.useWasmBinary` on Android.
2. `frontend/scripts/patch-next-termux.mjs` runs on `postinstall` and flips the default
   `loadBindings()` flag so worker entry points use the WASM fallback too.

The patch is a no-op on macOS/Linux/Windows. If you upgrade Next.js, re-run
`npm install` (or `node scripts/patch-next-termux.mjs`) and check the build.

Package scripts call Node directly (`node node_modules/next/dist/bin/next`) because
Termux does not provide `/usr/bin/env`, which breaks npm bin shebangs.

---

## Phase roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | UI shell, design system, editor UX, API contract, backend scaffold, Docker | ✅ Complete |
| 2 | YouTube import (yt-dlp metadata + download), chunked upload wiring, Whisper transcription (Hindi/English/Hinglish) | Next |
| 3 | LLM highlight detection with score + reason, clip grid wiring | Planned |
| 4 | Face-tracking 9:16 crop, caption burn-in, editor persistence | Planned |
| 5 | Translation, dual subtitles, SRT/VTT export | Planned |
| 6 | FFmpeg render pipeline, 720p/1080p export, ZIP bundles | Planned |

Each phase pauses for approval before the next one starts.

---

## Known limitations (Phase 1)

- The editor preview is a stylised CSS/SVG stand-in, not a decoded video frame.
- Export simulates rendering and only the SRT download is real.
- `POST /api/clips/{id}/render` completes without producing an MP4; `/download` returns `409` with an explicit message.
- `POST /api/subtitles/translate` prefixes text with the target language tag and sets `simulated: true`.
- Upload progress in the UI is simulated; the backend chunk protocol is functional but not yet wired to the dropzone.
- Authentication, billing and team permissions are UI-only placeholders.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Failed to load SWC binary for android/arm64` | Run `node scripts/patch-next-termux.mjs` from `frontend/`, then `npm run dev` |
| `tsc: not found` / `next: not found` | Use the package scripts (they invoke Node directly) or `node node_modules/...` |
| `Address already in use` | Change the port: `node node_modules/next/dist/bin/next dev -p 3001` |
| API starts but project stays `processing` | Check `SIMULATION_MODE=true` or start the Celery worker / set eager mode |
| `409` from `/download` | Expected in Phase 1 — rendering is simulated |
| SQLite `database is locked` under load | Use PostgreSQL (`docker compose`) or run the worker with concurrency 1 |
