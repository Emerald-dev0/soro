# Soro — AI / LLM

> **Phase 0 status: CONTRACT REAL, MODELS PLANNED.** The boundary, intent
> taxonomy, validation gates, and honesty rules exist and are tested. No
> model is wired, no prompt is live, no LLM call happens anywhere.
> **The LLM is not the banking authority.**
>
> Related: ARCHITECTURE.md · SYSTEM-FLOW.md · SECURITY.md · VOICE.md

## 1. Purpose

Define exactly what the model may do, what it must never do, and how its
output becomes trustworthy enough to approach money.

## 2. Responsibilities (the model MAY)

Interpret natural language; detect language (`yo`/`pcm`/`en`); classify
intent within the fixed taxonomy; extract entities (amount, recipient
reference); detect ambiguity; emit **structured intent only**; help phrase
Ayo's responses from confirmed data.

## 3. Non-responsibilities (the model MUST NEVER)

Execute/authorize banking; decide PIN correctness; receive PINs or secrets;
override policy or validation; fabricate provider responses; claim success
without provider confirmation. Enforced structurally: the model has no
code path to providers — only `StructuredIntent` → gates → `BankingRequest`.

## 4. Structured output (REAL schema)

```json
{ "language": "pcm", "intent": "GET_BALANCE",
  "entities": {}, "confidence": null }
```

Gate 1 (`structuredIntentSchema`, zod) rejects unknown languages/intents
and out-of-range confidence. `confidence: null` is first-class: producers
without calibrated confidence must say so — fabrication is a bug.

## 5. Intent taxonomy (REAL — `packages/types`)

`GET_BALANCE`, `GET_TRANSACTION_HISTORY`, `TRANSFER_MONEY`, `CONFIRM`,
`CANCEL`, `HELP`, `UNKNOWN`. Small on purpose: complete flows beat
feature count. Extensions require a documented policy + tests.

## 6. Entity extraction

Flat `entities` map (`amount`, `recipient_reference`, …). Business rules
(Gate 2) require positive kobo-safe amounts and non-empty recipients for
transfers; `UNKNOWN` intents are held, never guessed into money movement.

## 7. Language handling

Explicit per-intent language; session continuity
(`resolveSessionLanguage`: adopt supported detections, else keep session,
else English fallback); mixed-language input is expected and must not
break extraction (evaluation in Phase 1+).

## 8. Prompt architecture (PLANNED)

System prompt fixes role ("propose structured intent, never act"),
function-style output contract, few-shot Yoruba/Pidgin/English examples,
and a secret-redaction pre-filter. None written yet — tracked here.

## 9. Hallucination / injection / failure behavior

Hallucination containment = gates + provider-confirmed outcomes + Ayo
read-back before money moves. Injection: treat all caller-influenced text
as untrusted; policy holds `UNKNOWN`; security heuristics (labelled
prototype) flag urgency/secrecy patterns. Model failure/fallback: degrade
to DTMF-guided menus and human-readable errors — never silent action,
never invented data. Cost/observability: per-session token accounting and
latency budgets land with the first model wiring.

## 10. Future production considerations

Model selection + eval harness (Yoruba/Pidgin intent accuracy, injection
suite), PII minimization in prompts, regional data-residency, and
continuous red-teaming.
