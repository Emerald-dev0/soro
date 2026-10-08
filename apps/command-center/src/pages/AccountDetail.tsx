import { Link, useParams } from 'react-router-dom';
import { formatDateTime, formatNaira } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function AccountDetail() {
  const { accountNumber = '' } = useParams();
  const { data, error, loading, reload } = useApi(() => api.account(accountNumber), [accountNumber]);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Account not found.'} onRetry={reload} />;
  const { account, transactions } = data;
  return (
    <>
      <PageHeader title={account.accountNumber} sub={`${account.accountType} · ${account.currency}`} right={<StatusBadge status={account.status} />} />
      <div className="soro-grid cols-3" style={{ marginBottom: 24 }}>
        <div className="soro-card"><h3>Available balance</h3><div className="soro-stat">{formatNaira(account.balanceMinor)}</div></div>
        <div className="soro-card"><h3>Ledger entries</h3><div className="soro-stat">{transactions.length}</div></div>
        <div className="soro-card"><h3>Status</h3><div style={{ marginTop: 8 }}><StatusBadge status={account.status} /></div></div>
      </div>
      <div className="soro-card">
        <h3>Transactions</h3>
        {transactions.length === 0 ? <EmptyState title="No transactions found" /> : (
          <div className="soro-table-wrap"><table className="soro-table">
            <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.reference}>
                  <td>{formatDateTime(t.created_at)}</td>
                  <td>{t.description ?? t.kind}</td>
                  <td>{t.kind} · {t.direction ?? ''}</td>
                  <td><StatusBadge status={t.state} /></td>
                  <td style={{ textAlign: 'right' }}><span className={`soro-amount ${t.direction === 'CREDIT' ? 'credit' : 'debit'}`}>{t.direction === 'CREDIT' ? '+' : '−'}{formatNaira(t.amount_minor)}</span><div className="soro-mono" style={{ fontSize: 11, color: 'var(--soro-faint)' }}>{t.reference}</div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
      <p style={{ marginTop: 12 }}><Link to="/command/transactions">All transactions →</Link></p>
    </>
  );
}
