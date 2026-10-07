/**
 * Channel & mode model.
 *
 * - Channel: HOW the customer reaches Soro.
 * - Mode:    whether the flow exercises REAL providers (LIVE) or the
 *            deterministic scenario engine (DEMO).
 *
 * LIVE and DEMO must always be visibly distinguishable (Command Center,
 * logs, events). Demo Mode must NEVER present simulated data as live
 * banking data.
 */

export const CHANNELS = ['voice', 'demo', 'command-center'] as const;

export type Channel = (typeof CHANNELS)[number];

export const MODES = ['LIVE', 'DEMO'] as const;

export type Mode = (typeof MODES)[number];

export function isMode(value: unknown): value is Mode {
  return value === 'LIVE' || value === 'DEMO';
}
