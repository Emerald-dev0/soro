import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatNaira, formatTime, maskPhone } from '@soro/api-client';
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi, useEventStream } from '../lib/hooks.js';

interface LiveEvent { id?: string; type?: string; session_id?: string; created_at?: string; [k: string]: unknown }

export function Overview() {
  const calls = useApi(api.calls);
  const txns = useApi(api.transactions);
  const cases = useApi(api.supportCases);
  const [live, setLive] = useState<LiveEvent[]>([]);
  const stream = useEventStream((e) => setLive((prev) => [{ ...(e as LiveEvent) }, ...prev].slice(0, 60)));

  if (calls.loading || txns.loading || cases.loading) return <LoadingState label="Loading system state…" />;
  if (calls.error) return <ErrorState message={calls.error} onRetry={calls.reload} />;

  const allCalls = calls.data ?? [];
  const active = allCalls.filter((c) => !['COMPLETED', 'FAILED', 'ABANDONED'].includes(c.status));
  const successTx = (txns.data ?? []).filter((t) => t.state === 'SUCCESS');
  const pendingTx = (txns.data ?? []).filter((t) => ['PENDING', 'PROCESSING'].includes(t.state));
  const openCases = (cases.data ?? []).filter((c) => c.status === 'OPEN' || c.status === 'ESCALATED');

  return (
    <>
      <PageHeader
        title="Operations overview"
        sub="Live state from the Soro backend. Simulated demo data is labelled DEMO."
        right={<span className={`soro-live ${stream === 'live' ? '' : 'off'}`}><span className={`soro-dot ${stream === 'live' ? 'pulse' : ''}`} />{stream === 'live' ? 'LIVE' : stream.toUpperCase()}</span>}
      />
      <div className="soro-grid cols-4" style={{ marginBottom: 24 }}>
        <div className="soro-card"><h3>Active calls</h3><div className="soro-stat">{active.length}</div></div>
        <div className="soro-card"><h3>Successful operations</h3><div className="soro-stat">{successTx.length}</div></div>
        <div className="soro-card"><h3>Pending operations</h3><div className="soro-stat">{pendingTx.length}</div></div>
        <div className="soro-card"><h3>Open support cases</h3><div className="soro-stat">{openCases.length}</div></div>
      </div>

      {active.length > 0 && (
        <div className="soro-card" style={{ marginBottom: 24 }}>
          <h3>Active call</h3>
          {active.slice(0, 1).map((c) => (
            <div key={c.id} className="soro-row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 650 }}>{maskPhone(c.fromNumber)} → Soro</div>
                <div style={{ color: 'var(--soro-muted)', fontSize: 13 }}>{c.status.replaceAll('_', ' ')} · started {formatTime(c.startedAt)}</div>
              </div>
              <Link className="soro-btn" to={`/command/calls/${c.id}`}>Open live session</Link>
            </div>
          ))}
        </div>
      )}

      <div className="soro-grid cols-2">
        <div className="soro-card">
          <h3>Live activity</h3>
          {live.length === 0 ? <EmptyState title="Waiting for events" hint="Start a call or run a demo scenario to see activity here." /> : (
            <div className="soro-timeline">
              {live.map((e, i) => (
                <div className="soro-tl-item" key={String(e.id ?? i)}>
                  <div className="soro-tl-time">{formatTime(e.created_at)}</div>
                  <div className="soro-tl-rail"><span className="soro-tl-dot" /><span className="soro-tl-line" /></div>
                  <div className="soro-tl-body">
                    <div className="soro-tl-title">{String(e.type ?? 'EVENT').replaceAll('_', ' ')}</div>
                    {e.session_id ? <div className="soro-tl-detail soro-mono">{String(e.session_id).slice(0, 8)}…</div> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="soro-card">
          <h3>Recent calls</h3>
          {allCalls.length === 0 ? <EmptyState title="No calls yet" hint="Calls made through Soro will appear here." /> : allCalls.slice(0, 6).map((c) => (
            <div key={c.id} className="soro-row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--soro-border)' }}>
              <div>
                <Link to={`/command/calls/${c.id}`} style={{ fontWeight: 600, color: 'var(--soro-ink)' }}>{maskPhone(c.fromNumber)}</Link>
                <div style={{ fontSize: 12.5, color: 'var(--soro-muted)' }}>{formatTime(c.startedAt)} · {c.currentIntent?.replaceAll('_', ' ') ?? '—'}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
          <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 13 }}>
            <span>Volume moved (successful): <strong>{formatNaira(successTx.reduce((a, t) => a + (t.amount_minor ?? 0), 0))}</strong></span>
          </div>
        </div>
      </div>
      <p style={{ marginTop: 16, fontSize: 12.5, color: 'var(--soro-faint)' }}>All figures are computed from real backend state. <Badge tone="warn">DEMO</Badge></p>
    </>
  );
}
