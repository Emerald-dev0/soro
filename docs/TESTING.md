# Soro — Testing

> **Phase 0 status: REAL — 14 files, 47 tests, all passing.**
> `pnpm test` (full `vitest run`) is the gate; per-package runs via
> `pnpm --filter <pkg> test`.
>
> Related: DEVELOPMENT.md · SECURITY.md · DEMO.md · TROUBLESHOOTING.md

## 1. Strategy

Test the contract, not the scaffolding: gates, state machines, adapters,
and the honest DEMO trail — success AND failure paths. No network, no
credentials, in-memory SQLite; the suite proves Demo Mode works anywhere.

## 2. Coverage (REAL)

| Area | File | What is proven |
|---|---|---|
| E2E demo balance (pcm) | `tests/demo-balance-inquiry.test.ts` | config → gates → demo banking → events → timeline → SUCCESS |
| Events | `packages/events/tests/` | envelope, correlation, guards, ordering |
| Validation (3 gates) | `packages/validation/tests/` | shape/business/policy incl. transfer holds |
| Config | `packages/config/tests/` | defaults, loud invalids, demo/live readiness |
| Banking | `packages/banking/tests/` | demo determinism, transfer debit, Wema throws |
| DB | `packages/db/tests/` | migrate/version, reset, seeds, round-trips, ordering, FK integrity |
| UI | `packages/ui/tests/` | every Ayo state described; LIVE/DEMO badges distinct |
| Conversation | `services/conversation/tests/` | language continuity + English fallback |
| Voice | `services/voice/tests/` | call lifecycle incl. hangup/terminal rules |
| Orchestration | `services/orchestration/tests/` | 6-stage pipeline; txn machine incl. sticky UNKNOWN_RESULT |
| Banking service | `services/banking/tests/` | provider selection boundary |
| Events service | `services/events/tests/` | record + chronological timelines |
| Command Center | `apps/command-center/tests/` | 8-stage journey spine + descriptions |
| Web | `apps/web/tests/` | shell placeholder |

Plus: `pnpm typecheck` (strict TS, 15 projects), `pnpm lint`
(eslint recommended), `pnpm build` (all emit `dist/`).

## 3. Test matrix (Phase 1+ additions)

Provider sandbox replays, webhook signature fixtures, STT fixture audio
(yo/pcm/en), DTMF-leak scans, injection-prompt fixtures, demo-scenario
runner assertions, and manual call scripts (below).

## 4. Manual procedures (Phase 0)

`pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build`
— all green is the Definition of Done. `pnpm db:reset && pnpm db:seed`
then inspect `./data/soro.db` for the seeded DEMO timeline.

## 5. Production considerations

CI on every change, coverage thresholds per package, fixture-based
contract tests for Wema, and chaos drills (dropped calls, unknown
provider outcomes) before any live pilot.
