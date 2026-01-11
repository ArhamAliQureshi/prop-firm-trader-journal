# SERVICES.md

## Docker services and responsibilities

### Required services (MVP)

#### 1. web

- Role: UI (React + Vite)
- Responsibilities:
  - voice recording and upload
  - confirmations (trade event drafts, rules drafts)
  - dashboards (risk matrix, ROI, analytics)
- External port: 3000

#### 2. api

- Role: REST API (NestJS)
- Responsibilities:
  - auth, authorization
  - CRUD for firms, rulesets, purchases, accounts, trades, events, payouts
  - upload initialization (presigned URL creation)
  - orchestration endpoints (complete upload, approve drafts)
  - dashboard queries
- External port: 4000

#### 3. worker

- Role: asynchronous processing
- Responsibilities:
  - voice note state machine progression
  - STT calls and transcript persistence
  - extraction calls and draft persistence
  - OCR jobs and rules draft generation (if enabled)
  - recompute aggregates and alerts
- External port: none

#### 4. postgres

- Role: structured data store
- Responsibilities:
  - authoritative storage for all entities
  - migrations managed by the codebase
- External port (optional): 5432

#### 5. redis

- Role: queue and coordination
- Responsibilities:
  - job queue
  - distributed locks (if needed)
  - rate limiting (optional)
- External port (optional): 6379

#### 6. minio

- Role: object storage
- Responsibilities:
  - audio files (voice notes)
  - images (rules screenshots)
  - future attachments
- External ports:
  - 9000 (S3 API)
  - 9001 (console)

#### 7. minio-init (one-shot)

- Role: bootstrap
- Responsibilities:
  - creates buckets and policies
- External port: none

### Optional services (enable as needed)

#### 8. stt

- Role: local speech-to-text (Whisper)
- Called by: worker
- Internal port: 8001

#### 9. ocr

- Role: local OCR (Tesseract or PaddleOCR)
- Called by: worker or api
- Internal port: 8002

#### 10. llm

- Role: local text-to-JSON extraction
- Called by: worker
- Internal port: 11434

#### 11. reverse-proxy (optional)

- Role: unified entrypoint
- Useful for:
  - mobile client on local network
  - consistent routing and CORS control
