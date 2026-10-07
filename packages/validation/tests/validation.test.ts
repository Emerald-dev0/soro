import { describe, expect, it } from 'vitest';
import {
  evaluatePolicy,
  validateBusinessRules,
  validateStructuredIntentShape,
} from '../src/index.js';

describe('Gate 1 — schema validation', () => {
  it('accepts a well-formed Pidgin GET_BALANCE intent', () => {
    const r = validateStructuredIntentShape({
      language: 'pcm',
      intent: 'GET_BALANCE',
      entities: {},
      confidence: null,
    });
    expect(r.success).toBe(true);
  });

  it('accepts a Yoruba TRANSFER_MONEY intent shape', () => {
    const r = validateStructuredIntentShape({
      language: 'yo',
      intent: 'TRANSFER_MONEY',
      entities: { amount: 5000, recipient_reference: 'my daughter' },
      confidence: 0.9,
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown languages, intents and bad confidence', () => {
    expect(
      validateStructuredIntentShape({ language: 'fr', intent: 'GET_BALANCE', entities: {}, confidence: null }).success,
    ).toBe(false);
    expect(
      validateStructuredIntentShape({ language: 'en', intent: 'STEAL_MONEY', entities: {}, confidence: null }).success,
    ).toBe(false);
    expect(
      validateStructuredIntentShape({ language: 'en', intent: 'HELP', entities: {}, confidence: 42 }).success,
    ).toBe(false);
  });
});

describe('Gate 2 — business rules', () => {
  it('passes a complete transfer', () => {
    expect(
      validateBusinessRules({ intent: 'TRANSFER_MONEY', entities: { amount: 5000, recipient_reference: 'mama' } }),
    ).toEqual([]);
  });

  it('fails transfers with missing/invalid amount or recipient', () => {
    expect(
      validateBusinessRules({ intent: 'TRANSFER_MONEY', entities: { recipient_reference: 'mama' } })[0]?.code,
    ).toBe('AMOUNT_MISSING');
    expect(
      validateBusinessRules({ intent: 'TRANSFER_MONEY', entities: { amount: -5, recipient_reference: 'mama' } })[0]?.code,
    ).toBe('AMOUNT_INVALID');
    expect(
      validateBusinessRules({ intent: 'TRANSFER_MONEY', entities: { amount: 100 } })[0]?.code,
    ).toBe('RECIPIENT_MISSING');
  });

  it('holds unknown intents', () => {
    expect(validateBusinessRules({ intent: 'UNKNOWN', entities: {} })[0]?.code).toBe('INTENT_UNKNOWN');
  });
});

describe('Gate 3 — policy', () => {
  it('lets read-only intents through without authorization', () => {
    expect(evaluatePolicy({ intent: 'GET_BALANCE' })).toMatchObject({ allowed: true, authorizationRequired: false });
  });

  it('requires authorization for transfers', () => {
    expect(evaluatePolicy({ intent: 'TRANSFER_MONEY' })).toMatchObject({ allowed: true, authorizationRequired: true });
  });

  it('holds unknown intents', () => {
    expect(evaluatePolicy({ intent: 'UNKNOWN' }).allowed).toBe(false);
  });
});
