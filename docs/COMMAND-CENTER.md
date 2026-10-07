# Soro — Command Center

> **Phase 0 status: JOURNEY MODEL REAL** (`JOURNEY_STAGES` + descriptions in
> `@soro/command-center`, timeline queries in `@soro/service-events`;
> tested). The rendered UI is PLANNED — this document is its build spec.
>
> Related: ARCHITECTURE.md · EVENTS.md · DEMO.md · AYO.md · API.md

## 1. Purpose / users

Make invisible orchestration visible for judges and operators. It is NOT
the customer's banking interface and must never look like one (no
account numbers, no spendable actions, no secrets — ever).

## 2. Journey spine (REAL)

`CALL → LISTEN → UNDERSTAND → VERIFY → CONFIRM → AUTHORIZE → EXECUTE →
COMPLETE`, with per-stage descriptions (`JOURNEY_DESCRIPTIONS`). Every
screen renders position on this spine from the event timeline — never
vanity metrics, never fabricated confidence scores.

## 3. Screens / states (spec for Phase 1 UI)

- **Session header**: caller (masked), language, channel, and the
  unmissable mode badge (`getModeBadge`: LIVE MODE vs DEMO MODE +
  honesty note).
- **Conversation panel**: transcript turns + Ayo responses with Ayo-state
  indicator (`@soro/ui` metadata → `assets/ayo/` visuals when they exist).
- **Understanding panel**: language, intent, entities, and the three gate
  results (schema/business/policy with failure codes).
- **Banking panel**: provider name, request reference, response state,
  transaction state machine position, `simulated` flag where applicable.
- **Security panel**: confirmation status, authorization state (masked),
  warnings/blocks with reason codes.
- **Timeline**: `getTimeline(db, sessionId)` — chronological, filterable
  by type, click-to-inspect payloads (scrubbed).

## 4. LIVE vs DEMO rendering

Distinct badges, color language, and honesty copy; demo timelines carry a
persistent "SIMULATED DATA" treatment. A single glance must answer which
world the operator is watching.

## 5. Design principles

Honesty over impressiveness; latency of truth (show pipeline position
live, not just outcomes); nothing secret, nothing fabricated; keyboard-
and screen-reader-friendly for the accessibility story.

## 6. APIs / testing / production (Phase 1+)

Reads: `GET /api/sessions/:id/timeline`, `GET /api/transactions/:ref`
(docs/API.md). Tests: timeline-rendering fixtures incl. failure and
SECURITY_BLOCKED runs. Production: operator auth, read-only roles, and
audit of who viewed what.
