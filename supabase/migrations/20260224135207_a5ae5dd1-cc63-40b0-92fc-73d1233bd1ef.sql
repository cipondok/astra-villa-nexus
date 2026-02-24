SELECT cron.schedule(
  'visit-reminders-cron',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/visit-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);