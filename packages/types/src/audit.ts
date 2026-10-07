/** Audit event model — comprehensive trail for the Command Center. */
export const AUDIT_EVENT_NAMES = [
  'CALL_STARTED', 'CALL_ANSWERED', 'CUSTOMER_IDENTIFIED',
  'AUTHENTICATION_STARTED', 'AUTHENTICATION_SUCCESS', 'AUTHENTICATION_FAILED',
  'VOICE_VERIFICATION_STARTED', 'VOICE_VERIFICATION_SUCCESS',
  'INTENT_DETECTED', 'TOOL_CALLED', 'TOOL_SUCCESS', 'TOOL_FAILED',
  'BALANCE_VIEWED', 'TRANSACTIONS_VIEWED',
  'AIRTIME_PURCHASE_STARTED', 'AIRTIME_PURCHASE_SUCCESS',
  'DATA_PLAN_LOOKUP', 'DATA_PLAN_RECOMMENDED', 'DATA_PURCHASE_STARTED', 'DATA_PURCHASE_SUCCESS',
  'TRANSFER_STARTED', 'TRANSFER_CONFIRMATION_REQUESTED', 'TRANSFER_CONFIRMED',
  'AUTHORIZATION_STARTED', 'AUTHORIZATION_SUCCESS', 'AUTHORIZATION_FAILED',
  'TRANSFER_SUCCESS', 'TRANSFER_FAILED', 'TRANSFER_REVERSED',
  'STATEMENT_GENERATED', 'STATEMENT_EMAIL_SENT',
  'SUPPORT_CASE_CREATED', 'HUMAN_ESCALATION', 'CALL_COMPLETED',
] as const;

export type AuditEventName = (typeof AUDIT_EVENT_NAMES)[number];

export const AUDIT_ACTORS = ['CUSTOMER', 'AGENT', 'SYSTEM', 'TOOL', 'PROVIDER'] as const;
export type AuditActor = (typeof AUDIT_ACTORS)[number];

export interface AuditEvent {
  id: string;
  eventType: AuditEventName;
  actor: AuditActor;
  customerId?: string;
  accountId?: string;
  callSessionId?: string;
  transactionReference?: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'INFO' | 'PENDING';
  metadata?: Record<string, unknown>;
}
