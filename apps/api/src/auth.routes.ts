import type { FastifyInstance } from 'fastify';
import type { Database } from '@soro/db';
import { updateCall } from '@soro/db';
import { authenticateCustomer } from '@soro/service-security';

/** Machine-facing authentication endpoint (DTMF-collected PIN is verified here,
 *  outcome only is returned — the PIN is never logged, stored, or returned). */
export function authRoutes(app: FastifyInstance, db: Database): void {
  app.post('/api/authn', async (req, reply) => {
    const body = (req.body ?? {}) as { callId?: string; customerId?: string; method?: string; pin?: string };
    if (!body.customerId || !body.method) {
      return reply.status(400).send({ success: false, error: { code: 'INVALID_INPUT', message: 'customerId and method required.' } });
    }
    const outcome = authenticateCustomer(db, {
      customerId: body.customerId, callSessionId: body.callId,
      method: body.method as 'DTMF_PIN' | 'VOICE_VERIFICATION' | 'PHONE_LOOKUP', pin: body.pin,
    });
    if (body.callId) updateCall(db, body.callId, { authenticationStatus: outcome });
    return { success: true, data: { outcome } };
  });
}
