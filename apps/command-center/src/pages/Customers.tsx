import { Link } from 'react-router-dom';
import { maskPhone } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function Customers() {
  const { data, error, loading, reload } = useApi(api.customers);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Customers" sub={`${data?.length ?? 0} demo customers`} />
      {!data || data.length === 0 ? <EmptyState title="No customers" /> : (
        <div className="soro-table-wrap"><table className="soro-table">
          <thead><tr><th>Name</th><th>Customer no.</th><th>Phone</th><th>Email</th><th>Language</th><th>Status</th></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/command/customers/${c.id}`} style={{ color: 'var(--soro-ink)', fontWeight: 600 }}>{c.firstName} {c.lastName}</Link></td>
                <td className="soro-mono">{c.customerNumber}</td>
                <td>{maskPhone(c.phoneNumber)}</td>
                <td>{c.email}</td>
                <td>{c.preferredLanguage}</td>
                <td><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
