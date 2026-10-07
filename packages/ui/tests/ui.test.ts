import { describe, expect, it } from 'vitest';
import { AYO_ASSET_DIR, getAyoStateMeta, getModeBadge } from '../src/index.js';
import { AYO_STATES } from '@soro/types';

describe('@soro/ui', () => {
  it('describes every Ayo state with a canonical asset path', () => {
    for (const state of AYO_STATES) {
      const meta = getAyoStateMeta(state);
      expect(meta.label).toBeTruthy();
      expect(meta.assetPath.startsWith(AYO_ASSET_DIR)).toBe(true);
    }
  });

  it('keeps LIVE and DEMO badges distinguishable and honest', () => {
    const live = getModeBadge('LIVE');
    const demo = getModeBadge('DEMO');
    expect(live.label).not.toBe(demo.label);
    expect(demo.honestyNote).toMatch(/simulated/i);
  });
});
