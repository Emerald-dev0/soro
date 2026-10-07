# Soro — Demo Mode

> **Phase 0 status: PIECES REAL, RUNNER PLANNED.** Deterministic banking
> (`DemoBankingProvider`), event envelopes with replay overrides, journey
> spine, and seed data exist and are tested. The clickable scenario runner
> UI is Phase 1.
>
> Related: PRODUCT.md · SYSTEM-FLOW.md · COMMAND-CENTER.md · EVENTS.md ·
> BANKING.md · TESTING.md

## 1. Purpose / demo objective

Prove the thesis live on stage: a person speaks naturally → Soro
understands → validates → securely orchestrates → provider executes →
Ayo communicates → Command Center shows everything. Demo Mode guarantees
this story works with zero credentials and zero network.

## 2. Primary demo journey (Pidgin balance inquiry)

1. `RUN DEMO` on `demo-balance-pidgin` → `CALL_CONNECTED` (DEMO).
2. Customer line: *"Abeg, how much dey my account?"*
3. Command Center: `LANGUAGE_DETECTED pcm` → `INTENT_RESOLVED GET_BALANCE`
   → `VALIDATION_COMPLETED` (all gates pass) → journey spine advances.
4. `BANKING_REQUESTED` → `DemoBankingProvider` → `BANKING_RESPONSE_RECEIVED`
   (₦125,000.00, `simulated: true`).
5. Ayo line (Pidgin): balance + DEMO labelling.
6. `TRANSACTION_SUCCESS`; timeline complete; DEMO MODE badge visible
   throughout. Seed data for this exact run: `packages/db/sql/seeds/demo.sql`.

Backup journeys: Yoruba balance, transaction history (canned 3-item
history), and a held-transfer showing confirmation + masked DTMF
authorization (safe even on a live stage).

## 3. Live vs Demo distinguishability

`mode: DEMO` on every event/row, `simulated: true` on every demo banking
response, `getModeBadge('DEMO')` honesty copy in the UI. Presenting
simulated data as live is a show-stopper bug, not a shortcut.

## 4. Fallback strategy

Live Mode attempted only if `isLiveReady()` passes; any failure 10
minutes before stage time → Demo Mode, no exceptions. Demo needs nothing
but the laptop: `pnpm db:seed && pnpm test` proves readiness.

## 5. Failure recovery on stage

Dropped demo step → `aborted` run, restart scenario (deterministic, safe
to replay). Wrong audience answer → `UNKNOWN` hold path IS the demo of
graceful failure. Never improvise provider data.

## 6. Deterministic scenarios (model REAL)

`DemoScenario`/`DemoSession` in `@soro/types`: scripted steps with
`expectedIntent` + `expectedOutcome` (`SUCCESS`/`FAILURE_HANDLED`/
`BLOCKED`). Runner + scripts are PLANNED (Phase 1).

## 7. Production note

Demo Mode ships WITH production as the safe rehearsal/field-training
environment — same pipeline, simulated provider, identical event trail.
