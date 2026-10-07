import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import { installRateLimit } from '../src/rate-limit.js';
import { installAdminGuard } from '../src/admin-guard.js';

describe('rate limiting', () => {
  it('returns 429 after the configured burst', async () => {
    const app = Fastify();
    installRateLimit(app, ['/api/demo'], { windowMs: 60000, max: 1 });
    app.post('/api/demo/x', async () => ({ ok: true }));
    const first = await app.inject({ method: 'POST', url: '/api/demo/x' });
    const second = await app.inject({ method: 'POST', url: '/api/demo/x' });
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(429);
  });
});

describe('admin guard', () => {
  it('blocks dashboard routes without the token when ADMIN_TOKEN is set', async () => {
    process.env.ADMIN_TOKEN = 'secret-admin';
    const app = Fastify();
    installAdminGuard(app);
    app.get('/api/dashboard/customers', async () => ({ ok: true }));
    const denied = await app.inject({ method: 'GET', url: '/api/dashboard/customers' });
    expect(denied.statusCode).toBe(401);
    const allowed = await app.inject({ method: 'GET', url: '/api/dashboard/customers', headers: { 'x-admin-token': 'secret-admin' } });
    expect(allowed.statusCode).toBe(200);
    delete process.env.ADMIN_TOKEN;
  });
});
