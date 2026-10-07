import { randomBytes } from 'node:crypto';
import type { Database } from '@soro/db';
import {
  getAccountById, getAccountByNumber, getCustomerByPhone,
  getFinancialTransactionByIdempotencyKey, getFinancialTransactionByReference,
  insertAirtimePurchase, insertDataPurchase, insertFinancialTransaction,
  listDataPlans, listFinancialTransactionsForAccount, updateFinancialTransactionStatus,
} from '@soro/db';
import type { Account, DataPlan, FinancialTransaction, Network } from '@soro/types';

/**
 * MockBankingCore — the heart of the hackathon demo.
 * Real persisted state, atomic money movement, deterministic scenario
 * injection for demos/tests. The rest of Soro talks to this through
 * method calls, never by manipulating tables directly.
 */

export type Scenario =
  | 'insufficient_funds'
  | 'provider_timeout'
  | 'transfer_pending'
  | 'transfer_failed'
  | 'transfer_reversed'
  | 'account_frozen';

export class MockBankingError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'MockBankingError';
  }
}

export interface TransferInput {
  fromAccountId: string;
  toAccountNumber: string;
  amountMinor: number;
  description?: string;
  idempotencyKey: string;
  scenario?: Scenario;
}

export interface AirtimeInput {
  accountId: string;
  phoneNumber: string;
  network: Network;
  amountMinor: number;
  idempotencyKey: string;
  scenario?: Scenario;
}

export interface DataInput {
  accountId: string;
  phoneNumber: string;
  network: Network;
  planId: string;
  idempotencyKey: string;
  scenario?: Scenario;
}

export const AIRTIME_DENOMINATIONS_MINOR = [10000, 20000, 50000, 100000, 200000, 500000];

function now(): string { return new Date().toISOString(); }

export function generateReference(): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `SORO-TXN-${d}-${randomBytes(3).toString('hex').toUpperCase()}`;
}


export class MockBankingCore {
  constructor(private readonly db: Database) {}

  // ---------------------------------------------------------------- balance
  getAccountBalance(accountId: string): Account {
    const account = getAccountById(this.db, accountId);
    if (!account) throw new MockBankingError('ACCOUNT_NOT_FOUND', 'Account not found.');
    return account;
  }

  // ------------------------------------------------------------ transactions
  getRecentTransactions(accountId: string, limit = 10): FinancialTransaction[] {
    return listFinancialTransactionsForAccount(this.db, accountId, limit).map(rowToFinancial);
  }

  getTransactionsByDateRange(accountId: string, fromIso: string, toIso: string): FinancialTransaction[] {
    const rows = this.db.prepare(
      `SELECT * FROM transactions WHERE account_id=? AND created_at >= ? AND created_at <= ? ORDER BY created_at DESC`,
    ).all(accountId, fromIso, toIso) as never[];
    return (rows as any[]).map(rowToFinancial);
  }

  getTransaction(reference: string): FinancialTransaction | undefined {
    const row = getFinancialTransactionByReference(this.db, reference);
    return row ? rowToFinancial(row) : undefined;
  }

  // ---------------------------------------------------------------- transfer
  transfer(input: TransferInput): FinancialTransaction {
    const existing = getFinancialTransactionByIdempotencyKey(this.db, input.idempotencyKey);
    if (existing) return rowToFinancial(existing);

    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
      throw new MockBankingError('INVALID_AMOUNT', 'Amount must be a positive integer (kobo).');
    }
    const sender = getAccountById(this.db, input.fromAccountId);
    if (!sender) throw new MockBankingError('ACCOUNT_NOT_FOUND', 'Sender account not found.');
    if (sender.status !== 'ACTIVE') throw new MockBankingError('ACCOUNT_FROZEN', 'Sender account is not active.');
    const receiver = getAccountByNumber(this.db, input.toAccountNumber);
    if (!receiver) throw new MockBankingError('BENEFICIARY_NOT_FOUND', 'Recipient account not found.');
    if (receiver.status !== 'ACTIVE') throw new MockBankingError('ACCOUNT_FROZEN', 'Recipient account is not active.');

    if (input.scenario === 'insufficient_funds' || sender.availableBalanceMinor < input.amountMinor) {
      throw new MockBankingError('INSUFFICIENT_FUNDS', 'Insufficient available balance.');
    }
    if (input.scenario === 'account_frozen') {
      throw new MockBankingError('ACCOUNT_FROZEN', 'Account is frozen.');
    }

    const reference = generateReference();
    const createdAt = now();
    const scenario = input.scenario;

    this.db.exec('BEGIN IMMEDIATE');
    try {
      const debit = this.db.prepare(
        `UPDATE accounts SET balance_minor = balance_minor - ?, available_balance_minor = available_balance_minor - ?, updated_at = ?
         WHERE id = ? AND status = 'ACTIVE' AND balance_minor >= ? AND available_balance_minor >= ?`,
      ).run(input.amountMinor, input.amountMinor, createdAt, sender.id, input.amountMinor, input.amountMinor);
      if (debit.changes !== 1) throw new MockBankingError('INSUFFICIENT_FUNDS', 'Insufficient available balance.');

      const senderTxn: FinancialTransaction = {
        id: reference, reference, accountId: sender.id, customerId: sender.customerId,
        type: 'TRANSFER', direction: 'DEBIT', amountMinor: input.amountMinor, currency: 'NGN',
        status: scenario === 'transfer_pending' ? 'PENDING' : scenario === 'transfer_failed' ? 'FAILED' : 'SUCCESS',
        description: input.description ?? `Transfer to ${receiver.accountNumber}`,
        metadata: { counterparty: receiver.accountNumber }, idempotencyKey: input.idempotencyKey,
        createdAt, updatedAt: createdAt,
        completedAt: scenario === 'transfer_pending' || scenario === 'transfer_failed' ? undefined : createdAt,
      };
      insertFinancialTransaction(this.db, senderTxn);

      if (scenario === 'transfer_failed' || scenario === 'provider_timeout') {
        // roll back the debit — nothing leaves the sender
        this.db.prepare(
          `UPDATE accounts SET balance_minor = balance_minor + ?, available_balance_minor = available_balance_minor + ?, updated_at = ? WHERE id = ?`,
        ).run(input.amountMinor, input.amountMinor, createdAt, sender.id);
        updateFinancialTransactionStatus(this.db, reference, 'FAILED');
        this.db.exec('COMMIT');
        if (scenario === 'provider_timeout') throw new MockBankingError('PROVIDER_UNAVAILABLE', 'Transfer did not complete; funds reserved then released.');
        return { ...senderTxn, status: 'FAILED' };
      }

      if (scenario !== 'transfer_pending' && scenario !== 'transfer_reversed') {
        const credit = this.db.prepare(
          `UPDATE accounts SET balance_minor = balance_minor + ?, available_balance_minor = available_balance_minor + ?, updated_at = ? WHERE id = ?`,
        ).run(input.amountMinor, input.amountMinor, createdAt, receiver.id);
        if (credit.changes !== 1) throw new MockBankingError('TRANSACTION_FAILED', 'Credit failed.');
        const receiverTxn: FinancialTransaction = {
          id: `${reference}-RCV`, reference: `${reference}-RCV`, accountId: receiver.id, customerId: receiver.customerId,
          type: 'TRANSFER', direction: 'CREDIT', amountMinor: input.amountMinor, currency: 'NGN',
          status: 'SUCCESS', description: `Transfer from ${sender.accountNumber}`,
          metadata: { counterparty: sender.accountNumber }, idempotencyKey: `${input.idempotencyKey}-rcv`,
          createdAt, updatedAt: createdAt, completedAt: createdAt,
        };
        insertFinancialTransaction(this.db, receiverTxn);
      }

      this.db.exec('COMMIT');

      if (scenario === 'transfer_reversed') {
        this.reverseTransfer(reference);
        return { ...senderTxn, status: 'REVERSED' };
      }
      return senderTxn;
    } catch (e) {
      try { this.db.exec('ROLLBACK'); } catch { /* already committed */ }
      throw e;
    }
  }

  reverseTransfer(reference: string): FinancialTransaction {
    const txn = this.getTransaction(reference);
    if (!txn) throw new MockBankingError('TRANSACTION_PENDING', 'Transaction not found.');
    if (txn.status === 'REVERSED') return txn;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const t = now();
      if (txn.direction === 'DEBIT') {
        this.db.prepare(`UPDATE accounts SET balance_minor = balance_minor + ?, available_balance_minor = available_balance_minor + ?, updated_at = ? WHERE id = ?`)
          .run(txn.amountMinor, txn.amountMinor, t, txn.accountId);
      }
      updateFinancialTransactionStatus(this.db, reference, 'REVERSED', t);
      insertFinancialTransaction(this.db, {
        id: `${reference}-RVS`, reference: `${reference}-RVS`, accountId: txn.accountId, customerId: txn.customerId,
        type: 'REVERSAL', direction: 'CREDIT', amountMinor: txn.amountMinor, currency: 'NGN',
        status: 'SUCCESS', description: `Reversal of ${reference}`, metadata: { reverses: reference },
        idempotencyKey: `${reference}-RVS`, createdAt: t, updatedAt: t, completedAt: t,
      });
      this.db.exec('COMMIT');
      return { ...txn, status: 'REVERSED' };
    } catch (e) {
      try { this.db.exec('ROLLBACK'); } catch { /* ignore */ }
      throw e;
    }
  }

  // ----------------------------------------------------------------- airtime
  getAirtimeOptions(): number[] {
    return [...AIRTIME_DENOMINATIONS_MINOR];
  }

  purchaseAirtime(input: AirtimeInput): FinancialTransaction {
    const existing = getFinancialTransactionByIdempotencyKey(this.db, input.idempotencyKey);
    if (existing) return rowToFinancial(existing);
    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
      throw new MockBankingError('INVALID_AMOUNT', 'Amount must be a positive integer (kobo).');
    }
    const account = getAccountById(this.db, input.accountId);
    if (!account) throw new MockBankingError('ACCOUNT_NOT_FOUND', 'Account not found.');
    if (account.status !== 'ACTIVE') throw new MockBankingError('ACCOUNT_FROZEN', 'Account is not active.');
    if (input.scenario === 'insufficient_funds' || account.availableBalanceMinor < input.amountMinor) {
      throw new MockBankingError('INSUFFICIENT_FUNDS', 'Insufficient available balance.');
    }
    if (input.scenario === 'provider_timeout') throw new MockBankingError('PROVIDER_UNAVAILABLE', 'Airtime provider timeout.');

    const reference = generateReference();
    const t = now();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const debit = this.db.prepare(
        `UPDATE accounts SET balance_minor = balance_minor - ?, available_balance_minor = available_balance_minor - ?, updated_at = ?
         WHERE id = ? AND status='ACTIVE' AND balance_minor >= ? AND available_balance_minor >= ?`,
      ).run(input.amountMinor, input.amountMinor, t, account.id, input.amountMinor, input.amountMinor);
      if (debit.changes !== 1) throw new MockBankingError('INSUFFICIENT_FUNDS', 'Insufficient available balance.');
      const txn: FinancialTransaction = {
        id: reference, reference, accountId: account.id, customerId: account.customerId,
        type: 'AIRTIME', direction: 'DEBIT', amountMinor: input.amountMinor, currency: 'NGN',
        status: input.scenario === 'transfer_pending' ? 'PENDING' : 'SUCCESS',
        description: `${input.network} airtime to ${input.phoneNumber}`,
        metadata: { network: input.network, phoneNumber: input.phoneNumber },
        idempotencyKey: input.idempotencyKey, createdAt: t, updatedAt: t,
        completedAt: input.scenario === 'transfer_pending' ? undefined : t,
      };
      insertFinancialTransaction(this.db, txn);
      insertAirtimePurchase(this.db, {
        id: `${reference}-ATP`, transactionReference: reference, accountId: account.id,
        phoneNumber: input.phoneNumber, network: input.network, amountMinor: input.amountMinor,
        status: txn.status, createdAt: t,
      });
      this.db.exec('COMMIT');
      return txn;
    } catch (e) {
      try { this.db.exec('ROLLBACK'); } catch { /* ignore */ }
      throw e;
    }
  }

  // -------------------------------------------------------------------- data
  getDataPlans(network?: Network): DataPlan[] {
    const plans = listDataPlans(this.db);
    return network ? plans.filter((p) => p.network === network) : plans;
  }

  searchDataPlans(query: { network?: Network; maxBudgetMinor?: number; minDataMb?: number }): DataPlan[] {
    return this.getDataPlans(query.network).filter(
      (p) => (query.maxBudgetMinor === undefined || p.priceMinor <= query.maxBudgetMinor)
        && (query.minDataMb === undefined || p.dataMb >= query.minDataMb),
    );
  }

  recommendDataPlan(query: { network?: Network; budgetMinor?: number; desiredDataMb?: number; desiredValidityDays?: number }): { recommended?: DataPlan; alternatives: DataPlan[]; reason: string } {
    let plans = this.getDataPlans(query.network);
    if (query.budgetMinor !== undefined) plans = plans.filter((p) => p.priceMinor <= query.budgetMinor!);
    if (plans.length === 0) return { alternatives: [], reason: 'No plans fit the requested budget/network.' };

    const score = (p: DataPlan): number => {
      // price/value ratio: MB per 1000 kobo (₦10)
      const value = p.dataMb / (p.priceMinor / 1000);
      let s = value;
      if (query.desiredDataMb !== undefined && p.dataMb >= query.desiredDataMb) s += 5;
      if (query.desiredValidityDays !== undefined && p.validityDays >= query.desiredValidityDays) s += 3;
      return s;
    };
    const ranked = [...plans].sort((a, b) => score(b) - score(a));
    return {
      recommended: ranked[0],
      alternatives: ranked.slice(1, 3),
      reason: `Best balance of data volume and validity within budget: ${ranked[0].dataMb}MB for ₦${ranked[0].priceMinor / 100}, valid ${ranked[0].validityDays} days.`,
    };
  }

  purchaseData(input: DataInput): FinancialTransaction {
    const existing = getFinancialTransactionByIdempotencyKey(this.db, input.idempotencyKey);
    if (existing) return rowToFinancial(existing);
    const plan = listDataPlans(this.db).find((p) => p.id === input.planId);
    if (!plan) throw new MockBankingError('INVALID_AMOUNT', 'Unknown data plan.');
    if (input.scenario === 'provider_timeout') throw new MockBankingError('PROVIDER_UNAVAILABLE', 'Data provider timeout.');
    const account = getAccountById(this.db, input.accountId);
    if (!account) throw new MockBankingError('ACCOUNT_NOT_FOUND', 'Account not found.');
    if (account.status !== 'ACTIVE') throw new MockBankingError('ACCOUNT_FROZEN', 'Account is not active.');
    if (input.scenario === 'insufficient_funds' || account.availableBalanceMinor < plan.priceMinor) {
      throw new MockBankingError('INSUFFICIENT_FUNDS', 'Insufficient available balance.');
    }
    const reference = generateReference();
    const t = now();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const debit = this.db.prepare(
        `UPDATE accounts SET balance_minor = balance_minor - ?, available_balance_minor = available_balance_minor - ?, updated_at = ?
         WHERE id = ? AND status='ACTIVE' AND balance_minor >= ? AND available_balance_minor >= ?`,
      ).run(plan.priceMinor, plan.priceMinor, t, account.id, plan.priceMinor, plan.priceMinor);
      if (debit.changes !== 1) throw new MockBankingError('INSUFFICIENT_FUNDS', 'Insufficient available balance.');
      const txn: FinancialTransaction = {
        id: reference, reference, accountId: account.id, customerId: account.customerId,
        type: 'DATA', direction: 'DEBIT', amountMinor: plan.priceMinor, currency: 'NGN',
        status: 'SUCCESS', description: `${plan.label} ${plan.network} data to ${input.phoneNumber}`,
        metadata: { network: plan.network, planId: plan.id, dataMb: plan.dataMb },
        idempotencyKey: input.idempotencyKey, createdAt: t, updatedAt: t, completedAt: t,
      };
      insertFinancialTransaction(this.db, txn);
      insertDataPurchase(this.db, {
        id: `${reference}-DTP`, transactionReference: reference, accountId: account.id,
        phoneNumber: input.phoneNumber, network: plan.network, planId: plan.id,
        amountMinor: plan.priceMinor, status: txn.status, createdAt: t,
      });
      this.db.exec('COMMIT');
      return txn;
    } catch (e) {
      try { this.db.exec('ROLLBACK'); } catch { /* ignore */ }
      throw e;
    }
  }

  // ------------------------------------------------------------ verification
  verifyBeneficiary(customerId: string, accountNumber: string): { ok: boolean; account?: Account } {
    const account = getAccountByNumber(this.db, accountNumber);
    if (!account) return { ok: false };
    return { ok: true, account };
  }

  findCustomerByPhone(phone: string) {
    return getCustomerByPhone(this.db, phone);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToFinancial(r: any): FinancialTransaction {
  return {
    id: r.reference, reference: r.reference, accountId: r.account_id ?? '', customerId: r.customer_id ?? '',
    type: r.kind, direction: r.direction ?? 'DEBIT', amountMinor: r.amount_minor ?? 0,
    currency: r.currency ?? 'NGN', status: r.state, description: r.description ?? '',
    metadata: r.metadata_json ? JSON.parse(r.metadata_json) : {}, idempotencyKey: r.idempotency_key,
    createdAt: r.created_at, updatedAt: r.updated_at, completedAt: r.completed_at ?? undefined,
  };
}
