/**
 * Security & audit events.
 *
 * Security-relevant occurrences (warnings, blocks) are recorded as data
 * for the Command Center and audit trail. A prototype detector must never
 * be presented as a production fraud-detection system.
 */
export const SECURITY_EVENT_TYPES = ['INFO', 'WARNING', 'BLOCKED'] as const;

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];

export interface SecurityEvent {
  id: string;
  sessionId?: string;
  correlationId?: string;
  type: SecurityEventType;
  /** Machine-readable reason code, e.g. "PIN_EXPOSED_TO_LLM_BLOCKED". */
  reason: string;
  detail?: string;
  createdAt: string;
}
