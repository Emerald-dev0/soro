import type { FastifyInstance } from 'fastify';
import type { Database } from '@soro/db';
import { DemoVoiceIdentityProvider } from '@soro/service-security';

/**
 * Voice-identity verification endpoint (demo provider).
 * Architecture only — NOT a production biometric system.
 */
export function voiceIdentityRoutes(app: FastifyInstance, db: Database, provider: DemoVoiceIdentityProvider): void {
  app.post('/api/voice/verify', async (req) => {
    const body = (req.body ?? {}) as { customerId?: string };
    if (!body.customerId) return { success: false, error: { code: 'INVALID_INPUT', message: 'customerId required.' } };
    const result = provider.verify(body.customerId);
    return { success: true, data: result };
  });

  app.get('/api/voice/profile/:customerId', async (req) => {
    const profile = provider.getProfile((req.params as { customerId: string }).customerId);
    if (!profile) return { success: false, error: { code: 'NOT_FOUND', message: 'No voice profile.' } };
    return { success: true, data: profile };
  });
}
