import { describe, expect, it } from 'vitest';
import { createEvent, isSoroEvent, newCorrelationId, sortEventsByTime } from '../src/index.js';

describe('createEvent', () => {
  it('builds a well-formed envelope with generated ids', () => {
    const e = createEvent({
      type: 'INTENT_RESOLVED',
      sessionId: 'sess-1',
      source: 'conversation',
      mode: 'DEMO',
      payload: { intent: 'GET_BALANCE' },
    });
    expect(e.id).toBeTruthy();
    expect(e.correlationId).toBeTruthy();
    expect(e.createdAt).toBeTruthy();
    expect(e.mode).toBe('DEMO');
  });

  it('preserves a supplied correlationId across a trace', () => {
    const cid = newCorrelationId();
    const a = createEvent({
      type: 'SPEECH_RECEIVED', sessionId: 's', correlationId: cid,
      source: 'voice-gateway', mode: 'DEMO', payload: {},
    });
    const b = createEvent({
      type: 'INTENT_RESOLVED', sessionId: 's', correlationId: cid,
      source: 'conversation', mode: 'DEMO', payload: {},
    });
    expect(a.correlationId).toBe(cid);
    expect(b.correlationId).toBe(cid);
  });

  it('rejects unknown event types and missing sessionId', () => {
    expect(() =>
      createEvent({
        type: 'MADE_UP' as never, sessionId: 's',
        source: 'conversation', mode: 'DEMO', payload: {},
      }),
    ).toThrow();
    expect(() =>
      createEvent({
        type: 'ERROR_OCCURRED', sessionId: '',
        source: 'orchestration', mode: 'LIVE', payload: {},
      }),
    ).toThrow();
  });
});

describe('isSoroEvent / sortEventsByTime', () => {
  it('validates envelopes', () => {
    const e = createEvent({
      type: 'CALL_CONNECTED', sessionId: 's',
      source: 'twilio', mode: 'LIVE', payload: {},
    });
    expect(isSoroEvent(e)).toBe(true);
    expect(isSoroEvent({ nope: true })).toBe(false);
  });

  it('sorts timelines chronologically', () => {
    const mk = (t: string) =>
      createEvent({
        type: 'SPEECH_RECEIVED', sessionId: 's', correlationId: 'c',
        source: 'voice-gateway', mode: 'DEMO', payload: {}, createdAt: t,
        id: `id-${t}`,
      });
    const out = sortEventsByTime([mk('2026-01-02T00:00:00.000Z'), mk('2026-01-01T00:00:00.000Z')]);
    expect(out[0]?.createdAt).toContain('2026-01-01');
  });
});
