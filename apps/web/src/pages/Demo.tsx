import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@soro/api-client';
import { COMMAND_CENTER_URL } from '../config.js';

interface Line { sender: 'AYO' | 'CUSTOMER' | 'SYSTEM'; text: string }

const TURNS = ['Abeg buy me 500 naira data.', 'yes', 'How much money remain?', 'Send my statement to my email.', 'yes'];
const LINE_MS = 7000;

function speakerOf(sender: string): 'ayo' | 'customer' {
  return sender === 'CUSTOMER' ? 'customer' : 'ayo';
}

export function Demo() {
  const [lines, setLines] = useState<Line[]>([]);
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => () => { stopRef.current = true; }, []);

  const playUrl = (url: string): Promise<void> =>
    new Promise((resolve) => {
      const el = new Audio(url);
      el.onended = () => resolve();
      el.onerror = () => resolve();
      void el.play().catch(() => resolve());
    });

  const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

  const run = async () => {
    setError(null);
    setDone(false);
    setLines([]);
    setActive(-1);
    setCallId(null);
    stopRef.current = false;
    setRunning(true);

    const res = await api.runScenario({ phone: '08030000001', turns: TURNS, demoPin: '1234', paceMs: LINE_MS });
    if (!res.success) {
      setError(res.error.message);
      setRunning(false);
      return;
    }
    setCallId(res.data.callId);
    const script: Line[] = res.data.transcript.map((t) => ({
      sender: t.sender === 'CUSTOMER' ? 'CUSTOMER' : 'AYO',
      text: t.text,
    }));

    for (let i = 0; i < script.length; i++) {
      if (stopRef.current) break;
      const line = script[i]!;
      setLines((prev) => [...prev, line]);
      setActive(i);
      if (!muted) {
        const url = await api.speak(line.text, speakerOf(line.sender));
        if (url && !stopRef.current) await playUrl(url);
        else await wait(2500);
      } else {
        await wait(2500);
      }
    }
    setRunning(false);
    setDone(true);
  };

  const stop = () => { stopRef.current = true; setRunning(false); };

  return (
    <main className="soro-page">
      <div className="soro-grid cols-2" style={{ alignItems: 'start' }}>
        <div>
          <h1 className="soro-h1">Screen-record demo</h1>
          <p className="soro-sub">
            Plays the full Daniel call — customer voice and Ayo voice — against the real backend.
            Open the <a href={COMMAND_CENTER_URL} target="_blank" rel="noreferrer">Command Center</a> in a
            second window: events stream live as each line plays, paced to match.
          </p>
          <div className="soro-row" style={{ marginBottom: 16 }}>
            {!running ? (
              <button className="soro-btn soro-btn-primary" onClick={run}>▶ Play demo call</button>
            ) : (
              <button className="soro-btn soro-btn-danger" onClick={stop}>Stop</button>
            )}
            <button className="soro-btn" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
              {muted ? 'Unmute voices' : 'Mute voices'}
            </button>
          </div>
          {error ? <p style={{ color: 'var(--soro-red)', fontSize: 14 }}>{error}</p> : null}
          {callId ? <p className="soro-fine">Call session <span className="soro-mono">{callId.slice(0, 8)}…</span> — find it under Calls in the Command Center.</p> : null}
          {done ? <p style={{ color: 'var(--soro-green)', fontWeight: 650 }}>Demo complete — balance moved ₦84,250 → ₦83,750. <Link to="/call">Try a live call</Link></p> : null}
          <div className="soro-card" style={{ marginTop: 16 }}>
            <h3>Recording setup</h3>
            <p style={{ fontSize: 13.5, color: 'var(--soro-muted)', margin: 0, lineHeight: 1.7 }}>
              1. Open this page left, Command Center Overview right.<br />
              2. Press Play. Each exchange takes ~7 seconds; the event feed lands in sync.<br />
              3. Voices need ELEVENLABS_API_KEY on the backend — without it, lines still advance silently on the same beat.
            </p>
          </div>
        </div>
        <div className="soro-phone" role="region" aria-label="Demo call">
          <div className="soro-phone-screen">
            <div className="soro-statusbar"><span>DEMO</span><span>Soro · 5G ▮▮▮▯ 🔋</span></div>
            <div className="soro-notch" aria-hidden />
            <div className="soro-call-head">
              <div className={`soro-orb ${running ? 'listening' : ''}`} aria-hidden />
              <div className="name">Daniel ↔ Ayo</div>
              <div className="sub" role="status">{running ? 'Demo call playing…' : done ? 'Call ended' : 'Ready'}</div>
            </div>
            <div className="soro-phone-transcript" aria-live="polite">
              {lines.map((l, i) => (
                <div key={i} className={`soro-msg ${l.sender === 'CUSTOMER' ? 'customer' : 'ayo'}`} style={i === active ? { outline: '2px solid var(--soro-accent)' } : undefined}>
                  <span className="who">{l.sender === 'CUSTOMER' ? 'Daniel' : 'Ayo'}</span>{l.text}
                </div>
              ))}
              {lines.length === 0 && <div style={{ textAlign: 'center', color: '#8a918a', fontSize: 12.5 }}>Press Play to start the recorded-style call.</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
