import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface VapiLike {
  start(assistantId: string): Promise<unknown>;
  stop(): void;
  setMuted(m: boolean): void;
  isMuted(): boolean;
  on(event: string, cb: (msg: { type?: string; role?: string; transcript?: string; transcriptType?: string }) => void): void;
  on(event: 'error', cb: (e: unknown) => void): void;
  on(event: 'call-start' | 'call-end' | 'speech-start' | 'speech-end', cb: () => void): void;
}
async function loadVapi(): Promise<new (publicKey: string) => VapiLike> {
  const mod = (await import('@vapi-ai/web')) as unknown as Record<string, unknown>;
  const nested = (mod['default'] ?? {}) as Record<string, unknown>;
  const candidates = [nested['default'], mod['default'], mod['Vapi'], mod];
  const ctor = candidates.find((c) => typeof c === 'function');
  if (!ctor) throw new Error('Voice library failed to load. Please refresh and try again.');
  return ctor as new (publicKey: string) => VapiLike;
}

type Phase = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

interface ChatLine { who: 'ayo' | 'you'; text: string }

const ASSISTANT_ID =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env['VITE_VAPI_ASSISTANT_ID'] ??
  '440f103a-2190-4780-8844-6ce9a9fdb441';
const PUBLIC_KEY =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env['VITE_VAPI_PUBLIC_KEY'] ?? '';

const DIAL = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export function Call() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [speaking, setSpeaking] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([{ who: 'ayo', text: 'Hello, this is Ayo from Soro. How can I help you today?' }]);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [padOpen, setPadOpen] = useState(false);
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
      setError('Voice is not configured in this build (missing VITE_VAPI_PUBLIC_KEY).');
      setPhase('error');
      return;
    }
    try {
      setPhase('connecting');
      const Vapi = await loadVapi();
      const vapi = new Vapi(PUBLIC_KEY);
      vapiRef.current = vapi;
      vapi.on('call-start', () => {
        setPhase('active');
        setSeconds(0);
        setLines([]);
        timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      });
      vapi.on('call-end', () => {
        setPhase('ended');
        if (timer.current) window.clearInterval(timer.current);
      });
      vapi.on('speech-start', () => setSpeaking(true));
      vapi.on('speech-end', () => setSpeaking(false));
      vapi.on('message', (msg) => {
        if (msg.type === 'transcript' && msg.transcriptType === 'final' && msg.transcript) {
          const who: ChatLine['who'] = msg.role === 'user' ? 'you' : 'ayo';
          setLines((prev) => [...prev, { who, text: msg.transcript as string }].slice(-30));
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

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try { vapiRef.current?.setMuted(next); } catch { /* ignore */ }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const now = new Date();
  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <main className="soro-phone-wrap">
      <div className="soro-phone" role="region" aria-label="Ayo phone call">
        <div className="soro-phone-screen">
          <div className="soro-statusbar"><span>{clock}</span><span>Soro · 5G ▮▮▮▯ 🔋</span></div>
          <div className="soro-notch" aria-hidden />
          <div className="soro-call-head">
            <div className={`soro-orb ${speaking ? 'listening' : ''}`} aria-hidden />
            <div className="name">Ayo</div>
            <div className="sub" role="status">
              {phase === 'idle' && 'Ready to talk'}
              {phase === 'connecting' && 'Calling…'}
              {phase === 'active' && `${mm}:${ss} · ${speaking ? 'Ayo speaking' : 'Listening'}`}
              {phase === 'ended' && 'Call ended'}
              {phase === 'error' && 'Call failed'}
            </div>
          </div>

          <div className="soro-phone-transcript" aria-live="polite">
            {lines.map((l, i) => (
              <div key={i} className={`soro-msg ${l.who === 'you' ? 'customer' : 'ayo'}`}>{l.text}</div>
            ))}
            {phase === 'idle' && <div style={{ textAlign: 'center', color: '#8a918a', fontSize: 12.5 }}>Tap the green button to start talking to Ayo.</div>}
          </div>

          {padOpen && phase === 'active' && (
            <div className="soro-dialpad" aria-label="Dial pad">
              {DIAL.map((d) => <button key={d} onClick={() => undefined} aria-label={`Key ${d}`}>{d}</button>)}
            </div>
          )}

          <div style={{ paddingBottom: 8 }}>
            {phase === 'active' ? (
              <div className="soro-call-controls">
                <div><button className={`soro-call-btn ${muted ? 'on' : ''}`} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted}>🎙</button><div className="soro-call-btn-label">{muted ? 'unmute' : 'mute'}</div></div>
                <div><button className={`soro-call-btn ${padOpen ? 'on' : ''}`} onClick={() => setPadOpen((v) => !v)} aria-label="Keypad" aria-pressed={padOpen}>▦</button><div className="soro-call-btn-label">keypad</div></div>
                <div><button className="soro-call-btn end" onClick={stop} aria-label="End call">✆</button><div className="soro-call-btn-label">end</div></div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <button className="soro-call-btn" style={{ background: '#1d7a38', borderColor: '#1d7a38', width: 72, height: 72, fontSize: 26 }} onClick={start} aria-label="Call Ayo">✆</button>
              </div>
            )}
            {phase === 'ended' && <div style={{ textAlign: 'center' }}><Link to="/call" onClick={(e) => { e.preventDefault(); start(); }} style={{ color: '#cfd3ce', fontSize: 13 }}>Call again</Link></div>}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 375, margin: '0 auto', padding: '0 4px' }}>
        {error ? <p style={{ color: 'var(--soro-red)', fontSize: 13.5 }}>{error}</p> : null}
        <p style={{ fontSize: 12.5, color: 'var(--soro-muted)' }}>
          Browser calls have no keypad path to the AI — when Ayo asks for authorization, open the secure page on this same phone. PIN entry never reaches the conversation.
        </p>
      </div>
    </main>
  );
}
