import { z } from 'zod';

/**
 * Environment architecture (Phase 0).
 *
 * Configuration is grouped logically (application / database / llm /
 * twilio / wema / stt / tts), validated at startup with zod, and fully
 * documented in docs/ENVIRONMENT.md + .env.example.
 *
 * Rules:
 *  - No real credentials in tracked files, ever.
 *  - No fake secrets in defaults — missing secrets are empty/absent,
 *    and readiness helpers report exactly what is missing.
 *  - Demo Mode requires NO external credentials by design.
 */

const appSchema = z.object({
  SORO_APP_NAME: z.string().default('Soro'),
  SORO_ENV: z.string().default('local'),
  SORO_MODE: z.enum(['demo', 'live']).default('demo'),
  SORO_PORT: z.coerce.number().int().positive().default(3000),
  SORO_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const databaseSchema = z.object({
  SORO_DATABASE_PATH: z.string().default('./data/soro.db'),
});

const llmSchema = z.object({
  SORO_LLM_PROVIDER: z.string().optional(),
  SORO_LLM_API_KEY: z.string().optional(),
  SORO_LLM_MODEL: z.string().optional(),
});

const twilioSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_WEBHOOK_BASE_URL: z.string().default('http://localhost:3000'),
});

const wemaSchema = z.object({
  WEMA_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  WEMA_BASE_URL: z.string().optional(),
  WEMA_CLIENT_ID: z.string().optional(),
  WEMA_CLIENT_SECRET: z.string().optional(),
  WEMA_API_KEY: z.string().optional(),
});

const sttSchema = z.object({
  SORO_STT_PROVIDER: z.string().optional(),
  SORO_STT_API_KEY: z.string().optional(),
});

const ttsSchema = z.object({
  SORO_TTS_PROVIDER: z.string().optional(),
  SORO_TTS_API_KEY: z.string().optional(),
  SORO_TTS_VOICE: z.string().optional(),
});

export const soroEnvSchema = z.object({
  ...appSchema.shape,
  ...databaseSchema.shape,
  ...llmSchema.shape,
  ...twilioSchema.shape,
  ...wemaSchema.shape,
  ...sttSchema.shape,
  ...ttsSchema.shape,
});

export type SoroConfig = z.output<typeof soroEnvSchema>;

/** Parse + validate. Throws a descriptive error on invalid values. */
export function loadSoroConfig(env: Record<string, string | undefined> = process.env): SoroConfig {
  const parsed = soroEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid Soro configuration: ${parsed.error.message}`);
  }
  return parsed.data;
}

export interface Readiness {
  ready: boolean;
  missing: string[];
}

/**
 * Demo Mode readiness: needs NOTHING external. Always ready — the
 * scenario engine + DemoBankingProvider are deterministic and local.
 */
export function isDemoReady(_config: SoroConfig): Readiness {
  return { ready: true, missing: [] };
}

/** Live Mode readiness: Twilio + Wema (verified) credentials required. */
export function isLiveReady(config: SoroConfig): Readiness {
  const missing: string[] = [];
  if (!config.TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
  if (!config.TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
  if (!config.TWILIO_PHONE_NUMBER) missing.push('TWILIO_PHONE_NUMBER');
  if (!config.WEMA_BASE_URL) missing.push('WEMA_BASE_URL (NOT VERIFIED — see docs/WEMA.md)');
  if (!config.WEMA_API_KEY && !config.WEMA_CLIENT_ID) {
    missing.push('WEMA_API_KEY or WEMA_CLIENT_ID (NOT VERIFIED — see docs/WEMA.md)');
  }
  return { ready: missing.length === 0, missing };
}

export function isLiveVoiceReady(config: SoroConfig): Readiness {
  const missing: string[] = [];
  if (!config.TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
  if (!config.TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
  if (!config.TWILIO_PHONE_NUMBER) missing.push('TWILIO_PHONE_NUMBER');
  return { ready: missing.length === 0, missing };
}
