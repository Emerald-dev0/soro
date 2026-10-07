import type { FastifyInstance } from 'fastify';

/**
 * Tiny in-memory fixed-window rate limiter for public endpoints.
 * Adequate for a hackathon; replace with Redis in production.
 */
export function rateLimit(options: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return async (req: never, reply: never) => {
    const now = Date.now();
    const key = (req as { ip?: string }).ip ?? 'unknown';
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return;
    }
    entry.count += 1;
    if (entry.count > options.max) {
      (reply as { status: (n: number) => { send: (b: unknown) => void } })
        .status(429)
        .send({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests.' } });
    }
  };
}

export function installRateLimit(app: FastifyInstance, paths: string[], opts: { windowMs: number; max: number }): void {
  const limiter = rateLimit(opts);
  app.addHook('onRequest', async (req, reply) => {
    if (paths.some((p) => req.url.startsWith(p))) {
      await limiter(req as never, reply as never);
    }
  });
}
