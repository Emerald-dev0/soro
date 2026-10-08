import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@soro/api-client';
import { ErrorState, LoadingState } from '@soro/ui/components';
import { api as dashApi } from '@soro/api-client';
import { useEffect } from 'react';

type Outcome = 'idle' | 'working' | 'SUCCESS' | 'FAILED' | 'LOCKED';

export function Authorize() {
  const { callId = '' } = useParams();
  const [pin, setPin] = useState('');
  const [outcome, setOutcome] = useState<Outcome>('idle');
  const [error, setError] = useState<string | null>(null);
  const [callInfo, setCallInfo] = useState<{ intent?: string; status?: string } | null>(null);

  useEffect(() => {
    void dashApi.callDetail(callId).then((res) => {
      if (res.success) setCallInfo({ intent: res.data.call.currentIntent, status: res.data.call.status });
    });
  }, [callId]);

  const press = (d: string) => {
    if (outcome === 'working') return;
    if (d === 'clear') { setPin(''); return; }
    if (pin.length < 4 && /^[0-9]$/.test(d)) setPin(pin + d);
  };

  const submit = async () => {
    if (pin.length !== 4 || outcome === 'working') return;
    setOutcome('working');
    setError(null);
    const res = await api.authorize(callId, pin);
    if (!res.success) {
      setError(res.error.message);
      setOutcome('idle');
      setPin('');
      return;
    }
    setOutcome(res.data.outcome);
    setPin('');
  };

  return (
    <main className="soro-page-narrow">
      <div className="soro-call-ui" style={{ textAlign: 'center' }}>
        <div className="soro-brand" style={{ marginBottom: 4 }}>Soro</div>
        <h1 className="soro-h1" style={{ fontSize: 22 }}>Confirm transaction</h1>
        <p className="soro-sub">
          {callInfo?.intent ? `Authorizing: ${callInfo.intent.replaceAll('_', ' ')}` : 'A sensitive operation needs your approval.'}
          <br />This PIN is verified by the backend only. Ayo never sees it.
        </p>

        {outcome === 'SUCCESS' ? (
          <div role="status">
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--soro-green)' }}>Authorization successful</div>
            <p style={{ color: 'var(--soro-muted)', fontSize: 14 }}>You can return to your call. <Link to="/call">Back to call</Link></p>
          </div>
        ) : outcome === 'LOCKED' ? (
          <div role="alert">
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--soro-red)' }}>Too many attempts — blocked</div>
            <p style={{ color: 'var(--soro-muted)', fontSize: 14 }}>For your safety this operation is blocked. Please contact support.</p>
          </div>
        ) : outcome === 'FAILED' ? (
          <div role="alert">
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--soro-red)' }}>Authorization failed</div>
            <p style={{ color: 'var(--soro-muted)', fontSize: 14 }}>Wrong PIN. Try again, or <button className="soro-btn" onClick={() => setOutcome('idle')}>retry</button></p>
          </div>
        ) : outcome === 'working' ? (
          <LoadingState label="Verifying…" />
        ) : (
          <>
            <div className="soro-pin-dots" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className={i < pin.length ? 'filled' : ''} />)}</div>
            <div className="soro-keypad" role="group" aria-label="PIN keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((k) => (
                <button
                  key={k}
                  className="soro-key"
                  onClick={() => (k === 'back' ? setPin(pin.slice(0, -1)) : press(k))}
                  aria-label={k === 'clear' ? 'Clear' : k === 'back' ? 'Delete' : `Digit ${k}`}
                >{k === 'clear' ? 'C' : k === 'back' ? '⌫' : k}</button>
              ))}
            </div>
            <button className="soro-btn soro-btn-primary" disabled={pin.length !== 4} onClick={submit}>Confirm</button>
            {error ? <ErrorState message={error} /> : null}
          </>
        )}
        <p style={{ fontSize: 12, color: 'var(--soro-faint)', marginTop: 14 }}>Demo note: the PIN is checked locally against a hash. Nothing leaves this page except the result.</p>
      </div>
    </main>
  );
}
