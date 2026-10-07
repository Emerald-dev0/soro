import { z } from 'zod';
import { INTENTS, LANGUAGE_CODES } from '@soro/types';

/**
 * Validation layer (Phase 0 foundation).
 *
 * Enforces the pipeline:
 *
 *   LLM → Structured Intent → Schema Validation → Business Validation
 *   → Policy → Banking
 *
 * Nothing reaches the banking layer without passing all three gates.
 * The LLM is NEVER the banking authority: it proposes, these gates dispose.
 */

// ---------------------------------------------------------------------------
// Gate 1 — Schema validation (shape of AI output)
// ---------------------------------------------------------------------------

export const structuredIntentSchema = z.object({
  language: z.enum(LANGUAGE_CODES),
  intent: z.enum(INTENTS),
  entities: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  ),
  confidence: z.number().min(0).max(1).nullable(),
});

export type StructuredIntentInput = z.input<typeof structuredIntentSchema>;

/** Gate 1: is the AI output even well-shaped? */
export function validateStructuredIntentShape(value: unknown) {
  return structuredIntentSchema.safeParse(value);
}

// ---------------------------------------------------------------------------
// Gate 2 — Business validation (does the intent make sense?)
// ---------------------------------------------------------------------------

export interface BusinessRuleFailure {
  code: string;
  message: string;
}

const NGN_MINOR_PER_UNIT = 100;

/**
 * Gate 2: per-intent business rules on an already well-shaped intent.
 * Returns a list of failures (empty = pass).
 */
export function validateBusinessRules(intent: {
  intent: string;
  entities: Record<string, string | number | boolean>;
}): BusinessRuleFailure[] {
  const failures: BusinessRuleFailure[] = [];
  const ent = intent.entities;

  switch (intent.intent) {
    case 'TRANSFER_MONEY': {
      const amount = ent['amount'];
      if (amount === undefined || amount === null || amount === '') {
        failures.push({ code: 'AMOUNT_MISSING', message: 'Transfer amount is required.' });
      } else {
        const n = typeof amount === 'number' ? amount : Number(amount);
        if (!Number.isFinite(n) || n <= 0) {
          failures.push({ code: 'AMOUNT_INVALID', message: 'Transfer amount must be a positive number.' });
        } else if (!Number.isInteger(n * NGN_MINOR_PER_UNIT)) {
          failures.push({ code: 'AMOUNT_PRECISION', message: 'Amount has more precision than kobo allows.' });
        }
      }
      const recipient = ent['recipient_reference'];
      if (typeof recipient !== 'string' || recipient.trim().length === 0) {
        failures.push({ code: 'RECIPIENT_MISSING', message: 'A recipient reference is required.' });
      }
      break;
    }
    case 'GET_BALANCE':
    case 'GET_TRANSACTION_HISTORY':
    case 'HELP':
    case 'CONFIRM':
    case 'CANCEL':
      break;
    case 'UNKNOWN':
    default:
      failures.push({ code: 'INTENT_UNKNOWN', message: 'Intent could not be understood; ask the customer to rephrase.' });
      break;
  }
  return failures;
}

// ---------------------------------------------------------------------------
// Gate 3 — Policy (is this operation allowed down this path?)
// ---------------------------------------------------------------------------

export interface PolicyDecision {
  allowed: boolean;
  authorizationRequired: boolean;
  reasons: string[];
}

/**
 * Gate 3: deterministic policy. Read-only intents flow through;
 * money-movement ALWAYS requires explicit confirmation + DTMF
 * authorization (see docs/SYSTEM-FLOW.md). Unknown intents are held.
 */
export function evaluatePolicy(intent: {
  intent: string;
}): PolicyDecision {
  switch (intent.intent) {
    case 'GET_BALANCE':
    case 'GET_TRANSACTION_HISTORY':
    case 'HELP':
      return { allowed: true, authorizationRequired: false, reasons: ['READ_ONLY_INTENT'] };
    case 'TRANSFER_MONEY':
      return {
        allowed: true,
        authorizationRequired: true,
        reasons: ['MONEY_MOVEMENT_REQUIRES_CONFIRMATION', 'MONEY_MOVEMENT_REQUIRES_DTMF_AUTHORIZATION'],
      };
    case 'CONFIRM':
    case 'CANCEL':
      return { allowed: true, authorizationRequired: false, reasons: ['CONVERSATION_CONTROL'] };
    case 'UNKNOWN':
    default:
      return { allowed: false, authorizationRequired: false, reasons: ['INTENT_UNKNOWN_HOLD'] };
  }
}
