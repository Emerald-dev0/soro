import { describe, expect, it } from 'vitest';
import { APP_NAME, PLANNED_ROUTES } from '../src/index.js';

describe('web shell', () => {
  it('is a named placeholder with planned routes', () => {
    expect(APP_NAME).toBe('web');
    expect(PLANNED_ROUTES.length).toBeGreaterThan(0);
  });
});
