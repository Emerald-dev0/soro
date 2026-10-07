# Soro — Development Guide

> **Phase 0 status: REAL.** Every command below was executed during Phase 0.
>
> Related: ENVIRONMENT.md · DATABASE.md · TESTING.md · TROUBLESHOOTING.md

## 1. Purpose

Get from zero to a passing workspace: install, develop, test, build.

## 2. Responsibilities / non-responsibilities

This guide covers the local inner loop. It does NOT cover deployment
(docs/DEPLOYMENT.md), provider onboarding (docs/WEMA.md, docs/TWILIO.md),
or production operations.

## 3. Prerequisites

- **Node.js `24.19.0`** (pinned; `.nvmrc` + `.node-version` + `engines`).
  `node:sqlite` (used by `@soro/db`) requires Node ≥ 22.5.
- **PNPM `11.22.0`** (pinned via `packageManager`). No npm/Yarn/Bun.
- Network access to `https://registry.npmjs.org/` for the first install.

```bash
nvm use            # or: fnm use / volta pin (reads .nvmrc)
corepack enable
corepack prepare pnpm@11.22.0 --activate
node --version     # v24.19.0
pnpm --version     # 11.22.0
```

## 4. Install

```bash
cp .env.example .env     # local only; .env is git-ignored
pnpm install             # workspace install (15 projects)
```

Notes:

- `pnpm-workspace.yaml` declares `apps/*`, `services/*`, `packages/*`.
- `allowBuilds: { esbuild: true }` is the ONLY approved install-time
  build script (supply-chain hygiene; everything else is blocked).
- After install, workspace links exist per package
  (e.g. `services/banking/node_modules/@soro/banking` → symlink).

## 5. Daily commands

| Command | What it does |
|---|---|
| `pnpm dev` | All `dev` scripts in parallel (shells echo; servers land Phase 1+) |
| `pnpm typecheck` | Root `tsc --noEmit` + every workspace `typecheck` |
| `pnpm lint` | `eslint .` across the repo (flat config, TS recommended set) |
| `pnpm test` | Full `vitest run` (14 files, 47 tests in Phase 0) |
| `pnpm build` | Every workspace `tsc -p` emitting `dist/` |
| `pnpm --filter <pkg> <cmd>` | Scoped, e.g. `pnpm --filter @soro/db test` |
| `pnpm db:reset` / `pnpm db:seed` | Reset / seed local SQLite (`SORO_DATABASE_PATH`, default `./data/soro.db`) |

Per-package scripts (`build`, `typecheck`, `lint`, `test`, `dev`) resolve
`tsc`/`eslint`/`vitest` from the workspace root `.bin` — do NOT add local
copies of these tools.

## 6. Architecture rules for contributors

1. Domain concepts live in `@soro/types` exactly once — never duplicate.
2. Services never import each other; packages never import services/apps.
3. LLM output is untrusted text until `packages/validation` passes it.
4. Money movement always passes confirmation + DTMF authorization.
5. `WemaProvider` throws `NotVerifiedError` — do not "fill in" endpoints
   without verified docs (see docs/WEMA.md).
6. Source-first imports in Phase 0 (`main: src/index.ts`); the dist-first
   packaging decision is tracked for Phase 1 (docs/DECISIONS.md ADR-0012).
7. TypeScript `strict`, ESM (`"type": "module"`), `NodeNext` resolution.

## 7. Testing

See docs/TESTING.md. Minimum for any change: add/extend a colocated
`tests/*.test.ts`, then `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

## 8. Failure modes

- `pnpm install` network flakes → retry with
  `pnpm install --fetch-retries=5 --network-concurrency=8` (this bit Phase 0).
- `ERR_PNPM_IGNORED_BUILDS` → only `esbuild` is approved; never approve
  anything else without a security review.
- `Cannot find module '@soro/…'` → the importing package must declare the
  `workspace:*` dependency; root tests resolve via root devDependencies.
- `node:sqlite` errors → check Node ≥ 22.5 (`node --version`).

## 9. Configuration / operational notes

No global setup beyond Node + PNPM. Everything else (DB file, seeds) is
created by scripts. Never commit `.env`, `data/`, `dist/`, or `node_modules/`.

## 10. Future production considerations

CI matrix (install → typecheck → lint → test → build), lockfile audit in
CI, and per-package versioning when the first deployable ships.
