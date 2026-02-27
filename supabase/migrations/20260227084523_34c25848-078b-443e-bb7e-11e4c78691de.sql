ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS drone_video_url TEXT,
  ADD COLUMN IF NOT EXISTS panorama_360_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS glb_model_url TEXT,
  ADD COLUMN IF NOT EXISTS ai_staging_images TEXT[] DEFAULT '{}';