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
db.exec(`PRAGMA foreign_keys=OFF;
DROP TABLE IF EXISTS data_purchases;
DROP TABLE IF EXISTS airtime_purchases;
DROP TABLE IF EXISTS emails;
DROP TABLE IF EXISTS support_cases;
DROP TABLE IF EXISTS voice_profiles;
DROP TABLE IF EXISTS authorization_attempts;
DROP TABLE IF EXISTS authentication_attempts;
DROP TABLE IF EXISTS conversation_messages;
DROP TABLE IF EXISTS calls;
DROP TABLE IF EXISTS data_plans;
DROP TABLE IF EXISTS beneficiaries;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS provider_requests;
DROP TABLE IF EXISTS demo_sessions;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS schema_migrations;
PRAGMA foreign_keys=ON;
`);
db.exec(readFileSync(join(here, '..', 'sql', 'schema.sql'), 'utf8'));
db.prepare('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (1, ?)').run(new Date().toISOString());
db.close();
console.log(`[soro/db] reset complete: ${dbPath}`);
