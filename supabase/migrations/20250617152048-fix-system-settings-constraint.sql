
-- Fix duplicate key issues by ensuring we do proper upserting on system_settings table
-- First, remove any duplicate system_settings entries

-- Delete duplicate watermark settings that might be causing issues
DELETE FROM public.system_settings a
USING public.system_settings b
WHERE a.id < b.id 
AND a.key = b.key 
AND a.category = b.category
AND a.category = 'watermark';

-- Add proper constraint that works with our upsert logic
ALTER TABLE public.system_settings
DROP CONSTRAINT IF EXISTS system_settings_category_key_key;

ALTER TABLE public.system_settings
ADD CONSTRAINT system_settings_category_key_key 
UNIQUE (category, key);
