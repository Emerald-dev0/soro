import { describe, expect, it } from 'vitest';
import { migrate, openDatabase, saveSession } from '@soro/db';
import { getTimeline, recordEvent } from '../src/index.js';

describe('event service', () => {
  it('records envelopes and serves chronological timelines', () => {
    const db = openDatabase(':memory:');
    migrate(db);
    saveSession(db, {
      id: 'sess-1', channel: 'demo', mode: 'DEMO', language: 'pcm',
      status: 'active', startedAt: new Date().toISOString(),
    });
    recordEvent(db, {
      id: 'e2', type: 'INTENT_RESOLVED', sessionId: 'sess-1', correlationId: 'c',
      source: 'conversation', mode: 'DEMO', payload: { intent: 'GET_BALANCE' },
      createdAt: '2026-01-02T00:00:00.000Z',
    });
    recordEvent(db, {
      id: 'e1', type: 'CALL_CONNECTED', sessionId: 'sess-1', correlationId: 'c',
      source: 'demo-engine', mode: 'DEMO', payload: {},
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const timeline = getTimeline(db, 'sess-1');
    expect(timeline.map((e) => e.type)).toEqual(['CALL_CONNECTED', 'INTENT_RESOLVED']);
    db.close();
  });
});
