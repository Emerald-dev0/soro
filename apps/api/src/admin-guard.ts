import type { FastifyInstance } from 'fastify';

/** When ADMIN_TOKEN is set, dashboard/admin endpoints require it. */
export function installAdminGuard(app: FastifyInstance): void {
  app.addHook('onRequest', async (req, reply) => {
    const token = process.env.ADMIN_TOKEN;
    if (!token) return; // open in local demo mode
    if (req.url.startsWith('/api/dashboard') || req.url.startsWith('/api/events')) {
      if (req.headers['x-admin-token'] !== token) {
        return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin token required.' } });
      }
    }
  });
}
