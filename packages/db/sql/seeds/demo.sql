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

-- ------------------------------------------------------------------
-- Phase 1 deterministic demo data (SIMULATED — never live banking)
-- Account numbers/phones are fictional. Running twice is safe.
-- ------------------------------------------------------------------

INSERT OR IGNORE INTO customers (id, customer_number, first_name, last_name, phone_number, email, status, preferred_language, pin_hash, created_at, updated_at)
VALUES
  ('cust-daniel', 'CUST-001', 'Daniel', 'Okafor', '08030000001', 'daniel@soro.demo', 'ACTIVE', 'PIDGIN', '71016e8f8be19a13ff619fb5d69d5cb0ee631608b054bd96f21f672cc1b2daf5', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z'),
  ('cust-aisha',  'CUST-002', 'Aisha',  'Bello',  '08030000002', 'aisha@soro.demo',  'ACTIVE', 'YORUBA', '42b85945c83a569e191602fed2e0d3f3fd763eb290750f0b00c7f3aa5b15476e', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z');

INSERT OR IGNORE INTO accounts (id, customer_id, account_number, account_type, currency, balance_minor, available_balance_minor, status, created_at, updated_at)
VALUES
  ('acct-daniel', 'cust-daniel', '0123456789', 'SAVINGS', 'NGN', 8425000, 8425000, 'ACTIVE', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z'),
  ('acct-aisha',  'cust-aisha',  '0123456780', 'WALLET',  'NGN', 12560000, 12560000, 'ACTIVE', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z');

INSERT OR IGNORE INTO beneficiaries (id, customer_id, name, account_number, bank_name, bank_code, status, created_at)
VALUES
  ('ben-daniel-mum',   'cust-daniel', 'Mum',   '0123456780', 'Soro Demo Bank', '000', 'ACTIVE', '2026-09-01T00:00:00.000Z'),
  ('ben-daniel-aisha', 'cust-daniel', 'Aisha', '0123456780', 'Soro Demo Bank', '000', 'ACTIVE', '2026-09-01T00:00:00.000Z'),
  ('ben-aisha-daniel', 'cust-aisha',  'Daniel','0123456789', 'Soro Demo Bank', '000', 'ACTIVE', '2026-09-01T00:00:00.000Z');

INSERT OR IGNORE INTO data_plans (id, network, label, data_mb, price_minor, validity_days, status)
VALUES
  ('pln-mtn-1gb',   'MTN',   '1GB / 7 days',   1000, 50000,  7,  'ACTIVE'),
  ('pln-mtn-15gb',  'MTN',   '1.5GB / 7 days', 1500, 70000,  7,  'ACTIVE'),
  ('pln-mtn-2gb',   'MTN',   '2GB / 14 days',  2000, 100000, 14, 'ACTIVE'),
  ('pln-airtel-1gb','AIRTEL','1GB / 7 days',   1000, 50000,  7,  'ACTIVE'),
  ('pln-airtel-2gb','AIRTEL','2GB / 14 days',  2000, 100000, 14, 'ACTIVE'),
  ('pln-glo-1gb',   'GLO',   '1GB / 7 days',   1000, 45000,  7,  'ACTIVE'),
  ('pln-glo-3gb',   'GLO',   '3GB / 30 days',  3000, 150000, 30, 'ACTIVE'),
  ('pln-9mobile-1gb','9MOBILE','1GB / 7 days', 1000, 48000,  7,  'ACTIVE');

INSERT OR IGNORE INTO voice_profiles (id, customer_id, status, provider, provider_reference, enrollment_count, verification_count, successful_verification_count, confidence_score, model_version, last_verified_at, created_at, updated_at)
VALUES
  ('vp-daniel', 'cust-daniel', 'ENROLLED', 'demo-voice-identity', 'dvi-daniel-1', 3, 12, 11, 0.92, 'demo-v1', '2026-10-06T10:00:00.000Z', '2026-09-15T00:00:00.000Z', '2026-10-06T10:00:00.000Z'),
  ('vp-aisha',  'cust-aisha',  'ENROLLED', 'demo-voice-identity', 'dvi-aisha-1',  2, 5,  5,  0.89, 'demo-v1', '2026-10-05T09:00:00.000Z', '2026-09-20T00:00:00.000Z', '2026-10-05T09:00:00.000Z');

INSERT OR IGNORE INTO support_cases (id, customer_id, account_id, call_session_id, transaction_reference, category, description, priority, status, created_at, updated_at)
VALUES
  ('case-1', 'cust-aisha', 'acct-aisha', NULL, NULL, 'GENERAL_SUPPORT', 'Demo: Aisha asked how data recommendations work.', 'LOW', 'RESOLVED', '2026-10-02T11:00:00.000Z', '2026-10-02T11:05:00.000Z');
