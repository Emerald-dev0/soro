# Soro — Wema / ALAT Integration

> **Phase 0 status: NOT VERIFIED — nothing below is tested, connected, or
> callable.** This document tracks what we need and what we have actually
> confirmed (currently: nothing). Any endpoint added here without
> verification evidence is a fabrication bug. See also docs/BANKING.md.
>
> Related: BANKING.md · SECURITY.md · ENVIRONMENT.md · TESTING.md

## 1. Purpose / product role

Wema (ALAT) is the hackathon-context banking provider: the institution
whose rails execute Soro-initiated operations. Soro stays provider-neutral
(docs/BANKING.md); Wema is one adapter behind that boundary.

## 2. Capability tracker (all NOT VERIFIED until proven otherwise)

| Capability | Status | Endpoint | Auth | Sandbox behavior |
|---|---|---|---|---|
| Balance inquiry | NOT VERIFIED | — | — | — |
| Transaction history | NOT VERIFIED | — | — | — |
| Account resolution | NOT VERIFIED | — | — | — |
| Transfer initiation | NOT VERIFIED | — | — | — |
| Transfer status / reconciliation | NOT VERIFIED | — | — | — |
| Webhook / async notification | NOT VERIFIED | — | — | — |

Status vocabulary: `VERIFIED` (called successfully) · `TESTED` (sandbox
round-trip) · `PARTIALLY TESTED` · `UNAVAILABLE` · `PLANNED`.

## 3. Per-API record (template — fill ONLY with observed facts)

When an API is verified, record: product name, purpose, endpoint + HTTP
method, authentication, full request shape, full response shape, error
codes observed, sandbox vs production differences, required credentials,
and the local test that proves it. Until then: `NOT VERIFIED`.

## 4. Credentials (wanted, not held)

`WEMA_ENV`, `WEMA_BASE_URL`, `WEMA_CLIENT_ID`, `WEMA_CLIENT_SECRET`,
`WEMA_API_KEY` (docs/ENVIRONMENT.md). All empty in Phase 0. Production
credentials never enter source, chat logs, or screenshots.

## 5. Sandbox plan (Phase 1)

Obtain sandbox access → verify auth → record ONE read-only call fixture
(balance) → commit fixture + contract test → then (and only then) attempt
history → transfers last, with reconciliation. Each step updates the
tracker above with evidence (date, tester, fixture path).

## 6. Error behavior / limits / production

Unknown until observed — document actual error codes, retry semantics,
rate limits, and idempotency support from sandbox evidence, never from
assumption. Production: credential rotation, allow-listed egress,
settlement reconciliation, and a kill-switch that pins Soro to Demo Mode.
