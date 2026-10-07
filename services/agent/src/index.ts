import { randomUUID } from 'node:crypto';
import type { Database } from '@soro/db';
import { generateStatement, sendStatementEmail, MockBankingCore } from '@soro/banking';
import { addMessage, recordEventSnapshot } from './events.js';
import { createSupportCase, listAccountsForCustomer, listBeneficiaries, getAccountByNumber, updateCall } from '@soro/db';
import { TOOL_REGISTRY, getToolDefinition, type ToolDefinition } from './tools.js';
import { understandUtterance } from './nl.js';

export * from './nl.js';
export * from './tools.js';

export async function runToolByName(ctx: AgentContext, name: string, args: Record<string, string | number | boolean>): Promise<string> {
  return executeTool(ctx, name, args);
}

export async function executePendingTool(ctx: AgentContext): Promise<string> {
  const pending = ctx.pendingTool;
  if (!pending) return 'There is nothing pending to execute.';
  ctx.pendingTool = undefined;
  return executeTool(ctx, pending.name, pending.args);
}

export interface AgentContext {
  db: Database;
  core: MockBankingCore;
  callSessionId: string;
  customerId?: string;
  accountId?: string;
  authenticated: boolean;
  confirmedIntent?: { intent: string; entities: Record<string, string | number | boolean> };
  pendingTool?: { name: string; args: Record<string, string | number | boolean>; requiresAuthz: boolean };
  scenario?: string;
}

/**
 * Ayo turn handler. The NLU proposes a structured intent; the backend
 * decides what actually runs. Confirmation and DTMF authorization are
 * enforced here before any money moves.
 */
export async function handleVoiceTurn(ctx: AgentContext, utterance: string): Promise<{ reply: string; requiresDtmf: boolean }> {
  addMessage(ctx.db, {
    id: randomUUID(), callSessionId: ctx.callSessionId, sender: 'CUSTOMER',
    language: undefined, content: utterance, createdAt: new Date().toISOString(),
  });
  const understood = understandUtterance(utterance);
  recordEventSnapshot(ctx.db, ctx.callSessionId, 'INTENT_DETECTED', { intent: understood.intent, language: understood.language });

  // Deterministic scam/social-engineering heuristic (prototype, NOT production fraud detection).
  const SCAM_PATTERNS = /urgent|protect your account|share your pin|send otp|someone called earlier saying|verified caller|your account will be blocked/i;
  if (SCAM_PATTERNS.test(utterance)) {
    recordEventSnapshot(ctx.db, ctx.callSessionId, 'SECURITY_WARNING', { reason: 'SUSPICIOUS_SCAM_PATTERN', simulatedDetector: true });
    return { reply: 'Please be careful. I will never ask for your PIN or OTP by phone. If this call seems suspicious, hang up and call a number printed on your card. I have flagged this as a potential scam.', requiresDtmf: false };
  }

  if (understood.intent === 'CONFIRM' && ctx.pendingTool) {
    if (ctx.pendingTool.requiresAuthz) {
      recordEventSnapshot(ctx.db, ctx.callSessionId, 'AUTHORIZATION_STARTED', { tool: ctx.pendingTool.name });
      return { reply: 'Please use your phone keypad to authorize this transaction.', requiresDtmf: true };
    }
    return { reply: await executeTool(ctx, ctx.pendingTool.name, ctx.pendingTool.args), requiresDtmf: false };
  }

  if (understood.intent === 'CANCEL') {
    ctx.pendingTool = undefined;
    return { reply: 'Okay, I have cancelled that. How else can I help you?', requiresDtmf: false };
  }

  const tool = TOOL_REGISTRY.find((t) => t.intent === understood.intent);
  if (!tool) {
    return { reply: "I didn't quite get that. You can ask for your balance, buy airtime or data, transfer money, check transactions, get your statement, or speak to someone.", requiresDtmf: false };
  }

  if (tool.requiresAuthentication && !ctx.authenticated) {
    return { reply: 'Before I can help, I need to verify your identity. What is your PIN on your keypad?', requiresDtmf: false };
  }

  if (tool.requiresConfirmation) {
    ctx.pendingTool = { name: tool.name, args: understood.entities, requiresAuthz: tool.requiresAuthorization };
    return { reply: confirmationPrompt(tool, understood.entities), requiresDtmf: false };
  }

  return { reply: await executeTool(ctx, tool.name, understood.entities), requiresDtmf: false };
}

function confirmationPrompt(tool: ToolDefinition, args: Record<string, string | number | boolean>): string {
  const amt = args['amount_minor'];
  if (tool.name === 'purchaseAirtime') return `You want to buy ${amt ? `₦${Number(amt) / 100}` : ''} airtime. Is that correct?`;
  if (tool.name === 'purchaseData') return `You want to buy a data plan${amt ? ` for ₦${Number(amt) / 100}` : ''}. Is that correct?`;
  if (tool.name === 'createTransfer') return `You want to send money${amt ? ` of ₦${Number(amt) / 100}` : ''}. Is that correct?`;
  if (tool.name === 'sendStatementEmail') return 'I will send your statement to your registered email. Is that correct?';
  return `Please confirm you want to ${tool.description.toLowerCase()}`;
}

async function executeTool(ctx: AgentContext, name: string, args: Record<string, string | number | boolean>): Promise<string> {
  const def = getToolDefinition(name);
  if (!def) return 'Sorry, I cannot do that.';
  recordEventSnapshot(ctx.db, ctx.callSessionId, 'TOOL_CALLED', { tool: name });
  try {
    const result = await runTool(ctx, name, args);
    recordEventSnapshot(ctx.db, ctx.callSessionId, 'TOOL_SUCCESS', { tool: name });
    return result;
  } catch (e) {
    recordEventSnapshot(ctx.db, ctx.callSessionId, 'TOOL_FAILED', { tool: name, error: (e as Error).message });
    return `Sorry, that did not go through. ${(e as Error).message}`;
  }
}

async function runTool(ctx: AgentContext, name: string, args: Record<string, string | number | boolean>): Promise<string> {
  if (!ctx.accountId) throw new Error('No account selected.');
  switch (name) {
    case 'getAccountBalance': {
      const account = ctx.core.getAccountBalance(ctx.accountId);
      return `Your account balance is ₦${(account.balanceMinor / 100).toLocaleString()}.`;
    }
    case 'getRecentTransactions': {
      const txns = ctx.core.getRecentTransactions(ctx.accountId, 5);
      if (txns.length === 0) return 'You have no recent transactions.';
      return `Your last ${txns.length} transactions: ` + txns.map((t) => `${t.type} of ₦${t.amountMinor / 100} on ${t.createdAt.slice(0, 10)}`).join('; ') + '.';
    }
    case 'getDataPlans': {
      const plans = ctx.core.getDataPlans();
      return `Available plans include: ${plans.slice(0, 4).map((p) => `${p.network} ${p.label} for ₦${p.priceMinor / 100}`).join(', ')}.`;
    }
    case 'recommendDataPlan': {
      const budget = typeof args['amount_minor'] === 'number' ? args['amount_minor'] : undefined;
      const rec = ctx.core.recommendDataPlan({ budgetMinor: budget, network: args['network'] as never });
      if (!rec.recommended) return rec.reason;
      return `I recommend ${rec.recommended.network} ${rec.recommended.label} for ₦${rec.recommended.priceMinor / 100}. ${rec.reason}`;
    }
    case 'purchaseAirtime': {
      const amount = args['amount_minor'] as number;
      const customer = ctx.db.prepare(`SELECT phone_number FROM customers WHERE id=?`).get(ctx.customerId!) as { phone_number: string };
      const txn = ctx.core.purchaseAirtime({
        accountId: ctx.accountId, phoneNumber: customer.phone_number,
        network: (args['network'] as never) ?? 'MTN', amountMinor: amount,
        idempotencyKey: randomUUID(), scenario: ctx.scenario as never,
      });
      return `Airtime purchase successful. Your reference is ${txn.reference}.`;
    }
    case 'purchaseData': {
      const rec = ctx.core.recommendDataPlan({ budgetMinor: args['amount_minor'] as number, network: args['network'] as never });
      if (!rec.recommended) return 'No data plan fits that budget.';
      const txn = ctx.core.purchaseData({
        accountId: ctx.accountId, phoneNumber: '', network: rec.recommended.network, planId: rec.recommended.id,
        idempotencyKey: randomUUID(), scenario: ctx.scenario as never,
      });
      return `Data purchase successful: ${rec.recommended.label} ${rec.recommended.network} for ₦${rec.recommended.priceMinor / 100}. Reference ${txn.reference}.`;
    }
    case 'createTransfer': {
      const amount = args['amount_minor'] as number;
      const to = (args['account_number'] as string) ?? '';
      const txn = ctx.core.transfer({ fromAccountId: ctx.accountId, toAccountNumber: to, amountMinor: amount, idempotencyKey: randomUUID(), scenario: ctx.scenario as never });
      return `Transfer successful. Reference ${txn.reference}.`;
    }
    case 'getTransferStatus': {
      const ref = (args['reference'] as string) ?? '';
      const txn = ctx.core.getTransaction(ref);
      if (!txn) return 'I could not find that transaction reference.';
      return `Transaction ${ref} is ${txn.status}.`;
    }
    case 'generateStatement': {
      const account = ctx.core.getAccountBalance(ctx.accountId);
      const nowIso = new Date().toISOString();
      const from = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const stmt = generateStatement(ctx.db, { accountId: account.id, accountNumber: account.accountNumber, customerId: account.customerId, fromIso: from, toIso: nowIso });
      return `Statement for the last 30 days with ${stmt.transactions.length} transactions: ${stmt.bodyPreview.split('\n').slice(0, 5).join('; ')}`;
    }
    case 'sendStatementEmail': {
      const account = ctx.core.getAccountBalance(ctx.accountId);
      const nowIso = new Date().toISOString();
      const from = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const stmt = generateStatement(ctx.db, { accountId: account.id, accountNumber: account.accountNumber, customerId: account.customerId, fromIso: from, toIso: nowIso });
      const customer = ctx.db.prepare(`SELECT email FROM customers WHERE id=?`).get(ctx.customerId!) as { email: string };
      const sent = sendStatementEmail(ctx.db, { toAddress: customer.email, subject: 'Soro Statement', statement: stmt });
      recordEventSnapshot(ctx.db, ctx.callSessionId, 'STATEMENT_EMAIL_SENT', { emailId: sent.id });
      return `Your statement has been sent to ${customer.email}.`;
    }
    case 'createSupportCase': {
      const category = (args['category'] as string) ?? 'GENERAL_SUPPORT';
      const acct = ctx.accountId ? listAccountsForCustomer(ctx.db, ctx.customerId!).find((a) => a.id === ctx.accountId) : undefined;
      createSupportCase(ctx.db, {
        id: randomUUID(), customerId: ctx.customerId, accountId: ctx.accountId, callSessionId: ctx.callSessionId,
        category: category as never, description: (args['description'] as string) ?? 'Customer reported an issue via voice call.',
        priority: 'MEDIUM', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      recordEventSnapshot(ctx.db, ctx.callSessionId, 'SUPPORT_CASE_CREATED', { category });
      return 'I have logged a support case for you. Reference ' + (acct?.id ?? 'n/a') + '.';
    }
    case 'escalateToHuman': {
      createSupportCase(ctx.db, {
        id: randomUUID(), customerId: ctx.customerId, accountId: ctx.accountId, callSessionId: ctx.callSessionId,
        category: 'GENERAL_SUPPORT', description: 'Customer requested human assistance.', priority: 'HIGH', status: 'ESCALATED',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      updateCall(ctx.db, ctx.callSessionId, { status: 'ESCALATED', escalationStatus: 'ESCALATED' });
      recordEventSnapshot(ctx.db, ctx.callSessionId, 'HUMAN_ESCALATION', {});
      return 'I have escalated this to a human agent. Your case has been created.';
    }
    case 'getBeneficiaries': {
      const list = listBeneficiaries(ctx.db, ctx.customerId!);
      if (list.length === 0) return 'You have no saved beneficiaries.';
      return 'Your beneficiaries: ' + list.map((b) => `${b.name} (${b.bankName} ${b.accountNumber})`).join(', ');
    }
    case 'verifyBeneficiary': {
      const acct = args['account_number'] ? getAccountByNumber(ctx.db, args['account_number'] as string) : undefined;
      if (!acct) return 'I could not verify that account number.';
      return `Account ${args['account_number']} is verified and active.`;
    }
    default:
      return 'I cannot do that yet.';
  }
}
