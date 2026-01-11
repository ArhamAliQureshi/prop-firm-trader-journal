# ARCHITECTURE.md

## Prop Firm Trader Journal (Local-first, Voice-first, Rules-aware)

### 1. Architecture goals

- Local-first: runs on one machine via Docker Compose.
- Deterministic core: risk and ROI are reproducible from persisted data.
- Event-sourced trades: append-only trade events, trade state derived from events.
- AI assisted, not AI authoritative: AI outputs are drafts, user confirmation is required.
- Pluggable providers: STT, OCR, and LLM extraction can be swapped without redesign.

### 2. High-level system overview

The system is a local micro-stack composed of:

- Web UI (React): capture voice notes, manage prop rules, review extracted drafts, view risk matrix and ROI.
- API (NestJS): auth, core CRUD, presigned uploads, dashboards queries, orchestration endpoints.
- Worker: asynchronous pipeline execution and aggregation tasks.
- Postgres: source of truth for structured data.
- Redis: job queue and coordination.
- MinIO: object storage for audio and images.

Optional services:

- STT service: local Whisper inference.
- OCR service: local OCR for rules screenshots.
- Local LLM service: local text-to-JSON extraction (Ollama or llama.cpp).

### 3. Communication flows

#### 3.1 Voice note flow (happy path)

1. Web records audio and requests an upload ticket from API.
2. API returns a MinIO presigned URL.
3. Web uploads audio directly to MinIO.
4. Web calls API to mark upload complete.
5. API enqueues a job to Redis (VOICE_NOTE_TRANSCRIBE).
6. Worker pulls job, calls STT service, stores transcript in Postgres.
7. Worker calls Extractor provider (Local LLM or external if enabled) to produce draft events JSON.
8. Worker stores draft JSON in Postgres and sets status NEEDS_REVIEW.
9. Web shows transcript and event draft for user confirmation.
10. On approval, Web calls API to append TradeEvent(s), which triggers risk aggregation updates.

#### 3.2 Rules screenshot flow (prefill plus confirm)

1. Web uploads screenshot to MinIO via presigned URL.
2. API links screenshot to a RuleSet draft.
3. Worker runs OCR (optional) and stores extracted text.
4. Worker converts OCR text into RuleSet draft (optional LLM step).
5. Web shows a prefilled rule form, user confirms, and saves a new RuleSet version.

#### 3.3 Risk matrix computation flow

Risk is computed from:

- RuleSet assigned to each trading account
- Trades and trade_events
- Daily snapshots (optional)

The Worker maintains daily aggregates when events are appended. The API serves precomputed snapshots or computes on demand for smaller datasets.

### 4. Key invariants

- trade_events are append-only.
- RuleSet is versioned and immutable once assigned to an account.
- Audio and images never stored in Postgres (only object references).
- AI extraction results never persisted as final without schema validation and user confirmation.
- Job execution must be idempotent.

### 5. Operational model

- Single Docker Compose stack.
- Data persisted via volumes for Postgres and MinIO.
- Optional: export/import for migration and backup.
