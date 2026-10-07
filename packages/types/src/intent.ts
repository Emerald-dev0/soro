import type { LanguageCode } from './language.js';

/**
 * Intent taxonomy (Phase 0).
 *
 * Intents are the structured banking goals extracted from natural language.
 * The taxonomy is intentionally small: complete end-to-end flows beat
 * feature quantity (see AGENTS.md product scope principle).
 */
export const INTENTS = [
  'GET_BALANCE',
  'GET_TRANSACTION_HISTORY',
  'TRANSFER_MONEY',
  'GET_TRANSFER_STATUS',
  'PURCHASE_AIRTIME',
  'GET_AIRTIME_OPTIONS',
  'GET_DATA_PLANS',
  'RECOMMEND_DATA_PLAN',
  'PURCHASE_DATA',
  'GET_BENEFICIARIES',
  'VERIFY_BENEFICIARY',
  'GET_STATEMENT',
  'CREATE_SUPPORT_CASE',
  'ESCALATE_TO_HUMAN',
  'CONFIRM',
  'CANCEL',
  'HELP',
  'UNKNOWN',
] as const;

export type Intent = (typeof INTENTS)[number];

export function isIntent(value: unknown): value is Intent {
  return (
    typeof value === 'string' &&
    (INTENTS as readonly string[]).includes(value)
  );
}

/** A single extracted entity (amount, recipient reference, ...). */
export interface Entity {
  name: string;
  value: string | number | boolean;
}

/**
 * Structured intent — the ONLY shape of AI output allowed to flow
 * downstream toward validation and banking. Arbitrary LLM text must
 * never reach the banking layer.
 */
export interface StructuredIntent {
  language: LanguageCode;
  intent: Intent;
  /** Flat entity map, e.g. { amount: 5000, recipient_reference: "my daughter" }. */
  entities: Record<string, string | number | boolean>;
  /** Model-reported confidence, or null when the producer has none. Never fabricate. */
  confidence: number | null;
}

/** A structured intent annotated with its transport context. */
export interface IntentResult {
  intent: StructuredIntent;
  sessionId: string;
  correlationId: string;
  receivedAt: string;
}
