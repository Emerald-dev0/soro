import type { LanguageCode } from './language.js';
import type { Intent } from './intent.js';

/**
 * Demo Mode scenario engine model.
 *
 * Demo Mode is NOT a video: it is a deterministic scenario engine that
 * exercises the real Soro application flow with canned provider data.
 * Every demo run is labelled DEMO and simulated data is never presented
 * as live banking data.
 */

export type DemoStepSpeaker = 'customer' | 'ayo' | 'system';

export interface DemoStep {
  /** Human-readable step label shown in the Command Center timeline. */
  label: string;
  speaker: DemoStepSpeaker;
  /** What the customer "says" (customer steps) or Ayo says (ayo steps). */
  text?: string;
  /** Expected intent for customer steps (drives deterministic resolution). */
  expectedIntent?: Intent;
}

export type DemoExpectedOutcome = 'SUCCESS' | 'FAILURE_HANDLED' | 'BLOCKED';

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  language: LanguageCode;
  steps: DemoStep[];
  expectedOutcome: DemoExpectedOutcome;
}

export type DemoSessionStatus =
  | 'created'
  | 'running'
  | 'completed'
  | 'aborted';

export interface DemoSession {
  id: string;
  scenarioId: string;
  /** Demo sessions ALWAYS run in DEMO mode. */
  mode: 'DEMO';
  status: DemoSessionStatus;
  currentStepIndex: number;
  startedAt: string;
  endedAt?: string;
}
