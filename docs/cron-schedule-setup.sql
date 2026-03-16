-- ASTRA Villa Intelligence Worker Cron Schedule
-- Run this in the Supabase SQL Editor to activate automated workers
-- Extensions pg_cron and pg_net must be enabled (they already are)

-- Worker 1: Opportunity Score — every 10 minutes
SELECT cron.schedule(
  'astra_opportunity_scoring',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/compute-opportunity-scores',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk"}'::jsonb,
    body := '{"batch_size": 500}'::jsonb
  ) AS request_id;
  $$
);

-- Worker 2: Deal Hunter Scanner — every 5 minutes
SELECT cron.schedule(
  'astra_deal_scanner',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/scan-deal-opportunities',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk"}'::jsonb,
    body := '{"threshold": 75}'::jsonb
  ) AS request_id;
  $$
);

-- Worker 3: Market Heat Aggregation — every 30 minutes
SELECT cron.schedule(
  'astra_market_heat',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/aggregate-market-heat',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Worker 4: Price Prediction — every 60 minutes
SELECT cron.schedule(
  'astra_price_prediction',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/predict-property-prices',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk"}'::jsonb,
    body := '{"limit": 200}'::jsonb
  ) AS request_id;
  $$
);

-- Worker 5: Portfolio Analyzer — every 2 hours
SELECT cron.schedule(
  'astra_portfolio_analyzer',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/analyze-investor-portfolios',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify scheduled jobs
SELECT jobid, jobname, schedule FROM cron.job WHERE jobname LIKE 'astra_%';
