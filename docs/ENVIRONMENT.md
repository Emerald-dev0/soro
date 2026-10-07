# Soro — Environment Reference

> **Phase 0 status: REAL.** Template (`.env.example`), loader + readiness
> helpers (`packages/config`), and this reference all agree. No real
> credentials exist anywhere in the repo.
>
> Related: DEVELOPMENT.md · SECURITY.md · TWILIO.md · WEMA.md · VOICE.md

## 1. Purpose

One place that explains every environment variable: what it does, where
its value comes from, and whether it is needed locally, for Demo Mode,
or for Live Mode. Setup: `cp .env.example .env`.

## 2. How config is loaded

`loadSoroConfig(process.env)` (zod-validated at startup) groups variables
into application / database / llm / twilio / wema / stt / tts. Invalid
values throw loudly; missing secrets stay absent (never faked).
`isDemoReady()` is unconditionally true; `isLiveReady()` lists exactly
what is missing.

## 3. Variable reference

### APPLICATION

| Variable | Purpose | Source | LOCAL | DEMO | LIVE |
|---|---|---|---|---|---|
| `SORO_APP_NAME` | Human-readable name | free choice | opt | no | no |
| `SORO_ENV` | Environment label | `local` / `test` / `prod` | yes | no | no |
| `SORO_MODE` | Default mode `demo`\|`live` | operator choice | yes | forced `demo` | set `live` |
| `SORO_PORT` | HTTP port (services/webhooks) | free port, default 3000 | yes | no | yes |
| `SORO_LOG_LEVEL` | `debug`\|`info`\|`warn`\|`error` | operator choice | opt | no | no |

### DATABASE

| Variable | Purpose | Source | LOCAL | DEMO | LIVE |
|---|---|---|---|---|---|
| `SORO_DATABASE_PATH` | SQLite file path (default `./data/soro.db`) | local fs | yes | yes | yes (local live-test) |

### LLM (STATUS: PLANNED — no live calls in Phase 0)

| Variable | Purpose | Source | LOCAL | DEMO | LIVE |
|---|---|---|---|---|---|
| `SORO_LLM_PROVIDER` | e.g. `openai` | provider account | no | no | yes (planned) |
| `SORO_LLM_API_KEY` | model API key | provider dashboard | no | no | yes (planned) |
| `SORO_LLM_MODEL` | model id | provider docs | no | no | yes (planned) |

### TWILIO (STATUS: NOT YET TESTED)

| Variable | Purpose | Source | LOCAL | DEMO | LIVE |
|---|---|---|---|---|---|
| `TWILIO_ACCOUNT_SID` | account id (`AC…`) | Twilio console | live-test only | no | yes |
| `TWILIO_AUTH_TOKEN` | auth token | Twilio console | live-test only | no | yes |
| `TWILIO_PHONE_NUMBER` | caller-facing number | Twilio console | live-test only | no | yes |
| `TWILIO_WEBHOOK_BASE_URL` | public URL for webhooks (tunnel in dev) | ngrok/etc + path | live-test only | no | yes |

### WEMA (STATUS: NOT VERIFIED — see docs/WEMA.md)

| Variable | Purpose | Source | LOCAL | DEMO | LIVE |
|---|---|---|---|---|---|
| `WEMA_ENV` | `sandbox`\|`production` | integration stage | no | no | yes (once verified) |
| `WEMA_BASE_URL` | API base URL | Wema docs/portal | no | no | yes (once verified) |
| `WEMA_CLIENT_ID` | OAuth client id | Wema portal | no | no | yes (once verified) |
| `WEMA_CLIENT_SECRET` | OAuth secret | Wema portal | no | no | yes (once verified) |
| `WEMA_API_KEY` | API key (if key-auth) | Wema portal | no | no | yes (once verified) |

### STT / TTS (STATUS: PLANNED — see docs/VOICE.md)

| Variable | Purpose | Source | LOCAL | DEMO | LIVE |
|---|---|---|---|---|---|
| `SORO_STT_PROVIDER` / `SORO_STT_API_KEY` | speech-to-text | provider account | no | no | yes (planned) |
| `SORO_TTS_PROVIDER` / `SORO_TTS_API_KEY` / `SORO_TTS_VOICE` | Ayo's voice | provider account | no | no | yes (planned) |

## 4. Security rules

- `.env` is git-ignored; real credentials never enter tracked files.
- `.env.example` contains NO secrets (empty values for all credentials).
- Production secrets belong in a secret manager, never env files on disk.
- Webhook validation (`TWILIO_AUTH_TOKEN`) and Wema credentials are
  required before ANY live traffic (docs/SECURITY.md).

## 5. Failure modes

`SORO_MODE=live` without credentials → `isLiveReady()` reports the exact
missing list; services must refuse live traffic, not limp along. Bad
`SORO_PORT`/enum values → startup throws with the zod error.

## 6. Future production considerations

Per-environment secret injection, rotation runbooks, and config
change audit — all out of scope for local-first Phase 0.
