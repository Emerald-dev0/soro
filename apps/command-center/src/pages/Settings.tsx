import { ErrorState, LoadingState, PageHeader } from '@soro/ui/components';
import { api, useApi } from '../lib/hooks.js';

function Row({ label, ok, detail }: { label: string; ok: boolean | null; detail?: string }) {
  return (
    <div className="soro-row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--soro-border)' }}>
      <div style={{ fontWeight: 600 }}>{label}{detail ? <span style={{ fontWeight: 400, color: 'var(--soro-muted)' }}> — {detail}</span> : null}</div>
      <div className={`soro-live ${ok ? '' : 'off'}`}><span className="soro-dot" />{ok === null ? '…' : ok ? 'OPERATIONAL' : 'DOWN'}</div>
    </div>
  );
}

export function Settings() {
  const health = useApi(api.health);
  const db = useApi(api.healthDb);
  if (health.loading || db.loading) return <LoadingState />;
  if (health.error) return <ErrorState message={health.error} onRetry={health.reload} />;
  return (
    <>
      <PageHeader title="System status" sub="Backend health for the demo environment" />
      <div className="soro-card">
        <Row label="API" ok={!!health.data} detail={(health.data as unknown as { mode?: string })?.mode} />
        <Row label="Database" ok={!!db.data} />
        <Row label="Voice (Vapi)" ok detail="Browser calls via configured assistant" />
        <Row label="Banking provider" ok detail="Demo mock core — simulated, labelled" />
      </div>
      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--soro-muted)' }}>
        API base: <span className="soro-mono">{(import.meta as unknown as { env: Record<string, string> }).env['VITE_SORO_API_URL'] ?? 'http://localhost:3000'}</span>
      </p>
    </>
  );
}
