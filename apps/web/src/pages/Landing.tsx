import { Link } from 'react-router-dom';
import { Ayo, Reveal } from '../components/Ayo.js';
import { LiveDemo } from '../components/LiveDemo.js';

function Nav() {
  return (
    <div className="soro-lp-nav">
      <div className="soro-lp-nav-inner">
        <Link to="/" className="soro-brand" style={{ textDecoration: 'none' }}>SoroAI</Link>
        <nav className="soro-lp-links" aria-label="Sections">
          <a href="#product">Product</a>
          <a href="#how">How it works</a>
          <a href="#security">Security</a>
          <a href="#command">Under the hood</a>
        </nav>
        <Link className="soro-btn soro-btn-primary" to="/call">Talk to Ayo →</Link>
      </div>
    </div>
  );
}

export function Landing() {
  return (
    <>
      <Nav />
      <main>
        {/* HERO */}
        <div className="soro-page" style={{ paddingTop: 56 }}>
          <div className="soro-hero">
            <div>
              <h1>Banking shouldn&rsquo;t require you to know how to bank.</h1>
              <p className="lead">
                Meet SoroAI — a conversational financial interface. Check your balance,
                send money, buy data, and get statements simply by speaking to Ayo,
                in English, Pidgin, or Yoruba.
              </p>
              <div className="soro-row">
                <Link className="soro-btn soro-btn-primary" to="/call">Talk to Ayo</Link>
                <a className="soro-btn" href="#how">See how it works</a>
              </div>
            </div>
            <div>
              <LiveDemo />
            </div>
          </div>
        </div>

        {/* TRUST STRIP */}
        <div className="soro-strip" role="list">
          <div role="listitem"><strong>Voice-first</strong><span>English · Pidgin · Yoruba</span></div>
          <div role="listitem"><strong>Secure by design</strong><span>AI never receives your PIN</span></div>
          <div role="listitem"><strong>Built for real actions</strong><span>Balance · Transfers · Data · Statements</span></div>
        </div>

        {/* PROBLEM */}
        <div className="soro-page"><section className="soro-section" aria-labelledby="h-problem">
          <Reveal>
            <div className="soro-kicker">The problem</div>
            <h2 className="soro-h2" id="h-problem">Your money shouldn&rsquo;t come with a user manual.</h2>
            <p className="soro-lead">
              Banking apps assume you already understand banking — the menus, the terminology,
              the authentication steps. But people don&rsquo;t think in banking menus.
              They think in outcomes: <em>&ldquo;I need data.&rdquo;</em>
            </p>
          </Reveal>
          <Reveal>
            <div className="soro-vs">
              <div className="soro-card">
                <h3>Traditional</h3>
                <p style={{ fontSize: 14, color: 'var(--soro-muted)', lineHeight: 2 }}>
                  Open app → find payments → find data → select network → browse plans → confirm → authenticate
                </p>
              </div>
              <div className="soro-card" style={{ borderColor: 'var(--soro-accent)' }}>
                <h3>SoroAI</h3>
                <p style={{ fontSize: 16, fontWeight: 600 }}>&ldquo;Abeg buy me ₦500 data.&rdquo;</p>
                <p style={{ fontSize: 14, color: 'var(--soro-muted)' }}>That&rsquo;s it.</p>
              </div>
            </div>
          </Reveal>
        </section></div>

        {/* NATURAL LANGUAGE */}
        <div className="alt"><div className="soro-page"><section className="soro-section" aria-labelledby="h-lang">
          <Reveal>
            <div className="soro-kicker">Natural language</div>
            <h2 className="soro-h2" id="h-lang">People don&rsquo;t speak in menus.</h2>
          </Reveal>
          <div className="soro-split">
            <Reveal>
              <div className="soro-card">
                <h3>Customer language</h3>
                <p style={{ fontSize: 15 }}>&ldquo;How much dey my account?&rdquo;</p>
                <p style={{ fontSize: 15 }}>&ldquo;Abeg send five thousand to Aisha.&rdquo;</p>
                <p style={{ fontSize: 15 }}>&ldquo;Mo fẹ́ mọ iye owó tó wà nínú account mi.&rdquo;</p>
                <p style={{ fontSize: 15 }}>&ldquo;Something is wrong with my transfer.&rdquo;</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="soro-flow" aria-label="How Soro understands">
                {[['Soro understands', 'Intent · BUY_DATA'], ['Soro acts', 'Find plans → Recommend → Confirm → Authorize → Purchase']].map(([t, d]) => (
                  <div key={t}><div className="node"><strong>{t}</strong><span style={{ color: 'var(--soro-muted)', fontSize: 13 }}>{d}</span></div></div>
                ))}
              </div>
            </Reveal>
          </div>
        </section></div></div>

        {/* MEET AYO */}
        <div className="soro-page"><section className="soro-section" id="product" aria-labelledby="h-ayo">
          <div className="soro-split">
            <Reveal>
              <div className="soro-kicker">Meet Ayo</div>
              <h2 className="soro-h2" id="h-ayo">Your conversational financial assistant.</h2>
              <p className="soro-lead">
                Ayo listens, understands what you&rsquo;re trying to accomplish, and guides you
                through it — without making you learn the language of banking.
              </p>
              <div className="soro-lang-pills">
                <span className="soro-badge info">English</span>
                <span className="soro-badge info">Nigerian Pidgin</span>
                <span className="soro-badge info">Yoruba</span>
              </div>
              <p className="soro-fine" style={{ marginTop: 12 }}>Designed to support the way Nigerians naturally communicate.</p>
            </Reveal>
            <Reveal><Ayo pose="presenting" /></Reveal>
          </div>
        </section></div>

        {/* HOW IT WORKS */}
        <div className="alt"><div className="soro-page"><section className="soro-section" id="how" aria-labelledby="h-how">
          <Reveal>
            <div className="soro-kicker">How it works</div>
            <h2 className="soro-h2" id="h-how">Speak → Understand → Secure → Done.</h2>
          </Reveal>
          <div className="soro-split">
            <Reveal><Ayo pose="listening" /></Reveal>
            <Reveal>
              <div className="soro-steps" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 0 }}>
                <div><div className="n">01</div><strong>Speak</strong><p>Tell Ayo what you need, in your own words.</p></div>
                <div><div className="n">02</div><strong>Understand</strong><p>Conversation becomes a structured financial request.</p></div>
                <div><div className="n">03</div><strong>Secure</strong><p>Authentication, authorization, and policy decide what can happen.</p></div>
                <div><div className="n">04</div><strong>Done</strong><p>The operation executes and every step is recorded.</p></div>
              </div>
            </Reveal>
          </div>
        </section></div></div>

        {/* SECURITY */}
        <div className="soro-page"><section className="soro-section" id="security" aria-labelledby="h-sec">
          <div className="soro-split">
            <Reveal>
              <div className="soro-kicker">Security</div>
              <h2 className="soro-h2" id="h-sec">Conversation should be simple. Security shouldn&rsquo;t be.</h2>
              <p className="soro-lead">
                Ayo never sees your PIN. Sensitive actions require keypad authorization,
                financial operations run in the backend, and every important action is recorded.
              </p>
              <div className="soro-flow" aria-label="Secure pipeline">
                {['Request', 'Authentication', 'Confirmation', 'Authorization', 'Transaction', 'Audit'].map((s, i, arr) => (
                  <div key={s}>
                    <div className="node"><strong>{s}</strong>{i === 3 ? <span className="soro-badge warn">PIN required</span> : null}</div>
                    {i < arr.length - 1 && <div className="arrow">↓</div>}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal><Ayo pose="security" /></Reveal>
          </div>
        </section></div>

        {/* UNDER THE HOOD */}
        <div className="alt"><div className="soro-page"><section className="soro-section" id="command" aria-labelledby="h-hood">
          <Reveal>
            <div className="soro-kicker">Under the hood</div>
            <h2 className="soro-h2" id="h-hood">Simple for the customer. Serious underneath.</h2>
            <p className="soro-lead">
              Ayo doesn&rsquo;t control your money. Soro separates conversation from financial
              execution — <strong>AI understands, the backend decides.</strong>
            </p>
          </Reveal>
          <div className="soro-split">
            <Reveal>
              <div className="soro-card">
                <h3>Live from the Command Center</h3>
                <p style={{ fontSize: 14, color: 'var(--soro-muted)' }}>Intent <strong>BUY_DATA</strong> · Authorization <strong style={{ color: 'var(--soro-green)' }}>SUCCESS</strong> · Transaction <strong>₦500.00 SUCCESS</strong> · Balance ₦84,250.00 → ₦83,750.00</p>
                <p><a className="soro-btn" href="/command" target="_blank" rel="noreferrer">Explore the Command Center</a></p>
              </div>
            </Reveal>
            <Reveal><Ayo pose="success" /></Reveal>
          </div>
        </section></div></div>

        {/* CAPABILITIES */}
        <div className="soro-page"><section className="soro-section" aria-labelledby="h-cap">
          <Reveal>
            <div className="soro-kicker">Capabilities</div>
            <h2 className="soro-h2" id="h-cap">Everyday banking, by conversation.</h2>
          </Reveal>
          <div className="soro-split">
            <Reveal><Ayo pose="speaking" /></Reveal>
            <Reveal>
              <div className="soro-grid cols-2">
                <div className="soro-card"><h3>Available now</h3><p style={{ fontSize: 14, color: 'var(--soro-muted)', lineHeight: 1.9, margin: 0 }}>Balances · Transfers · Airtime · Data plans · Statements · Transaction history · Support &amp; escalation</p></div>
                <div className="soro-card"><h3>What&rsquo;s next</h3><p style={{ fontSize: 14, color: 'var(--soro-muted)', lineHeight: 1.9, margin: 0 }}>Savings · Credit · Emergency liquidity · Insurance — through the same conversation.</p></div>
              </div>
            </Reveal>
          </div>
        </section></div>

        {/* ACCESSIBILITY */}
        <div className="alt"><div className="soro-page"><section className="soro-section" aria-labelledby="h-acc">
          <div className="soro-split">
            <Reveal>
              <div className="soro-kicker">Access</div>
              <h2 className="soro-h2" id="h-acc">Financial services should adapt to people.</h2>
              <p className="soro-lead">
                Not everyone wants to navigate a banking app. Not everyone is comfortable
                with formal financial terminology. SoroAI meets customers where they are —
                by voice, in the language they think in. The technology adapts to the customer.
              </p>
            </Reveal>
            <Reveal><Ayo pose="walking" /></Reveal>
          </div>
        </section></div></div>

        {/* FINAL CTA */}
        <div className="soro-page"><section className="soro-section" aria-labelledby="h-cta">
          <div className="soro-split">
            <Reveal><Ayo pose="welcome" eager /></Reveal>
            <Reveal>
              <h2 className="soro-h2" id="h-cta">Try talking to your bank differently.</h2>
              <p className="soro-lead">No menus. No hunting through screens. Just tell Ayo what you need.</p>
              <div className="soro-row">
                <Link className="soro-btn soro-btn-primary" to="/call">Talk to Ayo</Link>
                <a className="soro-btn" href="/command" target="_blank" rel="noreferrer">See the Command Center</a>
              </div>
            </Reveal>
          </div>
        </section>
        <section aria-label="Brand statement" style={{ textAlign: 'center', padding: '24px 0 56px' }}>
          <p style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 650, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Banking shouldn&rsquo;t require you to know how to bank.</p>
          <p className="soro-fine">SoroAI · Conversational financial services · Demo — simulated data, real engine</p>
        </section></div>
      </main>
      <footer className="soro-footer">
        <div className="soro-page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="soro-brand">SoroAI</div>
          <nav aria-label="Footer">
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#security">Security</a>
            <a href="/command" target="_blank" rel="noreferrer">Command Center</a>
            <Link to="/call">Talk to Ayo</Link>
          </nav>
          <p className="soro-fine">SoroAI is a conversational interface, not a bank. Demo data is simulated and clearly labelled.</p>
        </div>
      </footer>
    </>
  );
}
