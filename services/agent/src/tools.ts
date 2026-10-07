/**
 * Tool registry — the ONLY surface through which Ayo can cause an effect.
 * Every tool declares its security envelope; the backend enforces it,
 * the LLM cannot bypass it.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ToolDefinition {
  name: string;
  description: string;
  requiresAuthentication: boolean;
  requiresConfirmation: boolean;
  requiresAuthorization: boolean;
  riskLevel: RiskLevel;
  intent: string;
}

export const TOOL_REGISTRY: ToolDefinition[] = [
  { name: 'getAccountBalance', description: 'Get the authenticated account balance.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_BALANCE' },
  { name: 'getRecentTransactions', description: 'List recent transactions.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_TRANSACTION_HISTORY' },
  { name: 'getTransaction', description: 'Get one transaction by reference.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_TRANSACTION' },
  { name: 'getDataPlans', description: 'List data plans, optionally by network.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_DATA_PLANS' },
  { name: 'recommendDataPlan', description: 'Recommend the best data plan for a budget/network.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'RECOMMEND_DATA_PLAN' },
  { name: 'purchaseData', description: 'Buy a data plan.', requiresAuthentication: true, requiresConfirmation: true, requiresAuthorization: true, riskLevel: 'MEDIUM', intent: 'PURCHASE_DATA' },
  { name: 'getAirtimeOptions', description: 'List airtime denominations.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_AIRTIME_OPTIONS' },
  { name: 'purchaseAirtime', description: 'Buy airtime.', requiresAuthentication: true, requiresConfirmation: true, requiresAuthorization: true, riskLevel: 'MEDIUM', intent: 'PURCHASE_AIRTIME' },
  { name: 'getBeneficiaries', description: 'List saved beneficiaries.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_BENEFICIARIES' },
  { name: 'verifyBeneficiary', description: 'Verify a beneficiary account number.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'VERIFY_BENEFICIARY' },
  { name: 'createTransfer', description: 'Transfer money to a beneficiary.', requiresAuthentication: true, requiresConfirmation: true, requiresAuthorization: true, riskLevel: 'HIGH', intent: 'TRANSFER_MONEY' },
  { name: 'getTransferStatus', description: 'Check a transfer reference.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_TRANSFER_STATUS' },
  { name: 'generateStatement', description: 'Generate an account statement.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'GET_STATEMENT' },
  { name: 'sendStatementEmail', description: 'Email an account statement to the registered address.', requiresAuthentication: true, requiresConfirmation: true, requiresAuthorization: false, riskLevel: 'MEDIUM', intent: 'GET_STATEMENT' },
  { name: 'createSupportCase', description: 'Open a support case.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'CREATE_SUPPORT_CASE' },
  { name: 'escalateToHuman', description: 'Escalate to a human support case.', requiresAuthentication: true, requiresConfirmation: false, requiresAuthorization: false, riskLevel: 'LOW', intent: 'ESCALATE_TO_HUMAN' },
];

export function getToolDefinition(name: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}
