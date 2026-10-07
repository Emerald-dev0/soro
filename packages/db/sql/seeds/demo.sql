-- Demo seed data (SIMULATED — Demo Mode only, never live banking data).
-- Applied by `pnpm db:seed`. Safe to re-run (INSERT OR IGNORE / REPLACE).

INSERT OR IGNORE INTO sessions (id, channel, mode, user_id, language, status, started_at, ended_at)
VALUES
  ('seed-demo-session-1', 'demo', 'DEMO', 'seed-user-1', 'pcm', 'ended',
   '2026-10-01T09:00:00.000Z', '2026-10-01T09:02:10.000Z');

INSERT OR IGNORE INTO events (id, type, session_id, correlation_id, source, mode, created_at, payload_json)
VALUES
  ('seed-event-1', 'CALL_CONNECTED', 'seed-demo-session-1', 'seed-corr-1', 'demo-engine', 'DEMO',
   '2026-10-01T09:00:00.000Z', '{"scenario":"demo-balance-pidgin"}'),
  ('seed-event-2', 'LANGUAGE_DETECTED', 'seed-demo-session-1', 'seed-corr-1', 'conversation', 'DEMO',
   '2026-10-01T09:00:20.000Z', '{"language":"pcm"}'),
  ('seed-event-3', 'INTENT_RESOLVED', 'seed-demo-session-1', 'seed-corr-1', 'conversation', 'DEMO',
   '2026-10-01T09:00:35.000Z', '{"intent":"GET_BALANCE"}'),
  ('seed-event-4', 'BANKING_RESPONSE_RECEIVED', 'seed-demo-session-1', 'seed-corr-1', 'banking', 'DEMO',
   '2026-10-01T09:01:05.000Z', '{"provider":"demo","state":"SUCCESS","simulated":true}'),
  ('seed-event-5', 'TRANSACTION_SUCCESS', 'seed-demo-session-1', 'seed-corr-1', 'orchestration', 'DEMO',
   '2026-10-01T09:01:06.000Z', '{"kind":"BALANCE"}');

INSERT OR IGNORE INTO demo_sessions (id, scenario_id, mode, status, current_step_index, started_at, ended_at)
VALUES
  ('seed-demo-run-1', 'demo-balance-pidgin', 'DEMO', 'completed', 8,
   '2026-10-01T09:00:00.000Z', '2026-10-01T09:02:10.000Z');
