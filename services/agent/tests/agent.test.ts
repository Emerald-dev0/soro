import { describe, expect, it } from 'vitest';
import { understandUtterance } from '../src/nl.js';
import { TOOL_REGISTRY, getToolDefinition } from '../src/tools.js';

describe('NLU', () => {
  it('detects a Pidgin balance question', () => {
    const u = understandUtterance('How much dey my account?');
    expect(u.language).toBe('pcm');
    expect(u.intent).toBe('GET_BALANCE');
  });
  it('detects a data request', () => {
    const u = understandUtterance('Abeg buy me 500 naira data');
    expect(u.intent).toBe('PURCHASE_DATA');
    expect(u.entities['amount_minor']).toBe(50000);
  });
  it('detects a transfer request with amount', () => {
    const u = understandUtterance('Send 5000 naira to my brother');
    expect(u.intent).toBe('TRANSFER_MONEY');
    expect(u.entities['amount_minor']).toBe(500000);
  });
  it('recommend intent maps to the recommendation tool', () => {
    const u = understandUtterance('Find me the best data plan for 500 naira');
    expect(u.intent).toBe('RECOMMEND_DATA_PLAN');
  });
});

describe('tool registry', () => {
  it('high-risk tools require confirmation + authorization', () => {
    const t = getToolDefinition('createTransfer')!;
    expect(t.requiresConfirmation).toBe(true);
    expect(t.requiresAuthorization).toBe(true);
    expect(t.riskLevel).toBe('HIGH');
  });
  it('read-only tools do not require authorization', () => {
    const t = getToolDefinition('getAccountBalance')!;
    expect(t.requiresAuthorization).toBe(false);
  });
  it('every tool has a permission envelope', () => {
    for (const t of TOOL_REGISTRY) {
      expect(t.riskLevel).toMatch(/LOW|MEDIUM|HIGH/);
      expect(typeof t.requiresAuthentication).toBe('boolean');
    }
  });
});
