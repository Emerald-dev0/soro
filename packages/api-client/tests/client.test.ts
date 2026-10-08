import { describe, expect, it } from 'vitest';
import { formatNaira, maskPhone, formatDuration } from '../src/index.js';

describe('formatting', () => {
  it('formats kobo as naira', () => {
    expect(formatNaira(8425000)).toBe('₦84,250.00');
    expect(formatNaira(50000)).toBe('₦500.00');
  });
  it('masks phone numbers', () => {
    expect(maskPhone('08030000001')).toBe('0803••••001');
  });
  it('formats durations', () => {
    expect(formatDuration(161)).toBe('02:41');
  });
});
