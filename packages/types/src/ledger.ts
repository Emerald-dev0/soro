/** Financial ledger record (the mock banking core's real persisted state). */
export const FINANCIAL_TYPES = ['TRANSFER', 'AIRTIME', 'DATA', 'BILL_PAYMENT', 'REVERSAL', 'CREDIT', 'DEBIT'] as const;
export type FinancialType = (typeof FINANCIAL_TYPES)[number];

export const FINANCIAL_DIRECTIONS = ['DEBIT', 'CREDIT'] as const;
export type FinancialDirection = (typeof FINANCIAL_DIRECTIONS)[number];

export const FINANCIAL_STATUSES = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED'] as const;
export type FinancialStatus = (typeof FINANCIAL_STATUSES)[number];

export interface FinancialTransaction {
  id: string;
  reference: string;
  accountId: string;
  customerId: string;
  type: FinancialType;
  direction: FinancialDirection;
  amountMinor: number;
  currency: string;
  status: FinancialStatus;
  description: string;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}
