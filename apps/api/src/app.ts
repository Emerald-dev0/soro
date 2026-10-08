import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { listCustomers, openDatabase, migrate, seedDemoData } from '@soro/db';
import { MockBankingCore } from '@soro/banking';

import { twilioVoiceRoute, twilioGatherRoute, twilioDtmfRoute, twilioStatusRoute } from './twilio.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { sseRoutes } from './events.routes.js';
import { demoRoutes } from './demo.routes.js';
import { authRoutes } from './auth.routes.js';
import { voiceIdentityRoutes } from './voice-identity.routes.js';
import { vapiRoutes } from './vapi.routes.js';
import { authorizeRoutes } from './authorize.routes.js';
import { ttsRoutes } from './tts.routes.js';
import { DemoVoiceIdentityProvider } from '@soro/service-security';
import { healthRoutes } from './health.routes.js';
import { installRateLimit } from './rate-limit.js';
import { installAdminGuard } from './admin-guard.js';

export interface AppContext {
  dbPath: string;
}

export function buildApp(): ReturnType<typeof Fastify> {
  const dbPath = process.env.SORO_DATABASE_PATH ?? join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'data', 'soro.db');
  let databasePath = dbPath;
  try {
    mkdirSync(dirname(databasePath), { recursive: true });
  } catch {
    // No writable disk mounted (e.g. Render without a disk): fall back to
    // ephemeral storage so the service still starts. Attach a disk at the
    // configured path for persistence (see render.yaml / docs/DEPLOYMENT.md).
    databasePath = join(tmpdir(), 'soro.db');
  }
  const database = openDatabase(databasePath);
  migrate(database);
  if (process.env.DEMO_MODE !== 'false' && listCustomers(database).length === 0) {
    seedDemoData(database);
  }
  const core = new MockBankingCore(database);
  const app = Fastify({ logger: { level: 'info' } });

  app.addHook('onRequest', async (req) => {
    (req as unknown as { id_: string }).id_ = randomUUID();
  });

  installAdminGuard(app);
  installRateLimit(app, ['/api/twilio', '/api/authn', '/api/demo'], { windowMs: 60_000, max: Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120) });
  healthRoutes(app, database);
  twilioVoiceRoute(app, database, core);
  twilioGatherRoute(app, database, core);
  twilioDtmfRoute(app, database, core);
  twilioStatusRoute(app, database);
  dashboardRoutes(app, database, core);
  sseRoutes(app);
  demoRoutes(app, database, core);
  authRoutes(app, database);
  vapiRoutes(app, database, core);
  authorizeRoutes(app, database);
  ttsRoutes(app);
  voiceIdentityRoutes(app, database, new DemoVoiceIdentityProvider(database));

  app.addHook('onResponse', async (req) => {
    req.log.info({ requestId: (req as unknown as { id_: string }).id_ }, 'request complete');
  });

  app.setErrorHandler((err: any, req, reply) => {
    req.log.error({ err }, 'request error');
    reply.status(err.statusCode ?? 500).send({
      success: false,
      error: { code: err.code ?? 'INTERNAL_ERROR', message: err.statusCode ? err.message : 'Internal error' },
      requestId: (req as unknown as { id_: string }).id_,
    });
  });

  return app;
}

