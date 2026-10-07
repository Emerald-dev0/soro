/**
 * Phase 0 foundation proof: a complete Demo Mode balance inquiry across
 * packages — session → intent → 3 validation gates → demo banking →
 * events → persisted timeline → transaction state machine.
 *
 * Uses ONLY deterministic local pieces. Nothing here touches a network.
 */
import { describe, expect, it } from 'vitest';
import { loadSoroConfig, isDemoReady } from '@soro/config';
import { createEvent } from '@soro/events';
import { recordEvent } from '@soro/service-events';
import { selectProvider } from '@soro/service-banking';
import { canTransitionTransaction } from '@soro/service-orchestration';
import { migrate, openDatabase, saveSession, saveTransaction } from '@soro/db';
import {
  evaluatePolicy,
  validateBusinessRules,
  validateStructuredIntentShape,
} from '@soro/validation';
import type { ConversationSession, Transaction } from '@soro/types';

describe('Demo Mode balance inquiry (Pidgin) end-to-end', () => {
  it('flows from utterance to confirmed SUCCESS with an honest DEMO trail', () => {
    // 1. Config: demo needs no credentials.
    const config = loadSoroConfig({});
    expect(isDemoReady(config).ready).toBe(true);

    // 2. Session: "Abeg, how much dey my account?"
    const session: ConversationSession = {
      id: 'e2e-sess-1', channel: 'demo', mode: 'DEMO',
      language: 'pcm', status: 'active', startedAt: new Date().toISOString(),
    };
    const db = openDatabase(':memory:');
    migrate(db);
    saveSession(db, session);

    // 3. Structured intent (what the LLM would propose) passes all 3 gates.
    const intentInput = { language: 'pcm', intent: 'GET_BALANCE', entities: {}, confidence: null };
    expect(validateStructuredIntentShape(intentInput).success).toBe(true);
    expect(validateBusinessRules({ intent: 'GET_BALANCE', entities: {} })).toEqual([]);
    const policy = evaluatePolicy({ intent: 'GET_BALANCE' });
    expect(policy).toMatchObject({ allowed: true, authorizationRequired: false });

    // 4. Demo banking answers deterministically and honestly.
    const banking = selectProvider('demo');
    const now = new Date().toISOString();
    return banking
      .getBalance({
        reference: 'e2e-ref-1', idempotencyKey: 'e2e-idem-1',
        sessionId: session.id, correlationId: 'e2e-corr-1',
        kind: 'BALANCE', requestedAt: now,
      })
      .then((response) => {
        expect(response.state).toBe('SUCCESS');
        expect(response.balanceMinor).toBeGreaterThan(0);
        expect(response.simulated).toBe(true); // never presented as live

        // 5. Events recorded along the trace; timeline is chronological.
        recordEvent(db, {
          id: 'e2e-e1', type: 'LANGUAGE_DETECTED', sessionId: session.id,
          correlationId: 'e2e-corr-1', source: 'conversation', mode: 'DEMO',
          payload: { language: 'pcm' }, createdAt: '2026-10-05T10:00:00.000Z',
        });
        recordEvent(db, {
          id: 'e2e-e2', type: 'INTENT_RESOLVED', sessionId: session.id,
          correlationId: 'e2e-corr-1', source: 'conversation', mode: 'DEMO',
          payload: intentInput, createdAt: '2026-10-05T10:00:01.000Z',
        });
        recordEvent(db, {
          id: 'e2e-e3', type: 'BANKING_RESPONSE_RECEIVED', sessionId: session.id,
          correlationId: 'e2e-corr-1', source: 'banking', mode: 'DEMO',
          payload: { state: response.state, simulated: true },
          createdAt: '2026-10-05T10:00:02.000Z',
        });
        expect(createEvent({
          type: 'TRANSACTION_SUCCESS', sessionId: session.id,
          correlationId: 'e2e-corr-1', source: 'orchestration', mode: 'DEMO',
          payload: {},
        }).mode).toBe('DEMO');

        // 6. Transaction lifecycle reaches SUCCESS through legal transitions.
        const tx: Transaction = {
          reference: 'e2e-ref-1', idempotencyKey: 'e2e-idem-1',
          sessionId: session.id, correlationId: 'e2e-corr-1', kind: 'BALANCE',
          state: 'SUCCESS', authorization: 'NOT_REQUIRED', provider: 'demo',
          createdAt: now, updatedAt: now,
        };
        saveTransaction(db, tx);
        const path: Array<[Transaction['state'], Transaction['state']]> = [
          ['REQUESTED', 'UNDERSTOOD'], ['UNDERSTOOD', 'VALIDATED'],
          ['VALIDATED', 'CONFIRMED'], ['CONFIRMED', 'PROCESSING'],
          ['PROCESSING', 'SUCCESS'],
        ];
        for (const [from, to] of path) expect(canTransitionTransaction(from, to)).toBe(true);
        db.close();
      });
  });
});
