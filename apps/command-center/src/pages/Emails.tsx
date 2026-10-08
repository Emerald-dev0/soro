import { formatDateTime } from '@soro/api-client';
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function Emails() {
  const { data, error, loading, reload } = useApi(api.emails);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Emails" sub="Statement and notification activity" />
      {!data || data.length === 0 ? <EmptyState title="No emails recorded" hint="Statements requested through Soro appear here." /> : (
        <div className="soro-table-wrap"><table className="soro-table">
          <thead><tr><th>Sent</th><th>To</th><th>Subject</th><th>Kind</th><th>Status</th><th>Delivery</th></tr></thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id}>
                <td>{formatDateTime(m.created_at)}</td>
                <td>{m.to_address}</td>
                <td>{m.subject}</td>
                <td>{m.kind}</td>
                <td><StatusBadge status={m.status} /></td>
                <td><Badge tone="warn">SIMULATED DELIVERY</Badge></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
