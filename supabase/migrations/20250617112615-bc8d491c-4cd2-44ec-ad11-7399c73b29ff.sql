
-- Add thumbnail_url column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Update existing properties to set thumbnail_url from first image if available
UPDATE public.properties 
SET thumbnail_url = COALESCE(
  thumbnail_url,
  CASE 
    WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN images[1]
    WHEN image_urls IS NOT NULL AND array_length(image_urls, 1) > 0 THEN image_urls[1]
    ELSE NULL
  END
)
WHERE thumbnail_url IS NULL;
