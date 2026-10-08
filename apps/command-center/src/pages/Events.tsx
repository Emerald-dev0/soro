import { useState } from 'react';
import { formatDateTime } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

export function Events() {
  const { data, error, loading, reload } = useApi(api.events);
  const [typeFilter, setTypeFilter] = useState('');
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const rows = (data ?? []).filter((e) => !typeFilter || e.type === typeFilter);
  const types = [...new Set((data ?? []).map((e) => e.type))].sort();
  return (
    <>
      <PageHeader title="Events" sub="Audit explorer — every persisted state change" />
      <div className="soro-row" style={{ marginBottom: 16 }}>
        <div><label className="soro-label" htmlFor="ev-type">Event type</label><select id="ev-type" className="soro-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">All</option>{types.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
      </div>
      {rows.length === 0 ? <EmptyState title="No events found" /> : (
        <div className="soro-timeline">
          {rows.map((e) => (
            <div className="soro-tl-item" key={e.id}>
              <div className="soro-tl-time">{formatDateTime(e.created_at)}</div>
              <div className="soro-tl-rail"><span className="soro-tl-dot muted" /><span className="soro-tl-line" /></div>
              <div className="soro-tl-body">
                <div className="soro-tl-title">{e.type.replaceAll('_', ' ')}</div>
                <div className="soro-tl-detail">{e.source} · {e.mode} · <span className="soro-mono">{e.session_id.slice(0, 8)}…</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
