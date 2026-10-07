import { beforeEach, describe, expect, it } from 'vitest';
import { openDatabase, migrate, seedDemoData } from '@soro/db';
import { assessRisk, authorizeWithDtmfPin, authenticateCustomer, DemoVoiceIdentityProvider } from '../src/index.js';

let db: ReturnType<typeof openDatabase>;
beforeEach(() => { db = openDatabase(':memory:'); migrate(db); seedDemoData(db); });

describe('authentication', () => {
  it('succeeds with the correct demo PIN', () => {
    expect(authenticateCustomer(db, { customerId: 'cust-daniel', method: 'DTMF_PIN', pin: '1234' })).toBe('SUCCESS');
  });
  it('fails with a wrong PIN', () => {
    expect(authenticateCustomer(db, { customerId: 'cust-daniel', method: 'DTMF_PIN', pin: '9999' })).toBe('FAILED');
  });
  it('locks after repeated failures', () => {
    for (let i = 0; i < 5; i++) authenticateCustomer(db, { customerId: 'cust-daniel', method: 'DTMF_PIN', pin: '9999' });
    expect(authenticateCustomer(db, { customerId: 'cust-daniel', method: 'DTMF_PIN', pin: '1234' })).toBe('LOCKED');
  });
});

describe('DTMF authorization', () => {
  it('succeeds with the correct PIN', () => {
    expect(authorizeWithDtmfPin(db, { customerId: 'cust-daniel', transactionReference: 'T1', customerNumber: 'CUST-001', pin: '1234' })).toBe('SUCCESS');
  });
  it('fails with a wrong PIN and blocks after 3 failures', () => {
    for (let i = 0; i < 3; i++) expect(authorizeWithDtmfPin(db, { customerId: 'cust-daniel', transactionReference: 'T2', customerNumber: 'CUST-001', pin: '0000' })).toBe('FAILED');
    expect(authorizeWithDtmfPin(db, { customerId: 'cust-daniel', transactionReference: 'T2', customerNumber: 'CUST-001', pin: '1234' })).toBe('LOCKED');
  });
});

describe('risk engine', () => {
  it('balance lookup is LOW risk and needs no DTMF', () => {
    const r = assessRisk({ toolName: 'getAccountBalance' });
    expect(r.riskLevel).toBe('LOW');
    expect(r.requiredAuthentication).toBe('PHONE_LOOKUP');
  });
  it('airtime purchase is MEDIUM risk', () => {
    expect(assessRisk({ toolName: 'purchaseAirtime' }).riskLevel).toBe('MEDIUM');
  });
  it('large transfer to a new beneficiary is HIGH risk', () => {
    const r = assessRisk({ toolName: 'createTransfer', amountMinor: 10000000, isNewBeneficiary: true });
    expect(r.riskLevel).toBe('HIGH');
    expect(r.requiredAuthentication).toBe('DTMF_PIN');
  });
});

describe('voice identity (demo provider)', () => {
  it('verifies an enrolled customer and increments counters', () => {
    const v = new DemoVoiceIdentityProvider(db);
    expect(v.verify('cust-daniel').ok).toBe(true);
    const profile = v.getProfile('cust-daniel') as { verification_count: number };
    expect(profile.verification_count).toBe(13);
  });
});
