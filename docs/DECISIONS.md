# Soro — Architecture Decision Records

> **Phase 0 status: REAL.** Decisions below were made during Phase 0
> implementation. No historical decisions invented. New decisions append
> here with number, date, context, and consequences.
>
> Related: ARCHITECTURE.md · PRODUCT.md · LIMITATIONS.md

## ADR-0001 — Soro is a conversational access layer, not a bank (2026-10-05)

Context: temptation to model money/ledgers. Decision: Soro requests and
tracks operations; providers execute. Consequence: no ledger tables, no
fund-holding code paths, provider abstraction mandatory.

## ADR-0002 — Voice/phone is the primary channel (2026-10-05)

Context: target users face app-interface friction. Decision: phone-first
(Twilio live, scenario engine demo); web is secondary. Consequence: voice
lifecycle and DTMF auth are core, not accessories.

## ADR-0003 — Ayo is separate from orchestration (2026-10-05)

Context: mascot creep toward authority. Decision: Ayo communicates;
orchestration decides; providers execute. Consequence: Ayo has no code
path to banking or secrets, enforced by package boundaries.

## ADR-0004 — AI understands; deterministic systems control (2026-10-05)

Context: LLM authority over money is the central risk. Decision: three
gates (schema/business/policy) + state machine between any model output
and any provider call. Consequence: `packages/validation`,
`services/orchestration` guards; model wiring cannot bypass them.

## ADR-0005 — Wema behind an adapter that throws until verified (2026-10-05)

Context: no verified Wema/ALAT endpoints. Decision: `WemaProvider` throws
`NotVerifiedError`; `DemoBankingProvider` carries local flows.
Consequence: fabrication is structurally impossible; verification tracked
in docs/WEMA.md.

## ADR-0006 — Demo Mode is a scenario engine, not a video (2026-10-05)

Context: hackathon demos often fake the backend. Decision: deterministic
engine over the REAL pipeline with simulated provider + honest labelling.
Consequence: demo failures are real bugs; replayable envelopes; offline OK.

## ADR-0007 — Command Center is event-sourced observation (2026-10-05)

Context: judges must see orchestration. Decision: read model over the
append-only event log against a fixed journey spine. Consequence: no
parallel UI state to drift; timelines are the spec.

## ADR-0008 — PNPM, pinned, with install-time script lockdown (2026-10-05)

Context: reproducible installs. Decision: PNPM 11.22.0 pinned via
`packageManager`; `allowBuilds: { esbuild: true }` only.
Consequence: predictable installs; supply-chain default-deny.

## ADR-0009 — Local-first, no remote in Phase 0 (2026-10-05)

Context: credentials and half-built systems. Decision: local Git only,
no remote/repo/deploy. Consequence: `.env` + `data/` git-ignored;
deployment checklist gated (docs/DEPLOYMENT.md).

## ADR-0010 — SQLite via node:sqlite for Phase 0 (2026-10-05)

Context: need durable sessions/events with zero setup. Decision: built-in
`node:sqlite`, file DB, repository seam for future Postgres.
Consequence: no Docker/credentials; FK-enforced integrity proven in tests.

## ADR-0011 — Extra shared packages beyond the brief (2026-10-05)

Context: brief listed 4 packages; events/banking/db mechanics needed a
home. Decision: add `@soro/events`, `@soro/banking`, `@soro/db` as shared
packages rather than duplicating logic. Consequence: 7 packages, each
with one reason to exist; structure deviation documented here and in
docs/ARCHITECTURE.md.

## ADR-0012 — Source-first packaging in Phase 0 (2026-10-05)

Context: proper dist-first publishing needs references + export maps.
Decision: `main: src/index.ts` for the foundation; revisit with project
references in Phase 1. Consequence: simpler Phase 0; packaging hardening
is tracked follow-up, not hidden debt.
