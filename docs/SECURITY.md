# Soro — Security

> **Phase 0 status: MODEL + GUARDRAILS REAL** (gates, state machine,
> provider isolation, secret-free schemas; tested). Provider integrations,
> webhook verification, and auth hardening are PLANNED. Prototype
> detectors are labelled as such — never presented as production fraud
> systems.
>
> Related: ARCHITECTURE.md · AI.md · BANKING.md · TWILIO.md · EVENTS.md ·
> ENVIRONMENT.md · SYSTEM-FLOW.md

## 1. Purpose

Defense in depth that judges can understand and engineers can implement:
what we protect, from whom, with what — and what is NOT yet protected.

## 2. Threat model (top risks)

| # | Threat | Control (status) |
|---|---|---|
| 1 | LLM manipulated into banking action (prompt injection) | 3 validation gates + state machine; LLM never calls providers (REAL) |
| 2 | PIN/secret leakage to model, logs, UI | Secret boundary: DTMF path bypasses LLM; scrubbed payloads (REAL model; enforcement tests Phase 1+) |
| 3 | Fake success ("request sent" = success) | Provider-confirmed SUCCESS only; sticky UNKNOWN_RESULT (REAL) |
| 4 | Double-charge on retry | `reference` + UNIQUE `idempotencyKey` (REAL) |
| 5 | Forged Twilio webhooks | Signature verification (PLANNED — blocks Live Mode until done) |
| 6 | Social-engineering victim coerced | Heuristic warnings, slow-down (PLANNED prototype, labelled) |
| 7 | Credential leak via repo | `.env` git-ignored, `.env.example` secret-free, local-only (REAL) |
| 8 | Demo data mistaken for live | `mode` + `simulated: true` structural honesty (REAL) |

## 3. Non-negotiable rules (AGENTS.md §§15–17)

- PINs/DTMF digits NEVER go to the LLM, logs, analytics, events,
  transcripts, or the Command Center. UI shows `● ● ● ●` / `DTMF INPUT RECEIVED`.
- Ayo never authorizes, never sees secrets, never invents results.
- Unknown provider outcomes remain unknown. No blind retries of
  non-idempotent operations.
- Wema adapter throws until endpoints are VERIFIED (no fabricated calls).

## 4. Implemented in Phase 0 (REAL, tested)

Schema/business/policy gates (`packages/validation`); transaction state
guard incl. sticky UNKNOWN_RESULT (`services/orchestration`);
`NotVerifiedError` isolation (`packages/banking`); idempotency keys +
minor-unit money (`@soro/types`, `@soro/db`); secret-free seed data and
env template; supply-chain approval (`allowBuilds: esbuild` only).

## 5. Planned (explicitly NOT done)

Twilio signature verification; DTMF auth provider selection + lockout
policy; STT/TTS vendor assessment; operator auth for Command Center APIs;
audit-log tamper-evidence; secret rotation; rate limiting; PII retention.

## 6. Logging restrictions

`SORO_LOG_LEVEL`-gated; scrub transcripts of digit sequences before
logging; error payloads carry codes, never secrets. Violation = security
bug, not a nit.

## 7. Failure modes / testing / production

Security tests: gate-bypass attempts, unknown-intent holds, terminal-state
immutability (all REAL in suite). Phase 1 adds: injection-prompt fixtures,
webhook-forgery fixtures, DTMF-leak scans of logs/events. Production:
audits, pen-test, incident runbooks, and a real fraud-ops posture.
