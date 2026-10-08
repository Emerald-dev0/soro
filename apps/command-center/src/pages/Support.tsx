import { formatDateTime } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function Support() {
  const { data, error, loading, reload } = useApi(api.supportCases);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Support cases" sub={`${data?.length ?? 0} cases`} />
      {!data || data.length === 0 ? <EmptyState title="No open support cases." /> : (
        <div className="soro-table-wrap"><table className="soro-table">
          <thead><tr><th>Opened</th><th>Category</th><th>Description</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>{formatDateTime(c.created_at)}</td>
                <td style={{ fontWeight: 600 }}>{c.category.replaceAll('_', ' ')}</td>
                <td style={{ maxWidth: 360 }}>{c.description}</td>
                <td>{c.priority}</td>
                <td><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
