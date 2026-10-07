import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, migrate } from '@soro/db';
import { MockBankingCore } from '@soro/banking';

import { twilioVoiceRoute, twilioGatherRoute, twilioDtmfRoute, twilioStatusRoute } from './twilio.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { sseRoutes } from './events.routes.js';
import { demoRoutes } from './demo.routes.js';
import { authRoutes } from './auth.routes.js';
import { healthRoutes } from './health.routes.js';

export interface AppContext {
  dbPath: string;
}

export function buildApp(): ReturnType<typeof Fastify> {
  const dbPath = process.env.SORO_DATABASE_PATH ?? join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'data', 'soro.db');
  const database = openDatabase(dbPath);
  migrate(database);
  const core = new MockBankingCore(database);
  const app = Fastify({ logger: { level: 'info' } });

  app.addHook('onRequest', async (req) => {
    (req as unknown as { id_: string }).id_ = randomUUID();
  });

  healthRoutes(app, database);
  twilioVoiceRoute(app, database, core);
  twilioGatherRoute(app, database, core);
  twilioDtmfRoute(app, database, core);
  twilioStatusRoute(app, database);
  dashboardRoutes(app, database, core);
  sseRoutes(app);
  demoRoutes(app, database, core);
  authRoutes(app, database);

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

