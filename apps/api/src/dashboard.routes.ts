import type { FastifyInstance } from 'fastify';
import type { Database } from '@soro/db';
import {
  getAccountByNumber, getCallById, listCalls, listCallsForCustomer,
  listCustomers, listMessagesForCall, listSupportCases, getVoiceProfileByCustomer, listEmails,
} from '@soro/db';
import type { MockBankingCore } from '@soro/banking';

const ok = (data: unknown) => ({ success: true, data });
const err = (code: string, message: string) => ({ success: false, error: { code, message } });

export function dashboardRoutes(app: FastifyInstance, db: Database, core: MockBankingCore): void {
  app.get('/api/dashboard/calls', async () => ok(listCalls(db)));

  app.get('/api/dashboard/customers', async () => ok(listCustomers(db)));

  app.get('/api/dashboard/customers/:id', async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const customer = listCustomers(db).find((c) => c.id === id);
    if (!customer) return reply.status(404).send(err('CUSTOMER_NOT_FOUND', 'Customer not found.'));
    return ok({
      customer,
      accounts: db.prepare(`SELECT * FROM accounts WHERE customer_id=?`).all(id),
      voiceProfile: getVoiceProfileByCustomer(db, id),
      calls: listCallsForCustomer(db, id),
      supportCases: listSupportCases(db).filter((s) => s.customerId === id),
    });
  });

  app.get('/api/dashboard/accounts/:accountNumber', async (req, reply) => {
    const account = getAccountByNumber(db, (req.params as { accountNumber: string }).accountNumber);
    if (!account) return reply.status(404).send(err('ACCOUNT_NOT_FOUND', 'Account not found.'));
    return ok({ account, transactions: core.getRecentTransactions(account.id, 50) });
  });

  app.get('/api/dashboard/calls/:id', async (req, reply) => {
    const call = getCallById(db, (req.params as { id: string }).id);
    if (!call) return reply.status(404).send(err('CALL_NOT_FOUND', 'Call not found.'));
    return ok({ call, messages: listMessagesForCall(db, call.id) });
  });

  app.get('/api/dashboard/transactions', async (req) => {
    const accountId = (req.query as Record<string, string>)['accountId'];
    const rows = accountId
      ? db.prepare(`SELECT * FROM transactions WHERE account_id=? ORDER BY created_at DESC LIMIT 100`).all(accountId)
      : db.prepare(`SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100`).all();
    return ok(rows);
  });

  app.get('/api/dashboard/support-cases', async () => ok(listSupportCases(db)));

  app.get('/api/dashboard/events', async (req) => {
    const sessionId = (req.query as Record<string, string>)['sessionId'];
    const rows = sessionId
      ? db.prepare(`SELECT * FROM events WHERE session_id=? ORDER BY created_at`).all(sessionId)
      : db.prepare(`SELECT * FROM events ORDER BY created_at DESC LIMIT 200`).all();
    return ok(rows);
  });

  app.get('/api/dashboard/emails', async () => ok(listEmails(db)));
}
