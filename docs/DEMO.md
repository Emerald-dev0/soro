# Soro — Hackathon Demo

## What the demo proves

One real flow: phone call → customer identification → Ayo conversation →
explicit confirmation → DTMF PIN authorization → mock banking core executes
against REAL persisted state → events stream → dashboard-ready timeline.

## Deterministic local demo (no Twilio account needed)

```bash
pnpm install
pnpm db:reset && pnpm db:seed
pnpm --filter @soro/api start
```

Then:

```bash
curl -s -X POST localhost:3000/api/demo/run-scenario \
  -H 'content-type: application/json' \
  -d '{
    "phone": "08030000001",
    "turns": [
      "Buy me 500 naira airtime",
      "yes",
      "How much money remain?"
    ],
    "demoPin": "1234"
  }'
```

Expected: balance decreases ₦84,250 → ₦83,750, airtime purchase recorded,
events persisted, transcript returned, all marked DEMO.

## Demo scenarios

- `?scenario=insufficient_funds` / `provider_timeout` / `transfer_pending` /
  `transfer_failed` / `transfer_reversed` may be passed via the agent context
  for deterministically failing demos.

## Live phone demo

1. `cp .env.example .env` and fill `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
   `TWILIO_PHONE_NUMBER`, `TWILIO_WEBHOOK_BASE_URL`.
2. Expose the local server: `ngrok http 3000` (or cloudflared).
3. Twilio console → Voice webhook → `POST https://<tunnel>/api/twilio/voice`.
4. Call the Twilio number. Ayo greets, identifies you by phone number, takes
   speech turns, and moves you into DTMF authorization for sensitive actions.

## Judge checklist

- [ ] `pnpm db:reset && pnpm db:seed` idempotent
- [ ] `pnpm test` (86 tests), `pnpm typecheck`, `pnpm lint`, `pnpm build` green
- [ ] Demo scenario returns real, updated balances
- [ ] `GET /api/dashboard/customers/cust-daniel` shows accounts, calls, voice profile
- [ ] `GET /api/events/stream` produces a live SSE feed during a call/demo
