import type { AyoState, Mode } from '@soro/types';

/**
 * Shared UI primitives (Phase 0 foundation).
 *
 * Framework-agnostic metadata consumed by the Command Center (Phase 1+)
 * and any future customer-facing UI. No React/Vite dependency yet — that
 * arrives with the first real screen implementation. See docs/DECISIONS.md.
 */

export interface AyoStateMeta {
  state: AyoState;
  label: string;
  description: string;
  /** Canonical asset path (file may not exist yet — see docs/AYO.md). */
  assetPath: string;
}

/** Canonical Ayo visual assets live under `assets/ayo/`. */
export const AYO_ASSET_DIR = 'assets/ayo';

const META: Record<AyoState, Omit<AyoStateMeta, 'state' | 'assetPath'>> = {
  IDLE: { label: 'Idle', description: 'Ayo is ready and waiting.' },
  LISTENING: { label: 'Listening', description: 'Ayo is listening to the customer.' },
  THINKING: { label: 'Thinking', description: 'Soro is interpreting what was heard.' },
  CONFIRMING: { label: 'Confirming', description: 'Ayo is confirming the understood intent.' },
  AUTHORIZING: { label: 'Authorizing', description: 'Waiting for secure keypad (DTMF) authorization. Secrets are never shown.' },
  PROCESSING: { label: 'Processing', description: 'Banking provider is processing the request.' },
  SUCCESS: { label: 'Success', description: 'The operation completed and was confirmed by the provider.' },
  ERROR: { label: 'Error', description: 'Something failed. Ayo explains and offers a safe next step.' },
  SECURITY_WARNING: { label: 'Security warning', description: 'Suspicious pattern noticed. Ayo slows down and warns.' },
};

export function getAyoStateMeta(state: AyoState): AyoStateMeta {
  const meta = META[state];
  return {
    state,
    label: meta.label,
    description: meta.description,
    assetPath: `${AYO_ASSET_DIR}/${state.toLowerCase()}.png`,
  };
}

export interface ModeBadge {
  mode: Mode;
  label: string;
  /** Honesty copy: simulated data is NEVER presented as live. */
  honestyNote: string;
}

/** LIVE and DEMO must always be visibly distinguishable. */
export function getModeBadge(mode: Mode): ModeBadge {
  return mode === 'LIVE'
    ? { mode, label: 'LIVE MODE', honestyNote: 'Connected to real providers. Real banking operations.' }
    : { mode, label: 'DEMO MODE', honestyNote: 'Simulated data. No real banking operations occur.' };
}
