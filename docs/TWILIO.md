# Soro — Twilio Integration

> **Phase 0 status: NOT YET TESTED.** No Twilio account is connected, no
> webhook exists, no call has been placed. Everything below marked
> ASSUMED follows standard Twilio voice practice and MUST be re-verified
> against live behavior before Live Mode. Nothing here is REAL.
>
> Related: VOICE.md · API.md · SECURITY.md · ENVIRONMENT.md · SYSTEM-FLOW.md

## 1. Purpose / why Twilio

Twilio provides the phone network edge Soro needs for basic-phone reach:
PSTN termination, speech capture hooks, keypad (DTMF) capture, and call
status callbacks — so customers need nothing but any phone.

## 2. Account setup (ASSUMED — verify in Phase 1)

Create a Twilio account → claim a Nigerian-capable voice number →
note `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER`
→ point voice webhooks at `TWILIO_WEBHOOK_BASE_URL` + `/voice/*`.
Local development needs a public tunnel (e.g. ngrok) since Twilio
cannot reach `localhost`.

## 3. Credentials / env (NOT YET TESTED)

`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`,
`TWILIO_WEBHOOK_BASE_URL` (docs/ENVIRONMENT.md). `isLiveVoiceReady()`
gates any live-voice attempt on the first three.

## 4. Webhook architecture (ASSUMED)

| Webhook | Purpose |
|---|---|
| `POST /voice/incoming` | new call → create LIVE session, return TwiML gather |
| `POST /voice/speech` | speech result → conversation turn |
| `POST /voice/dtmf` | keypad digits → auth provider only |
| `POST /voice/status` | hangup/error → EXPIRE session, reconcile |

**Signature validation is MANDATORY** (validate `X-Twilio-Signature`
with `TWILIO_AUTH_TOKEN`) before any processing — Live Mode is blocked
until this is implemented and tested.

## 5. Call flows (ASSUMED)

Incoming: `CALL_CONNECTED` → gather speech (language hint from CLI/geo
if available) → per-turn webhooks → TwiML `<Say>`/`<Gather>` responses
shaped by Ayo state. DTMF: `<Gather input="dtmf">` with attempt limits;
digits forwarded to auth, never to logs/events. Status callbacks drive
`CALL_DISCONNECTED` with honest reasons.

## 6. Error handling / limits

Webhook timeouts → Twilio retries: handlers must be idempotent (reference
+ idempotency keys). Rate limits: UNVERIFIED — record actual limits when
observed; never document guesses as fact.

## 7. Local testing (PLANNED)

Tunnel + Twilio test credentials + fixture calls; console call logs as
the first verification artifact. Until then: **NOT YET TESTED**.

## 8. Production considerations

Number inventory, webhook redundancy, recording consent/retention,
cost-per-minute budgets, and carrier behavior for Nigerian networks.
