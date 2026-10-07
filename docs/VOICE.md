# Soro — Voice

> **Phase 0 status: LIFECYCLE MODEL REAL** (`@soro/service-voice`: call
> states, transition guard, timeout budgets; tested). STT/TTS providers,
> audio handling, and Twilio wiring are PLANNED / NOT YET TESTED.
>
> Related: TWILIO.md · SYSTEM-FLOW.md · AI.md · AYO.md · SECURITY.md

## 1. Purpose

Phone-first conversation: how calls live, breathe, and die — and where
voice meets the deterministic pipeline.

## 2. Architecture (intended; gateway PLANNED)

```text
CUSTOMER PHONE → TWILIO → SORO VOICE GATEWAY → CONVERSATION ENGINE
→ ORCHESTRATOR → BANKING PROVIDER → (TTS) → CUSTOMER + COMMAND CENTER
```

The gateway owns: session binding, turn-taking, silence/timeout,
barge-in, DTMF capture, and hangup handling. It never contains banking
logic or secrets.

## 3. Call lifecycle (REAL model)

`IDLE → RINGING → CONNECTED ⇄ LISTENING/SPEAKING → ENDED`
(`canTransitionCall` guard, tested). `ENDED` is terminal; hangup is
legal from any active state. Mid-transfer drops mark sessions EXPIRED and
force reconciliation by reference before any retry.

## 4. STT / TTS (PLANNED — no vendor selected)

STT must handle Yoruba, Nigerian Pidgin, and code-switching over phone
audio; vendor evaluation (accuracy on our three languages, latency,
cost) is Phase 1 work. TTS voices Ayo (warm, calm, Nigerian-familiar —
docs/AYO.md). Until wired, Demo Mode uses scripted lines.

## 5. Session lifecycle, silence, timeout, interruption

Defaults (tunable placeholders, `VOICE_DEFAULTS`): silence timeout 5s,
max turn 60s. Silence → reprompt in session language → second silence →
offer DTMF menu → hangup gracefully. Barge-in (customer speaking over
Ayo) pauses synthesis and re-listens. All timeouts/interruptions emit
events so the Command Center shows *why* a call looks stuck.

## 6. Language behavior

Every turn carries a language hint; `resolveSessionLanguage` keeps
continuity; Ayo answers in the session language, falling back to English
explicitly ("Let me continue in English…") rather than silently.

## 7. Twilio / DTMF boundaries

Twilio is transport only (docs/TWILIO.md). DTMF digits go to the auth
provider exclusively — events record occurrence, storage keeps nothing,
Ayo never hears them (docs/SECURITY.md, docs/SYSTEM-FLOW.md §4).

## 8. Failure modes / testing / production

Failure behaviors: STT outage → DTMF menu fallback; TTS outage → call
with pre-recorded prompts; provider error mid-call → honest holding
message, no invented status. Testing (Phase 1): fixture audio in
yo/pcm/en, silence/hangup drills, barge-in timing. Production: regional
numbers, call recording consent + retention, and voice-biometrics
evaluation (explicitly NOT claimed today).
