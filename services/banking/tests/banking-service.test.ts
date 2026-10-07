import { describe, expect, it } from 'vitest';
import { selectProvider } from '../src/index.js';
import { DemoBankingProvider, WemaProvider } from '@soro/banking';

describe('selectProvider', () => {
  it('hands out the demo adapter locally', () => {
    expect(selectProvider('demo')).toBeInstanceOf(DemoBankingProvider);
  });

  it('hands out the (NOT VERIFIED) Wema stub without calling it', () => {
    expect(selectProvider('wema')).toBeInstanceOf(WemaProvider);
  });
});
