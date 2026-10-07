-- Migration 001: initial Phase 0 schema.
-- Fresh installs apply sql/schema.sql; this migration exists so the
-- migrations/ directory and the runner have a real starting point and
-- future changes follow the same additive path. Idempotent via IF NOT EXISTS.

PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  channel     TEXT NOT NULL,
  mode        TEXT NOT NULL,
  user_id     TEXT,
  language    TEXT NOT NULL DEFAULT 'en',
  status      TEXT NOT NULL DEFAULT 'active',
  started_at  TEXT NOT NULL,
  ended_at    TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id             TEXT PRIMARY KEY,
  type           TEXT NOT NULL,
  session_id     TEXT NOT NULL REFERENCES sessions(id),
  correlation_id TEXT NOT NULL,
  source         TEXT NOT NULL,
  mode           TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  payload_json   TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_correlation ON events(correlation_id);

CREATE TABLE IF NOT EXISTS transactions (
  reference          TEXT PRIMARY KEY,
  idempotency_key    TEXT NOT NULL UNIQUE,
  session_id         TEXT NOT NULL REFERENCES sessions(id),
  correlation_id     TEXT NOT NULL,
  kind               TEXT NOT NULL,
  state              TEXT NOT NULL,
  authorization      TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  provider           TEXT NOT NULL,
  provider_reference TEXT,
  amount_minor       INTEGER,
  currency           TEXT,
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_transactions_session ON transactions(session_id);

CREATE TABLE IF NOT EXISTS demo_sessions (
  id                TEXT PRIMARY KEY,
  scenario_id       TEXT NOT NULL,
  mode              TEXT NOT NULL DEFAULT 'DEMO',
  status            TEXT NOT NULL DEFAULT 'created',
  current_step_index INTEGER NOT NULL DEFAULT 0,
  started_at        TEXT NOT NULL,
  ended_at          TEXT
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
