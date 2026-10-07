import { describe, expect, it } from 'vitest';
import { createBankingProvider, DemoBankingProvider, NotVerifiedError, WemaProvider } from '../src/index.js';
import type { BankingRequest } from '@soro/types';

function req(partial: Partial<BankingRequest> = {}): BankingRequest {
  return {
    reference: 'ref-1',
    idempotencyKey: 'idem-1',
    sessionId: 'sess-1',
    correlationId: 'corr-1',
    kind: 'BALANCE',
    requestedAt: new Date().toISOString(),
    ...partial,
  };
}

describe('DemoBankingProvider', () => {
  it('returns a deterministic simulated balance', async () => {
    const p = new DemoBankingProvider({ balanceMinor: 12500000 });
    const res = await p.getBalance(req());
    expect(res.state).toBe('SUCCESS');
    expect(res.balanceMinor).toBe(12500000);
    expect(res.simulated).toBe(true);
  });

  it('returns canned transaction history', async () => {
    const p = new DemoBankingProvider();
    const res = await p.getTransactionHistory(req({ kind: 'TRANSACTION_HISTORY' }));
    expect(res.state).toBe('SUCCESS');
    expect(res.transactions?.length).toBeGreaterThan(0);
    expect(res.simulated).toBe(true);
  });

  it('processes transfers and debits the demo balance', async () => {
    const p = new DemoBankingProvider({ balanceMinor: 100000 });
    const ok = await p.transfer(req({ kind: 'TRANSFER', amountMinor: 5000, recipientReference: 'mama' }));
    expect(ok.state).toBe('SUCCESS');
    expect(ok.providerReference).toMatch(/^DEMO-/);
    const after = await p.getBalance(req());
    expect(after.balanceMinor).toBe(95000);
  });

  it('fails transfers cleanly on bad amount or insufficient funds', async () => {
    const p = new DemoBankingProvider({ balanceMinor: 1000 });
    expect((await p.transfer(req({ kind: 'TRANSFER', amountMinor: 0 }))).state).toBe('FAILED');
    expect((await p.transfer(req({ kind: 'TRANSFER', amountMinor: 99999 }))).state).toBe('FAILED');
  });
});

describe('WemaProvider (NOT VERIFIED stub)', () => {
  it('throws NotVerifiedError on every operation — never fabricates', async () => {
    const p = new WemaProvider();
    await expect(p.getBalance(req())).rejects.toBeInstanceOf(NotVerifiedError);
    await expect(p.getTransactionHistory(req())).rejects.toBeInstanceOf(NotVerifiedError);
    await expect(p.transfer(req({ kind: 'TRANSFER' }))).rejects.toBeInstanceOf(NotVerifiedError);
  });
});

describe('createBankingProvider', () => {
  it('selects adapters and rejects unknown names', () => {
    expect(createBankingProvider('demo')).toBeInstanceOf(DemoBankingProvider);
    expect(createBankingProvider('wema')).toBeInstanceOf(WemaProvider);
    expect(() => createBankingProvider('ghost-bank' as never)).toThrow();
  });
});
