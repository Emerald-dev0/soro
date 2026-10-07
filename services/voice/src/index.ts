/**
 * Voice gateway shell (Phase 0).
 *
 * Owns the CALL lifecycle model (Twilio boundary lives behind this).
 * STT/TTS providers, speech handling, interruptions and timeouts land in
 * Phase 1 — see docs/VOICE.md and docs/TWILIO.md. Nothing here touches a
 * real provider; status of all voice integrations: NOT YET TESTED.
 */

export const SERVICE_NAME = 'voice';

export const CALL_STATES = [
  'IDLE',
  'RINGING',
  'CONNECTED',
  'LISTENING',
  'SPEAKING',
  'ENDED',
] as const;

export type CallState = (typeof CALL_STATES)[number];

const ALLOWED_TRANSITIONS: Record<CallState, readonly CallState[]> = {
  IDLE: ['RINGING'],
  RINGING: ['CONNECTED', 'ENDED'],
  CONNECTED: ['LISTENING', 'SPEAKING', 'ENDED'],
  LISTENING: ['SPEAKING', 'ENDED', 'CONNECTED'],
  SPEAKING: ['LISTENING', 'ENDED', 'CONNECTED'],
  ENDED: [],
};

/** Guard for call-state transitions (hangups, errors end from anywhere active). */
export function canTransitionCall(from: CallState, to: CallState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Silence/timeout budget placeholders — real values are tuned in Phase 1. */
export const VOICE_DEFAULTS = {
  SILENCE_TIMEOUT_MS: 5000,
  MAX_TURN_MS: 60000,
} as const;
