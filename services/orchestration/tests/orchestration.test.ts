import { describe, expect, it } from 'vitest';
import { PIPELINE_STAGES, canTransitionTransaction } from '../src/index.js';

describe('pipeline stages', () => {
  it('defines the six-stage deterministic pipeline', () => {
    expect([...PIPELINE_STAGES]).toEqual([
      'UNDERSTAND', 'VALIDATE', 'CONFIRM', 'AUTHORIZE', 'EXECUTE', 'COMPLETE',
    ]);
  });
});

describe('transaction state machine', () => {
  it('allows the happy path to SUCCESS', () => {
    const path = [
      ['REQUESTED', 'UNDERSTOOD'],
      ['UNDERSTOOD', 'VALIDATED'],
      ['VALIDATED', 'CONFIRMATION_REQUIRED'],
      ['CONFIRMATION_REQUIRED', 'CONFIRMED'],
      ['CONFIRMED', 'AUTHORIZATION_REQUIRED'],
      ['AUTHORIZATION_REQUIRED', 'AUTHORIZED'],
      ['AUTHORIZED', 'PROCESSING'],
      ['PROCESSING', 'SUCCESS'],
    ] as const;
    for (const [from, to] of path) expect(canTransitionTransaction(from, to)).toBe(true);
  });

  it('allows read-only fast paths (no authorization needed)', () => {
    expect(canTransitionTransaction('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(canTransitionTransaction('VALIDATED', 'CONFIRMED')).toBe(true);
  });

  it('blocks backward jumps, skips and terminal exits', () => {
    expect(canTransitionTransaction('PROCESSING', 'REQUESTED')).toBe(false);
    expect(canTransitionTransaction('REQUESTED', 'SUCCESS')).toBe(false);
    expect(canTransitionTransaction('SUCCESS', 'FAILED')).toBe(false);
    // UNKNOWN_RESULT is sticky: never relabelled, never retried blindly.
    expect(canTransitionTransaction('UNKNOWN_RESULT', 'SUCCESS')).toBe(false);
    expect(canTransitionTransaction('UNKNOWN_RESULT', 'PROCESSING')).toBe(false);
  });
});
