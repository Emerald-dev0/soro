/**
 * Typed Soro backend client. The backend is authoritative; the frontend
 * never computes balances or authorization decisions.
 */

export interface ApiSuccess<T> { success: true; data: T }
export interface ApiFailure { success: false; error: { code: string; message: string }; requestId?: string }
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export interface CallSummary {
  id: string; twilioCallSid?: string; fromNumber: string; toNumber: string;
  customerId?: string; accountId?: string; status: string; language?: string;
  startedAt: string; answeredAt?: string; endedAt?: string; durationSeconds?: number;
  authenticationStatus: string; authorizationStatus: string; currentIntent?: string;
  escalationStatus: string;
}

export interface Message { id: string; callSessionId: string; sender: 'CUSTOMER' | 'AYO' | 'SYSTEM'; language?: string; content: string; createdAt: string }
export interface Customer { id: string; customerNumber: string; firstName: string; lastName: string; phoneNumber: string; email: string; status: string; preferredLanguage: string; createdAt: string; updatedAt: string }
export interface Account { id: string; customerId: string; accountNumber: string; accountType: string; currency: string; balanceMinor: number; availableBalanceMinor: number; status: string; createdAt: string; updatedAt: string }

function baseUrl(): string {
  return (import.meta as unknown as { env?: Record<string, string> }).env?.['VITE_SORO_API_URL'] ?? 'http://localhost:3000';
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, { headers: { 'content-type': 'application/json' }, ...init });
  } catch {
    return { success: false, error: { code: 'NETWORK_ERROR', message: 'Backend unreachable. Is the API running?' } };
  }
  try {
    const body = await res.json() as ApiResult<T>;
    if (!res.ok && body.success !== false) {
      return { success: false, error: { code: `HTTP_${res.status}`, message: `Request failed (${res.status}).` } };
    }
    return body;
  } catch {
    return { success: false, error: { code: 'BAD_RESPONSE', message: 'Backend returned an unreadable response.' } };
  }
}

export const api = {
  health: () => request<{ status: string; service: string; mode: string }>('/health'),
  healthDb: () => request<{ status: string }>('/health/db'),
  calls: () => request<CallSummary[]>('/api/dashboard/calls'),
  callDetail: (id: string) => request<{ call: CallSummary; messages: Message[] }>(`/api/dashboard/calls/${encodeURIComponent(id)}`),
  customers: () => request<Customer[]>('/api/dashboard/customers'),
  customerDetail: (id: string) => request<{ customer: Customer; accounts: Account[]; voiceProfile: unknown; calls: CallSummary[]; supportCases: unknown[] }>(`/api/dashboard/customers/${encodeURIComponent(id)}`),
  account: (n: string) => request<{ account: Account; transactions: TransactionRow[] }>(`/api/dashboard/accounts/${encodeURIComponent(n)}`),
  transactions: (accountId?: string) => request<TransactionRow[]>(`/api/dashboard/transactions${accountId ? `?accountId=${encodeURIComponent(accountId)}` : ''}`),
  supportCases: () => request<SupportCaseRow[]>('/api/dashboard/support-cases'),
  events: (sessionId?: string) => request<EventRow[]>(`/api/dashboard/events${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`),
  emails: () => request<EmailRow[]>('/api/dashboard/emails'),
  authorize: async (callId: string, pin: string): Promise<ApiResult<{ outcome: 'SUCCESS' | 'FAILED' | 'LOCKED' }>> => {
    let res: Response;
    try {
      res = await fetch(`${baseUrl()}/authorize/${encodeURIComponent(callId)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pin }) });
    } catch {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Backend unreachable.' } };
    }
    const text = await res.text();
    if (!res.ok) return { success: false, error: { code: `HTTP_${res.status}`, message: 'Authorization request failed.' } };
    if (text.includes('successful')) return { success: true, data: { outcome: 'SUCCESS' } };
    if (text.includes('Too many attempts')) return { success: true, data: { outcome: 'LOCKED' } };
    return { success: true, data: { outcome: 'FAILED' } };
  },
  runScenario: (body: { phone?: string; turns?: string[]; demoPin?: string; scenario?: string; paceMs?: number }) =>
    request<{ callId: string; transcript: { sender: string; text: string }[] }>(`/api/demo/run-scenario`, { method: 'POST', body: JSON.stringify(body) }),
  speak: async (text: string, speaker: 'ayo' | 'customer'): Promise<string | null> => {
    try {
      const res = await fetch(`${baseUrl()}/api/tts/speak`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, speaker }),
      });
      if (!res.ok) return null;
      return URL.createObjectURL(await res.blob());
    } catch {
      return null;
    }
  },
};

export interface TransactionRow {
  reference: string; idempotency_key: string; kind: string; direction?: string; description?: string;
  state: string; authorization: string; provider: string; provider_reference?: string;
  amount_minor?: number; currency?: string; created_at: string; updated_at: string; completed_at?: string;
  account_id?: string; customer_id?: string;
}

export interface SupportCaseRow {
  id: string; customer_id?: string; account_id?: string; call_session_id?: string;
  transaction_reference?: string; category: string; description: string; priority: string; status: string;
  created_at: string; updated_at: string;
}

export interface EventRow { id: string; type: string; session_id: string; correlation_id: string; source: string; mode: string; created_at: string; payload_json: string }

export interface EmailRow { id: string; to_address: string; subject: string; kind: string; status: string; body_preview: string; created_at: string }

// ---------------------------------------------------------------- formatting

/** ₦84,250.00 — display only; never compute money in the frontend. */
export function formatNaira(minorMinor: number | undefined | null): string {
  if (minorMinor === undefined || minorMinor === null) return '—';
  return `₦${(minorMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return '••••';
  return `${phone.slice(0, 4)}••••${phone.slice(-3)}`;
}

export function formatTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })} ${formatTime(iso)}`;
}

export function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- SSE

export type SseStatus = 'connecting' | 'live' | 'reconnecting' | 'closed';

export function connectEventStream(onEvent: (e: unknown) => void, onStatus: (s: SseStatus) => void): () => void {
  let es: EventSource | null = null;
  let closed = false;
  let retries = 0;
  const open = () => {
    if (closed) return;
    onStatus(retries === 0 ? 'connecting' : 'reconnecting');
    es = new EventSource(`${baseUrl()}/api/events/stream`);
    es.onopen = () => { retries = 0; onStatus('live'); };
    es.onmessage = (msg) => { try { onEvent(JSON.parse(msg.data)); } catch { /* ignore */ } };
    es.onerror = () => {
      es?.close();
      retries += 1;
      onStatus('reconnecting');
      setTimeout(open, Math.min(1000 * retries, 8000));
    };
  };
  open();
  return () => { closed = true; es?.close(); onStatus('closed'); };
}
