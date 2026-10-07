import { beforeEach, describe, expect, it } from 'vitest';
import { openDatabase, migrate, seedDemoData } from '@soro/db';
import { MockBankingCore, MockBankingError } from '../src/mock-core.js';

let db: ReturnType<typeof openDatabase>;
let core: MockBankingCore;

beforeEach(() => {
  db = openDatabase(':memory:');
  migrate(db);
  seedDemoData(db);
  core = new MockBankingCore(db);
});

describe('balance', () => {
  it('returns the real database balance', () => {
    const account = core.getAccountBalance('acct-daniel');
    expect(account.balanceMinor).toBe(8425000);
  });

  it('throws for missing account', () => {
    expect(() => core.getAccountBalance('nope')).toThrow(MockBankingError);
  });
});

describe('transfers', () => {
  it('moves money between two accounts atomically', () => {
    core.transfer({ fromAccountId: 'acct-daniel', toAccountNumber: '0123456780', amountMinor: 500000, idempotencyKey: 'k1' });
    expect(core.getAccountBalance('acct-daniel').balanceMinor).toBe(7925000);
    expect(core.getAccountBalance('acct-aisha').balanceMinor).toBe(13060000);
  });

  it('rejects insufficient funds', () => {
    expect(() => core.transfer({ fromAccountId: 'acct-daniel', toAccountNumber: '0123456780', amountMinor: 99999999900, idempotencyKey: 'k2' })).toThrow(/Insufficient/);
    expect(core.getAccountBalance('acct-daniel').balanceMinor).toBe(8425000);
  });

  it('rejects invalid beneficiary', () => {
    expect(() => core.transfer({ fromAccountId: 'acct-daniel', toAccountNumber: '9999999999', amountMinor: 100, idempotencyKey: 'k3' })).toThrow(/Recipient/);
  });

  it('is idempotent on duplicate keys', () => {
    const a = core.transfer({ fromAccountId: 'acct-daniel', toAccountNumber: '0123456780', amountMinor: 500000, idempotencyKey: 'k4' });
    const b = core.transfer({ fromAccountId: 'acct-daniel', toAccountNumber: '0123456780', amountMinor: 500000, idempotencyKey: 'k4' });
    expect(b.reference).toBe(a.reference);
    expect(core.getAccountBalance('acct-daniel').balanceMinor).toBe(7925000);
  });

  it('records a reversal and returns money', () => {
    const t = core.transfer({ fromAccountId: 'acct-daniel', toAccountNumber: '0123456780', amountMinor: 500000, idempotencyKey: 'k5' });
    core.reverseTransfer(t.reference);
    expect(core.getAccountBalance('acct-daniel').balanceMinor).toBe(8425000);
  });

  it('supports deterministic failure scenarios', () => {
    expect(() => core.transfer({ fromAccountId: 'acct-daniel', toAccountNumber: '0123456780', amountMinor: 500000, idempotencyKey: 'k6', scenario: 'transfer_failed' })).not.toThrow();
    expect(core.getAccountBalance('acct-daniel').balanceMinor).toBe(8425000);
  });
});

describe('airtime', () => {
  it('debits the account and records the purchase', () => {
    const t = core.purchaseAirtime({ accountId: 'acct-daniel', phoneNumber: '08030000001', network: 'MTN', amountMinor: 50000, idempotencyKey: 'a1' });
    expect(core.getAccountBalance('acct-daniel').balanceMinor).toBe(8375000);
    expect(t.status).toBe('SUCCESS');
  });

  it('rejects invalid amounts', () => {
    expect(() => core.purchaseAirtime({ accountId: 'acct-daniel', phoneNumber: '08030000001', network: 'MTN', amountMinor: 0, idempotencyKey: 'a2' })).toThrow(/Amount must be a positive integer/);
  });

  it('rejects insufficient funds', () => {
    expect(() => core.purchaseAirtime({ accountId: 'acct-daniel', phoneNumber: '08030000001', network: 'MTN', amountMinor: 99999999900, idempotencyKey: 'a3' })).toThrow(/Insufficient/);
  });
});

describe('data plans', () => {
  it('lists plans per network', () => {
    expect(core.getDataPlans('MTN').length).toBeGreaterThan(0);
  });

  it('filters by budget', () => {
    const plans = core.searchDataPlans({ network: 'MTN', maxBudgetMinor: 50000 });
    expect(plans.every((p) => p.priceMinor <= 50000)).toBe(true);
  });

  it('recommends a plan within budget', () => {
    const rec = core.recommendDataPlan({ network: 'MTN', budgetMinor: 50000 });
    expect(rec.recommended).toBeDefined();
    expect(rec.reason.length).toBeGreaterThan(0);
  });

  it('purchasing data debits the account', () => {
    const rec = core.recommendDataPlan({ network: 'MTN', budgetMinor: 50000 });
    core.purchaseData({ accountId: 'acct-daniel', phoneNumber: '08030000001', network: 'MTN', planId: rec.recommended!.id, idempotencyKey: 'd1' });
    expect(core.getAccountBalance('acct-daniel').balanceMinor).toBe(8425000 - rec.recommended!.priceMinor);
  });
});
