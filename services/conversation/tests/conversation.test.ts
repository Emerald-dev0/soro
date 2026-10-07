import { describe, expect, it } from 'vitest';
import { resolveSessionLanguage } from '../src/index.js';

describe('resolveSessionLanguage', () => {
  it('adopts a newly detected supported language', () => {
    expect(resolveSessionLanguage('en', 'pcm')).toBe('pcm');
    expect(resolveSessionLanguage('pcm', 'yo')).toBe('yo');
  });

  it('keeps session continuity when detection is missing/unsupported', () => {
    expect(resolveSessionLanguage('pcm', undefined)).toBe('pcm');
    expect(resolveSessionLanguage('yo', 'fr')).toBe('yo');
  });

  it('falls back to English when nothing is known', () => {
    expect(resolveSessionLanguage(undefined, undefined)).toBe('en');
  });
});
