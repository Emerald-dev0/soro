import type {
  Account, Beneficiary, CallSession, ConversationMessage, Customer,
  DataPlan, EmailRecord, FinancialTransaction, SupportCase, VoiceProfile,
} from '@soro/types';
import type { Database } from './index.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

function rowToCustomer(r: any): Customer {
  return {
    id: r.id, customerNumber: r.customer_number, firstName: r.first_name,
    lastName: r.last_name, phoneNumber: r.phone_number, email: r.email,
    status: r.status, preferredLanguage: r.preferred_language,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function createCustomer(db: Database, c: Customer, pinHash?: string | null): void {
  db.prepare(`INSERT OR IGNORE INTO customers
    (id, customer_number, first_name, last_name, phone_number, email, status, preferred_language, pin_hash, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    c.id, c.customerNumber, c.firstName, c.lastName, c.phoneNumber, c.email,
    c.status, c.preferredLanguage, pinHash ?? null, c.createdAt, c.updatedAt);
}

export function getCustomerById(db: Database, id: string): Customer | undefined {
  const r = db.prepare(`SELECT * FROM customers WHERE id=?`).get(id) as any;
  return r ? rowToCustomer(r) : undefined;
}

export function getCustomerByPhone(db: Database, phone: string): Customer | undefined {
  const r = db.prepare(`SELECT * FROM customers WHERE phone_number=?`).get(phone) as any;
  return r ? rowToCustomer(r) : undefined;
}

export function listCustomers(db: Database): Customer[] {
  return (db.prepare(`SELECT * FROM customers ORDER BY customer_number`).all() as any[]).map(rowToCustomer);
}

export function verifyCustomerPin(db: Database, customerId: string, pinHash: string): boolean {
  const r = db.prepare(`SELECT pin_hash FROM customers WHERE id=?`).get(customerId) as any;
  return !!r && r.pin_hash === pinHash && pinHash !== '';
}

function rowToAccount(r: any): Account {
  return {
    id: r.id, customerId: r.customer_id, accountNumber: r.account_number,
    accountType: r.account_type, currency: r.currency,
    balanceMinor: r.balance_minor, availableBalanceMinor: r.available_balance_minor,
    status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function createAccount(db: Database, a: Account): void {
  db.prepare(`INSERT OR IGNORE INTO accounts
    (id, customer_id, account_number, account_type, currency, balance_minor, available_balance_minor, status, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    a.id, a.customerId, a.accountNumber, a.accountType, a.currency,
    a.balanceMinor, a.availableBalanceMinor, a.status, a.createdAt, a.updatedAt);
}

export function getAccountByNumber(db: Database, accountNumber: string): Account | undefined {
  const r = db.prepare(`SELECT * FROM accounts WHERE account_number=?`).get(accountNumber) as any;
  return r ? rowToAccount(r) : undefined;
}

export function getAccountById(db: Database, id: string): Account | undefined {
  const r = db.prepare(`SELECT * FROM accounts WHERE id=?`).get(id) as any;
  return r ? rowToAccount(r) : undefined;
}

export function listAccountsForCustomer(db: Database, customerId: string): Account[] {
  return (db.prepare(`SELECT * FROM accounts WHERE customer_id=?`).all(customerId) as any[]).map(rowToAccount);
}

export function listAccounts(db: Database): Account[] {
  return (db.prepare(`SELECT * FROM accounts ORDER BY account_number`).all() as any[]).map(rowToAccount);
}

export function createBeneficiary(db: Database, b: Beneficiary): void {
  db.prepare(`INSERT OR IGNORE INTO beneficiaries (id, customer_id, name, account_number, bank_name, bank_code, status, created_at)
    VALUES (?,?,?,?,?,?,?,?)`).run(b.id, b.customerId, b.name, b.accountNumber, b.bankName, b.bankCode, b.status, b.createdAt);
}

export function listBeneficiaries(db: Database, customerId: string): Beneficiary[] {
  return (db.prepare(`SELECT * FROM beneficiaries WHERE customer_id=? ORDER BY name`).all(customerId) as any[]).map((r) => ({
    id: r.id, customerId: r.customer_id, name: r.name, accountNumber: r.account_number,
    bankName: r.bank_name, bankCode: r.bank_code, status: r.status, createdAt: r.created_at,
  }));
}

export function seedDataPlan(db: Database, p: DataPlan): void {
  db.prepare(`INSERT OR IGNORE INTO data_plans (id, network, label, data_mb, price_minor, validity_days, status)
    VALUES (?,?,?,?,?,?,?)`).run(p.id, p.network, p.label, p.dataMb, p.priceMinor, p.validityDays, 'ACTIVE');
}

export function listDataPlans(db: Database): DataPlan[] {
  return (db.prepare(`SELECT * FROM data_plans WHERE status='ACTIVE' ORDER BY network, price_minor`).all() as any[]).map((r) => ({
    id: r.id, network: r.network, label: r.label, dataMb: r.data_mb, priceMinor: r.price_minor, validityDays: r.validity_days,
  }));
}

// ------------------------------------------------------------------ calls

function rowToCall(r: any): CallSession {
  return {
    id: r.id, twilioCallSid: r.twilio_call_sid ?? undefined, fromNumber: r.from_number,
    toNumber: r.to_number, customerId: r.customer_id ?? undefined, accountId: r.account_id ?? undefined,
    status: r.status, language: r.language ?? undefined, startedAt: r.started_at,
    answeredAt: r.answered_at ?? undefined, endedAt: r.ended_at ?? undefined,
    durationSeconds: r.duration_seconds ?? undefined, authenticationStatus: r.authentication_status,
    authorizationStatus: r.authorization_status, currentIntent: r.current_intent ?? undefined,
    escalationStatus: r.escalation_status,
  };
}

export function createCall(db: Database, c: CallSession): void {
  db.prepare(`INSERT INTO calls
    (id, twilio_call_sid, from_number, to_number, customer_id, account_id, status, language, started_at, answered_at, ended_at, duration_seconds, authentication_status, authorization_status, current_intent, escalation_status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    c.id, c.twilioCallSid ?? null, c.fromNumber, c.toNumber, c.customerId ?? null, c.accountId ?? null,
    c.status, c.language ?? null, c.startedAt, c.answeredAt ?? null, c.endedAt ?? null,
    c.durationSeconds ?? null, c.authenticationStatus, c.authorizationStatus, c.currentIntent ?? null, c.escalationStatus);
}

export function updateCall(db: Database, id: string, patch: Partial<CallSession>): void {
  const fields: string[] = [];
  const vals: unknown[] = [];
  const map: Record<string, string> = {
    status: 'status', language: 'language', answeredAt: 'answered_at', endedAt: 'ended_at',
    durationSeconds: 'duration_seconds', authenticationStatus: 'authentication_status',
    authorizationStatus: 'authorization_status', currentIntent: 'current_intent',
    escalationStatus: 'escalation_status', customerId: 'customer_id', accountId: 'account_id',
  };
  for (const [k, col] of Object.entries(map)) {
    if (k in patch) { fields.push(`${col}=?`); vals.push((patch as any)[k] ?? null); }
  }
  if (fields.length === 0) return;
  vals.push(id);
  db.prepare(`UPDATE calls SET ${fields.join(', ')} WHERE id=?`).run(...(vals as any));
}

export function getCallById(db: Database, id: string): CallSession | undefined {
  const r = db.prepare(`SELECT * FROM calls WHERE id=?`).get(id) as any;
  return r ? rowToCall(r) : undefined;
}

export function getCallByTwilioSid(db: Database, sid: string): CallSession | undefined {
  const r = db.prepare(`SELECT * FROM calls WHERE twilio_call_sid=?`).get(sid) as any;
  return r ? rowToCall(r) : undefined;
}

export function listCalls(db: Database, limit = 100): CallSession[] {
  return (db.prepare(`SELECT * FROM calls ORDER BY started_at DESC LIMIT ?`).all(limit) as any[]).map(rowToCall);
}

export function listCallsForCustomer(db: Database, customerId: string): CallSession[] {
  return (db.prepare(`SELECT * FROM calls WHERE customer_id=? ORDER BY started_at DESC`).all(customerId) as any[]).map(rowToCall);
}

export function addMessage(db: Database, m: ConversationMessage): void {
  db.prepare(`INSERT INTO conversation_messages (id, call_session_id, sender, language, content, created_at)
    VALUES (?,?,?,?,?,?)`).run(m.id, m.callSessionId, m.sender, m.language ?? null, m.content, m.createdAt);
}

export function listMessagesForCall(db: Database, callId: string): ConversationMessage[] {
  return (db.prepare(`SELECT * FROM conversation_messages WHERE call_session_id=? ORDER BY created_at`).all(callId) as any[]).map((r) => ({
    id: r.id, callSessionId: r.call_session_id, sender: r.sender, language: r.language ?? undefined, content: r.content, createdAt: r.created_at,
  }));
}

// ------------------------------------------------------------------ support

export function createSupportCase(db: Database, s: SupportCase): void {
  db.prepare(`INSERT INTO support_cases
    (id, customer_id, account_id, call_session_id, transaction_reference, category, description, priority, status, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    s.id, s.customerId ?? null, s.accountId ?? null, s.callSessionId ?? null,
    s.transactionReference ?? null, s.category, s.description, s.priority, s.status, s.createdAt, s.updatedAt);
}

export function listSupportCases(db: Database): SupportCase[] {
  return (db.prepare(`SELECT * FROM support_cases ORDER BY created_at DESC`).all() as any[]).map((r) => ({
    id: r.id, customerId: r.customer_id ?? undefined, accountId: r.account_id ?? undefined,
    callSessionId: r.call_session_id ?? undefined, transactionReference: r.transaction_reference ?? undefined,
    category: r.category, description: r.description, priority: r.priority, status: r.status,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}

// ------------------------------------------------------------------ voice profiles

export function upsertVoiceProfile(db: Database, v: VoiceProfile): void {
  db.prepare(`INSERT INTO voice_profiles
    (id, customer_id, status, provider, provider_reference, enrollment_count, verification_count, successful_verification_count, confidence_score, model_version, last_verified_at, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(customer_id) DO UPDATE SET status=excluded.status, provider_reference=excluded.provider_reference,
      enrollment_count=excluded.enrollment_count, verification_count=excluded.verification_count,
      successful_verification_count=excluded.successful_verification_count, confidence_score=excluded.confidence_score,
      model_version=excluded.model_version, last_verified_at=excluded.last_verified_at, updated_at=excluded.updated_at`).run(
    v.id, v.customerId, v.status, v.provider, v.providerReference ?? null, v.enrollmentCount,
    v.verificationCount, v.successfulVerificationCount, v.confidenceScore ?? null, v.modelVersion ?? null,
    v.lastVerifiedAt ?? null, v.createdAt, v.updatedAt);
}

export function getVoiceProfileByCustomer(db: Database, customerId: string): VoiceProfile | undefined {
  const r = db.prepare(`SELECT * FROM voice_profiles WHERE customer_id=?`).get(customerId) as any;
  if (!r) return undefined;
  return {
    id: r.id, customerId: r.customer_id, status: r.status, provider: r.provider,
    providerReference: r.provider_reference ?? undefined, enrollmentCount: r.enrollment_count,
    verificationCount: r.verification_count, successfulVerificationCount: r.successful_verification_count,
    confidenceScore: r.confidence_score ?? undefined, modelVersion: r.model_version ?? undefined,
    lastVerifiedAt: r.last_verified_at ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// ------------------------------------------------------------------ emails

export function recordEmail(db: Database, e: EmailRecord): void {
  db.prepare(`INSERT INTO emails (id, to_address, subject, kind, status, body_preview, created_at)
    VALUES (?,?,?,?,?,?,?)`).run(e.id, e.toAddress, e.subject, e.kind, e.status, e.bodyPreview, e.createdAt);
}

export function listEmails(db: Database): EmailRecord[] {
  return (db.prepare(`SELECT * FROM emails ORDER BY created_at DESC`).all() as any[]).map((r) => ({
    id: r.id, toAddress: r.to_address, subject: r.subject, kind: r.kind, status: r.status, bodyPreview: r.body_preview, createdAt: r.created_at,
  }));
}

// ------------------------------------------------------------------ auth/authorization attempts

export function recordAuthnAttempt(db: Database, a: { id: string; customerId: string; callSessionId?: string; method: string; status: string; attemptNumber: number; createdAt: string; completedAt?: string }): void {
  db.prepare(`INSERT INTO authentication_attempts (id, customer_id, call_session_id, method, status, attempt_number, created_at, completed_at)
    VALUES (?,?,?,?,?,?,?,?)`).run(a.id, a.customerId, a.callSessionId ?? null, a.method, a.status, a.attemptNumber, a.createdAt, a.completedAt ?? null);
}

export function countRecentAuthnFailures(db: Database, customerId: string): number {
  const r = db.prepare(`SELECT COUNT(*) AS n FROM authentication_attempts WHERE customer_id=? AND status='FAILED' AND created_at > datetime('now','-15 minutes')`).get(customerId) as any;
  return r.n;
}

export function recordAuthzAttempt(db: Database, a: { id: string; customerId: string; callSessionId?: string; transactionReference?: string; method: string; status: string; attemptNumber: number; createdAt: string; completedAt?: string }): void {
  db.prepare(`INSERT INTO authorization_attempts (id, customer_id, call_session_id, transaction_reference, method, status, attempt_number, created_at, completed_at)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(a.id, a.customerId, a.callSessionId ?? null, a.transactionReference ?? null, a.method, a.status, a.attemptNumber, a.createdAt, a.completedAt ?? null);
}

export function countAuthzFailures(db: Database, transactionReference: string): number {
  const r = db.prepare(`SELECT COUNT(*) AS n FROM authorization_attempts WHERE transaction_reference=? AND status='FAILED'`).get(transactionReference) as any;
  return r.n;
}

// ------------------------------------------------------------------ ledger helpers

export function insertFinancialTransaction(db: Database, t: FinancialTransaction): void {
  db.prepare(`INSERT INTO transactions
    (reference, idempotency_key, session_id, correlation_id, kind, direction, description, metadata_json, customer_id, account_id,
     state, authorization, provider, provider_reference, amount_minor, currency, created_at, updated_at, completed_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    t.reference, t.idempotencyKey, t.id, t.id, t.type, t.direction, t.description,
    JSON.stringify(t.metadata), t.customerId, t.accountId,
    t.status, 'NOT_REQUIRED', 'demo', null, t.amountMinor, t.currency, t.createdAt, t.updatedAt, t.completedAt ?? null);
}

export function getFinancialTransactionByIdempotencyKey(db: Database, key: string) {
  return db.prepare(`SELECT * FROM transactions WHERE idempotency_key=?`).get(key) as any;
}

export function updateFinancialTransactionStatus(db: Database, reference: string, status: string, completedAt?: string): void {
  db.prepare(`UPDATE transactions SET state=?, updated_at=?, completed_at=? WHERE reference=?`).run(
    status, new Date().toISOString(), completedAt ?? null, reference);
}

export function listFinancialTransactionsForAccount(db: Database, accountId: string, limit = 50): any[] {
  return db.prepare(`SELECT * FROM transactions WHERE account_id=? AND kind IN ('TRANSFER','AIRTIME','DATA','BILL_PAYMENT','REVERSAL','CREDIT','DEBIT') ORDER BY created_at DESC LIMIT ?`).all(accountId, limit) as any[];
}

export function getFinancialTransactionByReference(db: Database, reference: string): any {
  return db.prepare(`SELECT * FROM transactions WHERE reference=?`).get(reference) as any;
}

export function insertAirtimePurchase(db: Database, p: { id: string; transactionReference: string; accountId: string; phoneNumber: string; network: string; amountMinor: number; status: string; createdAt: string }): void {
  db.prepare(`INSERT INTO airtime_purchases (id, transaction_reference, account_id, phone_number, network, amount_minor, status, created_at)
    VALUES (?,?,?,?,?,?,?,?)`).run(p.id, p.transactionReference, p.accountId, p.phoneNumber, p.network, p.amountMinor, p.status, p.createdAt);
}

export function insertDataPurchase(db: Database, p: { id: string; transactionReference: string; accountId: string; phoneNumber: string; network: string; planId: string; amountMinor: number; status: string; createdAt: string }): void {
  db.prepare(`INSERT INTO data_purchases (id, transaction_reference, account_id, phone_number, network, plan_id, amount_minor, status, created_at)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(p.id, p.transactionReference, p.accountId, p.phoneNumber, p.network, p.planId, p.amountMinor, p.status, p.createdAt);
}
