/** Demo customer/account/support/etc. domain model (SIMULATED data). */

export const CUSTOMER_STATUSES = ['ACTIVE', 'SUSPENDED', 'LOCKED'] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export const CUSTOMER_LANGUAGES = ['ENGLISH', 'PIDGIN', 'YORUBA'] as const;
export type CustomerLanguage = (typeof CUSTOMER_LANGUAGES)[number];

export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  status: CustomerStatus;
  preferredLanguage: CustomerLanguage;
  createdAt: string;
  updatedAt: string;
}

export const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT', 'WALLET'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_STATUSES = ['ACTIVE', 'FROZEN', 'CLOSED'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface Account {
  id: string;
  customerId: string;
  accountNumber: string;
  accountType: AccountType;
  currency: string;
  /** Minor units (kobo). */
  balanceMinor: number;
  availableBalanceMinor: number;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Beneficiary {
  id: string;
  customerId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export const NETWORKS = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'] as const;
export type Network = (typeof NETWORKS)[number];

export interface DataPlan {
  id: string;
  network: Network;
  label: string;
  dataMb: number;
  priceMinor: number;
  validityDays: number;
}

export const CALL_STATUSES = [
  'RINGING', 'IN_PROGRESS', 'AUTHENTICATING', 'AUTHENTICATED',
  'PROCESSING', 'ESCALATED', 'COMPLETED', 'FAILED', 'ABANDONED',
] as const;
export type CallStatus = (typeof CALL_STATUSES)[number];

export interface CallSession {
  id: string;
  twilioCallSid?: string;
  fromNumber: string;
  toNumber: string;
  customerId?: string;
  accountId?: string;
  status: CallStatus;
  language?: string;
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  authenticationStatus: string;
  authorizationStatus: string;
  currentIntent?: string;
  escalationStatus: string;
}

export interface ConversationMessage {
  id: string;
  callSessionId: string;
  sender: 'CUSTOMER' | 'AYO' | 'SYSTEM';
  language?: string;
  content: string;
  createdAt: string;
}

export const ATTEMPT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'LOCKED'] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export interface AuthenticationAttempt {
  id: string;
  customerId: string;
  callSessionId?: string;
  method: 'DTMF_PIN' | 'PHONE_LOOKUP' | 'VOICE_VERIFICATION';
  status: AttemptStatus;
  attemptNumber: number;
  createdAt: string;
  completedAt?: string;
}

export interface AuthorizationAttempt {
  id: string;
  customerId: string;
  callSessionId?: string;
  transactionReference?: string;
  method: 'DTMF_PIN' | 'VOICE_VERIFICATION' | 'FUTURE_BIOMETRIC';
  status: AttemptStatus;
  attemptNumber: number;
  createdAt: string;
  completedAt?: string;
}

export const VOICE_PROFILE_STATUSES = ['NOT_ENROLLED', 'ENROLLED', 'SUSPENDED'] as const;
export type VoiceProfileStatus = (typeof VOICE_PROFILE_STATUSES)[number];

export interface VoiceProfile {
  id: string;
  customerId: string;
  status: VoiceProfileStatus;
  provider: string;
  providerReference?: string;
  enrollmentCount: number;
  verificationCount: number;
  successfulVerificationCount: number;
  confidenceScore?: number;
  modelVersion?: string;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const SUPPORT_CATEGORIES = [
  'TRANSFER_FAILED', 'TRANSFER_PENDING', 'UNKNOWN_TRANSACTION',
  'CARD_ISSUE', 'ACCOUNT_ISSUE', 'FRAUD_CONCERN', 'GENERAL_SUPPORT',
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export interface SupportCase {
  id: string;
  customerId?: string;
  accountId?: string;
  callSessionId?: string;
  transactionReference?: string;
  category: SupportCategory;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
}

export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface RiskAssessment {
  riskLevel: RiskLevel;
  requiredAuthentication: 'NONE' | 'PHONE_LOOKUP' | 'VOICE_VERIFICATION' | 'DTMF_PIN';
  reasons: string[];
}

export interface EmailRecord {
  id: string;
  toAddress: string;
  subject: string;
  kind: 'STATEMENT' | 'SUPPORT_NOTIFICATION';
  status: 'SENT' | 'FAILED';
  bodyPreview: string;
  createdAt: string;
}
