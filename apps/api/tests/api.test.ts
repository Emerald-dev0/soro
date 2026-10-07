import { describe, expect, it } from 'vitest';
import { openDatabase, migrate, seedDemoData } from '@soro/db';
import { MockBankingCore } from '@soro/banking';
import Fastify from 'fastify';
import { twilioVoiceRoute, twilioGatherRoute, twilioDtmfRoute, twilioStatusRoute } from '../src/twilio.routes.js';
import { dashboardRoutes } from '../src/dashboard.routes.js';
import { healthRoutes } from '../src/health.routes.js';
import { demoRoutes } from '../src/demo.routes.js';
import { sseRoutes } from '../src/events.routes.js';

function testApp() {
  process.env.TWILIO_WEBHOOK_BASE_URL = 'http://localhost:3000';
  delete process.env.TWILIO_AUTH_TOKEN;
  const database = openDatabase(':memory:');
  migrate(database);
  seedDemoData(database);
  const core = new MockBankingCore(database);
  const app = Fastify();
  healthRoutes(app, database);
  twilioVoiceRoute(app, database, core);
  twilioGatherRoute(app, database, core);
  twilioDtmfRoute(app, database, core);
  twilioStatusRoute(app, database);
  dashboardRoutes(app, database, core);
  sseRoutes(app);
  demoRoutes(app, database, core);
  return { app, database };
}

describe('health', () => {
  it('GET /health reports ok', async () => {
    const { app } = testApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().success).toBe(true);
  });
});

describe('twilio flow', () => {
  it('incoming call creates a session and returns TwiML', async () => {
    const { app, database } = testApp();
    const res = await app.inject({ method: 'POST', url: '/api/twilio/voice', payload: { CallSid: 'CA123', From: '08030000001', To: '+123' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<Response>');
    const call = database.prepare(`SELECT * FROM calls WHERE twilio_call_sid='CA123'`).get() as { customer_id: string };
    expect(call.customer_id).toBe('cust-daniel');
  });

  it('duplicate webhook does not create a duplicate call', async () => {
    const { app, database } = testApp();
    await app.inject({ method: 'POST', url: '/api/twilio/voice', payload: { CallSid: 'CA123', From: '08030000001', To: '+123' } });
    await app.inject({ method: 'POST', url: '/api/twilio/voice', payload: { CallSid: 'CA123', From: '08030000001', To: '+123' } });
    const rows = database.prepare(`SELECT * FROM calls WHERE twilio_call_sid='CA123'`).all();
    expect(rows).toHaveLength(1);
  });

  it('gather turn produces an Ayo reply', async () => {
    const { app, database } = testApp();
    await app.inject({ method: 'POST', url: '/api/twilio/voice', payload: { CallSid: 'CA1', From: '08030000001', To: '+123' } });
    const call = database.prepare(`SELECT id FROM calls WHERE twilio_call_sid='CA1'`).get() as { id: string };
    const res = await app.inject({ method: 'POST', url: `/api/twilio/gather?callId=${call.id}`, payload: { SpeechResult: 'How much dey my account?' } });
    expect(res.body).toContain('balance');
  });

  it('dtmf endpoint records only a sanitized receipt', async () => {
    const { app, database } = testApp();
    await app.inject({ method: 'POST', url: '/api/twilio/voice', payload: { CallSid: 'CA2', From: '08030000001', To: '+123' } });
    const call = database.prepare(`SELECT id FROM calls WHERE twilio_call_sid='CA2'`).get() as { id: string };
    const res = await app.inject({ method: 'POST', url: `/api/twilio/dtmf?callId=${call.id}`, payload: { Digits: '1234' } });
    expect(res.statusCode).toBe(200);
    const messages = database.prepare(`SELECT content FROM conversation_messages WHERE call_session_id=?`).all(call.id) as { content: string }[];
    expect(messages.map((m) => m.content).join(' ')).not.toContain('1234');
    expect(messages.map((m) => m.content).join(' ')).toContain('DTMF INPUT RECEIVED');
  });
});

describe('dashboard APIs', () => {
  it('lists customers', async () => {
    const { app } = testApp();
    const res = await app.inject({ method: 'GET', url: '/api/dashboard/customers' });
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveLength(2);
  });

  it('account view returns the real balance', async () => {
    const { app } = testApp();
    const res = await app.inject({ method: 'GET', url: '/api/dashboard/accounts/0123456789' });
    expect(res.json().data.account.balanceMinor).toBe(8425000);
  });
});

describe('demo scenario', () => {
  it('runs a balance inquiry end-to-end with real state', async () => {
    const { app } = testApp();
    const res = await app.inject({ method: 'POST', url: '/api/demo/run-scenario', payload: { phone: '08030000001', turns: ['How much dey my account?'] } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.transcript.some((t: { text: string }) => t.text.includes('Balance'))).toBe(true);
  });
});
