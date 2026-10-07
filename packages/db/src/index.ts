import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  BankingRequestKind,
  ConversationSession,
  SoroEvent,
  Transaction,
} from '@soro/types';

/**
 * Local database client (Phase 0).
 *
 * Engine: SQLite via Node.js built-in `node:sqlite` (Node ≥ 22.5; pinned
 * Node 24 here). Zero external setup — no Docker, no server, no credentials.
 * See docs/DATABASE.md for why, and docs/DECISIONS.md ADR-0010.
 *
 * SCOPE: sessions, events (append-only), transactions, demo_sessions.
 * What it deliberately does NOT store: PINs, full phone numbers, raw
 * secrets, LLM prompts with PII. See docs/SECURITY.md.
 */

const here = dirname(fileURLToPath(import.meta.url));
// Works source-first (src/ → ../sql) and after build (dist/src → ../../sql).
function sqlPath(...parts: string[]): string {
  const candidates = [
    join(here, '..', 'sql', ...parts),
    join(here, '..', '..', 'sql', ...parts),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(`Soro db: SQL file not found. Tried: ${candidates.join(', ')}`);
  }
  return found;
}

export type Database = DatabaseSync;

export function openDatabase(path: string): Database {
  return new DatabaseSync(path);
}

/** Apply the canonical schema (idempotent — safe on existing DBs). */
export function migrate(db: Database): void {
  const schema = readFileSync(sqlPath('schema.sql'), 'utf8');
  db.exec(schema);
  db.prepare(
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (1, ?)`,
  ).run(new Date().toISOString());
}

/** Drop all domain tables and re-apply the schema. Local dev/test only. */
export function resetDatabase(db: Database): void {
  db.exec(`DROP TABLE IF EXISTS demo_sessions;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS schema_migrations;`);
  migrate(db);
}

/** Load deterministic demo seed data. Local dev/test only. */
export function seedDemoData(db: Database): void {
  const seed = readFileSync(sqlPath('seeds', 'demo.sql'), 'utf8');
  db.exec(seed);
}

// ---------------------------------------------------------------------------
// Repositories — small, explicit, no ORM magic
// ---------------------------------------------------------------------------

export function saveSession(db: Database, s: ConversationSession): void {
  db.prepare(
    `INSERT OR REPLACE INTO sessions
     (id, channel, mode, user_id, language, status, started_at, ended_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(s.id, s.channel, s.mode, s.userId ?? null, s.language, s.status, s.startedAt, s.endedAt ?? null);
}

export function getSession(db: Database, id: string): ConversationSession | undefined {
  const row = db
    .prepare(`SELECT * FROM sessions WHERE id = ?`)
    .get(id) as Record<string, string | null> | undefined;
  if (!row) return undefined;
  return {
    id: row['id'] as string,
    channel: row['channel'] as ConversationSession['channel'],
    mode: row['mode'] as ConversationSession['mode'],
    userId: (row['user_id'] as string | null) ?? undefined,
    language: row['language'] as ConversationSession['language'],
    status: row['status'] as ConversationSession['status'],
    startedAt: row['started_at'] as string,
    endedAt: (row['ended_at'] as string | null) ?? undefined,
  };
}

export function appendEvent(db: Database, event: SoroEvent): void {
  db.prepare(
    `INSERT OR IGNORE INTO events
     (id, type, session_id, correlation_id, source, mode, created_at, payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    event.id, event.type, event.sessionId, event.correlationId,
    event.source, event.mode, event.createdAt, JSON.stringify(event.payload ?? {}),
  );
}

export function listEventsBySession(db: Database, sessionId: string): SoroEvent[] {
  const rows = db
    .prepare(`SELECT * FROM events WHERE session_id = ? ORDER BY created_at ASC`)
    .all(sessionId) as Record<string, string>[];
  return rows.map((r) => ({
    id: r['id'],
    type: r['type'],
    sessionId: r['session_id'],
    correlationId: r['correlation_id'],
    source: r['source'],
    mode: r['mode'],
    createdAt: r['created_at'],
    payload: JSON.parse(r['payload_json'] ?? '{}'),
  })) as SoroEvent[];
}

export function saveTransaction(db: Database, t: Transaction): void {
  db.prepare(
    `INSERT OR REPLACE INTO transactions
     (reference, idempotency_key, session_id, correlation_id, kind, state,
      authorization, provider, provider_reference, amount_minor, currency,
      created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    t.reference, t.idempotencyKey, t.sessionId, t.correlationId, t.kind,
    t.state, t.authorization, t.provider, t.providerReference ?? null,
    t.amountMinor ?? null, t.currency ?? null, t.createdAt, t.updatedAt,
  );
}

export function getTransaction(db: Database, reference: string): Transaction | undefined {
  const row = db
    .prepare(`SELECT * FROM transactions WHERE reference = ?`)
    .get(reference) as Record<string, string | number | null> | undefined;
  if (!row) return undefined;
  return {
    reference: row['reference'] as string,
    idempotencyKey: row['idempotency_key'] as string,
    sessionId: row['session_id'] as string,
    correlationId: row['correlation_id'] as string,
    kind: row['kind'] as BankingRequestKind,
    state: row['state'] as Transaction['state'],
    authorization: row['authorization'] as Transaction['authorization'],
    provider: row['provider'] as Transaction['provider'],
    providerReference: (row['provider_reference'] as string | null) ?? undefined,
    amountMinor: (row['amount_minor'] as number | null) ?? undefined,
    currency: (row['currency'] as string | null) ?? undefined,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}
