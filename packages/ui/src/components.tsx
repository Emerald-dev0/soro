import type { ReactNode } from 'react';

/** Shared presentational components (no data fetching inside). */

export function Badge({ tone = 'muted', children }: { tone?: 'muted' | 'ok' | 'err' | 'warn' | 'info'; children: ReactNode }) {
  return <span className={`soro-badge ${tone === 'muted' ? '' : tone}`}>{children}</span>;
}

export function statusTone(status: string): 'ok' | 'err' | 'warn' | 'info' | 'muted' {
  const s = status.toUpperCase();
  if (['SUCCESS', 'COMPLETED', 'ACTIVE', 'SENT', 'RESOLVED', 'VERIFIED', 'ENROLLED'].includes(s)) return 'ok';
  if (['FAILED', 'ERROR', 'LOCKED', 'BLOCKED', 'ABANDONED', 'SECURITY_BLOCKED', 'UNAUTHORIZED'].includes(s)) return 'err';
  if (['PENDING', 'PROCESSING', 'RINGING', 'IN_PROGRESS', 'AUTHORIZATION_REQUIRED', 'CONFIRMATION_REQUIRED', 'OPEN', 'ESCALATED', 'UNKNOWN_RESULT'].includes(s)) return 'warn';
  if (['IDENTIFIED', 'AUTHENTICATED', 'AUTHORIZED'].includes(s)) return 'info';
  return 'muted';
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status.replaceAll('_', ' ')}</Badge>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="soro-empty">
      <div style={{ fontWeight: 650, color: 'var(--soro-ink)', marginBottom: 4 }}>{title}</div>
      {hint ? <div>{hint}</div> : null}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <div className="soro-loading" role="status">{label}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="soro-error" role="alert">
      <div>{message}</div>
      {onRetry ? <div style={{ marginTop: 12 }}><button className="soro-btn" onClick={onRetry}>Try again</button></div> : null}
    </div>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="soro-row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h1 className="soro-h1">{title}</h1>
        {sub ? <p className="soro-sub" style={{ margin: 0 }}>{sub}</p> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}
