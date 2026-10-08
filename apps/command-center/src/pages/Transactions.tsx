import { useState } from 'react';
import { formatDateTime, formatNaira } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function Transactions() {
  const { data, error, loading, reload } = useApi(api.transactions);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const rows = (data ?? []).filter((t) => (!typeFilter || t.kind === typeFilter) && (!statusFilter || t.state === statusFilter));
  const types = [...new Set((data ?? []).map((t) => t.kind))];
  const states = [...new Set((data ?? []).map((t) => t.state))];
  return (
    <>
      <PageHeader title="Transactions" sub={`${rows.length} of ${data?.length ?? 0} ledger entries`} />
      <div className="soro-row" style={{ marginBottom: 16 }}>
        <div><label className="soro-label" htmlFor="tf-type">Type</label><select id="tf-type" className="soro-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">All</option>{types.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="soro-label" htmlFor="tf-status">Status</label><select id="tf-status" className="soro-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">All</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      {rows.length === 0 ? <EmptyState title="No transactions found" hint="Adjust the filters or run a scenario." /> : (
        <div className="soro-table-wrap"><table className="soro-table">
          <thead><tr><th>Reference</th><th>Date</th><th>Type</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.reference}>
                <td className="soro-mono">{t.reference}</td>
                <td>{formatDateTime(t.created_at)}</td>
                <td>{t.kind} · {t.direction ?? ''}</td>
                <td><StatusBadge status={t.state} /></td>
                <td style={{ textAlign: 'right' }}><span className={`soro-amount ${t.direction === 'CREDIT' ? 'credit' : 'debit'}`}>{formatNaira(t.amount_minor)}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
