import type { Database } from '@soro/db';
import { recordEmail } from '@soro/db';
import type { FinancialTransaction } from '@soro/types';

/**
 * Statement generation — structured first, email abstraction second.
 * Never fabricate: rows come from the real ledger.
 */
export interface Statement {
  accountNumber: string;
  customerId: string;
  from: string;
  to: string;
  transactions: FinancialTransaction[];
  generatedAt: string;
  bodyPreview: string;
}

export function generateStatement(
  db: Database,
  input: { accountId: string; accountNumber: string; customerId: string; fromIso: string; toIso: string },
): Statement {
  const rows = db.prepare(
    `SELECT * FROM transactions WHERE account_id=? AND created_at >= ? AND created_at <= ? ORDER BY created_at`,
  ).all(input.accountId, input.fromIso, input.toIso) as Record<string, unknown>[];
  const txns: FinancialTransaction[] = rows.map((r) => ({
    id: r['reference'] as string, reference: r['reference'] as string,
    accountId: (r['account_id'] as string) ?? '', customerId: (r['customer_id'] as string) ?? '',
    type: r['kind'] as FinancialTransaction['type'], direction: (r['direction'] as FinancialTransaction['direction']) ?? 'DEBIT',
    amountMinor: (r['amount_minor'] as number) ?? 0, currency: (r['currency'] as string) ?? 'NGN',
    status: r['state'] as FinancialTransaction['status'], description: (r['description'] as string) ?? '',
    metadata: r['metadata_json'] ? JSON.parse(r['metadata_json'] as string) : {},
    idempotencyKey: r['idempotency_key'] as string,
    createdAt: r['created_at'] as string, updatedAt: r['updated_at'] as string,
    completedAt: (r['completed_at'] as string) ?? undefined,
  }));
  const bodyPreview = txns.length === 0
    ? 'No transactions in this period.'
    : txns.map((t) => `${t.createdAt.slice(0, 10)} | ${t.type} | ${t.direction} | ₦${t.amountMinor / 100} | ${t.status}`).join('\n');
  return {
    accountNumber: input.accountNumber, customerId: input.customerId,
    from: input.fromIso, to: input.toIso, transactions: txns,
    generatedAt: new Date().toISOString(), bodyPreview,
  };
}

export function sendStatementEmail(
  db: Database,
  input: { toAddress: string; subject: string; statement: Statement },
): { id: string; status: 'SENT' } {
  const id = `email-${Date.now()}`;
  recordEmail(db, {
    id, toAddress: input.toAddress, subject: input.subject, kind: 'STATEMENT',
    status: 'SENT', bodyPreview: input.statement.bodyPreview.slice(0, 500),
    createdAt: new Date().toISOString(),
  });
  return { id, status: 'SENT' };
}
