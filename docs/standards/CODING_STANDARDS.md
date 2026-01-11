# CODING_STANDARDS.md

## Coding standards (project-wide)

### 1. TypeScript and schema validation

- TypeScript strict mode enabled.
- Zod is the source of truth for request and event payload validation.
- Types are inferred from Zod schemas, not duplicated manually.

### 2. API design

- REST endpoints under /v1.
- Consistent error shape:
  - { code, message, details?, requestId }
- Use pagination for list endpoints (limit, cursor or offset).
- All times stored as ISO timestamps in UTC.
- All money fields stored as integers in minor units (cents) or decimal with explicit precision, never float.

### 3. Domain rules

- trade_events append-only.
- Derived trade state is computed via projection logic, not direct mutation.
- RuleSet is versioned and immutable.
- Purchases are ledger-like; adjustments recorded separately.

### 4. Background jobs

- All jobs idempotent.
- Use explicit job names and payload schemas.
- Store job correlation IDs for tracing.
- Worker must check current VoiceNote status before executing stage.

### 5. Storage rules

- Audio and images stored in MinIO buckets:
  - voice-notes/
  - rules-images/
- Postgres stores only:
  - object_key
  - metadata (duration, content type, size)
- Implement retention policy as a configuration option.

### 6. Security

- Centralized auth guard in API.
- Resource-level authorization checks for all reads and writes.
- Validate upload ownership before issuing presigned URLs.
- Rate limit sensitive endpoints (login, upload init) if needed.

### 7. Testing

- Unit tests mandatory for:
  - risk calculations
  - rule variants (static vs trailing)
  - event projections
- Integration tests for:
  - creating trades and appending events
  - risk matrix endpoint correctness
- Worker tests for:
  - state machine transitions
  - retries and failure recovery

### 8. Logging and observability

- Structured logs with requestId and userId where available.
- Worker logs include voiceNoteId, job name, attempt.
- Errors must include actionable context and should not leak secrets.
