import type { LanguageCode } from '@soro/types';
import { defaultLanguage, isLanguageCode } from '@soro/types';

/**
 * Conversation engine shell (Phase 0).
 *
 * Owns: session language continuity, intent intake shape.
 * Does NOT own: model calls, STT/TTS, banking (see docs/ARCHITECTURE.md).
 * Full NLU wiring lands in Phase 1 — this shell establishes boundaries.
 */

export const SERVICE_NAME = 'conversation';

export const RESPONSIBILITIES = [
  'session language continuity',
  'structured-intent intake (schema gate)',
  'conversation context for Ayo responses',
] as const;

/**
 * Session-level language continuity: keep the session language stable;
 * adopt a newly detected language only when it is a supported code.
 * Falls back to English when nothing is known.
 */
export function resolveSessionLanguage(
  current: LanguageCode | undefined,
  detected: unknown,
): LanguageCode {
  if (isLanguageCode(detected)) return detected;
  if (current !== undefined) return current;
  return defaultLanguage();
}
