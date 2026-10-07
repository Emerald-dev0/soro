import { describe, expect, it } from 'vitest';
import { isDemoReady, isLiveReady, loadSoroConfig } from '../src/index.js';

describe('loadSoroConfig', () => {
  it('loads safe defaults with an empty environment', () => {
    const cfg = loadSoroConfig({});
    expect(cfg.SORO_APP_NAME).toBe('Soro');
    expect(cfg.SORO_MODE).toBe('demo');
    expect(cfg.SORO_PORT).toBe(3000);
    expect(cfg.SORO_DATABASE_PATH).toBe('./data/soro.db');
    // No fake secrets: missing credentials stay absent, not invented.
    expect(cfg.TWILIO_ACCOUNT_SID).toBeUndefined();
    expect(cfg.WEMA_API_KEY).toBeUndefined();
  });

  it('rejects invalid values loudly', () => {
    expect(() => loadSoroConfig({ SORO_MODE: 'quantum' })).toThrow();
    expect(() => loadSoroConfig({ SORO_PORT: 'not-a-port' })).toThrow();
  });
});

describe('readiness', () => {
  it('demo mode is always ready (no external credentials)', () => {
    expect(isDemoReady(loadSoroConfig({}))).toEqual({ ready: true, missing: [] });
  });

  it('live mode reports exactly what is missing', () => {
    const readiness = isLiveReady(loadSoroConfig({}));
    expect(readiness.ready).toBe(false);
    expect(readiness.missing).toContain('TWILIO_ACCOUNT_SID');
    expect(readiness.missing.join(' ')).toContain('WEMA');
  });
});
