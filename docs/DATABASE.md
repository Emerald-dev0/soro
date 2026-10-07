# Soro — Database

> **Phase 0 status: REAL.** SQLite via `node:sqlite`, canonical schema,
> migrations, typed client, seeds, reset scripts, and tests all exist and
> pass. No production data, no remote database.
>
> Related: ARCHITECTURE.md · EVENTS.md · ENVIRONMENT.md · SECURITY.md ·
> TESTING.md · DECISIONS.md (ADR-0010)

## 1. Purpose

Durable local storage for sessions, the append-only event log (the
Command Center's source of truth), transaction lifecycle records, and
demo runs — with zero external setup.

## 2. Responsibilities / non-responsibilities

The DB **does**: sessions, events, transactions, demo_sessions, schema
versioning, deterministic seeds for local/dev/test. It **does NOT**:
store PINs, DTMF digits, full phone numbers, LLM prompts with PII, or
anything resembling a bank ledger (Soro holds no funds).

## 3. Architecture — why SQLite via `node:sqlite`

| Option | Verdict |
|---|---|
| SQLite via `node:sqlite` (built-in, Node ≥ 22.5) | **Chosen.** Zero setup, file-based, WAL-capable, no native deps, no credentials. Perfect for local-first hackathon. |
| better-sqlite3 | Rejected for Phase 0: native compilation burden. |
| Postgres / hosted DB | Rejected for Phase 0: server + credentials contradict local-first; migration path kept open behind the repository seam. |

Code: `packages/db` (`@soro/db`). Schema: `packages/db/sql/schema.sql`.
Migration: `packages/db/sql/migrations/001_init.sql`. Seeds:
`packages/db/sql/seeds/demo.sql`.

## 4. Data flow

`recordEvent(db, …)` (`@soro/service-events`) → `appendEvent` →
`events` table → `getTimeline(db, sessionId)` → Command Center feed.
Sessions/transactions round-trip through `saveSession`/`getSession` and
`saveTransaction`/`getTransaction`. FK integrity is enforced
(`transactions.session_id → sessions.id`; the test suite proves it).

## 5. Schema philosophy

Smallest viable: 4 domain tables + `schema_migrations`. Every row
carries `mode` (LIVE/DEMO) so simulated data can never be confused with
live. Money in **minor units** (`amount_minor`, kobo) — never floats.
References everywhere: sessions/transactions/events join on ids, and
`idempotency_key` is UNIQUE for safe retries.

## 6. APIs (typed client — REAL)

`openDatabase(path)` · `migrate(db)` (idempotent) · `resetDatabase(db)`
· `seedDemoData(db)` · `saveSession/getSession` · `appendEvent`
· `listEventsBySession` (chronological) · `saveTransaction/getTransaction`.
SQL path resolution works source-first (`src/ → ../sql`) and post-build
(`dist/src → ../../sql`).

## 7. Security

File permissions on `SORO_DATABASE_PATH`; no secrets in rows (enforced by
code review, not just policy — event payloads for DTMF carry occurrence,
never digits). See docs/SECURITY.md.

## 8. Failure modes

Missing/corrupt DB file → `migrate` recreates schema; FK violation →
loud error (never silent partial writes); concurrent writers → SQLite
WAL handles local concurrency (documented limit, not a prod story).

## 9. Testing

`packages/db/tests/db.test.ts` (in-memory `:memory:` DBs): migration
versioning, reset, deterministic seeds, session/event/transaction
round-trips, timeline ordering. Reset/seed scripts are exercised via
`pnpm db:reset && pnpm db:seed` against `./data/` (git-ignored).

## 10. Configuration

`SORO_DATABASE_PATH` (default `./data/soro.db`). Local setup: nothing to
install. Reset procedure: `pnpm db:reset`. Seed: `pnpm db:seed`
(SIMULATED demo rows only).

## 11. Future production considerations

Migrate to Postgres behind the same repository functions; add connection
pooling, retention/purge policy for events, encrypted backups, and
read-replica for the Command Center timeline.
