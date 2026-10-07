/**
 * Command Center shell (Phase 0).
 *
 * The judge-facing operational interface that makes invisible
 * orchestration visible. Phase 0 defines its JOURNEY model (the
 * CALL → … → COMPLETE spine every screen will render); the actual
 * React/Vite UI lands in Phase 1 per docs/COMMAND-CENTER.md.
 */

export const APP_NAME = 'command-center';

/**
 * The journey spine: CALL → LISTEN → UNDERSTAND → VERIFY → CONFIRM →
 * AUTHORIZE → EXECUTE → COMPLETE. Every screen, timeline and demo
 * script renders against these stages — never vanity metrics, never
 * fabricated confidence percentages.
 */
export const JOURNEY_STAGES = [
  'CALL',
  'LISTEN',
  'UNDERSTAND',
  'VERIFY',
  'CONFIRM',
  'AUTHORIZE',
  'EXECUTE',
  'COMPLETE',
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];

export const JOURNEY_DESCRIPTIONS: Record<JourneyStage, string> = {
  CALL: 'Call connected (Twilio live, or scenario engine in Demo Mode).',
  LISTEN: 'Listening to the customer; transcript streams here.',
  UNDERSTAND: 'Language detected, intent + entities resolved.',
  VERIFY: 'Schema, business and policy validation results.',
  CONFIRM: 'Ayo reads back the understood intent for confirmation.',
  AUTHORIZE: 'DTMF keypad authorization for sensitive operations (masked).',
  EXECUTE: 'Banking provider request/response with transaction state.',
  COMPLETE: 'Terminal outcome confirmed by the provider — or held as unknown.',
};
