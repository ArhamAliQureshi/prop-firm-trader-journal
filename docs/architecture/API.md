# API.md

## REST API (v1)

### Conventions

- Base path: /v1
- Auth: JWT in httpOnly cookie (web) or Bearer token (optional)
- Idempotency header required on retryable writes:
  - Idempotency-Key: <uuid>
- All responses include requestId for debugging.

### 1. Auth

- POST /v1/auth/register
- POST /v1/auth/login
- POST /v1/auth/logout
- GET /v1/me

### 2. Prop firms

- GET /v1/prop-firms
- POST /v1/prop-firms
- GET /v1/prop-firms/:propFirmId
- PATCH /v1/prop-firms/:propFirmId

### 3. Challenge products

- GET /v1/challenge-products?propFirmId=...
- POST /v1/challenge-products
- GET /v1/challenge-products/:productId
- PATCH /v1/challenge-products/:productId

### 4. Rule sets (versioned)

- GET /v1/rule-sets?propFirmId=...&productId=...
- POST /v1/rule-sets
- GET /v1/rule-sets/:ruleSetId
- POST /v1/rule-sets/:ruleSetId/clone

### 5. Uploads (MinIO presigned URLs)

#### Rules image upload

- POST /v1/uploads/rules-image/init
  - body: { propFirmId, productId, fileName, contentType, sizeBytes }
  - returns: { uploadId, objectKey, presignedUrl }

- POST /v1/uploads/:uploadId/complete
  - returns: { linked: true }

#### Voice note upload

- POST /v1/voice-notes/init
  - body: { tradingAccountId, tradeId?, fileName, contentType, sizeBytes, durationMs, intentHint? }
  - returns: { voiceNoteId, objectKey, presignedUrl }

- POST /v1/voice-notes/:voiceNoteId/complete
  - returns: { status: "TRANSCRIBING" }

- GET /v1/voice-notes/:voiceNoteId
  - returns: status, transcript_text, extracted_draft_json, missingFields, error

- POST /v1/voice-notes/:voiceNoteId/retry

### 6. Purchases and accounts

- GET /v1/purchases?propFirmId=...
- POST /v1/purchases
- GET /v1/purchases/:purchaseId
- PATCH /v1/purchases/:purchaseId

- GET /v1/trading-accounts?propFirmId=...
- POST /v1/trading-accounts
- GET /v1/trading-accounts/:accountId
- PATCH /v1/trading-accounts/:accountId
- POST /v1/trading-accounts/:accountId/set-phase
- POST /v1/trading-accounts/:accountId/set-ruleset

### 7. Trades and events (event sourced)

- GET /v1/trades?tradingAccountId=...&status=open|closed&symbol=...&from=...&to=...
- POST /v1/trades
- GET /v1/trades/:tradeId
- PATCH /v1/trades/:tradeId
  - metadata only: tags, notes

- GET /v1/trades/:tradeId/events
- POST /v1/trades/:tradeId/events
  - body: { eventType, eventTime, payload, voiceNoteId? }

Optional helper:

- POST /v1/trade-events/resolve-target
  - body: { tradingAccountId, transcript, symbol? }
  - returns: candidates

### 8. Payouts and adjustments

- GET /v1/payouts?tradingAccountId=...&propFirmId=...
- POST /v1/payouts
- PATCH /v1/payouts/:payoutId

- GET /v1/adjustments?tradingAccountId=...&propFirmId=...
- POST /v1/adjustments

### 9. Risk and dashboards

- GET /v1/risk/matrix?propFirmId=...
- GET /v1/trading-accounts/:accountId/risk
- GET /v1/trading-accounts/:accountId/daily-snapshots?from=...&to=...
- POST /v1/trading-accounts/:accountId/daily-snapshots (optional)

### 10. ROI and analytics

- GET /v1/roi/summary?propFirmId=...
- GET /v1/analytics/performance?tradingAccountId=...&from=...&to=...&symbol=...&tag=...
- GET /v1/analytics/behavior?tradingAccountId=...&from=...&to=...

### 11. System

- GET /v1/health
- GET /v1/version
