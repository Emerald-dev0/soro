# Soro — System Flows

> **Phase 0 status: MODELS REAL, WIRING PLANNED.** State machines, gates,
> and adapters exist and are unit-tested; the runtime that chains them
> end-to-end (orchestrator loop, voice loop, scenario runner) lands in
> Phase 1+. The Demo balance path is proven in `tests/demo-balance-inquiry.test.ts`.
>
> Related: ARCHITECTURE.md · AI.md · BANKING.md · VOICE.md · TWILIO.md ·
> DEMO.md · SECURITY.md

## 1. Balance inquiry (primary journey — foundation REAL)

```text
Customer ("Abeg, how much dey my account?")
  → Voice/Demo channel captures speech            [SPEECH_RECEIVED]
  → Language detection: pcm                       [LANGUAGE_DETECTED]
  → Intent resolution: GET_BALANCE                [INTENT_RESOLVED]
  → Gate 1 schema ✓ / Gate 2 business ✓          [VALIDATION_STARTED/COMPLETED]
  → Gate 3 policy: read-only, no auth needed
  → BankingRequest { kind: BALANCE, reference, idempotencyKey }
                                                  [BANKING_REQUESTED]
  → Provider responds                               [BANKING_RESPONSE_RECEIVED]
  → Transaction → SUCCESS                           [TRANSACTION_SUCCESS]
  → Ayo speaks the balance (language-matched, DEMO-labelled if demo)
```

No confirmation, no DTMF: read-only intents are low-risk by policy
(`evaluatePolicy` in `packages/validation`).

## 2. Transaction history (foundation REAL, flow PLANNED)

Identical to balance except `kind: TRANSACTION_HISTORY` and Ayo reads
back the last N entries (capped — never dump a full statement by voice).
Same gates, same read-only policy, same event trail.

## 3. Future transfer (INTENDED ARCHITECTURE — not implemented)

```text
Customer ("Send five thousand naira to my daughter.")
  → LANGUAGE_DETECTED → INTENT_RESOLVED (TRANSFER_MONEY, amount, recipient)
  → Gates: schema ✓, business ✓ (amount>0, recipient present)
  → Policy: MONEY_MOVEMENT → authorization REQUIRED
  → Transaction: REQUESTED → … → CONFIRMATION_REQUIRED
  → Ayo reads back: amount + recipient, asks to confirm   [CONFIRMATION_REQUESTED]
  → Customer confirms                                     [CONFIRMATION_RECEIVED → CONFIRMED]
  → Transaction: AUTHORIZATION_REQUIRED
  → Ayo: "Use your keypad to authorize." → DTMF digits → auth provider
      → AUTHORIZED [AUTHORIZATION_SUCCEEDED] / UNAUTHORIZED [AUTHORIZATION_FAILED]
  → BankingRequest { kind: TRANSFER }                     [BANKING_REQUESTED]
  → Provider confirms → SUCCESS / FAILED / UNKNOWN_RESULT (sticky)
  → Ayo reports ONLY the confirmed outcome.
```

Invariants (enforced by `canTransitionTransaction` + gates): no transfer
without confirmation AND authorization; PINs never in LLM context, logs,
events, or UI; UNKNOWN_RESULT stays unknown (no blind retry).

## 4. Authorization / DTMF (model REAL, provider PLANNED)

```text
AUTHORIZATION_REQUIRED
  → Ayo prompts for keypad entry (never asks for the secret aloud)
  → DTMF_INPUT_RECEIVED (event stores "● ● ● ●" semantics: occurrence, never digits)
  → Authorization provider verifies → AUTHORIZATION_SUCCEEDED / AUTHORIZATION_FAILED
  → 3 failures → SECURITY_BLOCKED + cool-down (policy, Phase 1)
```

The Phase 0 event catalog already reserves `DTMF_INPUT_RECEIVED` with a
no-digits payload contract (docs/EVENTS.md, docs/SECURITY.md).

## 5. Demo Mode path (deterministic — engine PLANNED, pieces REAL)

```text
RUN DEMO (scenario, e.g. demo-balance-pidgin)
  → demo-engine emits CALL_CONNECTED (mode: DEMO)
  → scripted customer line → same gates → DemoBankingProvider
  → scripted Ayo line → SUCCESS
  → Command Center shows DEMO MODE badge + full timeline
```

Deterministic: fixed ids/timestamps replayable (`createEvent` supports
`id`/`createdAt` overrides). Works with zero credentials and no network.

## 6. Live Mode path (PLANNED — Twilio NOT YET TESTED)

```text
PHONE → Twilio webhook → voice gateway (signature-verified)
  → call session (mode: LIVE) → STT → conversation → gates
  → WemaProvider (once VERIFIED) → TTS → Command Center (LIVE badge)
```

Every hop has a documented failure behavior in docs/TWILIO.md and
docs/TROUBLESHOOTING.md (silence, timeout, hangup, provider error).

## 7. Failure handling (contract)

| Situation | Behavior |
|---|---|
| Unknown intent | Hold, ask to rephrase (`INTENT_UNKNOWN_HOLD`) |
| Validation failure | Ayo explains in session language; no banking call |
| Customer cancels | CANCELLED (terminal) at any non-terminal state |
| Auth fails | UNAUTHORIZED; repeated failures → SECURITY_BLOCKED |
| Provider says FAILED | FAILED; Ayo offers safe next step |
| Provider outcome unclear | UNKNOWN_RESULT — sticky, surfaced honestly, never retried blindly |
| Call drops mid-transfer | Session EXPIRED; reconciliation by reference before any retry |
