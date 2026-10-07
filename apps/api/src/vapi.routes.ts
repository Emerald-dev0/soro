import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import type { Database } from '@soro/db';
import { createCall, getCustomerByPhone, getCustomerById, listAccountsForCustomer, updateCall } from '@soro/db';
import { MockBankingCore } from '@soro/banking';
import { runToolByName, TOOL_REGISTRY, type AgentContext } from '@soro/service-agent';

/**
 * Vapi server URL: assistant-request inbound, tool-calls dispatch,
 * call lifecycle status, end-of-call summary persisted.
 */
export function vapiRoutes(app: FastifyInstance, db: Database, core: MockBankingCore): void {
  app.post('/api/vapi/webhook', async (req) => {
    const body = req.body as { message?: { type?: string; call?: { id?: string; customer?: { number?: string } }; toolCallList?: { id: string; name: string; parameters?: Record<string, unknown> }[]; assistant?: unknown; status?: string } } | undefined;
    const msg = (body?.message ?? {}) as { type?: string; call?: { id?: string; customer?: { number?: string } }; toolCallList?: { id: string; name: string; parameters?: Record<string, unknown> }[]; status?: string };
    console.log('[vapi] type=', msg.type, 'tools=', (msg.toolCallList ?? []).map((t) => t.name).join(','));
    const callId = msg.call?.id ?? 'vapi-unknown';

    if (msg.type === 'tool-calls') {
      const results = [];
      for (const tc of msg.toolCallList ?? []) {
        try {
          const ctx = buildVapiContext(db, core, callId, msg.call as { id?: string; customer?: { number?: string } } | undefined);
          const result = await runToolByName(ctx, tc.name, normalizeArgs(tc.parameters ?? {}));
          results.push({ name: tc.name, toolCallId: tc.id, result });
        } catch (e) {
          results.push({ name: tc.name, toolCallId: tc.id, result: `Sorry, that action failed: ${(e as Error).message}` });
        }
      }
      return { results };
    }

    if (msg.type === 'assistant-request') {
      return { assistant: buildAssistant() };
    }

    if (msg.type === 'status-update' || msg.type === 'end-of-call-report') {
      try {
        const status = msg.type === 'end-of-call-report' ? 'COMPLETED' : msg.status === 'in-progress' ? 'IN_PROGRESS' : 'RINGING';
        const existing = db.prepare(`SELECT id FROM calls WHERE twilio_call_sid=?`).get(`vapi:${callId}`) as { id?: string } | undefined;
        if (existing?.id) updateCall(db, existing.id, { status: status as never, endedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined });
        else createCall(db, { id: randomUUID(), twilioCallSid: `vapi:${callId}`, fromNumber: msg.call?.customer?.number ?? 'unknown', toNumber: 'VAPI', status: status as never, authenticationStatus: 'IDENTIFIED', authorizationStatus: 'NONE', escalationStatus: 'NONE', startedAt: new Date().toISOString() });
      } catch { /* best-effort */ }
      return {};
    }

    return {};
  });
}

export function buildAssistant(): Record<string, unknown> {
  const tools = TOOL_REGISTRY.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: 'object',
        properties: {
          amount_minor: { type: 'number', description: 'Amount in kobo (₦1 = 100 kobo)' },
          network: { type: 'string', enum: ['MTN', 'AIRTEL', 'GLO', '9MOBILE'] },
          reference: { type: 'string', description: 'Transfer reference' },
          account_number: { type: 'string', description: 'Destination account number' },
          description: { type: 'string', description: 'Issue description' },
        },
      },
    },
    server: { url: `${process.env.APP_BASE_URL}/api/vapi/webhook` },
  }));
  return {
    name: 'Ayo — Soro Banking',
    firstMessage: 'Hello, this is Ayo from Soro. How can I help you today?',
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.6,
      maxTokens: 200,
      messages: [{
        role: 'system',
        content: [
          'You are Ayo (also called AY), a calm and concise conversational banking assistant for Soro. You may be addressed as Ayo or AY — both refer to you.',
          'You help customers check balances, buy airtime/data, transfer money, view transactions, and get statements.',
          'You MUST call the provided tools for any banking fact or action — never invent balances or transaction results.',
          'For transfers, airtime, data, and statements, first confirm the details, then execute the tool.',
          'Never ask for PINs or OTPs. Ayo does not process PINs.',
          'You support English, Nigerian Pidgin, and Yoruba. Reply in the customer\u2019s language.',
          'Keep every spoken reply to 1-2 short sentences and vary your phrasing; never read long lists unless asked.',
          'When a tool returns a result, ALWAYS speak its key facts immediately: balances, amounts, references, plan names. Never claim you cannot do something a tool just completed.',
          'Sound like a calm Nigerian bank customer-care agent: polite, warm, unhurried. If the customer speaks Yoruba, answer in simple Yoruba and keep it brief.',
        ].join(' '),
      }],
      tools,
    },
    voice: { provider: 'vapi', voiceId: 'Elliot' },
    transcriber: { provider: 'deepgram', model: 'nova-3', language: 'en' },
  };
}

function normalizeArgs(params: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  if (out['amount_naira'] !== undefined && out['amount_minor'] === undefined) {
    out['amount_minor'] = Math.round(Number(out['amount_naira']) * 100);
  }
  return out;
}

function buildVapiContext(db: Database, core: MockBankingCore, callId: string, call?: { id?: string; customer?: { number?: string } }): AgentContext {
  const number = call?.customer?.number;
  const customer = number ? getCustomerByPhone(db, number) : undefined;
  const fallback = customer ?? getCustomerById(db, 'cust-daniel')!;
  const account = listAccountsForCustomer(db, fallback.id)[0];
  const existing = db.prepare(`SELECT id FROM calls WHERE twilio_call_sid=?`).get(`vapi:${callId}`) as { id?: string } | undefined;
  let callSessionId = existing?.id;
  if (!callSessionId) {
    callSessionId = randomUUID();
    createCall(db, { id: callSessionId, twilioCallSid: `vapi:${callId}`, fromNumber: number ?? 'unknown', toNumber: 'VAPI', customerId: fallback.id, accountId: account?.id, status: 'IN_PROGRESS', authenticationStatus: 'IDENTIFIED', authorizationStatus: 'NONE', escalationStatus: 'NONE', startedAt: new Date().toISOString() });
  }
  return { db, core, callSessionId, customerId: fallback.id, accountId: account?.id, authenticated: true };
}
