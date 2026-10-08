# Soro — banking should be as easy as having a conversation

Soro is a **conversational banking access layer**: customers speak
naturally — by phone, in Yoruba, Nigerian Pidgin, or English — and Soro
translates conversation into structured, validated, controlled banking
operations executed by their banking provider. Soro holds no funds and
gives AI no authority over money: **AI understands, deterministic systems
control.** The voice of the system is **Ayo**.

> Start with `AGENTS.md` (engineering constitution), then `docs/PRODUCT.md`.

## The problems Soro exists to solve

### 1. Banking apps assume you already understand banking
Menus, sub-menus, "payments" vs "transfers" vs "bills", OTP flows that expire
while you read them, updates that move everything overnight. Millions of
Nigerians know exactly what they want — *"send money to my daughter"* — but
the app is the barrier between them and their own money. Soro removes the
interface entirely: the customer states the outcome, Ayo and the backend
handle the navigation, validation, and execution.

### 2. USSD codes fail when you need them most
`*901#`-style banking was supposed to be the equalizer, but sessions time out
mid-transaction, wrong keypresses swallow requests, network drops leave
transfers in limbo, and cryptic error codes explain nothing. A voice
conversation doesn't time out in 30 seconds, doesn't punish a mistyped digit,
and always tells you what actually happened — confirmed by the provider, not
assumed.

### 3. "My money don hang" — failed transfers and disputes
A debited-but-unreceived transfer today means days of anxiety: branch queues,
call centers, reference numbers nobody can find. Soro attacks this three ways:
every operation carries a real transaction reference and explicit state
(including `UNKNOWN_RESULT`, which is never relabelled as success); support
cases with transaction context can be opened mid-call and escalated to humans;
and the **vision** is an AI agent that settles routine disputes itself —
detecting duplicate debits, confirming provider state on both legs, and
initiating reversals with the customer only confirming. *(Dispute
auto-settlement is vision, not built: case creation + human escalation are.)*

### 4. Language and literacy exclusion
Formal banking English excludes. Ayo speaks the customer's language —
Yoruba, Nigerian Pidgin, English — because the surface language changes but
the banking intent doesn't. This isn't localization decoration; intent
understanding, confirmations, and responses all run in the detected language.

### 5. Digital inclusion is the product, not a feature
Older adults who prefer speaking to typing. People with low digital literacy
who understand money but not app navigation. Accessibility users locked out of
visual interfaces. Basic-phone owners with no smartphone at all — a phone call
is the most universal interface ever shipped. Soro is designed for all of them
first, not as an afterthought.

## Where Ayo expands from here

Live today: balances, transfers, airtime, data plans + recommendations,
statements, transaction history, support cases, human escalation — all by
voice, all audited.

The same conversational layer extends naturally to savings, credit and
emergency liquidity (*"Ayo, I need ₦20,000 to restock my shop"*), insurance,
bill payments, and merchant collections — each new capability arriving as a
backend tool with the same confirmation + authorization guarantees, never as
new menus to learn.

## Progressive trust: from PINs to passphrases (vision)

Today, sensitive actions require explicit confirmation plus DTMF keypad
authorization — the PIN never reaches the AI, transcripts, or logs. The
architecture is designed to grow past static PINs: every successful voice
interaction enriches the customer's voice profile, and over time the system
accumulates enough verification history to offer a spoken **passphrase**
instead of a keypad PIN for step-up authorization — same backend guarantees,
lower friction. *(Voice profiles, attempt tracking, and the risk engine exist
today; the voice-identity provider is a demo stub and passphrase auth is a
designed-but-unbuilt step. Nothing here is presented as production
biometrics.)*

## Architecture at a glance

```text
Phone → Twilio (live) / scenario engine (demo) → voice layer → Ayo
→ intent + context → policy + validation → banking engine
→ Wema adapter / Demo adapter → event stream → Command Center
```

## Live deployments

| Surface | URL |
|---|---|
| Customer app (SoroAI landing + Talk to Ayo + authorize) | https://web-coral-kappa-89.vercel.app/demo|
| Command Center | https://command-center-oluwadareanuoluwapo458-7684.vercel.app |
| Backend API (Render) | https://soro-api.onrender.com |

Health: `GET https://soro-api.onrender.com/health`

## Quick start (local only — no remote, no deploy)

```bash
nvm use && corepack enable          # Node 24.19.0, PNPM 11.22.0
cp .env.example .env
pnpm install
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm db:reset && pnpm db:seed       # local SQLite demo data
```

## Documentation map

| Doc | Covers |
|---|---|
| `AGENTS.md` | Engineering constitution (read first) |
| `docs/PRODUCT.md` | Thesis, users, journeys, boundaries |
| `docs/ARCHITECTURE.md` | Components, dependencies, diagrams |
| `docs/SYSTEM-FLOW.md` | Balance / history / transfer / auth / demo / live flows |
| `docs/DEVELOPMENT.md` | Setup, commands, contributor rules |
| `docs/ENVIRONMENT.md` | Every env var: purpose, source, demo/live need |
| `docs/DATABASE.md` | SQLite schema, migrations, client, seeds |
| `docs/API.md` | Planned HTTP surface + conventions |
| `docs/EVENTS.md` | 22-event typed catalog + timeline model |
| `docs/SECURITY.md` | Threat model, boundaries, implemented vs planned |
| `docs/AI.md` | Model responsibilities, taxonomy, anti-hallucination |
| `docs/VOICE.md` | Call lifecycle, STT/TTS plan, timeouts |
| `docs/TWILIO.md` | Integration reference (NOT YET TESTED) |
| `docs/BANKING.md` | Provider abstraction, demo adapter, idempotency |
| `docs/WEMA.md` | Capability tracker (NOT VERIFIED) |
| `docs/AYO.md` | Personality, states, assets, boundaries |
| `docs/DEMO.md` | Hackathon demo plan + fallback strategy |
| `docs/COMMAND-CENTER.md` | Judge-facing UI spec |
| `docs/TESTING.md` | Strategy, coverage (47 tests), matrix |
| `docs/TROUBLESHOOTING.md` | Symptom → cause → diagnostic → fix |
| `docs/DEPLOYMENT.md` | Local-only posture + production checklist |
| `docs/LIMITATIONS.md` | Honest capability gaps |
| `docs/DECISIONS.md` | ADRs 0001–0012 |

Status labels used everywhere: **REAL** (implemented + tested) ·
**PLANNED** · **NOT VERIFIED** (Wema) · **NOT YET TESTED** (Twilio) ·
**SIMULATED** (demo data).

## Current status (Phase 0)

Foundation + knowledge base: PNPM monorepo (15 projects), shared domain
types, 3 validation gates, transaction state machine, typed events,
SQLite store, Demo adapter, journey spine — 47/47 tests, typecheck, lint,
and build green. No live integrations: Twilio NOT YET TESTED, Wema NOT
VERIFIED, no model wired. See `docs/LIMITATIONS.md`.

---

## Phase 1 backend (hackathon build) — READY

What now works end-to-end:

- `MockBankingCore` (real persisted state: balances, transfers, airtime,
  data plans, statements) — `packages/banking/src/mock-core.ts`
- Deterministic DTMF PIN authorization with attempt locking —
  `services/security/src/index.ts`
- Tool registry with permission envelopes (AI cannot bypass backend policy) —
  `services/agent/src/tools.ts`
- Fastify API: `/health`, `/api/dashboard/*`, `/api/events/stream` (SSE),
  Twilio webhooks (`/api/twilio/voice|gather|dtmf|status`) with signature
  validation, deterministic demo runner `/api/demo/run-scenario` —
  `apps/api/src/*`

Run it:

```bash
pnpm install
pnpm db:reset && pnpm db:seed
pnpm --filter @soro/api start        # http://localhost:3000
curl -s localhost:3000/health
curl -s -X POST localhost:3000/api/demo/run-scenario \
  -H 'content-type: application/json' \
  -d '{"phone":"08030000001","turns":["Buy me 500 naira airtime","yes","How much money remain?"],"demoPin":"1234"}'
```

Demo accounts: Daniel `08030000001` (₦84,250) · Aisha `08030000002` (₦125,600).
Demo PINs (keypad authorization only, never sent to the LLM): Daniel `1234`,
Aisha `4321`.

Demo: SIMULATED banking data, real engine path. **DEMO_MODE=true** labels all
simulated responses. Twilio live calls require `TWILIO_*` env vars and a
public webhook URL (ngrok/cloudflared); see `docs/TWILIO.md`.
