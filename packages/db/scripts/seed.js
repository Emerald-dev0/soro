// pnpm --filter @soro/db seed — load deterministic demo seed data.
// SIMULATED data for Demo Mode only. LOCAL ONLY.
/* global process console */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(process.env.SORO_DATABASE_PATH ?? join(here, '..', '..', '..', 'data', 'soro.db'));
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(readFileSync(join(here, '..', 'sql', 'schema.sql'), 'utf8'));
db.exec(readFileSync(join(here, '..', 'sql', 'seeds', 'demo.sql'), 'utf8'));
db.close();
console.log(`[soro/db] seed complete (SIMULATED demo data): ${dbPath}`);
