// pnpm --filter @soro/db reset — drop all domain tables and re-apply schema.
// LOCAL ONLY. Never run against anything but a local SQLite file.
/* global process console */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(process.env.SORO_DATABASE_PATH ?? join(here, '..', '..', '..', 'data', 'soro.db'));
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`DROP TABLE IF EXISTS demo_sessions;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS schema_migrations;`);
db.exec(readFileSync(join(here, '..', 'sql', 'schema.sql'), 'utf8'));
db.prepare('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (1, ?)').run(new Date().toISOString());
db.close();
console.log(`[soro/db] reset complete: ${dbPath}`);
