import { randomUUID } from 'node:crypto';
import type { Database } from '@soro/db';
import { appendEvent } from '@soro/db';
import type { SoroEvent } from '@soro/types';

/** Persist an event within an existing conversation call (Command Center feed). */
export function recordEventSnapshot(db: Database, sessionId: string, type: string, payload: unknown): SoroEvent {
  const event: SoroEvent = {
    id: randomUUID(),
    type: type as SoroEvent['type'],
    sessionId,
    correlationId: sessionId,
    source: 'conversation',
    mode: 'DEMO',
    createdAt: new Date().toISOString(),
    payload,
  };
  appendEvent(db, event);
  return event;
}

export { addMessage, getCallById } from '@soro/db';
export { listMessagesForCall } from '@soro/db';
