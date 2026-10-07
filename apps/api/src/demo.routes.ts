import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import type { Database } from '@soro/db';
import { createCall, updateCall, addMessage, listMessagesForCall, getCustomerByPhone, listAccountsForCustomer } from '@soro/db';
import { MockBankingCore } from '@soro/banking';
import { handleVoiceTurn, executePendingTool, type AgentContext } from '@soro/service-agent';
import { authorizeWithDtmfPin } from '@soro/service-security';
import { broadcastEvent } from './events.routes.js';

const seenEvents = new Set<string>();
function publishSessionEvents(db: Database, sessionId: string): void {
  const rows = db.prepare(`SELECT * FROM events WHERE session_id=? ORDER BY created_at`).all(sessionId) as { id: string }[];
  for (const row of rows) {
    if (!seenEvents.has(row.id)) { seenEvents.add(row.id); broadcastEvent(row); }
  }
}

/**
 * Deterministic Demo Mode — runs the FULL Soro pipeline with the mock
 * banking core over simulated DTMF. Exactly labels every result DEMO.
 */
export function demoRoutes(app: FastifyInstance, db: Database, core: MockBankingCore): void {
  app.post('/api/demo/run-scenario', async (req, reply) => {
    const adminToken = process.env.WEBHOOK_SECRET ?? process.env.SESSION_SECRET;
    if (adminToken && req.headers['x-admin-token'] !== adminToken && process.env.DEMO_MODE === 'false') {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin token required.' } });
    }

    const body = (req.body ?? {}) as { phone?: string; customer?: string; turns?: string[]; demoPin?: string };
    const phone = body.phone ?? '08030000001';
    const customer = getCustomerByPhone(db, phone);
    if (!customer) return reply.status(404).send({ success: false, error: { code: 'CUSTOMER_NOT_FOUND', message: 'Demo customer not found.' } });
    const account = listAccountsForCustomer(db, customer.id)[0];
    const callId = randomUUID();
    createCall(db, {
      id: callId, fromNumber: phone, toNumber: 'SORO-DEMO', customerId: customer.id, accountId: account?.id,
      status: 'IN_PROGRESS', language: customer.preferredLanguage === 'PIDGIN' ? 'pcm' : customer.preferredLanguage === 'YORUBA' ? 'yo' : 'en',
      authenticationStatus: 'IDENTIFIED', authorizationStatus: 'NONE', escalationStatus: 'NONE',
      startedAt: new Date().toISOString(),
    });

    const ctx: AgentContext = { db, core, callSessionId: callId, customerId: customer.id, accountId: account?.id, authenticated: true };
    const transcript: { sender: string; text: string }[] = [];
    const turns = body.turns ?? ['How much dey my account?'];

    const greet = 'Hello, welcome to Soro. How can I help you today?';
    addMessage(db, { id: randomUUID(), callSessionId: callId, sender: 'AYO', content: greet, createdAt: new Date().toISOString() });
    transcript.push({ sender: 'AYO', text: greet });

    for (const turn of turns) {
      addMessage(db, { id: randomUUID(), callSessionId: callId, sender: 'CUSTOMER', content: turn, createdAt: new Date().toISOString() });
      const res = await handleVoiceTurn(ctx, turn);
      let replyText = res.reply;
      if (res.requiresDtmf && body.demoPin) {
        const outcome = authorizeWithDtmfPin(db, {
          customerId: customer.id, callSessionId: callId, transactionReference: `AUTH-${callId}`,
          customerNumber: customer.customerNumber, pin: body.demoPin,
        });
        replyText += outcome === 'SUCCESS' ? ' Authorization successful. Processing your request.' : ` Authorization ${outcome.toLowerCase()}.`;
        if (outcome === 'SUCCESS' && ctx.pendingTool) {
          replyText += ' ' + await executePendingTool(ctx);
        }
      }
      addMessage(db, { id: randomUUID(), callSessionId: callId, sender: 'AYO', content: replyText, createdAt: new Date().toISOString() });
      transcript.push({ sender: 'CUSTOMER', text: turn }, { sender: 'AYO', text: replyText });
      publishSessionEvents(db, callId);

      // Follow-up balance question answers the REAL state
      if (/balance|how much/i.test(turn)) {
        const account2 = core.getAccountBalance(account!.id);
        transcript.push({ sender: 'AYO', text: `(State check) Balance is now ₦${account2.balanceMinor / 100}.` });
      }
    }

    updateCall(db, callId, { status: 'COMPLETED', endedAt: new Date().toISOString() });
    publishSessionEvents(db, callId);
    return {
      success: true,
      data: { mode: 'DEMO', callId, transcript, messages: listMessagesForCall(db, callId) },
    };
  });
}
