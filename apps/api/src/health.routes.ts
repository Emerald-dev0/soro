import type { FastifyInstance } from 'fastify';
import type { Database } from '@soro/db';

export function healthRoutes(app: FastifyInstance, db: Database): void {
  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'soro-api', mode: process.env.DEMO_MODE === 'true' ? 'DEMO' : 'LIVE' },
  }));

  app.get('/health/db', async () => {
    try {
      db.prepare('SELECT 1').get();
      return { success: true, data: { status: 'ok' } };
    } catch {
      return { success: false, error: { code: 'DB_UNAVAILABLE', message: 'Database check failed.' } };
    }
  });

  app.get('/health/twilio', async () => ({
    success: true,
    data: { configured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) },
  }));

  app.get('/health/providers', async () => ({
    success: true,
    data: {
      banking: 'demo-mock-core',
      ai: process.env.AI_PROVIDER_API_KEY ? 'configured' : 'deterministic-demo',
      stt: process.env.VOICE_PROVIDER_API_KEY ? 'configured' : 'demo',
      email: 'demo-provider',
    },
  }));
}
