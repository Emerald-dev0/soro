# Soro — Troubleshooting

> **Phase 0 status: REAL.** Every entry below was observed during Phase 0
> or follows directly from the implemented code. No invented failures.
>
> Related: DEVELOPMENT.md · ENVIRONMENT.md · DATABASE.md · TESTING.md

## Format: SYMPTOM → LIKELY CAUSE → DIAGNOSTIC → FIX

## PNPM installation

- **Install stalls / ETIMEDOUT from registry** → flaky network to
  `registry.npmjs.org` → rerun and watch for `ETIMEDOUT` lines →
  `pnpm install --fetch-retries=5 --network-concurrency=8`.
- **`ERR_PNPM_IGNORED_BUILDS` (esbuild)** → install-time scripts blocked
  by default → check `allowBuilds` in `pnpm-workspace.yaml` →
  only `esbuild: true` is approved; never approve anything else without
  security review.
- **`"pnpm" field … no longer read` warning** → legacy config location →
  confirm settings live in `pnpm-workspace.yaml`, remove `pnpm` key.

## Environment configuration

- **Live readiness reports missing vars** → expected: no credentials in
  Phase 0 → `isLiveReady(loadSoroConfig({})).missing` lists them →
  stay in Demo Mode; fill `.env` only with real, owned credentials.
- **Startup throws zod error** → bad enum/port in `.env` → read the
  error message (it names the variable) → fix `.env` (never commit it).

## Database

- **`node:sqlite` errors at import** → Node < 22.5 → `node --version` →
  use pinned Node 24.19.0 (`.nvmrc`).
- **SQL file not found** → stale path assumption → error lists tried
  paths → keep `sql/` next to `src/` in `@soro/db` (resolver covers
  `src/` and `dist/src/` layouts).
- **FOREIGN KEY constraint failed** → writing a transaction/event for a
  missing session → check insert order → `saveSession` first (integrity
  is enforced; this is correct behavior).
- ** Athens `data/soro.db` confusion** → default local path → check
  `SORO_DATABASE_PATH` → `pnpm db:reset` recreates; `data/` is git-ignored.

## LLM / STT / TTS

- **Any "model not responding" symptom** → no model is wired in Phase 0 →
  confirm you are not expecting one → Demo flows use scripted +
  deterministic pieces only.

## Twilio / webhooks / Wema / audio / DTMF

- **Nothing connects** → correct: Twilio NOT YET TESTED, Wema NOT
  VERIFIED → see docs/TWILIO.md, docs/WEMA.md → do not invent endpoints;
  exercise Demo Mode instead.

## Command Center / Demo Mode

- **Timeline empty** → no events recorded for session → query
  `listEventsBySession` directly → ensure `recordEvent` runs per step.
- **Demo data looks live** → missing honesty labelling → assert
  `mode === 'DEMO'` and `simulated === true` → fix the renderer, not the data.

## Typecheck / lint / tests / build

- **`Cannot find module '@soro/…'`** → missing `workspace:*` dep or root
  devDep → add it, `pnpm install`.
- **Test imports `./index.js` failing** → tests live in `tests/`, code in
  `src/` → import from `../src/index.js`.
- **One failing test after green** → run the single file
  (`pnpm exec vitest run <path>`) → read the assertion → fix code or
  fixture, never weaken the contract silently.
