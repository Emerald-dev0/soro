import { Link, useParams } from 'react-router-dom';
import { formatDateTime, formatTime, maskPhone } from '@soro/api-client';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '@soro/ui/components';
import { api, useApi, useEventStream } from '../lib/hooks.js';

export function CallDetail() {
  const { id = '' } = useParams();
  const { data, error, loading, reload } = useApi(() => api.callDetail(id), [id]);
  useEventStream(() => { reload(); });
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Call not found.'} onRetry={reload} />;
  const { call, messages } = data;
  return (
    <>
      <PageHeader
        title={`Call ${call.id.slice(0, 8)}…`}
        sub={`${formatDateTime(call.startedAt)} · ${maskPhone(call.fromNumber)}`}
        right={<StatusBadge status={call.status} />}
      />
      <div className="soro-grid cols-2">
        <div className="soro-card">
          <h3>Conversation</h3>
          {messages.length === 0 ? <EmptyState title="No messages yet" /> : (
            <div className="soro-chat">
              {messages.map((m) => (
                <div key={m.id} className={`soro-msg ${m.sender === 'CUSTOMER' ? 'customer' : m.sender === 'AYO' ? 'ayo' : 'system'}`}>
                  <span className="who">{m.sender === 'AYO' ? 'Ayo' : m.sender.toLowerCase()}</span>
                  {m.content}
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{formatTime(m.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="soro-card" style={{ marginBottom: 16 }}>
            <h3>System activity</h3>
            <dl className="soro-kv">
              <dt>Intent</dt><dd>{call.currentIntent?.replaceAll('_', ' ') ?? '—'}</dd>
              <dt>Authentication</dt><dd><StatusBadge status={call.authenticationStatus} /></dd>
              <dt>Authorization</dt><dd><StatusBadge status={call.authorizationStatus} /></dd>
              <dt>Escalation</dt><dd><StatusBadge status={call.escalationStatus} /></dd>
              <dt>Language</dt><dd>{call.language ?? '—'}</dd>
            </dl>
          </div>
          <div className="soro-card">
            <h3>Events for this session</h3>
            <SessionEvents sessionId={call.id} />
          </div>
          {call.customerId ? <p style={{ marginTop: 12 }}><Link to={`/command/customers/${call.customerId}`}>View customer →</Link></p> : null}
        </div>
      </div>
    </>
  );
}

function SessionEvents({ sessionId }: { sessionId: string }) {
  const { data, error, loading } = useApi(() => api.events(sessionId), [sessionId]);
  if (loading) return <LoadingState label="Loading events…" />;
  if (error || !data) return <ErrorState message={error ?? 'No events.'} />;
  if (data.length === 0) return <EmptyState title="No events recorded" />;
  return (
    <div className="soro-timeline">
      {data.map((e) => (
        <div className="soro-tl-item" key={e.id}>
          <div className="soro-tl-time">{formatTime(e.created_at)}</div>
          <div className="soro-tl-rail"><span className="soro-tl-dot muted" /><span className="soro-tl-line" /></div>
          <div className="soro-tl-body"><div className="soro-tl-title">{e.type.replaceAll('_', ' ')}</div><div className="soro-tl-detail">{e.source} · {e.mode}</div></div>
        </div>
      ))}
    </div>
  );
}
