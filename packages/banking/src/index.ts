import type {
  BankingProvider,
  BankingProviderName,
  BankingRequest,
  BankingResponse,
  TransactionRecord,
} from '@soro/types';

/**
 * Banking provider implementations (Phase 0 foundation).
 *
 * The abstraction (`BankingProvider`, defined in @soro/types) lets Soro
 * operate independently of any single bank. Two adapters:
 *
 *   DemoBankingProvider — REAL, deterministic, local. Powers Demo Mode.
 *   WemaProvider        — STUB. Throws NotVerifiedError on every call
 *                         until documented Wema/ALAT endpoints are verified
 *                         (see docs/WEMA.md). Never fabricate endpoints.
 */

export class NotVerifiedError extends Error {
  readonly code = 'PROVIDER_NOT_VERIFIED';
  constructor(provider: string, operation: string) {
    super(
      `${provider}.${operation} is NOT VERIFIED: no documented endpoint has been confirmed. ` +
        `See docs/WEMA.md. Use the DemoBankingProvider for local flows.`,
    );
    this.name = 'NotVerifiedError';
  }
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Demo adapter — deterministic, honest about being simulated
// ---------------------------------------------------------------------------

export interface DemoBankingOptions {
  balanceMinor?: number;
  currency?: string;
  transactions?: TransactionRecord[];
}

const DEFAULT_DEMO_TRANSACTIONS: TransactionRecord[] = [
  { id: 'demo-txn-1', amountMinor: 2500000, currency: 'NGN', direction: 'credit', narration: 'Salary — Demo Employer', occurredAt: '2026-09-30T09:00:00.000Z' },
  { id: 'demo-txn-2', amountMinor: 150000, currency: 'NGN', direction: 'debit', narration: 'Demo Market Purchase', occurredAt: '2026-10-01T12:30:00.000Z' },
  { id: 'demo-txn-3', amountMinor: 500000, currency: 'NGN', direction: 'debit', narration: 'Transfer — Demo Recipient', occurredAt: '2026-10-02T08:15:00.000Z' },
];

/** Deterministic local adapter. Every response is marked simulated: true. */
export class DemoBankingProvider implements BankingProvider {
  readonly name: BankingProviderName = 'demo';
  private balanceMinor: number;
  private currency: string;
  private transactions: TransactionRecord[];

  constructor(options: DemoBankingOptions = {}) {
    this.balanceMinor = options.balanceMinor ?? 12500000; // ₦125,000.00 demo money
    this.currency = options.currency ?? 'NGN';
    this.transactions = options.transactions ?? [...DEFAULT_DEMO_TRANSACTIONS];
  }

  async getBalance(request: BankingRequest): Promise<BankingResponse> {
    return {
      reference: request.reference,
      provider: 'demo',
      state: 'SUCCESS',
      balanceMinor: this.balanceMinor,
      currency: this.currency,
      simulated: true,
      respondedAt: now(),
    };
  }

  async getTransactionHistory(request: BankingRequest): Promise<BankingResponse> {
    return {
      reference: request.reference,
      provider: 'demo',
      state: 'SUCCESS',
      currency: this.currency,
      transactions: [...this.transactions],
      simulated: true,
      respondedAt: now(),
    };
  }

  async transfer(request: BankingRequest): Promise<BankingResponse> {
    if (request.amountMinor === undefined || request.amountMinor <= 0) {
      return {
        reference: request.reference, provider: 'demo', state: 'FAILED',
        message: 'Transfer amount must be positive.', simulated: true, respondedAt: now(),
      };
    }
    if (request.amountMinor > this.balanceMinor) {
      return {
        reference: request.reference, provider: 'demo', state: 'FAILED',
        message: 'Insufficient demo funds.', simulated: true, respondedAt: now(),
      };
    }
    this.balanceMinor -= request.amountMinor;
    const providerReference = `DEMO-${request.reference}`;
    this.transactions.unshift({
      id: providerReference,
      amountMinor: request.amountMinor,
      currency: request.currency ?? this.currency,
      direction: 'debit',
      narration: `Transfer — ${request.recipientReference ?? 'unknown recipient'} (DEMO)`,
      occurredAt: now(),
    });
    return {
      reference: request.reference,
      provider: 'demo',
      providerReference,
      state: 'SUCCESS',
      currency: request.currency ?? this.currency,
      simulated: true,
      respondedAt: now(),
    };
  }
}

// ---------------------------------------------------------------------------
// Wema adapter — stub until endpoints are VERIFIED (docs/WEMA.md)
// ---------------------------------------------------------------------------

/** Isolated Wema/ALAT adapter. Every operation throws until verified. */
export class WemaProvider implements BankingProvider {
  readonly name: BankingProviderName = 'wema';

  async getBalance(_request: BankingRequest): Promise<BankingResponse> {
    throw new NotVerifiedError('WemaProvider', 'getBalance');
  }

  async getTransactionHistory(_request: BankingRequest): Promise<BankingResponse> {
    throw new NotVerifiedError('WemaProvider', 'getTransactionHistory');
  }

  async transfer(_request: BankingRequest): Promise<BankingResponse> {
    throw new NotVerifiedError('WemaProvider', 'transfer');
  }
}

/** Select an adapter by name. Unknown names fail loudly — never default silently. */
export function createBankingProvider(
  name: BankingProviderName,
  demoOptions?: DemoBankingOptions,
): BankingProvider {
  if (name === 'demo') return new DemoBankingProvider(demoOptions);
  if (name === 'wema') return new WemaProvider();
  throw new Error(`Unknown banking provider: ${String(name)}`);
}
export * from "./mock-core.js";
export * from "./statement.js";
