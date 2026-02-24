-- Add reminder tracking columns to property_visits
ALTER TABLE public.property_visits 
  ADD COLUMN IF NOT EXISTS reminder_24h_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent boolean DEFAULT false;

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;