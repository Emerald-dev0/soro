/**
 * @soro/types — the shared domain model.
 *
 * This package is the common language between conversation, orchestration,
 * banking, voice, events, Command Center and Demo Mode. Domain concepts
 * MUST be defined here exactly once and imported — never duplicated
 * across applications.
 */
export * from './language.js';
export * from './channel.js';
export * from './intent.js';
export * from './session.js';
export * from './banking.js';
export * from './security.js';
export * from './events.js';
export * from './ayo.js';
export * from './demo.js';
