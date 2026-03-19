
INSERT INTO public.properties (owner_id, title, description, property_type, listing_type, price, location, state, city, bedrooms, bathrooms, area_sqm, land_area_sqm, building_area_sqm, floors, has_pool, furnishing, view_type, status, approval_status, development_status, is_featured, investor_highlight, roi_percentage, rental_yield_percentage, wna_eligible, image_urls, thumbnail_url, property_features) VALUES
(
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'Villa Sunset Canggu – Premium Beachside Investment',
  'Luxurious 3-bedroom villa in the heart of Canggu with infinity pool, rooftop terrace, and ocean views. Fully furnished with Scandinavian interior design. Ideal for short-term rental with proven 18% annual yield.',
  'villa', 'sale', 4500000000,
  'Jl. Pantai Batu Bolong No. 45, Canggu, Bali',
  'Bali', 'Badung',
  3, 3, 280, 350, 280, 2, true, 'fully_furnished', 'ocean',
  'active', 'approved', 'completed', true, true, 22.5, 18.0, true,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  '{"swimming_pool": true, "rooftop_terrace": true, "garden": true, "parking": true, "security_24h": true, "wifi": true}'::jsonb
),
(
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'Townhouse Modern Menteng – Heritage District',
  'Elegant 4-bedroom townhouse in Jakarta most prestigious neighborhood. Recently renovated with smart home technology. Perfect for expatriate families or long-term rental.',
  'townhouse', 'sale', 12000000000,
  'Jl. Menteng Raya No. 12, Menteng, Jakarta Pusat',
  'DKI Jakarta', 'Jakarta Pusat',
  4, 3, 320, 200, 320, 3, false, 'fully_furnished', 'city',
  'active', 'approved', 'completed', true, false, 12.0, 8.5, false,
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800'],
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  '{"smart_home": true, "garden": true, "parking": true, "security_24h": true, "ac": true}'::jsonb
),
(
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'Villa Tropical Ubud – Jungle Retreat with Rice Field View',
  'Stunning 2-bedroom eco-villa surrounded by tropical jungle and rice terraces. Features open-air living, private pool, and yoga deck. Top-performing Airbnb listing with 92% occupancy rate.',
  'villa', 'sale', 2800000000,
  'Jl. Raya Tegallalang, Ubud, Bali',
  'Bali', 'Gianyar',
  2, 2, 180, 400, 180, 1, true, 'fully_furnished', 'rice_field',
  'active', 'approved', 'completed', false, true, 28.0, 22.0, true,
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
  '{"swimming_pool": true, "yoga_deck": true, "garden": true, "rice_field_view": true, "eco_friendly": true, "wifi": true}'::jsonb
),
(
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'Apartment Premium BSD City – Smart Living Hub',
  'Brand new 2-bedroom apartment in BSD City emerging tech district. Strategic location near AEON Mall, ICE Convention Center, and upcoming MRT station.',
  'apartment', 'sale', 850000000,
  'The Breeze BSD, Jl. BSD Raya Utama, Tangerang Selatan',
  'Banten', 'Tangerang Selatan',
  2, 1, 65, null, 65, 1, false, 'semi_furnished', 'city',
  'active', 'approved', 'completed', false, false, 15.0, 10.0, false,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
  '{"gym": true, "swimming_pool_shared": true, "parking": true, "security_24h": true, "near_mrt": true}'::jsonb
),
(
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'Villa Cliffside Uluwatu – Ultra Luxury Ocean Estate',
  'Breathtaking 5-bedroom cliffside estate with 180 degree Indian Ocean panorama. Features 25-meter infinity pool, private beach access, home cinema, and wine cellar.',
  'villa', 'sale', 35000000000,
  'Jl. Labuan Sait, Pecatu, Uluwatu, Bali',
  'Bali', 'Badung',
  5, 6, 850, 1200, 850, 3, true, 'fully_furnished', 'ocean',
  'active', 'approved', 'completed', true, true, 18.0, 14.0, true,
  ARRAY['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
  '{"infinity_pool": true, "private_beach": true, "home_cinema": true, "wine_cellar": true, "helipad": true, "security_24h": true, "smart_home": true, "garden": true}'::jsonb
);
