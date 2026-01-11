# PIPELINES.md

## Processing pipelines and state machines

### 1. Voice note pipeline

#### 1.1 States

- UPLOADED: audio stored, metadata persisted
- TRANSCRIBING: job enqueued, worker processing
- TRANSCRIBED: transcript stored
- EXTRACTING: worker calling extractor provider
- NEEDS_REVIEW: draft JSON available, awaiting user confirmation
- READY: events applied to trades successfully
- FAILED: terminal error (with retry allowed)

#### 1.2 Jobs

- VOICE_NOTE_TRANSCRIBE(voiceNoteId)
- VOICE_NOTE_EXTRACT(voiceNoteId)
- APPLY_DRAFT_EVENTS(voiceNoteId) (triggered by user confirmation)
- RECOMPUTE_RISK(tradingAccountId, dateRange)

#### 1.3 Idempotency rules

- Every job must be safe under retries.
- Each stage checks current state before proceeding.
- Event application must dedupe by (voiceNoteId, eventIndex) or explicit event_dedupe_key.

#### 1.4 Failure handling

- STT failure: mark FAILED with error_code, allow retry.
- Extraction failure: mark FAILED, allow retry.
- Validation failure: keep NEEDS_REVIEW with missingFields populated, require user edits.

### 2. Rules image pipeline

#### 2.1 Flow

- Upload rules screenshot, store in MinIO, link to RuleSet draft
- OCR (optional), store raw OCR text
- Convert OCR text to RuleSet JSON draft (optional), require user confirmation, create new RuleSet version

#### 2.2 Important constraint

- OCR and extraction are prefill only.
- User confirmation is mandatory.

### 3. Risk computation pipeline

#### 3.1 Inputs

- RuleSet assigned to account
- TradeEvents and derived realized PnL
- DailySnapshot baseline if configured

#### 3.2 Computation variants

- Static drawdown: limits based on initial balance and start-of-day balance
- Trailing drawdown: limits based on peak equity and trailing rules

#### 3.3 Outputs

Per account:

- daily_used_amount
- daily_remaining_amount
- overall_used_amount
- overall_remaining_amount
- status: SAFE, WARNING, CRITICAL, BREACH
- explanation: ruleId and reason

#### 3.4 Trigger points

- When events are confirmed and appended
- When daily snapshot baseline is created or updated
- When ruleset or phase changes
