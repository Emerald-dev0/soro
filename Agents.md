# SORO — ENGINEERING CONSTITUTION

> This document is the authoritative engineering and product context for the Soro project.
>
> Every coding agent working on Soro MUST read this file before making changes.
>
> This document takes precedence over assumptions made by an AI coding agent about what Soro should be.

---

# 1. PROJECT IDENTITY

## Product

**Soro**

## Conversational Agent

**Ayo**

## Core Thesis

> **Banking should be as easy as having a conversation.**

Soro is a **conversational banking access layer**.

It allows people to interact with banking services through natural conversation, primarily voice, while translating that conversation into structured, validated and controlled banking operations.

Soro is not a bank.

Soro does not hold customer funds.

Soro does not replace the banking provider.

Soro does not give an AI model unrestricted authority over financial operations.

Soro exists to reduce the friction between a customer and the banking infrastructure they already use.

---

# 2. WHY SORO EXISTS

Traditional digital banking often assumes:

> The customer understands the interface.

That assumption is not always true.

A customer may know exactly what they want to accomplish but still struggle with:

* complicated navigation
* banking terminology
* small-screen interfaces
* forms
* account fields
* unfamiliar application layouts
* digital literacy requirements
* language barriers
* authentication workflows
* smartphone dependence

The customer may understand:

> "I want to know my balance."

without understanding:

> "Where inside this banking application do I find the balance?"

That distinction is fundamental to Soro.

Soro reverses the normal relationship.

Instead of forcing the customer to learn the banking interface, Soro allows the customer to express their intent naturally.

The customer describes what they want.

Soro handles the complexity required to translate that intent into a controlled banking operation.

---

# 3. TARGET MARKET

Soro is NOT exclusively an elderly-person product.

Older adults are an important accessibility use case, but the product is designed around a broader category:

> **People who experience friction when interacting with conventional digital banking.**

The initial target users include:

### 3.1 Older adults

People who may:

* be uncomfortable navigating banking applications
* prefer speaking to typing
* struggle with small UI controls
* prefer familiar conversational interaction

### 3.2 People with low digital literacy

People who understand money and banking but may not understand:

* application navigation
* digital banking terminology
* complex forms
* multi-step workflows

### 3.3 Yoruba speakers

Customers who are more comfortable expressing themselves in Yoruba than formal banking English.

### 3.4 Nigerian Pidgin speakers

Customers who naturally communicate in Nigerian Pidgin and may find conventional banking interfaces overly formal or unfamiliar.

### 3.5 Accessibility-focused users

People who experience difficulty interacting with conventional visual interfaces.

### 3.6 Basic-phone / non-app scenarios

People who may not have convenient access to a modern smartphone application.

This is one of the reasons a phone-based conversational channel is strategically important.

### 3.7 Customers who know the outcome but not the interface

This is the broadest and most important category.

The customer knows:

> "I want to check my transactions."

They should not need to know how the bank internally exposes that functionality.

---

# 4. PRODUCT PRINCIPLE

The central product insight is:

> **The customer knows what they want. The system should handle the complexity required to accomplish it safely.**

Example:

A customer says:

> "Abeg, how much dey my account?"

Soro should understand:

```text
language = Nigerian Pidgin
intent = GET_BALANCE
```

Another customer may say:

> "Mo fẹ́ mọ iye owó tó wà nínú account mi."

Soro should understand:

```text
language = Yoruba
intent = GET_BALANCE
```

The surface language changes.

The underlying banking intent does not.

---

# 5. SORO IS NOT A GENERIC AI CHATBOT

Never reduce Soro to:

> "An AI chatbot for banking."

That description is technically weak and does not represent the product.

Soro is an orchestration and accessibility layer.

The architecture is closer to:

```text
Human
  ↓
Natural Language / Voice
  ↓
Soro
  ↓
Intent Understanding
  ↓
Validation
  ↓
Policy
  ↓
Authorization
  ↓
Banking Provider
  ↓
Result
  ↓
Ayo
  ↓
Human
```

AI is one component.

Voice is one channel.

Wema is one banking provider.

Ayo is the conversational interface.

Soro is the system that coordinates them.

---

# 6. AYO

Ayo is Soro's conversational interface and personality.

Ayo represents:

* trust
* calmness
* accessibility
* intelligence
* financial confidence
* Nigerian cultural familiarity

Ayo should feel:

* warm
* respectful
* professional
* approachable
* calm
* intelligent
* human-centered

Ayo must NOT feel:

* childish
* cartoonish
* robotic
* generic
* cyberpunk
* futuristic for the sake of being futuristic
* like a generic AI mascot

Existing Ayo visual assets are canonical.

If Ayo assets already exist in the project:

* reuse them
* preserve visual consistency
* do not generate arbitrary replacements
* do not redesign Ayo without an explicit product decision

---

# 7. AYO IS NOT THE BANKING AUTHORITY

This distinction is mandatory.

Ayo communicates.

Ayo does not authorize financial operations.

Ayo does not independently decide whether a transaction should happen.

Ayo does not know the customer's PIN.

Ayo does not bypass security controls.

Ayo does not invent banking results.

The correct relationship is:

```text
Ayo
  ↓
Conversation
  ↓
Soro
  ↓
Deterministic Controls
  ↓
Banking Provider
```

---

# 8. LANGUAGE STRATEGY

Primary languages:

1. Yoruba
2. Nigerian Pidgin

English is the fallback.

Language must be represented explicitly in the application domain.

Example:

```json
{
  "language": "yo",
  "intent": "GET_BALANCE"
}
```

Example:

```json
{
  "language": "pcm",
  "intent": "GET_BALANCE"
}
```

Do not build an architecture that assumes all user input is English.

The system should eventually support:

* language detection
* language-aware intent interpretation
* language-aware responses
* session-level language continuity
* fallback to English when necessary

Mixed-language speech must be considered.

---

# 9. CORE ARCHITECTURE

The high-level architecture is:

```text
                         SORO
                          │
              CONVERSATIONAL ACCESS
                          │
             ┌────────────┴────────────┐
             │                         │
        LIVE CHANNEL              DEMO CHANNEL
             │                         │
          Twilio                 Scenario Engine
             │                         │
             └────────────┬────────────┘
                          │
                   SORO VOICE LAYER
                          │
                         AYO
                          │
                 INTENT + CONTEXT
                          │
                POLICY + VALIDATION
                          │
                  BANKING ENGINE
                          │
             ┌────────────┴────────────┐
             │                         │
       WEMA ADAPTER              DEMO ADAPTER
             │                         │
             └────────────┬────────────┘
                          │
                     EVENT STREAM
                          │
                  COMMAND CENTER
```

This is a conceptual architecture.

Individual implementation details may evolve.

The product boundaries must not.

---

# 10. AI SAFETY PRINCIPLE

The most important technical rule:

> **AI understands. Deterministic systems control.**

The LLM may:

* interpret natural language
* detect language
* classify intent
* extract entities
* detect ambiguity
* produce structured intent
* help formulate conversational responses

The LLM must NOT:

* directly execute banking operations
* directly authorize transfers
* determine whether a PIN is correct
* receive customer PINs
* override policy
* bypass validation
* fabricate provider responses
* claim a transaction succeeded without confirmed provider state

The architecture must enforce this separation.

---

# 11. STRUCTURED INTENT

AI output must be structured.

Conceptually:

```json
{
  "language": "pcm",
  "intent": "GET_BALANCE",
  "entities": {},
  "confidence": null
}
```

For a transfer:

```json
{
  "language": "pcm",
  "intent": "TRANSFER_MONEY",
  "amount": 5000,
  "recipient_reference": "my daughter"
}
```

These examples are conceptual.

Actual schemas must be strongly typed and validated.

Never allow arbitrary LLM output to flow directly into a banking provider.

---

# 12. BANKING PROVIDER ABSTRACTION

Soro must not be tightly coupled to Wema.

Create a provider abstraction.

Conceptually:

```typescript
interface BankingProvider {
  getBalance(...)
  getTransactionHistory(...)
  resolveAccount(...)
  transfer(...)
}
```

Actual method names and contracts may evolve.

Expected implementations:

```text
WemaProvider
DemoBankingProvider
```

The Wema provider should use documented Wema/ALAT APIs.

Do not invent endpoints.

Do not fabricate SDK methods.

Do not guess request or response formats.

If an external capability cannot be verified:

1. do not pretend it exists
2. isolate it behind the provider interface
3. document the limitation
4. provide a deterministic local fallback where appropriate

---

# 13. WEMA INTEGRATION

Wema is an important integration target because Soro is being developed for a Wema hackathon context.

The system should be architected to integrate with documented Wema/ALAT OpenAPI capabilities.

However:

> **The project must never pretend that an integration works when it has not been verified.**

Wema sandbox/test capabilities should be used where available.

Production credentials must never be embedded in source code.

The Wema adapter must be isolated from the rest of the system.

---

# 14. VOICE ARCHITECTURE

The primary live interaction is phone-first.

Conceptually:

```text
CUSTOMER PHONE
      ↓
    TWILIO
      ↓
SORO VOICE GATEWAY
      ↓
CONVERSATION ENGINE
      ↓
SORO ORCHESTRATOR
      ↓
BANKING PROVIDER
```

Twilio is an external service.

The system must support:

* incoming calls
* call sessions
* speech input
* speech output
* silence
* timeouts
* interruptions
* hangups
* provider errors
* webhook validation

Twilio credentials belong in environment configuration.

Never hard-code them.

---

# 15. DTMF / SECURE AUTHORIZATION

Sensitive banking operations require stronger authorization than conversational intent alone.

A customer may use keypad input for authorization.

Conceptually:

```text
Ayo:
"Please use your keypad to authorize this transaction."

        ↓

DTMF

        ↓

Authorization Provider

        ↓

AUTHORIZED / REJECTED
```

The customer's secret must never be exposed to the AI.

Never:

* send PINs to the LLM
* display PINs in the Command Center
* store PINs in logs
* store PINs in analytics
* include PINs in events
* include PINs in transcripts

For demonstration, the interface may display:

```text
● ● ● ●
```

or:

```text
DTMF INPUT RECEIVED
```

Never display actual secret digits.

---

# 16. TRANSACTION STATE MACHINE

Financial operations must have explicit states.

Conceptually:

```text
REQUESTED
    ↓
UNDERSTOOD
    ↓
VALIDATED
    ↓
CONFIRMATION_REQUIRED
    ↓
CONFIRMED
    ↓
AUTHORIZATION_REQUIRED
    ↓
AUTHORIZED
    ↓
PROCESSING
    ↓
SUCCESS
```

Failure branches include:

```text
CANCELLED
FAILED
EXPIRED
UNAUTHORIZED
SECURITY_BLOCKED
UNKNOWN_RESULT
```

Never treat:

> "Request sent"

as:

> "Transaction successful."

A transaction is successful only when the banking provider confirms success.

Unknown provider outcomes must remain unknown.

Never blindly retry potentially non-idempotent operations.

Use appropriate:

* transaction references
* idempotency keys
* correlation IDs
* provider references

where supported.

---

# 17. SECURITY MODEL

Soro must follow a defense-in-depth approach.

Relevant controls include:

* input validation
* structured AI output
* deterministic policy checks
* authorization
* provider confirmation
* transaction state
* idempotency
* secure secrets management
* webhook verification
* audit events
* sensitive-data minimization

Security should be understandable to judges and implementable in code.

Do not create fake security theater.

---

# 18. SCAM / SOCIAL ENGINEERING

Soro may eventually identify suspicious conversational patterns such as:

* urgency
* secrecy
* impersonation
* "protect your account" scams
* suspicious transfer instructions
* unusual recipient behavior

However:

> A prototype security detector must not be presented as a production fraud-detection system.

If a security feature is simulated or heuristic, document that clearly.

---

# 19. COMMAND CENTER

The Soro Command Center is the judge-facing operational interface.

It makes the invisible orchestration visible.

It is not the customer's primary banking interface.

The Command Center should show the journey:

```text
CALL
 ↓
LISTEN
 ↓
UNDERSTAND
 ↓
VERIFY
 ↓
CONFIRM
 ↓
AUTHORIZE
 ↓
EXECUTE
 ↓
COMPLETE
```

It should expose useful operational state:

### Conversation

* transcript
* Ayo response
* call status

### Understanding

* language
* intent
* entities
* validation

### Banking

* provider
* service
* request
* response
* transaction state

### Security

* confirmation
* authorization
* warnings
* blocked operations

### Timeline

A chronological event stream.

Avoid meaningless vanity metrics.

Do not fabricate:

```text
AI confidence: 98.7%
```

unless such a metric is actually meaningful and calculated.

---

# 20. DEMO MODE

Soro must have a deterministic Demo Mode.

Demo Mode is NOT a video.

It is a scenario engine that exercises the Soro application flow.

Example:

```text
RUN DEMO
   ↓
Incoming call
   ↓
Customer speech
   ↓
Ayo response
   ↓
Language detection
   ↓
Intent
   ↓
Validation
   ↓
Banking request
   ↓
Banking response
   ↓
Ayo response
   ↓
SUCCESS
```

Demo Mode must be clearly labelled:

> DEMO MODE

It must never deceive users into believing simulated data is live banking data.

Demo Mode should remain useful even if:

* Twilio fails
* Wema sandbox is unavailable
* network connectivity fails
* external AI service fails

where possible.

---

# 21. LIVE MODE

Live Mode represents the real phone flow.

```text
PHONE
 ↓
TWILIO
 ↓
SORO
 ↓
AYO
 ↓
BANKING PROVIDER
 ↓
COMMAND CENTER
```

Live Mode and Demo Mode must be visibly distinguishable.

---

# 22. AYO VISUAL STATES

Ayo may appear in states including:

```text
LISTENING
THINKING
CONFIRMING
AUTHORIZING
PROCESSING
SUCCESS
ERROR
SECURITY_WARNING
```

Existing Ayo assets should be associated with these states.

Do not generate unrelated visual identities.

---

# 23. PRODUCT SCOPE PRINCIPLE

Soro should be one coherent product.

Do not turn the hackathon project into several unrelated mini-products.

Every feature must support the central thesis:

> Banking should be as easy as having a conversation.

Prioritize complete end-to-end flows over feature quantity.

A small number of working flows are better than many unfinished features.

---

# 24. TECHNOLOGY PRINCIPLES

Package manager:

**PNPM**

Do not mix:

* npm
* Yarn
* Bun

unless a specific unavoidable technical requirement exists.

Use TypeScript as the primary language.

Use modular architecture.

Prefer simple, understandable solutions.

Do not install dependencies without justification.

Do not introduce infrastructure merely because it is fashionable.

---

# 25. LOCAL-FIRST DEVELOPMENT

The current project is LOCAL ONLY.

Do not:

* create a GitHub repository
* add a GitHub remote
* push
* deploy
* publish

Local Git may be used for development checkpoints.

External services may still be used where required:

* Twilio
* Wema
* LLM
* STT
* TTS

Credentials remain local.

Never commit secrets.

---

# 26. ENVIRONMENT VARIABLES

Use environment variables for:

* database configuration
* LLM credentials
* Twilio credentials
* Wema credentials
* STT credentials
* TTS credentials
* application configuration

Provide:

`.env.example`

Never provide real credentials in tracked files.

Never hard-code secrets.

---

# 27. DOCUMENTATION IS A FIRST-CLASS DELIVERABLE

This is a hackathon project.

The documentation must be exceptionally detailed.

Documentation is not an afterthought.

The documentation should allow another engineer to understand:

* what Soro is
* why it exists
* who it serves
* how it works
* why architectural decisions were made
* how external services work
* how to configure them
* how data flows
* how security works
* how Demo Mode works
* how Live Mode works
* how to test the system
* how to troubleshoot failures
* what is real
* what is simulated
* what remains incomplete
* what a future production implementation would require

Never write shallow documentation simply to satisfy the existence of a file.

---

# 28. DOCUMENTATION STANDARD

Every major subsystem should have documentation covering:

## Purpose

Why the subsystem exists.

## Responsibilities

What it does.

## Non-responsibilities

What it deliberately does NOT do.

## Architecture

How it connects to other components.

## Data flow

Input → processing → output.

## APIs

Endpoints, request shapes, response shapes and errors where applicable.

## Security

Threats, controls and sensitive data.

## Failure modes

What can go wrong and how the system behaves.

## Testing

How the subsystem is tested.

## Configuration

Environment variables and setup.

## Operational notes

How developers diagnose problems.

## Future production considerations

What would need to change before production deployment.

---

# 29. THIRD-PARTY DOCUMENTATION

Every external service must have dedicated integration documentation.

At minimum document:

* purpose
* account setup
* credentials
* environment variables
* API endpoints
* SDK usage
* webhook requirements
* authentication
* rate limits if known
* sandbox/test behavior
* error behavior
* local testing
* production considerations
* known limitations

Relevant third parties may include:

* Wema/ALAT OpenAPI
* Twilio
* speech-to-text provider
* text-to-speech provider
* LLM provider

Do not document capabilities that have not been verified.

Clearly label:

REAL

SIMULATED

MOCKED

UNAVAILABLE

PLANNED

---

# 30. CODE QUALITY

Code must be:

* typed
* modular
* readable
* testable
* observable
* secure

Avoid:

* giant files
* hidden global state
* magic strings
* duplicated domain models
* unnecessary abstractions
* dead code
* swallowed errors
* fake implementations presented as real

---

# 31. CHANGE DISCIPLINE

Before modifying the codebase:

1. Inspect the existing implementation.
2. Read relevant documentation.
3. Understand current architecture.
4. Identify dependencies.
5. Preserve working functionality.
6. Make the smallest coherent change.

Do not rewrite functioning subsystems without a clear reason.

Do not silently change product requirements.

---

# 32. NO FABRICATION

This rule is absolute.

Never fabricate:

* API endpoints
* SDK methods
* provider responses
* transaction results
* credentials
* banking capabilities
* external service capabilities
* test results

If something cannot be verified:

say so.

Then design an appropriate fallback.

---

# 33. TESTING STANDARD

A feature is not complete because its UI exists.

A feature is complete when the relevant path has been tested.

At minimum use:

* unit tests
* integration tests
* type checking
* linting
* build validation
* end-to-end testing where appropriate

Test both:

SUCCESS

and

FAILURE.

---

# 34. DEFINITION OF DONE

A phase is complete only when:

1. Code exists.
2. The intended behavior is implemented.
3. The relevant flow has been tested.
4. Types pass.
5. Lint passes.
6. Tests pass.
7. Build passes.
8. Documentation is updated.
9. Security implications are reviewed.
10. Known limitations are documented.

---

# 35. FINAL PRINCIPLE

When choosing between:

A large feature that is unreliable

and

A smaller feature that works end-to-end,

choose the working feature.

Soro should demonstrate one powerful idea extremely well:

> A person speaks naturally.

> Soro understands.

> Soro validates.

> Soro securely orchestrates.

> The banking provider executes.

> Ayo communicates.

> The Command Center makes the process visible.

That is Soro.
