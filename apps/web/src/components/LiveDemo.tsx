import { useEffect, useRef, useState } from 'react';
import { formatTime } from '@soro/api-client';

const SCRIPT: { who: 'ayo' | 'you'; text: string }[] = [
  { who: 'ayo', text: 'Hi Daniel. How can I help you?' },
  { who: 'you', text: 'Abeg buy me ₦500 data.' },
  { who: 'ayo', text: 'I found a 1.5GB MTN plan, valid 7 days. Should I buy it?' },
  { who: 'you', text: 'Yes.' },
  { who: 'ayo', text: 'Done. Your balance is now ₦83,750.00.' },
];

const PIPE = ['CALL STARTED', 'CUSTOMER IDENTIFIED', 'INTENT DETECTED', 'PLAN RECOMMENDED', 'CUSTOMER CONFIRMED', 'AUTHORIZATION SUCCESS', 'TRANSACTION SUCCESS'];

/** Autoplay conversation + event pipe, driven by scroll visibility. Respects reduced motion. */
export function LiveDemo() {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setCount(SCRIPT.length); return; }
    let timer: number | undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        let i = 0;
        timer = window.setInterval(() => {
          i += 1;
          setCount(i);
          if (i >= SCRIPT.length && timer !== undefined) window.clearInterval(timer);
        }, 1100);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); if (timer !== undefined) window.clearInterval(timer); };
  }, []);

  return (
    <div ref={ref} className="soro-call-ui">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--soro-muted)', marginBottom: 14 }}>
        SORO · <span style={{ color: 'var(--soro-green)' }}>● Connected</span>
      </div>
      <div className="soro-chat soro-demo-chat" aria-live="polite">
        {SCRIPT.slice(0, count).map((l, i) => (
          <div key={i} className={`soro-msg shown ${l.who === 'you' ? 'customer' : 'ayo'}`}>
            <span className="who">{l.who === 'you' ? 'You' : 'Ayo'}</span>{l.text}
          </div>
        ))}
        {count < SCRIPT.length && <div className="soro-msg ayo shown"><span className="who">Ayo</span>🎙 Listening…</div>}
      </div>
      <div className="soro-event-pipe" style={{ marginTop: 18, borderTop: '1px solid var(--soro-border)', paddingTop: 12 }} aria-hidden>
        {PIPE.slice(0, Math.min(count + 1, PIPE.length)).map((p) => (
          <div key={p} className="soro-tl-item shown" style={{ padding: '4px 0' }}>
            <div className="soro-tl-time">{formatTime(new Date().toISOString())}</div>
            <div className="soro-tl-rail"><span className="soro-tl-dot ok" style={{ marginTop: 5 }} /></div>
            <div className="soro-tl-body"><div className="soro-tl-title" style={{ fontSize: 12.5 }}>{p}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
