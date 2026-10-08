import { Link } from 'react-router-dom';
import { Ayo, Reveal } from '../components/Ayo.js';
import { LiveDemo } from '../components/LiveDemo.js';
import { COMMAND_CENTER_URL } from '../config.js';
import { ArrowIcon, BoltIcon, ChatIcon, DocIcon, GlobeIcon, LockIcon, MicIcon, ShieldIcon, SwapIcon } from '../components/icons.js';

const PHRASES = [
  '“How much dey my account?”', '“Abeg send five thousand to Aisha.”',
  '“Mo fẹ́ mọ iye owó tó wà nínú account mi.”', '“I need data.”',
  '“Send my statement.”', '“Something is wrong with my transfer.”',
];

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
        <div className="soro-page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="soro-hero-grid">
            <div>
              <div className="soro-kicker">Conversational financial interface · Nigeria</div>
              <h1 className="soro-display">Banking shouldn&rsquo;t require you to <em>know how to bank.</em></h1>
              <p className="soro-lead">
                SoroAI lets you check your balance, send money, buy data, and get statements
                simply by speaking to Ayo — in English, Pidgin, or Yoruba.
              </p>
              <div className="soro-row" style={{ marginTop: 20 }}>
                <Link className="soro-btn soro-btn-primary" to="/call" style={{ padding: '13px 26px', fontSize: 15 }}>Talk to Ayo <ArrowIcon /></Link>
                <a className="soro-btn" href="#how" style={{ padding: '13px 22px', fontSize: 15 }}>See how it works</a>
              </div>
            </div>
            <Reveal>
              <div className="soro-ayo-arch">
                <img src="/ayo/welcome.jpg" alt="Ayo waving hello" loading="eager" decoding="async" />
              </div>
            </Reveal>
          </div>
          <Reveal><LiveDemo /></Reveal>
          <div style={{ height: 48 }} />
        </div>

        {/* TICKER */}
        <div className="soro-ticker" aria-hidden>
          <div className="soro-ticker-inner">{[...PHRASES, ...PHRASES].map((p, i) => <span key={i}>{p}</span>)}</div>
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
              Banking apps assume you already understand banking. But people don&rsquo;t think
              in menus — they think in outcomes. For millions of Nigerians, the app itself
              is the barrier between them and their own money.
            </p>
          </Reveal>
          <Reveal>
            <figure className="soro-photo-band" style={{ margin: '28px 0 0' }}>
              <img className="bg" src="/photos/lagos-market.jpg" alt="A young trader pushing a wheelbarrow through Lagos traffic" loading="lazy" decoding="async" />
              <span className="shade" aria-hidden />
              <figcaption className="cap">
                <h3>He knows exactly what his money needs to do.</h3>
                <p>He shouldn&rsquo;t need to learn an app to do it. SoroAI meets customers where they are — by voice, in their language.</p>
              </figcaption>
            </figure>
            <p className="soro-credit">Mile 12 market, Lagos — photo: Shedrack Salami / Unsplash</p>
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
                <p style={{ fontSize: 17, fontWeight: 650 }}>&ldquo;Abeg buy me ₦500 data.&rdquo;</p>
                <p style={{ fontSize: 14, color: 'var(--soro-muted)' }}>That&rsquo;s it.</p>
              </div>
            </div>
          </Reveal>
        </section></div>

        {/* LANGUAGE */}
        <div className="alt"><div className="soro-page"><section className="soro-section" aria-labelledby="h-lang">
          <Reveal>
            <div className="soro-kicker">Natural language</div>
            <h2 className="soro-h2" id="h-lang">People don&rsquo;t speak in menus.</h2>
          </Reveal>
          <div className="soro-split">
            <Reveal>
              <div className="soro-card">
                <h3>What customers say</h3>
                <div className="soro-feat"><span className="soro-icon"><ChatIcon /></span><div><strong>&ldquo;I need data.&rdquo;</strong><p>Intent BUY_DATA → find plans, recommend, confirm, authorize, purchase.</p></div></div>
                <div className="soro-feat"><span className="soro-icon"><MicIcon /></span><div><strong>&ldquo;Mo fẹ́ mọ iye owó tó wà&rdquo;</strong><p>Yoruba in, same structured banking intent out.</p></div></div>
                <div className="soro-feat"><span className="soro-icon"><BoltIcon /></span><div><strong>&ldquo;Something is wrong with my transfer.&rdquo;</strong><p>Support case opened, human escalation ready.</p></div></div>
              </div>
            </Reveal>
            <Reveal><Ayo pose="speaking" /></Reveal>
          </div>
        </section></div></div>

        {/* MEET AYO */}
        <div className="soro-page"><section className="soro-section" id="product" aria-labelledby="h-ayo">
          <div className="soro-split">
            <Reveal>
              <div className="soro-kicker">Meet Ayo</div>
              <h2 className="soro-h2" id="h-ayo">A financial concierge, not a chatbot.</h2>
              <p className="soro-lead">
                Ayo listens, understands what you&rsquo;re trying to accomplish, and guides you
                through it — without making you learn the language of banking. Ayo communicates;
                the Soro backend decides and executes.
              </p>
              <div className="soro-lang-pills">
                <span className="soro-badge info"><GlobeIcon /> English</span>
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
              <div className="soro-feat"><span className="soro-icon"><LockIcon /></span><div><strong>AI never sees your PIN.</strong><p>Keypad authorization is verified by the backend alone.</p></div></div>
              <div className="soro-feat"><span className="soro-icon"><ShieldIcon /></span><div><strong>Every sensitive action requires authorization.</strong><p>With attempt limits and lockout on abuse.</p></div></div>
              <div className="soro-feat"><span className="soro-icon"><DocIcon /></span><div><strong>Every important action is recorded.</strong><p>A complete audit trail feeds the Command Center.</p></div></div>
            </Reveal>
            <Reveal><Ayo pose="security" /></Reveal>
          </div>
        </section></div>

        {/* UNDER THE HOOD */}
        <div className="soro-page" style={{ paddingTop: 0 }}><section aria-labelledby="h-hood">
          <Reveal>
            <div className="soro-dark" id="command">
              <div className="soro-kicker">Under the hood</div>
              <h2 className="soro-h2" id="h-hood">Simple for the customer. Serious underneath.</h2>
              <p className="soro-lead">AI understands. The backend decides. Watch a ₦500 data purchase move through the real pipeline:</p>
              <div className="soro-grid cols-3" style={{ marginTop: 24 }}>
                <div><div className="soro-stat" style={{ color: '#fff' }}>BUY_DATA</div><p style={{ color: '#b9beb8', fontSize: 13 }}>Intent detected from Pidgin speech</p></div>
                <div><div className="soro-stat" style={{ color: '#fff' }}>₦500.00</div><p style={{ color: '#b9beb8', fontSize: 13 }}>MTN · 1.5GB · 7 days — authorized, executed</p></div>
                <div><div className="soro-stat" style={{ color: '#fff' }}>₦83,750.00</div><p style={{ color: '#b9beb8', fontSize: 13 }}>Balance after purchase, confirmed by provider</p></div>
              </div>
              <p style={{ marginTop: 24 }}><a className="soro-btn soro-btn-primary" href={COMMAND_CENTER_URL} target="_blank" rel="noreferrer">Explore the Command Center</a></p>
            </div>
          </Reveal>
        </section></div>

        {/* CAPABILITIES */}
        <div className="soro-page"><section className="soro-section" aria-labelledby="h-cap">
          <Reveal>
            <div className="soro-kicker">Capabilities</div>
            <h2 className="soro-h2" id="h-cap">Everyday banking, by conversation.</h2>
          </Reveal>
          <div className="soro-grid cols-2" style={{ marginTop: 24 }}>
            <Reveal>
              <div className="soro-card">
                <h3>Available now · Demo</h3>
                <div className="soro-feat"><span className="soro-icon"><BoltIcon /></span><div><strong>Balances &amp; history</strong><p>Real ledger state, read aloud.</p></div></div>
                <div className="soro-feat"><span className="soro-icon"><SwapIcon /></span><div><strong>Transfers, airtime &amp; data</strong><p>With recommendations and keypad authorization.</p></div></div>
                <div className="soro-feat"><span className="soro-icon"><DocIcon /></span><div><strong>Statements &amp; support</strong><p>Generated, emailed, escalated to humans.</p></div></div>
              </div>
            </Reveal>
            <Reveal>
              <div className="soro-card">
                <h3>What&rsquo;s next</h3>
                <p style={{ fontSize: 14, color: 'var(--soro-muted)', lineHeight: 1.8 }}>Savings · Credit · Emergency liquidity · Insurance — through the same conversation. <br /><br />&ldquo;Ayo, I need ₦20,000 to restock my shop.&rdquo;</p>
              </div>
            </Reveal>
          </div>
        </section></div>

        {/* ACCESSIBILITY */}
        <div className="soro-page" style={{ paddingTop: 0 }}><section aria-labelledby="h-acc">
          <Reveal>
            <figure className="soro-photo-band" style={{ margin: 0 }}>
              <img className="bg" src="/photos/lagos-fruit.jpg" alt="Fruit sellers at Mile 12 market, Lagos" loading="lazy" decoding="async" />
              <span className="shade" aria-hidden />
              <figcaption className="cap">
                <h3 id="h-acc">Financial services should adapt to people.</h3>
                <p>Not everyone wants to navigate a banking app. SoroAI meets customers where they are — by voice, in the language they think in. The technology adapts to the customer.</p>
              </figcaption>
            </figure>
            <p className="soro-credit">Mile 12 market, Lagos — photo: Mary / Unsplash</p>
          </Reveal>
        </section></div>

        {/* FINAL CTA */}
        <div className="soro-page"><section className="soro-section" aria-labelledby="h-cta">
          <div className="soro-split">
            <Reveal><Ayo pose="welcome" eager /></Reveal>
            <Reveal>
              <h2 className="soro-h2" id="h-cta">Try talking to your bank differently.</h2>
              <p className="soro-lead">No menus. No hunting through screens. Just tell Ayo what you need.</p>
              <div className="soro-row">
                <Link className="soro-btn soro-btn-primary" to="/call">Talk to Ayo</Link>
                <a className="soro-btn" href={COMMAND_CENTER_URL} target="_blank" rel="noreferrer">See the Command Center</a>
              </div>
            </Reveal>
          </div>
        </section>
        <section aria-label="Brand statement" style={{ textAlign: 'center', padding: '24px 0 56px' }}>
          <p style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 750, letterSpacing: '-0.025em', margin: '0 0 8px' }}>Banking shouldn&rsquo;t require you to know how to bank.</p>
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
            <a href={COMMAND_CENTER_URL} target="_blank" rel="noreferrer">Command Center</a>
            <Link to="/call">Talk to Ayo</Link>
          </nav>
          <p className="soro-fine">SoroAI is a conversational interface, not a bank. Demo data is simulated and clearly labelled. Photography: Shedrack Salami, Mary via Unsplash.</p>
        </div>
      </footer>
    </>
  );
}
