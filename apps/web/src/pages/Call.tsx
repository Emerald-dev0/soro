import { useEffect, useRef, useState } from 'react';
import VapiClient from '@vapi-ai/web';

interface VapiLike {
  start(assistantId: string): Promise<unknown>;
  stop(): void;
  on(event: string, cb: (msg: { type?: string; role?: string; transcript?: string; transcriptType?: string }) => void): void;
  on(event: 'error', cb: (e: unknown) => void): void;
  on(event: 'call-start' | 'call-end' | 'speech-start' | 'speech-end', cb: () => void): void;
}
const Vapi = VapiClient as unknown as new (publicKey: string) => VapiLike;

type Phase = 'idle' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'ended' | 'error';

interface ChatLine { who: 'ayo' | 'you'; text: string }

const ASSISTANT_ID =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env['VITE_VAPI_ASSISTANT_ID'] ??
  '440f103a-2190-4780-8844-6ce9a9fdb441';
const PUBLIC_KEY =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env['VITE_VAPI_PUBLIC_KEY'] ?? '';

function phaseLabel(p: Phase): string {
  switch (p) {
    case 'idle': return 'Ready';
    case 'connecting': return 'Ayo is joining…';
    case 'connected': return 'Connected';
    case 'listening': return 'Listening…';
    case 'thinking': return 'Understanding your request…';
    case 'speaking': return 'Ayo is speaking…';
    case 'ended': return 'Call ended';
    case 'error': return 'Connection failed';
  }
}

export function Call() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const vapiRef = useRef<VapiLike | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
    vapiRef.current?.stop();
  }, []);

  const start = async () => {
    setError(null);
    if (!PUBLIC_KEY) {
      setError('Voice is not configured in this build (missing VITE_VAPI_PUBLIC_KEY). The backend demo still works via /api/demo/run-scenario.');
      setPhase('error');
      return;
    }
    try {
      setPhase('connecting');
      const vapi = new Vapi(PUBLIC_KEY);
      vapiRef.current = vapi;
      vapi.on('call-start', () => {
        setPhase('connected');
        setSeconds(0);
        timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      });
      vapi.on('call-end', () => {
        setPhase('ended');
        if (timer.current) window.clearInterval(timer.current);
      });
      vapi.on('speech-start', () => setPhase((p) => (p === 'connected' || p === 'listening' ? 'speaking' : p)));
      vapi.on('speech-end', () => setPhase('listening'));
      vapi.on('message', (msg) => {
        if (msg.type === 'transcript' && msg.transcriptType === 'final' && msg.transcript) {
          const who: ChatLine['who'] = msg.role === 'user' ? 'you' : 'ayo';
          setLines((prev) => [...prev, { who, text: msg.transcript as string }].slice(-30));
          setPhase(msg.role === 'user' ? 'thinking' : 'listening');
        }
      });
      vapi.on('error', (e: unknown) => {
        setError(e instanceof Error ? e.message : 'Call failed.');
        setPhase('error');
      });
      await vapi.start(ASSISTANT_ID);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the call.');
      setPhase('error');
    }
  };

  const stop = () => {
    vapiRef.current?.stop();
    if (timer.current) window.clearInterval(timer.current);
    setPhase('ended');
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <main className="soro-page-narrow">
      <div className="soro-call-ui" style={{ textAlign: 'center' }}>
        <div className={`soro-orb ${phase === 'listening' ? 'listening' : ''}`} aria-hidden />
        <div style={{ fontWeight: 700, fontSize: 18 }}>Ayo</div>
        <div style={{ color: 'var(--soro-muted)', fontSize: 13.5, margin: '4px 0 8px' }} role="status">
          {phaseLabel(phase)}{phase === 'connected' || phase === 'listening' || phase === 'speaking' || phase === 'thinking' ? ` · ${mm}:${ss}` : ''}
        </div>
        {phase === 'idle' || phase === 'ended' || phase === 'error' ? (
          <button className="soro-btn soro-btn-primary" onClick={start}>Talk to Ayo</button>
        ) : (
          <button className="soro-btn soro-btn-danger" onClick={stop}>End call</button>
        )}
        {error ? <p style={{ color: 'var(--soro-red)', fontSize: 13.5 }}>{error}</p> : null}
        <p style={{ fontSize: 12.5, color: 'var(--soro-faint)', marginTop: 12 }}>
          Voice channel · Browser / Vapi · PIN authorization happens on the secure page, never in chat
        </p>
      </div>
      {lines.length > 0 && (
        <div className="soro-card" style={{ marginTop: 16 }}>
          <h3>Live transcript</h3>
          <div className="soro-chat">
            {lines.map((l, i) => (
              <div key={i} className={`soro-msg ${l.who === 'you' ? 'customer' : 'ayo'}`}>
                <span className="who">{l.who === 'you' ? 'You' : 'Ayo'}</span>{l.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
