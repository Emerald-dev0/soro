import { describe, expect, it } from 'vitest';
import {
  appendEvent,
  getSession,
  getTransaction,
  listEventsBySession,
  migrate,
  openDatabase,
  resetDatabase,
  saveSession,
  saveTransaction,
  seedDemoData,
} from '../src/index.js';

function freshDb() {
  const db = openDatabase(':memory:');
  migrate(db);
  return db;
}

describe('migrate/reset/seed', () => {
  it('migrates and records the schema version', () => {
    const db = freshDb();
    const row = db.prepare('SELECT version FROM schema_migrations').get() as { version: number };
    expect(row.version).toBe(1);
    db.close();
  });

  it('resets cleanly and seeds deterministic demo data', () => {
    const db = freshDb();
    seedDemoData(db);
    expect(getSession(db, 'seed-demo-session-1')?.mode).toBe('DEMO');
    expect(listEventsBySession(db, 'seed-demo-session-1')).toHaveLength(5);
    resetDatabase(db);
    expect(getSession(db, 'seed-demo-session-1')).toBeUndefined();
    db.close();
  });
});

describe('repositories', () => {
  it('round-trips sessions', () => {
    const db = freshDb();
    saveSession(db, {
      id: 'sess-1', channel: 'demo', mode: 'DEMO', language: 'pcm',
      status: 'active', startedAt: new Date().toISOString(),
    });
    expect(getSession(db, 'sess-1')?.language).toBe('pcm');
    db.close();
  });

  it('appends and lists events in timeline order', () => {
    const db = freshDb();
    saveSession(db, {
      id: 'sess-1', channel: 'demo', mode: 'DEMO', language: 'en',
      status: 'active', startedAt: new Date().toISOString(),
    });
    const base = {
      sessionId: 'sess-1', correlationId: 'c', source: 'demo-engine', mode: 'DEMO',
      payload: {},
    } as const;
    appendEvent(db, { ...base, id: 'e2', type: 'INTENT_RESOLVED', createdAt: '2026-01-02T00:00:00.000Z' });
    appendEvent(db, { ...base, id: 'e1', type: 'CALL_CONNECTED', createdAt: '2026-01-01T00:00:00.000Z' });
    const events = listEventsBySession(db, 'sess-1');
    expect(events.map((e) => e.id)).toEqual(['e1', 'e2']);
    db.close();
  });

  it('round-trips transactions', () => {
    const db = freshDb();
    const now = new Date().toISOString();
    saveSession(db, {
      id: 'sess-1', channel: 'demo', mode: 'DEMO', language: 'en',
      status: 'active', startedAt: now,
    });
    saveTransaction(db, {
      reference: 'tx-1', idempotencyKey: 'idem-1', sessionId: 'sess-1', correlationId: 'c',
      kind: 'BALANCE', state: 'SUCCESS', authorization: 'NOT_REQUIRED',
      provider: 'demo', createdAt: now, updatedAt: now,
    });
    expect(getTransaction(db, 'tx-1')?.state).toBe('SUCCESS');
    db.close();
  });
});
