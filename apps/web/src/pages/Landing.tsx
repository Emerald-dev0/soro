import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <main className="soro-page">
      <div className="soro-hero">
        <div>
          <h1>Banking shouldn&rsquo;t require you to know how to bank.</h1>
          <p className="lead">
            Soro lets you talk to your money. Speak naturally to Ayo in English,
            Nigerian Pidgin, or Yoruba — check balances, buy airtime and data,
            send money, and get statements, all by conversation.
          </p>
          <div className="soro-row">
            <Link className="soro-btn soro-btn-primary" to="/call">Talk to Ayo</Link>
            <a className="soro-btn" href="/command" target="_blank" rel="noreferrer">See how Soro works</a>
          </div>
          <p style={{ marginTop: 18, fontSize: 13, color: 'var(--soro-muted)' }}>
            Ayo understands. The Soro backend verifies, authorizes, and executes — every step visible in the Command Center.
          </p>
        </div>
        <div className="soro-call-ui" aria-label="Example conversation">
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--soro-muted)', marginBottom: 14 }}>AYO · VOICE</div>
          <div className="soro-chat">
            <div className="soro-msg ayo"><span className="who">Ayo</span>Good morning. How can I help you?</div>
            <div className="soro-msg customer"><span className="who">You</span>Abeg check my balance.</div>
            <div className="soro-msg ayo"><span className="who">Ayo</span>Your available balance is ₦84,250.00.</div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--soro-border)', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--soro-muted)' }}>
            <span>English · Pidgin · Yoruba</span>
            <span>Secured by keypad authorization</span>
          </div>
        </div>
      </div>
      <div className="soro-grid cols-3">
        <div className="soro-card"><h3>Speak naturally</h3><p style={{ margin: 0, fontSize: 14, color: 'var(--soro-muted)' }}>No menus, no forms. Say what you want in the language you think in.</p></div>
        <div className="soro-card"><h3>Always verified</h3><p style={{ margin: 0, fontSize: 14, color: 'var(--soro-muted)' }}>Sensitive actions need your keypad PIN. Ayo never sees it.</p></div>
        <div className="soro-card"><h3>Fully visible</h3><p style={{ margin: 0, fontSize: 14, color: 'var(--soro-muted)' }}>Every intent, tool call, and transaction is recorded and auditable.</p></div>
      </div>
    </main>
  );
}
