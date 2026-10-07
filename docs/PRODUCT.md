# Soro — Product Definition

> **Phase 0 status: FOUNDATION.** This document describes the product thesis,
> users, and boundaries that all implementation must serve. It is REAL as a
> product definition; the features it describes are mostly PLANNED beyond
> the Phase 0 foundation (see docs/LIMITATIONS.md).
>
> Related: ARCHITECTURE.md · SYSTEM-FLOW.md · AYO.md · DEMO.md ·
> COMMAND-CENTER.md · LIMITATIONS.md · DECISIONS.md

## 1. What Soro is

**Banking should be as easy as having a conversation.**

Soro is a **conversational banking access layer**. A customer speaks
naturally — usually by phone, in Yoruba, Nigerian Pidgin, or English —
and Soro translates that conversation into structured, validated, and
controlled banking operations executed by the customer's banking provider.

Soro is **not** a bank. It holds no funds, owns no ledger, and never
replaces the banking provider. It is the accessibility and orchestration
layer between a human voice and banking infrastructure:

```text
Human → voice → Soro → intent → validation → policy → authorization
      → banking provider → result → Ayo → human
```

Soro is **not** a generic AI chatbot. AI is one component (understanding),
inside deterministic guardrails (control). See docs/AI.md.

## 2. Why Soro exists

Conventional digital banking assumes the customer understands the
interface: navigation, terminology, forms, small screens, app layouts,
authentication workflows. Millions of people know exactly what they want
("I want to know my balance") without knowing where a banking app hides
that function. Soro reverses the relationship: **the customer describes
the outcome; the system handles the complexity — safely.**

Pain points Soro removes:

| Pain | Soro answer |
|---|---|
| Complicated navigation / small screens | No screens at all — a phone call |
| Banking terminology | Speak Yoruba, Pidgin, or plain English |
| Forms, account fields, multi-step flows | Intent + confirmation, guided by Ayo |
| Digital-literacy requirements | Conversation instead of UI literacy |
| Smartphone dependence | Any basic phone that can call |
| Auth workflows people don't understand | Spoken guidance + keypad (DTMF) authorization |

## 3. Target users

Not exclusively the elderly — the category is **people who experience
friction with conventional digital banking**:

1. **Older adults** — prefer speaking, struggle with small controls.
2. **Low-digital-literacy users** — understand money, not app navigation.
3. **Yoruba speakers** — more comfortable than in formal banking English.
4. **Nigerian Pidgin speakers** — the formal register feels foreign.
5. **Accessibility-focused users** — visual interfaces are a barrier.
6. **Basic-phone users** — no modern smartphone app available.
7. **Outcome-knowers** — the broadest group: they know the *what* ("check
   my transactions"), never the *where* inside the bank's interface.

## 4. The core mapping: language changes, intent doesn't

The same human goal in three surface languages becomes one structured intent:

**Pidgin** — "Abeg, how much dey my account?"
→ `{ "language": "pcm", "intent": "GET_BALANCE" }`

**Yoruba** — "Mo fẹ́ mọ iye owó tó wà nínú account mi."
→ `{ "language": "yo", "intent": "GET_BALANCE" }`

**English** — "What is my current account balance?"
→ `{ "language": "en", "intent": "GET_BALANCE" }`

A transfer works the same way. Pidgin: "Send five thousand naira to my
daughter." → `{ "language": "pcm", "intent": "TRANSFER_MONEY",
"amount": 5000, "recipient_reference": "my daughter" }`. The structured
intent (typed in `packages/types`, gated in `packages/validation`) is the
product's central abstraction.

## 5. Roles

| Actor | Role | Non-role |
|---|---|---|
| **Customer** | Speaks intent, confirms, authorizes via keypad | Never touches provider APIs |
| **Ayo** | Conversational interface: listens, explains, confirms | NEVER authorizes, never sees PINs, never invents results (docs/AYO.md) |
| **Soro** | Orchestration: understand → validate → authorize → execute | Never lets AI execute banking directly |
| **Wema (provider)** | Executes real banking operations behind an adapter | Never spoken to directly by AI or UI (docs/BANKING.md, docs/WEMA.md) |
| **Command Center** | Judge/operator visibility into the whole journey | Not the customer's banking interface (docs/COMMAND-CENTER.md) |

## 6. Modes

- **Demo Mode** — deterministic scenario engine exercising the real flow
  with simulated data. Clearly labelled DEMO MODE. Works offline.
  See docs/DEMO.md. **Status: foundation REAL** (`DemoBankingProvider`,
  demo journey spine); scenario runner UI is PLANNED.
- **Live Mode** — real phone call via Twilio, real provider behind the
  adapter, Command Center showing the live journey. **Status: PLANNED**
  (Twilio NOT YET TESTED, Wema NOT VERIFIED).

## 7. Product boundaries (non-goals)

- No fund-holding, no ledger, no account creation.
- No AI-driven transaction authority — deterministic controls decide.
- No PIN/secret ever reaches the LLM, logs, events, or Command Center.
- No fabricated provider results; unknown outcomes stay unknown.
- No vanity metrics (e.g. invented "AI confidence 98.7%").
- One coherent product: every feature must serve the thesis above.

## 8. Hackathon demonstration strategy

Show ONE powerful idea extremely well: a person speaks naturally (Pidgin
balance inquiry is the primary journey) → Soro understands → validates →
securely orchestrates → the provider executes → Ayo communicates → the
Command Center makes the process visible. Demo Mode is the guaranteed
fallback; Live Mode is attempted only with verified integrations.
Details: docs/DEMO.md.

## 9. Future production vision

Production requires: verified Wema/ALAT integration, hardened Twilio
voice path with barge-in and Yoruba/Pidgin STT evaluation, real LLM intent
pipeline behind the validation gates, PCI-aware secret handling, fraud
operations (beyond heuristic warnings), Postgres migration path, and full
audit/compliance posture. Each docs page carries a "Future production
considerations" section with specifics.
