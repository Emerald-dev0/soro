import { Link, useParams } from 'react-router-dom';
import { formatDateTime, formatNaira, maskPhone } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function CustomerDetail() {
  const { id = '' } = useParams();
  const { data, error, loading, reload } = useApi(() => api.customerDetail(id), [id]);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Customer not found.'} onRetry={reload} />;
  const { customer, accounts, voiceProfile, calls, supportCases } = data;
  const vp = voiceProfile as { status?: string; successful_verification_count?: number; verification_count?: number; confidence_score?: number } | null;
  return (
    <>
      <PageHeader title={`${customer.firstName} ${customer.lastName}`} sub={`${customer.customerNumber} · ${maskPhone(customer.phoneNumber)} · ${customer.email}`} right={<StatusBadge status={customer.status} />} />
      <div className="soro-grid cols-2">
        <div>
          <div className="soro-card" style={{ marginBottom: 16 }}>
            <h3>Accounts</h3>
            {accounts.length === 0 ? <EmptyState title="No accounts" /> : accounts.map((a) => (
              <div key={a.id} className="soro-row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--soro-border)' }}>
                <div>
                  <Link to={`/command/accounts/${a.accountNumber}`} className="soro-mono" style={{ color: 'var(--soro-ink)', fontWeight: 650 }}>{a.accountNumber}</Link>
                  <div style={{ fontSize: 12.5, color: 'var(--soro-muted)' }}>{a.accountType} · <StatusBadge status={a.status} /></div>
                </div>
                <div className="soro-amount" style={{ fontSize: 20 }}>{formatNaira(a.balanceMinor)}</div>
              </div>
            ))}
          </div>
          <div className="soro-card">
            <h3>Voice identity</h3>
            {!vp ? <EmptyState title="Not enrolled" /> : (
              <dl className="soro-kv">
                <dt>Status</dt><dd><StatusBadge status={vp.status ?? 'UNKNOWN'} /></dd>
                <dt>Successful verifications</dt><dd>{vp.successful_verification_count ?? 0} of {vp.verification_count ?? 0}</dd>
                <dt>Confidence</dt><dd>{vp.confidence_score ?? '—'}</dd>
              </dl>
            )}
          </div>
        </div>
        <div>
          <div className="soro-card" style={{ marginBottom: 16 }}>
            <h3>Recent calls</h3>
            {calls.length === 0 ? <EmptyState title="No calls yet" /> : calls.slice(0, 5).map((c) => (
              <div key={c.id} className="soro-row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--soro-border)' }}>
                <Link to={`/command/calls/${c.id}`} style={{ color: 'var(--soro-ink)', fontWeight: 600 }}>{formatDateTime(c.startedAt)}</Link>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
          <div className="soro-card">
            <h3>Support cases</h3>
            {supportCases.length === 0 ? <EmptyState title="No support cases" /> : supportCases.map((s) => {
              const row = s as { id: string; category: string; status: string; created_at: string };
              return (
                <div key={row.id} className="soro-row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--soro-border)' }}>
                  <div style={{ fontWeight: 600 }}>{row.category.replaceAll('_', ' ')}</div>
                  <StatusBadge status={row.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
