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
  session_id     TEXT NOT NULL REFERENCES sessions(id),
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
  session_id         TEXT NOT NULL REFERENCES sessions(id),
  correlation_id     TEXT NOT NULL,
  kind               TEXT NOT NULL,      -- BALANCE | TRANSACTION_HISTORY | TRANSFER
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
