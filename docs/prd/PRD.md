# Product Requirements Document (PRD)
## Prop Firm Trader Journal (Voice First, Rules Aware, ROI and Risk)

### Version
- v1.0 (Local-first MVP)

### Owner
- You

### Status
- Planning

---

## 1. Executive Summary
Build a TradeZella-like trading journal dedicated to prop firm traders, optimized for challenge rule compliance, risk monitoring, and fee ROI. The system is voice-first: traders dictate trades and trade management actions (partials, add-ons, breakeven, trailing stop, take profit changes). The app converts voice notes into structured trade events, calculates prop-rule proximity (daily drawdown, overall drawdown, trailing drawdown), and provides ROI and performance analytics per firm and per account.

Initial deployment is local-only via Docker to avoid ongoing costs. Web app first, later convertible to mobile using the same backend APIs.

---

## 2. Problem Statement
Prop firm traders often fail challenges due to rule violations and risk drift rather than lack of strategy. Existing journals are general-purpose and frequently assume broker integrations. Prop traders need:

- Rule-aware daily risk visibility (how close to breach, with explanations)
- Strong audit trail of trade management behavior (partials, BE moves, add-ons)
- Spend tracking and ROI on fees across multiple accounts and firms
- Low-friction capture, ideally voice-based, because manual journaling is abandoned quickly

---

## 3. Goals and Success Criteria

### 3.1 Goals
1. Voice-first trade journaling capturing the full trade lifecycle (not just entry and exit).
2. Prop-firm rules engine that flags breaches and near-breaches per account and per day.
3. Spend and payout tracking with ROI views by firm, product, and account.
4. Local-first deployment: Docker-only, minimal operational cost, data stored locally.

### 3.2 Success Criteria
- A trader can log an open trade and later log management actions via voice in under 30 seconds per action.
- The risk matrix accurately shows remaining daily and overall drawdown room for each account based on confirmed trade events.
- ROI dashboard shows total spend, payouts, net profit, and fee ROI per firm and overall.
- System runs fully locally and remains usable without internet (except optional external LLM provider if enabled).

---

## 4. Personas
1. **Solo Prop Trader**
   - Runs multiple accounts, needs daily guardrails, wants fast logging.

2. **Scaling Trader**
   - Manages several firms and products; needs consolidated ROI and rule monitoring.

3. **Review-driven Trader**
   - Wants analytics by setup, mistakes, and management behavior to improve discipline.

---

## 5. Scope

### 5.1 In Scope (MVP)
- Prop firms, challenge products, purchases, multiple accounts per purchase
- Rule sets per product and phase (Phase 1, Phase 2, Funded) with versioning
- Rules chart upload (image stored locally)
- Optional local OCR to prefill rules form; user confirmation is mandatory
- Trade lifecycle as append-only events:
  - OPENED, PARTIAL_TAKEN, ADDED_TO_POSITION, STOP_MOVED, TP_CHANGED, TRAILING_ENABLED, BREAKEVEN_SET, CLOSED, NOTE_ADDED
- Voice notes:
  - record, upload, local storage, transcription, extraction to JSON, confirmation UI
- Risk matrix:
  - daily drawdown remaining
  - overall drawdown remaining
  - trailing drawdown support if configured
  - breach and near-breach alerts
- ROI dashboard:
  - fees per firm and per account
  - payouts, adjustments, net profit
  - fee ROI by firm and overall
- Basic performance analytics:
  - win rate, expectancy, profit factor (based on logged trades)
  - tagging by setup, mistakes, session

### 5.2 Out of Scope (MVP)
- Broker connections and auto-import
- Automated live equity tracking from brokers
- Social features
- Advanced charting and trade replay
- Cloud hosting and multi-tenant SaaS

---

## 6. Assumptions and Constraints
- Local-only deployment with Docker Compose.
- Audio, screenshots, and all data stored locally (MinIO or mounted disk).
- Accuracy is enforced by confirmation workflow; AI does not persist final trade events without validation and user approval.
- LLM extraction provider is pluggable:
  - default: local LLM
  - optional: Gemini text-to-JSON if enabled
- Speech to text runs locally (Whisper family).
- Internet is optional; required only if an external extraction provider is enabled.

---

## 7. Functional Requirements

### 7.1 Prop Firm and Purchase Management
#### Features
- Create Prop Firm (name, notes)
- Create Challenge Product (firm, account size, type: 1-step or 2-step, leverage optional, phases supported)
- Upload Rules Chart (store image locally; link to ruleset version)
- Create RuleSet (versioned)
  - Drawdown mode: static or trailing
  - Daily loss limit: percent and basis definition
  - Overall loss limit: percent and basis definition
  - Phase rules: targets, min days, restrictions
- Create Purchase
  - firm, product, number of accounts, fee per account or total paid, currency, purchase date
- Create Trading Accounts
  - one record per purchased account; nickname, phase, ruleset reference

#### Acceptance Criteria
- User can see total spend across all firms.
- User can see spend per firm, per product, and per account.
- RuleSet changes create a new version; accounts remain linked to the version in use at that time.

---

### 7.2 Trade Journaling (Manual and Voice)
#### Features
- Manual trade entry (fallback)
  - symbol, direction, entry, SL, TP, size, reasons, tags
- Voice note capture and processing
  - record audio, upload, store, transcribe, extract intent and one or more event drafts
- Event timeline
  - append-only events on a trade
  - multiple partials supported
  - add-to-position supported
  - stop moves, breakeven, trailing, TP changes supported
- Trade resolution for voice updates
  - if tradeId not specified: resolve to last open trade by symbol
  - if ambiguous: user must select target trade

#### Acceptance Criteria
- Each voice note results in either:
  - validated event draft(s) ready for confirmation, or
  - clear error state with retry path
- No event is persisted without schema validation and user confirmation.

---

### 7.3 Rules Engine and Risk Matrix
#### Features
- Compute per account:
  - daily realized PnL (and optional unrealized)
  - daily remaining loss room
  - overall remaining loss room
  - trailing drawdown remaining (if configured)
- Compute per day:
  - breach status and near-breach warnings
- Display risk matrix across accounts:
  - SAFE, WARNING, CRITICAL, BREACH
  - numeric remaining room in currency and percent
- Alerts:
  - triggered when event changes PnL and crosses thresholds
  - triggered when account phase or ruleset changes

#### Acceptance Criteria
- Risk numbers are deterministic and reproducible from stored events and snapshots.
- For each breach, system explains which rule and value caused it.

---

### 7.4 ROI and Payout Tracking
#### Features
- Record payouts per firm and per account
- Record adjustments (reset fees, re-try fees, add-ons, refunds)
- ROI views:
  - per firm: total fees, payouts, net profit, fee ROI
  - overall: consolidated totals
  - per account: fees, payouts, status

#### Acceptance Criteria
- Default ROI uses fee ROI:
  - feeROI = (totalPayouts - totalFees) / totalFees
- UI clearly distinguishes fee ROI from notional account performance.

---

### 7.5 Analytics and Insights (Basic)
#### Features
- Performance metrics:
  - win rate, average win/loss, expectancy, profit factor
- Behavior metrics:
  - frequency of BE moves
  - frequency of adding to losers
  - partial usage patterns
  - early exits vs plan (where possible)
- Filters:
  - date range, symbol, setup tags, firm, account, phase

#### Acceptance Criteria
- Analytics are based on confirmed events only.
- Queries remain fast on local DB with appropriate indexes.

---

## 8. Non-Functional Requirements

### 8.1 Reliability
- Job processing is idempotent.
- VoiceNote state machine:
  - UPLOADED, TRANSCRIBING, TRANSCRIBED, EXTRACTING, NEEDS_REVIEW, READY, FAILED
- Worker restarts do not lose jobs.

### 8.2 Performance
- UI loads under 2 seconds on a typical developer machine.
- Async pipeline with progress states for transcription and extraction.
- DB indexes for trade_events, daily_snapshots, account_id, date filters.

### 8.3 Security and Privacy
- Local storage by default.
- Audio and images stored in object storage (MinIO or disk), not in Postgres.
- Secrets stored in `.env` and never committed.
- Optional encryption at rest is recommended for local volumes.

### 8.4 Data Integrity
- trade_events are append-only. Corrections are new events or explicit correction records.
- RuleSets are versioned and immutable once assigned to an account.

---

## 9. AI and Processing Pipelines

### 9.1 Speech to Text (Local)
- Input: audio file reference
- Output: transcript text and optional segments
- Constraints: enforce max duration and max size per voice note

### 9.2 Transcript to JSON (Local LLM or Optional Gemini)
- Input: transcript plus compact context (symbol metadata, account, phase, rules)
- Output: strict JSON with:
  - intent: open_trade, update_trade, close_trade, add_note
  - eventType(s)
  - fields payload
  - confidence and missingFields
- Validation: Zod schema validation
- Repair loop: if invalid JSON, re-run with corrective prompt
- Confirmation UI is required gate

### 9.3 Rules Screenshot to RuleSet (Optional OCR)
- Store image as reference
- OCR locally to extract text
- Normalize OCR text into RuleSet JSON via extractor provider
- Confirmation UI required

---

## 10. Data Model Overview

### Core Entities
- PropFirm
- ChallengeProduct
- RuleSet (versioned)
- Purchase
- TradingAccount
- Trade
- TradeEvent (append-only)
- VoiceNote (audio ref, transcript, extracted draft JSON, status)
- DailySnapshot (per account, per date)
- Payout
- Adjustment

### Key Principle
Trade state is derived from events, not overwritten.

---

## 11. Docker Services

### Required for MVP
- **web**: React + Vite UI (voice capture, rule entry, dashboards)
- **api**: NestJS REST API (auth, CRUD, presigned upload tickets, reads for dashboards)
- **worker**: background jobs (STT orchestration, extraction orchestration, risk recompute, analytics aggregation)
- **postgres**: structured data store
- **redis**: job queue and coordination
- **minio**: local object storage for audio and rules images
- **minio-init**: one-shot bucket initialization container

### Optional (add when needed)
- **stt**: local speech-to-text service (Whisper via faster-whisper or whisper.cpp)
- **ocr**: local OCR service for rules screenshots (Tesseract or PaddleOCR)
- **llm**: local text-to-JSON extraction (Ollama or llama.cpp server)
- **reverse-proxy**: single entry point (Caddy or Nginx) for consistent routing
- **pgadmin / redis-insight**: dev-only admin tools

---

## 12. API Endpoints (REST)

### 12.1 Auth and User
- POST /v1/auth/register
- POST /v1/auth/login
- POST /v1/auth/logout
- GET  /v1/me

### 12.2 Prop Firms and Products
- GET  /v1/prop-firms
- POST /v1/prop-firms
- GET  /v1/prop-firms/:propFirmId
- PATCH /v1/prop-firms/:propFirmId

- GET  /v1/challenge-products?propFirmId=...
- POST /v1/challenge-products
- GET  /v1/challenge-products/:productId
- PATCH /v1/challenge-products/:productId

### 12.3 Rule Sets (Versioned)
- GET  /v1/rule-sets?propFirmId=...&productId=...
- POST /v1/rule-sets
- GET  /v1/rule-sets/:ruleSetId
- POST /v1/rule-sets/:ruleSetId/clone

### 12.4 Rules Screenshot Upload and OCR
- POST /v1/uploads/rules-image/init
- POST /v1/uploads/:uploadId/complete
- POST /v1/rule-sets/parse-from-ocr (optional)

### 12.5 Purchases and Accounts
- GET  /v1/purchases?propFirmId=...
- POST /v1/purchases
- GET  /v1/purchases/:purchaseId
- PATCH /v1/purchases/:purchaseId

- GET  /v1/trading-accounts?propFirmId=...
- POST /v1/trading-accounts
- GET  /v1/trading-accounts/:accountId
- PATCH /v1/trading-accounts/:accountId
- POST /v1/trading-accounts/:accountId/set-phase
- POST /v1/trading-accounts/:accountId/set-ruleset

### 12.6 Voice Notes and Audio Pipeline
- POST /v1/voice-notes/init
- POST /v1/voice-notes/:voiceNoteId/complete
- GET  /v1/voice-notes/:voiceNoteId
- POST /v1/voice-notes/:voiceNoteId/retry

### 12.7 Trades and Trade Events (Event Sourced)
- GET  /v1/trades?tradingAccountId=...&status=...&symbol=...&from=...&to=...
- POST /v1/trades
- GET  /v1/trades/:tradeId
- PATCH /v1/trades/:tradeId (metadata only)

- GET  /v1/trades/:tradeId/events
- POST /v1/trades/:tradeId/events

- POST /v1/trade-events/resolve-target (optional)

### 12.8 Payouts and Adjustments
- GET  /v1/payouts?tradingAccountId=...&propFirmId=...
- POST /v1/payouts
- PATCH /v1/payouts/:payoutId

- GET  /v1/adjustments?tradingAccountId=...
- POST /v1/adjustments

### 12.9 Risk Engine and Dashboards
- GET /v1/risk/matrix?propFirmId=...
- GET /v1/trading-accounts/:accountId/risk
- GET /v1/trading-accounts/:accountId/daily-snapshots?from=...&to=...
- POST /v1/trading-accounts/:accountId/daily-snapshots (optional manual snapshots)

### 12.10 ROI and Analytics
- GET /v1/roi/summary?propFirmId=...
- GET /v1/analytics/performance?tradingAccountId=...&from=...&to=...&symbol=...&tag=...
- GET /v1/analytics/behavior?tradingAccountId=...&from=...&to=...

### 12.11 System
- GET /v1/health
- GET /v1/version

---

## 13. Milestones and Phases

### Phase 1: PRD, schemas, repo standards
- Stable schemas, invariants, repo conventions, CI gates.

### Phase 2: Local infra foundation
- Docker Compose brings up web, api, worker, postgres, redis, minio.

### Phase 3: Core domain and CRUD
- rule sets, purchases, accounts, trades, trade events APIs working end-to-end.

### Phase 4: Voice pipeline with local STT
- record audio, upload, transcribe asynchronously, store transcript.

### Phase 5: Text to events via extractor plus confirmation UI
- transcript becomes validated TradeEvent(s) after confirmation.

### Phase 6: Rules chart upload and optional OCR prefill
- screenshot stored, ruleset form supported, OCR optional.

### Phase 7: Risk matrix and ROI dashboards
- daily and overall drawdown tracking, breach alerts, spend and ROI analytics.

### Optional Phase 8: Hardening and mobile readiness
- exports, backups, performance tuning, API client packaging.

---

## 14. Risks and Mitigations
1. AI extraction errors
   - strict schema validation, mandatory confirmation UI, event-sourcing audit trail

2. Prop firm rule variability and edge cases
   - versioned RuleSet, explicit drawdown configuration fields, explainable calculations

3. No broker integration limits real-time equity accuracy
   - compute from logged trades; optional manual equity snapshots; label assumptions clearly

4. Local performance constraints
   - small models, short voice notes, async pipeline, graceful fallback to manual entry

5. OCR unreliability on rules screenshots
   - treat OCR as prefill only; confirmation required; allow manual entry always

---

## 15. Definition of Done (MVP)
- User can create firm, product, ruleset, purchase, and multiple accounts.
- User can log trades via voice and confirm structured events.
- Risk matrix shows daily and overall drawdown remaining per account.
- ROI dashboard shows total spend and fee ROI per firm and overall.
- Entire system runs locally via Docker without paid services.
