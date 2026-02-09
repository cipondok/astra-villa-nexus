
-- Update existing properties with default images based on property type
UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
WHERE property_type = 'house' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');

UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
WHERE property_type = 'apartment' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');

UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'
WHERE property_type = 'villa' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');

UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
WHERE property_type = 'land' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');

UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
WHERE property_type = 'commercial' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');

UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=800&q=80'
WHERE property_type = 'townhouse' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');

UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'
WHERE property_type = 'warehouse' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');

UPDATE properties SET 
  images = ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
  image_urls = ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
  thumbnail_url = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
WHERE property_type = 'kost' AND (images IS NULL OR array_length(images, 1) IS NULL) AND (thumbnail_url IS NULL OR thumbnail_url = '');
