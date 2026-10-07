import { createHash, randomUUID } from 'node:crypto';
import type { Database } from '@soro/db';
import {
  countAuthzFailures, countRecentAuthnFailures, getCustomerByPhone,
  recordAuthnAttempt, recordAuthzAttempt, verifyCustomerPin,
} from '@soro/db';
import type { Customer, RiskAssessment } from '@soro/types';

/**
 * Security subsystem. DTMF digits and PINs are handled here and NEVER
 * flow to the LLM, transcripts, dashboard, events metadata, or logs.
 */

export function hashDemoPin(customerNumber: string, pin: string): string {
  return createHash('sha256').update(`soro:${customerNumber}:${pin}`).digest('hex');
}

const MAX_AUTH_FAILURES = 5;
const MAX_AUTHZ_FAILURES = 3;

export type AuthnOutcome = 'SUCCESS' | 'FAILED' | 'LOCKED';

export function authenticateCustomer(
  db: Database,
  input: { customerId: string; callSessionId?: string; method: 'PHONE_LOOKUP' | 'DTMF_PIN' | 'VOICE_VERIFICATION'; pin?: string },
): AuthnOutcome {
  const failures = countRecentAuthnFailures(db, input.customerId);
  if (failures >= MAX_AUTH_FAILURES) {
    recordAuthnAttempt(db, { id: randomUUID(), customerId: input.customerId, callSessionId: input.callSessionId, method: input.method, status: 'LOCKED', attemptNumber: failures + 1, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
    return 'LOCKED';
  }
  let ok = input.method === 'PHONE_LOOKUP';
  if (input.method === 'DTMF_PIN' && input.pin) {
    const customer = db.prepare(`SELECT customer_number FROM customers WHERE id=?`).get(input.customerId) as { customer_number?: string } | undefined;
    ok = !!customer?.customer_number && verifyCustomerPin(db, input.customerId, hashDemoPin(customer.customer_number, input.pin));
  }
  if (input.method === 'VOICE_VERIFICATION') ok = true; // demo voice identity provider accepts; see VoiceIdentityProvider
  recordAuthnAttempt(db, { id: randomUUID(), customerId: input.customerId, callSessionId: input.callSessionId, method: input.method, status: ok ? 'SUCCESS' : 'FAILED', attemptNumber: failures + 1, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
  return ok ? 'SUCCESS' : 'FAILED';
}

export type AuthzOutcome = 'SUCCESS' | 'FAILED' | 'LOCKED' | 'TIMEOUT';

/**
 * Verify a DTMF-provided PIN for a transaction. The raw digits stop here.
 * Only the outcome is returned to the caller (and to Ayo).
 */
export function authorizeWithDtmfPin(
  db: Database,
  input: { customerId: string; callSessionId?: string; transactionReference: string; customerNumber: string; pin: string },
): AuthzOutcome {
  const failures = countAuthzFailures(db, input.transactionReference);
  if (failures >= MAX_AUTHZ_FAILURES) {
    recordAuthzAttempt(db, { id: randomUUID(), customerId: input.customerId, callSessionId: input.callSessionId, transactionReference: input.transactionReference, method: 'DTMF_PIN', status: 'LOCKED', attemptNumber: failures + 1, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
    return 'LOCKED';
  }
  const ok = verifyCustomerPin(db, input.customerId, hashDemoPin(input.customerNumber, input.pin));
  recordAuthzAttempt(db, { id: randomUUID(), customerId: input.customerId, callSessionId: input.callSessionId, transactionReference: input.transactionReference, method: 'DTMF_PIN', status: ok ? 'SUCCESS' : 'FAILED', attemptNumber: failures + 1, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() });
  return ok ? 'SUCCESS' : 'FAILED';
}

export function getCustomerByCallerNumber(db: Database, fromNumber: string): Customer | undefined {
  return getCustomerByPhone(db, fromNumber);
}

/**
 * Deterministic risk engine — real rules, not a fake AI score.
 */
export function assessRisk(input: {
  toolName: string;
  amountMinor?: number;
  isNewBeneficiary?: boolean;
  voiceConfidence?: number;
  transactionType?: string;
}): RiskAssessment {
  const toolRisk: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
    getAccountBalance: 'LOW',
    getRecentTransactions: 'LOW',
    getTransaction: 'LOW',
    getDataPlans: 'LOW',
    recommendDataPlan: 'LOW',
    getAirtimeOptions: 'LOW',
    getBeneficiaries: 'LOW',
    verifyBeneficiary: 'LOW',
    generateStatement: 'LOW',
    sendStatementEmail: 'MEDIUM',
    createSupportCase: 'LOW',
    escalateToHuman: 'LOW',
    getTransferStatus: 'LOW',
    purchaseAirtime: 'MEDIUM',
    purchaseData: 'MEDIUM',
    createTransfer: 'HIGH',
  };
  let level = toolRisk[input.toolName] ?? 'MEDIUM';
  const reasons: string[] = [`TOOL_${level}`];
  if (input.amountMinor !== undefined && input.amountMinor > 5000000) {
    level = 'HIGH';
    reasons.push('LARGE_AMOUNT');
  }
  if (input.isNewBeneficiary) {
    level = level === 'LOW' ? 'MEDIUM' : 'HIGH';
    reasons.push('NEW_BENEFICIARY');
  }
  if (input.voiceConfidence !== undefined && input.voiceConfidence < 0.6) {
    level = 'HIGH';
    reasons.push('LOW_VOICE_CONFIDENCE');
  }
  const requiredAuthentication =
    level === 'HIGH' ? 'DTMF_PIN'
    : level === 'MEDIUM' ? 'DTMF_PIN'
    : 'PHONE_LOOKUP';
  return { riskLevel: level, requiredAuthentication, reasons };
}

export interface VoiceIdentityProvider {
  enroll(customerId: string): { ok: boolean };
  verify(customerId: string): { ok: boolean; confidence: number };
  getProfile(customerId: string): unknown;
}

/** Controlled demo implementation — architecture only, NOT a biometric system. */
export class DemoVoiceIdentityProvider implements VoiceIdentityProvider {
  constructor(private readonly db: Database) {}
  enroll(customerId: string) {
    return { ok: !!customerId };
  }
  verify(customerId: string) {
    const profile = this.db.prepare(`SELECT * FROM voice_profiles WHERE customer_id=?`).get(customerId) as { status?: string } | undefined;
    const ok = profile?.status === 'ENROLLED';
    this.db.prepare(`UPDATE voice_profiles SET verification_count = verification_count + 1,
      successful_verification_count = successful_verification_count + ?,
      last_verified_at = ? WHERE customer_id = ?`).run(ok ? 1 : 0, new Date().toISOString(), customerId);
    return { ok, confidence: ok ? 0.9 : 0.2 };
  }
  getProfile(customerId: string) {
    return this.db.prepare(`SELECT * FROM voice_profiles WHERE customer_id=?`).get(customerId);
  }
}
