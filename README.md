# Soro — banking should be as easy as having a conversation

Soro is a **conversational banking access layer**: customers speak
naturally — by phone, in Yoruba, Nigerian Pidgin, or English — and Soro
translates conversation into structured, validated, controlled banking
operations executed by their banking provider. Soro holds no funds and
gives AI no authority over money: **AI understands, deterministic systems
control.** The voice of the system is **Ayo**.

> Start with `AGENTS.md` (engineering constitution), then `docs/PRODUCT.md`.

## Architecture at a glance

```text
Phone → Twilio (live) / scenario engine (demo) → voice layer → Ayo
→ intent + context → policy + validation → banking engine
→ Wema adapter / Demo adapter → event stream → Command Center
```

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
