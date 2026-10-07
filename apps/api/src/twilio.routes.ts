import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import type { Database } from '@soro/db';
import {
  createCall, getCallByTwilioSid, updateCall, addMessage, getCustomerByPhone,
  listAccountsForCustomer,
} from '@soro/db';
import { MockBankingCore } from '@soro/banking';
import { handleVoiceTurn, type AgentContext } from '@soro/service-agent';
import { authorizeWithDtmfPin } from '@soro/service-security';
import { isValidTwilioRequest, sayGatherXml, gatherDtmfXml } from './twilio.util.js';

/**
 * Live voice flow:
 *   POST /api/twilio/voice   — incoming call: create/identify session, greet
 *   POST /api/twilio/gather  — speech result: Ayo turn (intent, tools, policy)
 *   POST /api/twilio/dtmf    — DTMF digits: verify PIN, never reach the AI
 *   POST /api/twilio/status  — call status callbacks
 */

export function twilioVoiceRoute(app: FastifyInstance, db: Database, _core: MockBankingCore): void {
  app.post('/api/twilio/voice', async (req, reply) => {
    const params = req.body as Record<string, string>;
    if (!isValidTwilioRequest(`${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/voice`, params, req.headers['x-twilio-signature'] as string)) {
      return reply.status(403).send({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook validation failed.' } });
    }
    const callSid = params['CallSid'];
    if (!callSid) return reply.status(400).send({ success: false, error: { code: 'MISSING_CALL_SID', message: 'CallSid required.' } });

    let call = getCallByTwilioSid(db, callSid);
    if (!call) {
      const from = params['From'] ?? '';
      const customer = getCustomerByPhone(db, from);
      const account = customer ? listAccountsForCustomer(db, customer.id)[0] : undefined;
      call = {
        id: randomUUID(), twilioCallSid: callSid, fromNumber: from, toNumber: params['To'] ?? '',
        customerId: customer?.id, accountId: account?.id, status: 'IN_PROGRESS',
        authenticationStatus: customer ? 'IDENTIFIED' : 'PENDING', authorizationStatus: 'NONE',
        escalationStatus: 'NONE', startedAt: new Date().toISOString(), answeredAt: new Date().toISOString(),
      };
      createCall(db, call);
    }
    const greeting = call.customerId
      ? `Hello, welcome to Soro. How can I help you today?`
      : 'Hello, welcome to Soro. I could not find an account for this number. Please contact support.';
    reply.header('Content-Type', 'text/xml').send(sayGatherXml(greeting, `${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/gather?callId=${call.id}`));
  });
}

export function twilioGatherRoute(app: FastifyInstance, db: Database, core: MockBankingCore): void {
  app.post('/api/twilio/gather', async (req, reply) => {
    const params = req.body as Record<string, string>;
    if (!isValidTwilioRequest(`${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/gather`, params, req.headers['x-twilio-signature'] as string)) {
      return reply.status(403).send({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook validation failed.' } });
    }
    const callId = (req.query as Record<string, string>)['callId'];
    const speech = params['SpeechResult'] ?? '';
    addMessage(db, { id: randomUUID(), callSessionId: callId, sender: 'CUSTOMER', content: speech, createdAt: new Date().toISOString() });

    const ctx: AgentContext = buildAgentContext(db, core, callId);
    const turn = await handleVoiceTurn(ctx, speech);
    addMessage(db, { id: randomUUID(), callSessionId: callId, sender: 'AYO', content: turn.reply, createdAt: new Date().toISOString() });

    if (turn.requiresDtmf) {
      return reply.header('Content-Type', 'text/xml').send(gatherDtmfXml(turn.reply, `${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/dtmf?callId=${callId}`));
    }
    reply.header('Content-Type', 'text/xml').send(sayGatherXml(turn.reply, `${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/gather?callId=${callId}`));
  });
}

export function twilioDtmfRoute(app: FastifyInstance, db: Database, _core: MockBankingCore): void {
  app.post('/api/twilio/dtmf', async (req, reply) => {
    const params = req.body as Record<string, string>;
    if (!isValidTwilioRequest(`${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/dtmf`, params, req.headers['x-twilio-signature'] as string)) {
      return reply.status(403).send({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook validation failed.' } });
    }
    const callId = (req.query as Record<string, string>)['callId'];
    const digits = params['Digits'] ?? '';
    // The AI NEVER receives these digits. We only record that DTMF input was received.
    addMessage(db, { id: randomUUID(), callSessionId: callId, sender: 'SYSTEM', content: 'DTMF INPUT RECEIVED', createdAt: new Date().toISOString() });

    const call = db.prepare(`SELECT * FROM calls WHERE id=?`).get(callId) as { customer_id?: string } | undefined;
    const customer = call?.customer_id ? (db.prepare(`SELECT * FROM customers WHERE id=?`).get(call.customer_id) as { id: string; customer_number: string }) : undefined;
    let replyText = 'Authorization failed.';
    if (customer) {
      const outcome = authorizeWithDtmfPin(db, {
        customerId: customer.id, callSessionId: callId,
        transactionReference: `AUTH-${callId}`, customerNumber: customer.customer_number, pin: digits,
      });
      if (outcome === 'SUCCESS') replyText = 'Authorization successful. Processing your request.';
      else if (outcome === 'LOCKED') replyText = 'Too many failed attempts. Your transaction has been blocked.';
      else if (outcome === 'TIMEOUT') replyText = 'No input received. Authorization timed out.';
      updateCall(db, callId, { authorizationStatus: outcome });
    }
    reply.header('Content-Type', 'text/xml').send(sayGatherXml(replyText, `${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/gather?callId=${callId}`));
  });
}

export function twilioStatusRoute(app: FastifyInstance, db: Database): void {
  app.post('/api/twilio/status', async (req, reply) => {
    const params = req.body as Record<string, string>;
    if (!isValidTwilioRequest(`${process.env.TWILIO_WEBHOOK_BASE_URL}/api/twilio/status`, params, req.headers['x-twilio-signature'] as string)) {
      return reply.status(403).send({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook validation failed.' } });
    }
    const callSid = params['CallSid'];
    const status = params['CallStatus'];
    if (callSid) {
      const call = getCallByTwilioSid(db, callSid);
      if (call) {
        const patch: Record<string, unknown> = {};
        if (status === 'completed') { patch['status'] = 'COMPLETED'; patch['endedAt'] = new Date().toISOString(); }
        if (status === 'failed') patch['status'] = 'FAILED';
        if (status === 'busy' || status === 'no-answer') patch['status'] = 'ABANDONED';
        if (Object.keys(patch).length > 0) updateCall(db, call.id, patch);
      }
    }
    reply.send({ success: true });
  });
}

function buildAgentContext(db: Database, core: MockBankingCore, callId: string): AgentContext {
  const call = db.prepare(`SELECT * FROM calls WHERE id=?`).get(callId) as { customer_id?: string; account_id?: string } | undefined;
  return {
    db, core, callSessionId: callId, customerId: call?.customer_id, accountId: call?.account_id,
    authenticated: !!call?.customer_id,
  };
}
