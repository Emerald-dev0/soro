# Soro — Events

> **Phase 0 status: ENVELOPE + FACTORY REAL** (`@soro/types` catalog,
> `@soro/events` factory/guards, `@soro/service-events` persistence +
> timelines; tested). Live streaming transport is PLANNED.
>
> Related: ARCHITECTURE.md · SYSTEM-FLOW.md · DATABASE.md ·
> COMMAND-CENTER.md · SECURITY.md

## 1. Purpose

Every significant state change is a typed `SoroEvent`: identity (`id`),
ordering (`createdAt`), scope (`sessionId`), traceability
(`correlationId`), origin (`source`), and honesty (`mode`). The event
log is the Command Center's source of truth.

## 2. Envelope (REAL)

```ts
interface SoroEvent<T> {
  id: string; correlationId: string; sessionId: string;
  type: SoroEventType; source: EventSource; mode: 'LIVE' | 'DEMO';
  createdAt: string; // ISO-8601
  payload: T;
}
```

`createEvent(input)` generates ids/timestamps (overridable for
deterministic demo replay); `isSoroEvent()` guards wire input;
`sortEventsByTime()` orders timelines; `newCorrelationId()` starts traces.

## 3. Catalog (22 types — REAL as definitions; emission wiring is Phase 1+)

| Event | Emitted when | Payload (contract) | Source |
|---|---|---|---|
| `CALL_CONNECTED` | call answered / demo run starts | callSid?, scenario? | twilio / demo-engine |
| `CALL_DISCONNECTED` | hangup / error / demo end | reason | twilio / demo-engine |
| `SPEECH_RECEIVED` | STT final (or scripted line) | transcript, languageHint? | voice-gateway / demo-engine |
| `SPEECH_PROCESSED` | turn normalized for NLU | text, durationMs? | conversation |
| `LANGUAGE_DETECTED` | language set for session | language (`yo`\|`pcm`\|`en`) | conversation |
| `INTENT_RESOLVED` | structured intent produced | intent envelope | conversation |
| `VALIDATION_STARTED` | gates begin | intent summary (no secrets) | orchestration |
| `VALIDATION_COMPLETED` | gates pass/fail | pass, failures[] | orchestration |
| `CONFIRMATION_REQUESTED` | Ayo reads back intent | spoken summary | orchestration |
| `CONFIRMATION_RECEIVED` | customer confirms/cancels | decision | voice-gateway / demo-engine |
| `AUTHORIZATION_REQUIRED` | money movement needs DTMF | masked prompt ref | orchestration |
| `DTMF_INPUT_RECEIVED` | keypad entry occurred | **occurrence only — NEVER digits** | voice-gateway |
| `AUTHORIZATION_SUCCEEDED` | auth provider accepts | authRef (opaque) | orchestration |
| `AUTHORIZATION_FAILED` | auth provider rejects | attempt count, no digits | orchestration |
| `BANKING_REQUESTED` | provider call made | kind, reference (no secrets) | banking |
| `BANKING_RESPONSE_RECEIVED` | provider answered | state, providerRef?, simulated | banking |
| `TRANSACTION_PROCESSING` | async leg in flight | reference | orchestration |
| `TRANSACTION_SUCCESS` | provider-confirmed success | reference, providerRef | orchestration |
| `TRANSACTION_FAILED` | provider-confirmed failure | reference, reason | orchestration |
| `SECURITY_WARNING` | heuristic trip (labelled prototype) | pattern code | orchestration |
| `SECURITY_BLOCKED` | operation blocked | reason code | orchestration |
| `ERROR_OCCURRED` | unexpected failure | code, message (scrubbed) | any |

## 4. LIVE vs DEMO

Same envelope, different `mode`. Demo events flow from the scenario
engine; live events from Twilio/voice/banking. The Command Center badges
them distinctly and demo responses always carry `simulated: true`.

## 5. Security / failure modes

Payloads are scrubbed at creation: no PINs, digits, or full phone
numbers (docs/SECURITY.md). Persistence is append-only
(`INSERT OR IGNORE`); a failed append must fail the step loudly, never
silently skip the audit trail.

## 6. Testing / production

Unit-tested factory, guards, ordering, and persistence (in-memory DB).
Phase 1 adds: append-failure drills and the streaming transport
(WebSocket/SSE decision tracked here when made); production adds
retention policy and partitioned consumers.
