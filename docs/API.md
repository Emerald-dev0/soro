# Soro — API Reference

> **Phase 0 status: PLANNED (no HTTP API exists).** This document fixes the
> API conventions now so Phase 1 implements against a contract instead of
> inventing one. Nothing below is callable yet — do not present it as REAL.
>
> Related: ARCHITECTURE.md · EVENTS.md · TWILIO.md · SECURITY.md

## 1. Purpose

Define the future HTTP surface (webhooks, Command Center reads, demo
control) and the conventions every endpoint must follow.

## 2. Conventions (binding on Phase 1)

- JSON everywhere; ISO-8601 timestamps; minor-unit money (kobo).
- Every mutating banking call takes `reference` + `idempotencyKey`;
  retries reuse both (docs/BANKING.md).
- Every response carries `mode: LIVE | DEMO`; demo payloads carry
  `simulated: true`.
- Errors: `{ code, message, correlationId }` with stable machine `code`s
  (`VALIDATION_FAILED`, `PROVIDER_NOT_VERIFIED`, `UNAUTHORIZED`, …).
- Twilio webhooks: signature-verified before any processing
  (docs/TWILIO.md, docs/SECURITY.md); reject-unknown-headers.

## 3. Planned surface (PLANNED)

| Method & path | Purpose | Notes |
|---|---|---|
| `POST /voice/incoming` | Twilio incoming-call webhook | signature required; creates session (LIVE) |
| `POST /voice/speech` | speech-result webhook | partial + final turns; silence/timeout handling |
| `POST /voice/dtmf` | keypad webhook | occurrence only in events; digits never logged |
| `POST /voice/status` | call-status callbacks | hangup/failure → session EXPIRED + reconcile |
| `GET /api/sessions/:id/timeline` | Command Center event feed | chronological `SoroEvent[]` |
| `GET /api/transactions/:ref` | transaction state lookup | by Soro reference |
| `POST /api/demo/runs` | start a scenario run | DEMO only; deterministic ids optional |
| `GET /api/health` | readiness (demo/live) | exposes `isDemoReady`/`isLiveReady`, never secrets |

## 4. Security

Auth for operator endpoints (Phase 1 decision, tracked here when made);
webhook verification mandatory; rate limits on webhooks; no secret
echoes; audit events for blocked calls. See docs/SECURITY.md.

## 5. Failure modes / testing / production

Failure behaviors per endpoint land with implementation. Testing: webhook
signature fixtures, idempotency replays, unknown-outcome drills. Production:
versioned paths (`/v1`), gateway auth, and per-route rate limiting.
