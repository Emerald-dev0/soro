import { describe, expect, it } from 'vitest';
import { JOURNEY_DESCRIPTIONS, JOURNEY_STAGES } from '../src/index.js';

describe('command-center journey spine', () => {
  it('defines the eight judge-facing stages in order', () => {
    expect([...JOURNEY_STAGES]).toEqual([
      'CALL', 'LISTEN', 'UNDERSTAND', 'VERIFY',
      'CONFIRM', 'AUTHORIZE', 'EXECUTE', 'COMPLETE',
    ]);
  });

  it('describes every stage', () => {
    for (const stage of JOURNEY_STAGES) {
      expect(JOURNEY_DESCRIPTIONS[stage].length).toBeGreaterThan(0);
    }
  });
});
