# Soro — Known Limitations

> **Phase 0 status: REAL and intentionally blunt.** Hiding limitations to
> look complete is a project violation (AGENTS.md §32). Everything below
> is true as of the Phase 0 checkpoint.
>
> Related: PRODUCT.md · DECISIONS.md · TESTING.md · DEPLOYMENT.md

## 1. Banking operations

- Only balance, history, and transfer-shaped flows exist as models; only
  the Demo adapter executes anything.
- **Wema: zero verified endpoints.** No sandbox access, no fixtures, no
  calls. The adapter throws by design.
- No account resolution, no real settlement, no reconciliation jobs.

## 2. Voice & AI

- No STT/TTS/LLM wired or evaluated. Yoruba/Pidgin recognition quality is
  UNPROVEN — claimed nowhere.
- No prompt scripts, no eval harness, no injection test fixtures yet.
- Interruption handling, barge-in, and audio quality are untested models.

## 3. Twilio / Live Mode

- NOT YET TESTED end to end: no account connected, no webhooks, no
  signature verification, no tunnel testing, no rate-limit data.

## 4. UI

- Command Center and web app are shells + specs; no rendered screens.
- `assets/ayo/` is empty — no canonical Ayo visuals exist yet.

## 5. Security posture (prototype-grade)

- Gates and guards are implemented, but webhook auth, operator auth,
  DTMF lockout policy, audit tamper-evidence, and pen-testing are all open.
- Social-engineering detection is a labelled future heuristic, not a system.

## 6. Data & scale

- SQLite single-file; no concurrency story beyond WAL; no retention
  policy; seeds are the only data. Postgres migration is planned work.
- Source-first packaging (`main: src/index.ts`) is a Phase 0 simplification
  (docs/DECISIONS.md ADR-0012).

## 7. Process

- No CI, no remote repo, local-only development.
- pnpm 11 shows upstream deprecation nags (eslint 9) — tracked, harmless.
