# DATA_MODEL.md

## Data model and invariants

### 1. Core entities

#### User

- id
- email
- password_hash
- created_at

#### PropFirm

- id
- owner_user_id
- name
- notes
- created_at

#### ChallengeProduct

- id
- prop_firm_id
- name (e.g., "25K 2-Step")
- account_size (numeric)
- currency
- step_type (one_step, two_step)
- leverage (optional)
- created_at

#### RuleSet (versioned)

- id
- prop_firm_id
- challenge_product_id
- version (int, monotonically increasing)
- drawdown_type (static, trailing)
- daily_loss_pct
- daily_loss_basis (balance_start_of_day, equity_start_of_day, intraday_equity)
- overall_loss_pct
- overall_loss_basis (initial_balance, peak_equity, trailing_rule_specific)
- phases_json (JSONB: phase1, phase2, funded rules)
- source_image_object_key (optional)
- source_ocr_text (optional)
- created_at

Invariants:

- RuleSet is immutable after creation.
- Updates happen by cloning to a new version.

#### Purchase

- id
- prop_firm_id
- challenge_product_id
- purchase_date
- currency
- accounts_count
- fee_per_account
- total_fee_paid
- notes

Invariant:

- Purchases are treated as ledger inputs; corrections via Adjustment records.

#### TradingAccount

- id
- prop_firm_id
- challenge_product_id
- ruleset_id (assigned version)
- purchase_id
- nickname
- phase (phase1, phase2, funded)
- status (active, failed, passed, paused)
- initial_balance
- created_at

#### Trade

- id
- trading_account_id
- symbol
- opened_at
- closed_at (nullable)
- status (open, closed)
- tags (array or JSONB)
- notes

Invariant:

- Trade lifecycle state should be derived from events; status is a convenience projection.

#### TradeEvent (append-only)

- id
- trade_id
- trading_account_id
- event_time
- event_type:
  - OPENED
  - PARTIAL_TAKEN
  - ADDED_TO_POSITION
  - STOP_MOVED
  - BREAKEVEN_SET
  - TRAILING_ENABLED
  - TP_CHANGED
  - CLOSED
  - NOTE_ADDED
- payload JSONB (schema-validated)
- voice_note_id (nullable)
- created_at

Invariants:

- Append-only: never update or delete.
- Payload must pass Zod validation.
- Event must be idempotent (dedupe key) if created via async workflow.

#### VoiceNote

- id
- trading_account_id
- trade_id (nullable)
- object_key (MinIO path)
- duration_ms
- status:
  - UPLOADED
  - TRANSCRIBING
  - TRANSCRIBED
  - EXTRACTING
  - NEEDS_REVIEW
  - READY
  - FAILED
- transcript_text (nullable)
- extracted_draft_json (nullable)
- error_code, error_message (nullable)
- created_at

Invariant:

- object_key is the only reference to audio. Audio content is not stored in Postgres.

#### DailySnapshot (optional but recommended)

- id
- trading_account_id
- date (YYYY-MM-DD)
- start_of_day_balance
- start_of_day_equity (optional)
- realized_pnl
- unrealized_pnl (optional)
- end_of_day_balance (optional)
- computed_at

#### Payout

- id
- trading_account_id (nullable) or prop_firm_id depending on firm policy
- amount
- currency
- payout_date
- notes

#### Adjustment

- id
- trading_account_id (nullable)
- prop_firm_id
- type (reset_fee, retry_fee, add_on_fee, refund, other)
- amount (negative for refunds if preferred)
- currency
- date
- notes

### 2. Risk computation inputs

- RuleSet assigned to account
- TradeEvents and derived realized PnL
- DailySnapshot baseline if configured

### 3. Indexing guidance (minimum)

- trade_events: (trading_account_id, event_time)
- trades: (trading_account_id, status)
- voice_notes: (trading_account_id, created_at), (status)
- daily_snapshots: (trading_account_id, date)
- purchases: (prop_firm_id, purchase_date)
