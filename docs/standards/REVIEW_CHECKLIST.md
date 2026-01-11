# REVIEW_CHECKLIST.md

## Review checklist (non-negotiables)

### 1. Data integrity

- trade_events are append-only (no update, no delete).
- RuleSet is versioned and immutable once used.
- No audio blobs or images in Postgres, only object references.
- All writes validate Zod schemas server-side.
- Event payloads are schema-validated and versioned if needed.

### 2. Idempotency and reliability

- Retryable POST endpoints support Idempotency-Key.
- Worker jobs are idempotent and safe under retries.
- VoiceNote state transitions are valid and enforced (no illegal jumps).
- Background processing failures are visible and recoverable via retry.

### 3. Security

- Auth and authorization enforced on every endpoint.
- Multi-account scoping: user can only read/write their own data.
- No secrets committed; .env.example only.
- Upload URLs are short-lived presigned URLs and bound to objectKey.

### 4. Performance

- Queries used by dashboards have indexes.
- Avoid N+1 query patterns in list endpoints.
- Use pagination for list endpoints (trades, events, voice notes).

### 5. AI safety and correctness

- LLM output is treated as a draft only.
- Schema validation required before persistence.
- Confirmation UI required for applying extracted events.
- Ambiguity must trigger user selection, not silent guessing.

### 6. Testing expectations

- Unit tests for risk calculations and rule variants.
- Integration tests for event append and read projections.
- Worker job tests for state transitions and retries.
