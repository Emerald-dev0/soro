import type { Mode } from './channel.js';

/**
 * Typed event model.
 *
 * Every significant state change in the system is a SoroEvent: a typed
 * envelope with identity (id), ordering (createdAt), scope (sessionId),
 * traceability (correlationId), origin (source) and honesty (mode).
 *
 * Phase 0 establishes the envelope + catalog; behavior per event lands
 * in later phases. Both LIVE and DEMO flows emit the same envelope.
 */

export const SORO_EVENT_TYPES = [
  'CALL_CONNECTED',
  'CALL_DISCONNECTED',
  'SPEECH_RECEIVED',
  'SPEECH_PROCESSED',
  'LANGUAGE_DETECTED',
  'INTENT_RESOLVED',
  'VALIDATION_STARTED',
  'VALIDATION_COMPLETED',
  'CONFIRMATION_REQUESTED',
  'CONFIRMATION_RECEIVED',
  'AUTHORIZATION_REQUIRED',
  'DTMF_INPUT_RECEIVED',
  'AUTHORIZATION_SUCCEEDED',
  'AUTHORIZATION_FAILED',
  'BANKING_REQUESTED',
  'BANKING_RESPONSE_RECEIVED',
  'TRANSACTION_PROCESSING',
  'TRANSACTION_SUCCESS',
  'TRANSACTION_FAILED',
  'SECURITY_WARNING',
  'SECURITY_BLOCKED',
  'ERROR_OCCURRED',
] as const;

export type SoroEventType = (typeof SORO_EVENT_TYPES)[number];

export function isSoroEventType(value: unknown): value is SoroEventType {
  return (
    typeof value === 'string' &&
    (SORO_EVENT_TYPES as readonly string[]).includes(value)
  );
}

export const EVENT_SOURCES = [
  'twilio',
  'voice-gateway',
  'conversation',
  'orchestration',
  'banking',
  'demo-engine',
  'command-center',
] as const;

export type EventSource = (typeof EVENT_SOURCES)[number];

export interface SoroEvent<T = unknown> {
  id: string;
  type: SoroEventType;
  sessionId: string;
  correlationId: string;
  source: EventSource;
  mode: Mode;
  createdAt: string;
  payload: T;
}
