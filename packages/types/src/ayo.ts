/**
 * Ayo — conversational interface states.
 *
 * Ayo COMMUNICATES; Ayo does not authorize. These states drive Ayo's
 * visual/voice presentation in the Command Center and (later) the call.
 * Canonical visual assets live under `assets/ayo/` (see docs/AYO.md).
 */
export const AYO_STATES = [
  'IDLE',
  'LISTENING',
  'THINKING',
  'CONFIRMING',
  'AUTHORIZING',
  'PROCESSING',
  'SUCCESS',
  'ERROR',
  'SECURITY_WARNING',
] as const;

export type AyoState = (typeof AYO_STATES)[number];

export function isAyoState(value: unknown): value is AyoState {
  return (
    typeof value === 'string' &&
    (AYO_STATES as readonly string[]).includes(value)
  );
}
