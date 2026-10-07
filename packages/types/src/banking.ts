/**
 * Banking domain model.
 *
 * Soro is NOT a bank and holds no funds. These types describe REQUESTS to
 * an external BankingProvider and the STATES of those requests — never
 * money itself.
 */

export const TRANSACTION_STATES = [
  'REQUESTED',
  'UNDERSTOOD',
  'VALIDATED',
  'CONFIRMATION_REQUIRED',
  'CONFIRMED',
  'AUTHORIZATION_REQUIRED',
  'AUTHORIZED',
  'PROCESSING',
  'SUCCESS',
  'CANCELLED',
  'FAILED',
  'EXPIRED',
  'UNAUTHORIZED',
  'SECURITY_BLOCKED',
  'UNKNOWN_RESULT',
] as const;

export type TransactionState = (typeof TRANSACTION_STATES)[number];

/** Terminal states: no further transitions expected. */
export const TERMINAL_TRANSACTION_STATES: readonly TransactionState[] = [
  'SUCCESS',
  'CANCELLED',
  'FAILED',
  'EXPIRED',
  'UNAUTHORIZED',
  'SECURITY_BLOCKED',
  'UNKNOWN_RESULT',
];

export function isTerminalTransactionState(state: TransactionState): boolean {
  return (TERMINAL_TRANSACTION_STATES as readonly string[]).includes(state);
}

export const AUTHORIZATION_STATES = [
  'NOT_REQUIRED',
  'REQUIRED',
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'BLOCKED',
] as const;

export type AuthorizationState = (typeof AUTHORIZATION_STATES)[number];

export const BANKING_PROVIDER_NAMES = ['wema', 'demo'] as const;

export type BankingProviderName = (typeof BANKING_PROVIDER_NAMES)[number];

export type BankingRequestKind =
  | 'BALANCE'
  | 'TRANSACTION_HISTORY'
  | 'TRANSFER';

/**
 * A validated request to a banking provider. Constructed ONLY from
 * validated structured intents — never directly from LLM output.
 */
export interface BankingRequest {
  /** Soro-side reference (idempotency + audit). */
  reference: string;
  /** Idempotency key: retries MUST reuse it; providers must dedupe on it. */
  idempotencyKey: string;
  sessionId: string;
  correlationId: string;
  kind: BankingRequestKind;
  /** Minor units (kobo) to avoid float errors. Required for TRANSFER. */
  amountMinor?: number;
  currency?: string;
  /** Opaque recipient reference (alias/account label) — never a PIN. */
  recipientReference?: string;
  requestedAt: string;
}

export type BankingResultState = 'SUCCESS' | 'FAILED' | 'UNKNOWN_RESULT';

/**
 * A provider's answer. UNKNOWN_RESULT must stay unknown: never present
 * "request sent" as "transaction successful", never blindly retry.
 */
export interface BankingResponse {
  reference: string;
  provider: BankingProviderName;
  providerReference?: string;
  state: BankingResultState;
  /** Balance in minor units (kobo) for BALANCE responses. */
  balanceMinor?: number;
  currency?: string;
  transactions?: TransactionRecord[];
  message?: string;
  /** True when the data is simulated (Demo Mode). Never hide this. */
  simulated: boolean;
  respondedAt: string;
}

export interface TransactionRecord {
  id: string;
  amountMinor: number;
  currency: string;
  direction: 'credit' | 'debit';
  narration: string;
  occurredAt: string;
}

/** Full lifecycle record of one financial operation attempt. */
export interface Transaction {
  reference: string;
  idempotencyKey: string;
  sessionId: string;
  correlationId: string;
  kind: BankingRequestKind;
  state: TransactionState;
  authorization: AuthorizationState;
  provider: BankingProviderName;
  providerReference?: string;
  amountMinor?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Provider abstraction — the boundary that keeps Soro independent of any
 * single bank implementation. Expected implementations: WemaProvider
 * (verified APIs only) and DemoBankingProvider (deterministic).
 */
export interface BankingProvider {
  readonly name: BankingProviderName;
  getBalance(request: BankingRequest): Promise<BankingResponse>;
  getTransactionHistory(request: BankingRequest): Promise<BankingResponse>;
  transfer(request: BankingRequest): Promise<BankingResponse>;
}
