import { Link } from 'react-router-dom';
import { formatDateTime, formatDuration, maskPhone } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function Calls() {
  const { data, error, loading, reload } = useApi(api.calls);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Calls" sub={`${data?.length ?? 0} sessions recorded`} />
      {!data || data.length === 0 ? <EmptyState title="No calls yet" hint="Calls made through Soro will appear here." /> : (
        <div className="soro-table-wrap"><table className="soro-table">
          <thead><tr><th>Time</th><th>Caller</th><th>Language</th><th>Intent</th><th>Duration</th><th>Auth</th><th>Status</th></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>{formatDateTime(c.startedAt)}</td>
                <td><Link to={`/command/calls/${c.id}`} style={{ color: 'var(--soro-ink)', fontWeight: 600 }}>{maskPhone(c.fromNumber)}</Link></td>
                <td>{c.language ?? '—'}</td>
                <td>{c.currentIntent?.replaceAll('_', ' ') ?? '—'}</td>
                <td className="soro-mono">{c.endedAt && c.startedAt ? formatDuration(Math.max(0, Math.round((new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()) / 1000))) : '—'}</td>
                <td><StatusBadge status={c.authenticationStatus} /></td>
                <td><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
