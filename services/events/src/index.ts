import type { Database } from '@soro/db';
import { appendEvent, listEventsBySession } from '@soro/db';
import { sortEventsByTime, type CreateEventInput } from '@soro/events';
import { createEvent } from '@soro/events';
import type { SoroEvent } from '@soro/types';

/**
 * Event service shell (Phase 0).
 *
 * Owns: durable event persistence (append-only) + per-session timelines
 * that feed the Command Center. Live streaming (WebSocket/SSE) lands in
 * Phase 1 — see docs/EVENTS.md and docs/COMMAND-CENTER.md.
 */

export const SERVICE_NAME = 'events';

/** Build an envelope AND persist it atomically (as atomic as SQLite gets). */
export function recordEvent<T>(db: Database, input: CreateEventInput<T>): SoroEvent<T> {
  const event = createEvent(input);
  appendEvent(db, event);
  return event;
}

/** Timeline for one session, chronological — the Command Center's feed. */
export function getTimeline(db: Database, sessionId: string): SoroEvent[] {
  return sortEventsByTime(listEventsBySession(db, sessionId));
}
