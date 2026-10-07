import { randomUUID } from 'node:crypto';
import type {
  EventSource,
  Mode,
  SoroEvent,
  SoroEventType,
} from '@soro/types';
import { isSoroEventType } from '@soro/types';

export interface CreateEventInput<T = unknown> {
  type: SoroEventType;
  sessionId: string;
  correlationId?: string;
  source: EventSource;
  mode: Mode;
  payload: T;
  /** Override for deterministic tests / demo replay. */
  createdAt?: string;
  /** Override for deterministic tests / demo replay. */
  id?: string;
}

/**
 * Create a well-formed SoroEvent envelope.
 * Generates id (UUIDv4), createdAt (ISO-8601) and — when omitted — a fresh
 * correlationId. Deterministic overrides exist so Demo Mode and tests can
 * replay exact timelines.
 */
export function createEvent<T>(input: CreateEventInput<T>): SoroEvent<T> {
  if (!isSoroEventType(input.type)) {
    throw new Error(`Unknown Soro event type: ${String(input.type)}`);
  }
  if (!input.sessionId) throw new Error('createEvent: sessionId is required');
  return {
    id: input.id ?? randomUUID(),
    type: input.type,
    sessionId: input.sessionId,
    correlationId: input.correlationId ?? randomUUID(),
    source: input.source,
    mode: input.mode,
    createdAt: input.createdAt ?? new Date().toISOString(),
    payload: input.payload,
  };
}

/** Start a new correlated trace (one customer request end-to-end). */
export function newCorrelationId(): string {
  return randomUUID();
}

/** Runtime guard for envelopes arriving over the wire (webhooks, storage). */
export function isSoroEvent(value: unknown): value is SoroEvent {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    isSoroEventType(v['type']) &&
    typeof v['sessionId'] === 'string' &&
    typeof v['correlationId'] === 'string' &&
    typeof v['source'] === 'string' &&
    (v['mode'] === 'LIVE' || v['mode'] === 'DEMO') &&
    typeof v['createdAt'] === 'string'
  );
}

/** Chronological timeline ordering (stable for equal timestamps). */
export function sortEventsByTime<T>(events: SoroEvent<T>[]): SoroEvent<T>[] {
  return [...events].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
  );
}
