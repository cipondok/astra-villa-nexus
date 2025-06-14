
-- Table to store market trends data
CREATE TABLE public.market_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_type TEXT NOT NULL, -- e.g., 'interest_rate', 'regional_demand'
  value TEXT NOT NULL, -- e.g., 'dropped', 'increased'
  description TEXT, -- A human-readable description of the trend, e.g., "Interest rates dropped by 0.5%"
  location TEXT, -- For location-specific trends, e.g., 'Bali'
  property_type TEXT, -- For property-type-specific trends, e.g., 'villa'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.market_trends IS 'Stores data about market changes to trigger property revivals.';
COMMENT ON COLUMN public.market_trends.trend_type IS 'e.g., ''interest_rate'', ''regional_demand''';
COMMENT ON COLUMN public.market_trends.value IS 'e.g., ''dropped'', ''increased''';
COMMENT ON COLUMN public.market_trends.description IS 'A human-readable description of the trend, e.g., "Interest rates dropped by 0.5%"';
COMMENT ON COLUMN public.market_trends.location IS 'For location-specific trends, e.g., ''Bali''';
COMMENT ON COLUMN public.market_trends.property_type IS 'For property-type-specific trends, e.g., ''villa''';

-- Add RLS to market_trends
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access on trends" ON public.market_trends FOR SELECT USING (true);
CREATE POLICY "Allow admin full access on trends" ON public.market_trends FOR ALL USING (public.check_admin_access()) WITH CHECK (public.check_admin_access());

-- Table to log when a property is revived by the AI
CREATE TABLE public.property_revival_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  market_trend_id UUID NOT NULL REFERENCES public.market_trends(id) ON DELETE CASCADE,
  revival_details JSONB, -- e.g., {"message_sent": "...", "updated_at": "..."}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.property_revival_log IS 'Keeps a record of which listings have been automatically revived to avoid duplicates.';
COMMENT ON COLUMN public.property_revival_log.revival_details IS 'e.g., {"message_sent": "...", "updated_at": "..."}';

-- Add RLS to property_revival_log
ALTER TABLE public.property_revival_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin full access on revival logs" ON public.property_revival_log FOR ALL USING (public.check_admin_access()) WITH CHECK (public.check_admin_access());
CREATE POLICY "Allow property owner to see their own revival logs" ON public.property_revival_log FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_revival_log.property_id AND p.owner_id = auth.uid()
  )
);

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule the listing-reviver function to run once every day at midnight UTC.
-- NOTE: This creates the schedule, but the function itself will be created in the next step.
SELECT cron.schedule(
  'revive-listings-daily',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT net.http_post(
    url:='https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/listing-reviver',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bXJhanV1eXlma3pkbXB0ZWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDM5NjksImV4cCI6MjA2NDcxOTk2OX0.jcdUvzLIWj7b0ay5UvuzJ7RVsAzkSWQQ_-o83kNaYYk"}'::jsonb,
    body:='{}'::jsonb
  )
  $$
);
