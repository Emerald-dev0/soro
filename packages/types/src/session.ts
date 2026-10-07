import type { Channel, Mode } from './channel.js';
import type { LanguageCode } from './language.js';

/**
 * Minimal user record.
 *
 * NOTE: raw phone numbers and secrets are NEVER stored here. Integrations
 * that need a stable caller key must store a hash/masked reference only.
 */
export interface User {
  id: string;
  displayName: string;
  preferredLanguage: LanguageCode;
  /** Masked caller reference, e.g. "***1234". Never a full number. */
  phoneMasked?: string;
}

export type ConversationSessionStatus = 'active' | 'ended' | 'expired';

/** A single conversational session (one call, or one demo run). */
export interface ConversationSession {
  id: string;
  channel: Channel;
  mode: Mode;
  userId?: string;
  /** Session-level language continuity: set on detection, kept stable. */
  language: LanguageCode;
  status: ConversationSessionStatus;
  startedAt: string;
  endedAt?: string;
}
