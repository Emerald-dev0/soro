-- =============================================================================
-- SORO database schema (Phase 0) — SQLite
-- =============================================================================
-- Philosophy: the smallest schema that supports sessions, events,
-- transactions and demo sessions. No speculative tables. Every row
-- carries mode (LIVE/DEMO) so simulated data is never confused with live.
-- Migrations are additive, numbered, and replayed in order (see
-- migrations/). This file is the canonical full schema for fresh setups.
-- =============================================================================

PRAGMA journal_mode = WAL;

-- A single conversational session: one call, or one demo run.
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  channel     TEXT NOT NULL,            -- voice | demo | command-center
  mode        TEXT NOT NULL,            -- LIVE | DEMO
  user_id     TEXT,                     -- nullable: callers may be unknown
  language    TEXT NOT NULL DEFAULT 'en',
  status      TEXT NOT NULL DEFAULT 'active',
  started_at  TEXT NOT NULL,
  ended_at    TEXT
);

-- Append-only event log. The source of truth for the Command Center timeline.
CREATE TABLE IF NOT EXISTS events (
  id             TEXT PRIMARY KEY,
  type           TEXT NOT NULL,
  session_id     TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  source         TEXT NOT NULL,
  mode           TEXT NOT NULL,          -- LIVE | DEMO
  created_at     TEXT NOT NULL,
  payload_json   TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_correlation ON events(correlation_id);

-- Lifecycle record of one financial operation attempt.
CREATE TABLE IF NOT EXISTS transactions (
  reference          TEXT PRIMARY KEY,
  idempotency_key    TEXT NOT NULL UNIQUE,
  session_id         TEXT,
  correlation_id     TEXT,
  kind               TEXT NOT NULL,      -- BALANCE | TRANSACTION_HISTORY | TRANSFER | TRANSFER | AIRTIME | DATA | ...
  direction          TEXT,               -- DEBIT | CREDIT
  description        TEXT,
  metadata_json      TEXT,
  customer_id        TEXT,
  account_id         TEXT,
  completed_at       TEXT,
  state              TEXT NOT NULL,      -- TransactionState
  authorization      TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  provider           TEXT NOT NULL,      -- wema | demo
  provider_reference TEXT,
  amount_minor       INTEGER,
  currency           TEXT,
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_transactions_session ON transactions(session_id);

-- Demo Mode scenario runs (always mode = DEMO).
CREATE TABLE IF NOT EXISTS demo_sessions (
  id                TEXT PRIMARY KEY,
  scenario_id       TEXT NOT NULL,
  mode              TEXT NOT NULL DEFAULT 'DEMO',
  status            TEXT NOT NULL DEFAULT 'created',
  current_step_index INTEGER NOT NULL DEFAULT 0,
  started_at        TEXT NOT NULL,
  ended_at          TEXT
);

-- Schema version for migration tracking.
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

-- =============================================================================
-- Phase 1 domain tables — mock financial system with REAL state
-- =============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id                 TEXT PRIMARY KEY,
  customer_number    TEXT NOT NULL UNIQUE,
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL,
  phone_number       TEXT NOT NULL UNIQUE,
  email              TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'ACTIVE',
  preferred_language TEXT NOT NULL DEFAULT 'ENGLISH',
  pin_hash           TEXT,               -- salted sha256 of DTMF PIN; never plaintext
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id                       TEXT PRIMARY KEY,
  customer_id              TEXT NOT NULL REFERENCES customers(id),
  account_number           TEXT NOT NULL UNIQUE,
  account_type             TEXT NOT NULL,
  currency                 TEXT NOT NULL DEFAULT 'NGN',
  balance_minor            INTEGER NOT NULL CHECK (balance_minor >= 0),
  available_balance_minor  INTEGER NOT NULL CHECK (available_balance_minor >= 0),
  status                   TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at               TEXT NOT NULL,
  updated_at               TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounts_customer ON accounts(customer_id);

CREATE TABLE IF NOT EXISTS beneficiaries (
  id             TEXT PRIMARY KEY,
  customer_id    TEXT NOT NULL REFERENCES customers(id),
  name           TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name      TEXT NOT NULL,
  bank_code      TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_customer ON beneficiaries(customer_id);

CREATE TABLE IF NOT EXISTS data_plans (
  id          TEXT PRIMARY KEY,
  network     TEXT NOT NULL,
  label       TEXT NOT NULL,
  data_mb     INTEGER NOT NULL,
  price_minor INTEGER NOT NULL,
  validity_days INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS airtime_purchases (
  id                     TEXT PRIMARY KEY,
  transaction_reference  TEXT NOT NULL REFERENCES transactions(reference),
  account_id             TEXT NOT NULL,
  phone_number           TEXT NOT NULL,
  network                TEXT NOT NULL,
  amount_minor           INTEGER NOT NULL,
  status                 TEXT NOT NULL,
  created_at             TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_purchases (
  id                     TEXT PRIMARY KEY,
  transaction_reference  TEXT NOT NULL REFERENCES transactions(reference),
  account_id             TEXT NOT NULL,
  phone_number           TEXT NOT NULL,
  network                TEXT NOT NULL,
  plan_id                TEXT NOT NULL REFERENCES data_plans(id),
  amount_minor           INTEGER NOT NULL,
  status                 TEXT NOT NULL,
  created_at             TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calls (
  id                       TEXT PRIMARY KEY,
  twilio_call_sid          TEXT UNIQUE,
  from_number              TEXT NOT NULL,
  to_number                TEXT NOT NULL,
  customer_id              TEXT,
  account_id               TEXT,
  status                   TEXT NOT NULL,
  language                 TEXT,
  started_at               TEXT NOT NULL,
  answered_at              TEXT,
  ended_at                 TEXT,
  duration_seconds         INTEGER,
  authentication_status    TEXT NOT NULL DEFAULT 'PENDING',
  authorization_status     TEXT NOT NULL DEFAULT 'NONE',
  current_intent           TEXT,
  escalation_status        TEXT NOT NULL DEFAULT 'NONE'
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id             TEXT PRIMARY KEY,
  call_session_id TEXT NOT NULL REFERENCES calls(id),
  sender         TEXT NOT NULL,
  language       TEXT,
  content        TEXT NOT NULL,
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_call ON conversation_messages(call_session_id, created_at);

CREATE TABLE IF NOT EXISTS authentication_attempts (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL,
  call_session_id TEXT,
  method          TEXT NOT NULL,
  status          TEXT NOT NULL,
  attempt_number  INTEGER NOT NULL,
  created_at      TEXT NOT NULL,
  completed_at    TEXT
);

CREATE TABLE IF NOT EXISTS authorization_attempts (
  id                     TEXT PRIMARY KEY,
  customer_id            TEXT NOT NULL,
  call_session_id        TEXT,
  transaction_reference  TEXT,
  method                 TEXT NOT NULL,
  status                 TEXT NOT NULL,
  attempt_number         INTEGER NOT NULL,
  created_at             TEXT NOT NULL,
  completed_at           TEXT
);

CREATE TABLE IF NOT EXISTS voice_profiles (
  id                              TEXT PRIMARY KEY,
  customer_id                     TEXT NOT NULL UNIQUE REFERENCES customers(id),
  status                          TEXT NOT NULL,
  provider                        TEXT NOT NULL,
  provider_reference              TEXT,
  enrollment_count                INTEGER NOT NULL DEFAULT 0,
  verification_count              INTEGER NOT NULL DEFAULT 0,
  successful_verification_count   INTEGER NOT NULL DEFAULT 0,
  confidence_score                REAL,
  model_version                   TEXT,
  last_verified_at                TEXT,
  created_at                      TEXT NOT NULL,
  updated_at                      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_cases (
  id                     TEXT PRIMARY KEY,
  customer_id            TEXT,
  account_id             TEXT,
  call_session_id        TEXT,
  transaction_reference  TEXT,
  category               TEXT NOT NULL,
  description            TEXT NOT NULL,
  priority               TEXT NOT NULL DEFAULT 'MEDIUM',
  status                 TEXT NOT NULL DEFAULT 'OPEN',
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS emails (
  id           TEXT PRIMARY KEY,
  to_address   TEXT NOT NULL,
  subject      TEXT NOT NULL,
  kind         TEXT NOT NULL,
  status       TEXT NOT NULL,
  body_preview TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_requests (
  id                TEXT PRIMARY KEY,
  provider          TEXT NOT NULL,
  operation         TEXT NOT NULL,
  reference         TEXT,
  status            TEXT NOT NULL,
  request_json      TEXT,
  response_json     TEXT,
  created_at        TEXT NOT NULL
);
