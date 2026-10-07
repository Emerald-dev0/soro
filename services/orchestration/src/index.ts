import type { TransactionState } from '@soro/types';
import { isTerminalTransactionState } from '@soro/types';

/**
 * Orchestrator shell (Phase 0).
 *
 * Owns: the pipeline stage order and the TRANSACTION state machine guard.
 * The orchestrator coordinates conversation → validation → policy →
 * authorization → banking → Ayo; it NEVER contains provider logic or model
 * calls. Full orchestration lands in Phase 1 (see docs/ARCHITECTURE.md).
 */

export const SERVICE_NAME = 'orchestration';

/** The deterministic pipeline every request travels. */
export const PIPELINE_STAGES = [
  'UNDERSTAND',
  'VALIDATE',
  'CONFIRM',
  'AUTHORIZE',
  'EXECUTE',
  'COMPLETE',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

const FORWARD_EDGES: Record<TransactionState, readonly TransactionState[]> = {
  REQUESTED: ['UNDERSTOOD', 'CANCELLED', 'EXPIRED'],
  UNDERSTOOD: ['VALIDATED', 'CANCELLED', 'FAILED'],
  VALIDATED: ['CONFIRMATION_REQUIRED', 'CONFIRMED', 'CANCELLED', 'FAILED'],
  CONFIRMATION_REQUIRED: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
  CONFIRMED: ['AUTHORIZATION_REQUIRED', 'AUTHORIZED', 'PROCESSING', 'CANCELLED'],
  AUTHORIZATION_REQUIRED: ['AUTHORIZED', 'UNAUTHORIZED', 'CANCELLED', 'EXPIRED', 'SECURITY_BLOCKED'],
  AUTHORIZED: ['PROCESSING', 'CANCELLED', 'EXPIRED'],
  PROCESSING: ['SUCCESS', 'FAILED', 'UNKNOWN_RESULT'],
  SUCCESS: [],
  CANCELLED: [],
  FAILED: [],
  EXPIRED: [],
  UNAUTHORIZED: [],
  SECURITY_BLOCKED: [],
  UNKNOWN_RESULT: [],
};

/**
 * State-machine guard. Forward progress follows FORWARD_EDGES; terminal
 * states accept no transitions. UNKNOWN_RESULT is sticky by design:
 * an unknown provider outcome must REMAIN unknown, never be retried
 * blindly or re-labelled SUCCESS.
 */
export function canTransitionTransaction(from: TransactionState, to: TransactionState): boolean {
  if (isTerminalTransactionState(from)) return false;
  return FORWARD_EDGES[from].includes(to);
}
