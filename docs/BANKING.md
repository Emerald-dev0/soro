# Soro — Banking

> **Phase 0 status: ABSTRACTION + DEMO ADAPTER REAL** (tested).
> Wema adapter is an intentional stub (`NotVerifiedError`). No real money
> moves anywhere.
>
> Related: WEMA.md · SYSTEM-FLOW.md · SECURITY.md · EVENTS.md · API.md

## 1. Purpose

Let Soro operate against ANY bank behind one stable contract, so the
product never couples to a single provider's quirks, outages, or SDK.

## 2. Provider responsibilities / non-responsibilities

A provider **does**: balance lookup, transaction history, account
resolution, transfers — returning confirmed outcomes. It **does NOT**:
decide authorization, see PINs, or talk to the LLM. Upstream code depends
only on `BankingProvider` (`@soro/types`); selection happens in exactly
one place (`selectProvider`, `@soro/service-banking`).

## 3. The contract (REAL)

```ts
interface BankingProvider {
  readonly name: 'wema' | 'demo';
  getBalance(req: BankingRequest): Promise<BankingResponse>;
  getTransactionHistory(req: BankingRequest): Promise<BankingResponse>;
  transfer(req: BankingRequest): Promise<BankingResponse>;
}
```

Requests carry `reference` + `idempotencyKey` + session/correlation ids;
money uses minor units (kobo). Responses carry `state`
(`SUCCESS`/`FAILED`/`UNKNOWN_RESULT`), optional `providerReference`,
and mandatory `simulated` honesty flag.

## 4. Adapters

- **DemoBankingProvider (REAL, deterministic):** fixed demo balance
  (₦125,000.00 default), canned history, stateful transfers with
  insufficient-funds handling. Every response `simulated: true`.
- **WemaProvider (STUB):** every method throws `NotVerifiedError` with a
  pointer to docs/WEMA.md. This is честность by design — see §7.

## 5. Transaction state (REAL guard)

`REQUESTED → UNDERSTOOD → VALIDATED → CONFIRMATION_REQUIRED → CONFIRMED →
AUTHORIZATION_REQUIRED → AUTHORIZED → PROCESSING → SUCCESS`, with
`CANCELLED / FAILED / EXPIRED / UNAUTHORIZED / SECURITY_BLOCKED /
UNKNOWN_RESULT` branches (`canTransitionTransaction`, tested).
Read-only flows shortcut `CONFIRMED → PROCESSING` (no auth needed).

## 6. Idempotency / errors / unknown state

Retries reuse `reference` + `idempotencyKey` (UNIQUE in DB — double
submission is a loud error, not a double charge). Provider `FAILED` is
reported honestly with safe next steps. `UNKNOWN_RESULT` is sticky:
surfaced as unknown, reconciled by reference, never blindly retried.

## 7. Why the Wema adapter throws (no fabrication, ever)

Per AGENTS.md §32 / docs/WEMA.md: undocumented endpoints are NOT
implemented, NOT guessed, NOT demoed as working. The stub keeps the
boundary honest until verification. Status: NOT VERIFIED.

## 8. Testing / production

Demo adapter: full unit coverage incl. failure branches (REAL).
Wema: contract tests land WITH verification (recorded fixtures, sandbox
replays). Production: credential rotation, provider timeouts/circuit
breakers, reconciliation jobs, and settlement-report matching.
