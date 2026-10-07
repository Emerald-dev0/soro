import type { FastifyInstance } from 'fastify';
import type { Database } from '@soro/db';
import { getCustomerById, listAccountsForCustomer, updateCall } from '@soro/db';
import { authorizeWithDtmfPin } from '@soro/service-security';

/**
 * Web authorization page — the no-keypad substitute for browser demos.
 * The PIN typed here never reaches the LLM, transcript, dashboard, or events.
 */
export function authorizeRoutes(app: FastifyInstance, db: Database): void {
  app.get('/authorize/:callId', async (req, reply) => {
    const callId = (req.params as { callId: string }).callId;
    const call = db.prepare(`SELECT customer_id FROM calls WHERE id=?`).get(callId) as { customer_id?: string } | undefined;
    const customerName = call?.customer_id ? (getCustomerById(db, call.customer_id)?.firstName ?? 'Customer') : 'Customer';
    reply.header('Content-Type', 'text/html').send(`<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Soro Authorization</title>
<style>body{font-family:sans-serif;max-width:380px;margin:40px auto;padding:0 16px}input{font-size:24px;letter-spacing:8px;width:100%;padding:10px;text-align:center}button{width:100%;padding:14px;font-size:18px;background:#005f5a;color:#fff;border:0;border-radius:8px;margin-top:12px}</style></head>
<body><h2>Authorize transaction</h2><p>Hello ${customerName}, enter your 4-digit PIN to authorize this Soro operation. This PIN is never recorded or shared.</p>
<form method="POST" action="/authorize/${callId}"><input name="pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required autocomplete="off"><button type="submit">Authorize</button></form>
<p style="color:#666;font-size:12px">Demo note: PIN is verified locally; Ayo never sees it.</p></body></html>`);
  });

  app.post('/authorize/:callId', async (req, reply) => {
    const callId = (req.params as { callId: string }).callId;
    const body = req.body as { pin?: string } | undefined;
    const call = db.prepare(`SELECT customer_id, twilio_call_sid FROM calls WHERE id=?`).get(callId) as { customer_id?: string } | undefined;
    if (!call?.customer_id) return reply.status(404).send('Call not found.');
    const customer = getCustomerById(db, call.customer_id)!;
    listAccountsForCustomer(db, customer.id); // ensure account exists
    const outcome = authorizeWithDtmfPin(db, {
      customerId: customer.id, callSessionId: callId, transactionReference: `WEB-${callId}`,
      customerNumber: customer.customerNumber, pin: body?.pin ?? '',
    });
    updateCall(db, callId, { authorizationStatus: outcome });
    reply.header('Content-Type', 'text/html').send(`<!doctype html><html><body style="font-family:sans-serif;max-width:380px;margin:40px auto;padding:0 16px"><h2>${outcome === 'SUCCESS' ? 'Authorization successful' : outcome === 'LOCKED' ? 'Too many attempts — blocked' : 'Authorization failed'}</h2><p>You can return to your call. The PIN was never sent to the AI.</p></body></html>`);
  });
}
