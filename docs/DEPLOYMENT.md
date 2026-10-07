# Soro — Deployment

> **Phase 0 status: LOCAL ONLY — there is nothing to deploy and no
> deployment was performed.** No remote repository, no hosting, no CI.
> This document records the current posture and what production will
> require. Status: PLANNED throughout.
>
> Related: DEVELOPMENT.md · SECURITY.md · ENVIRONMENT.md · LIMITATIONS.md

## 1. Current posture (REAL)

- Local Git only (no remote will be added in Phase 0).
- SQLite file DB, `.env` local-only, Demo Mode fully offline.
- `pnpm build` emits `dist/` per package; no container, no artifact
  publishing, no environment promotion.

## 2. Pre-production checklist (PLANNED — all open)

- [ ] Wema endpoints VERIFIED with sandbox fixtures (docs/WEMA.md)
- [ ] Twilio webhooks signature-verified and load-tested (docs/TWILIO.md)
- [ ] LLM/STT/TTS vendors selected, evaluated, costed (docs/AI.md, docs/VOICE.md)
- [ ] Operator auth + audit on Command Center APIs (docs/SECURITY.md)
- [ ] Postgres migration behind `@soro/db` seam (docs/DATABASE.md)
- [ ] Secret management (no env files), rotation runbooks
- [ ] CI: install → typecheck → lint → test → build + lockfile audit
- [ ] Rate limiting, webhook idempotency under retry storms
- [ ] Call-recording consent + retention policy; PII retention policy
- [ ] Reconciliation jobs + Demo-Mode kill-switch
- [ ] Incident runbooks; fraud-ops posture beyond heuristics

## 3. Target shape (intended, not decided)

Versioned API (`/v1`), stateless services with sticky call routing,
event bus for the timeline stream, read-replica for operators,
per-route auth, and blue/green deploys gated on the contract suite.

## 4. What explicitly NOT to do now

Push to any remote, deploy anywhere, publish packages, or bake
credentials into images — the project is local-first until the checklist
above is real.
