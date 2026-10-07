import { describe, expect, it } from 'vitest';
import { canTransitionCall } from '../src/index.js';

describe('call lifecycle guard', () => {
  it('allows the happy path', () => {
    expect(canTransitionCall('IDLE', 'RINGING')).toBe(true);
    expect(canTransitionCall('RINGING', 'CONNECTED')).toBe(true);
    expect(canTransitionCall('CONNECTED', 'LISTENING')).toBe(true);
    expect(canTransitionCall('LISTENING', 'SPEAKING')).toBe(true);
    expect(canTransitionCall('SPEAKING', 'LISTENING')).toBe(true);
  });

  it('allows hangup from any active state but nothing after ENDED', () => {
    for (const s of ['RINGING', 'CONNECTED', 'LISTENING', 'SPEAKING'] as const) {
      expect(canTransitionCall(s, 'ENDED')).toBe(true);
    }
    expect(canTransitionCall('ENDED', 'CONNECTED')).toBe(false);
    expect(canTransitionCall('IDLE', 'CONNECTED')).toBe(false);
  });
});
