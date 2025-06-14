
-- Add demo properties for search testing
INSERT INTO public.properties (
  title, 
  description, 
  property_type, 
  listing_type, 
  location, 
  city, 
  state, 
  price, 
  bedrooms, 
  bathrooms, 
  area_sqm, 
  status,
  owner_id,
  images
) VALUES 
  ('Luxury Penthouse Jakarta Central', 'Stunning penthouse with panoramic city views in Central Jakarta. Features modern amenities and premium finishes.', 'apartment', 'sale', 'Central Jakarta, Menteng', 'Jakarta', 'DKI Jakarta', 3500000000, 3, 3, 250, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop']),
  
  ('Beachfront Villa Bali Canggu', 'Magnificent 5-bedroom villa with direct beach access in Canggu. Perfect for vacation rental or family living.', 'villa', 'rent', 'Canggu Beach, Bali', 'Denpasar', 'Bali', 45000000, 5, 4, 450, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=600&fit=crop']),
  
  ('Modern Townhouse Surabaya', 'Contemporary 3-story townhouse in premium residential area of East Surabaya. Great for families.', 'house', 'sale', 'East Surabaya, Rungkut', 'Surabaya', 'East Java', 1800000000, 4, 3, 180, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800&h=600&fit=crop']),
  
  ('Studio Apartment Bandung', 'Cozy studio apartment near ITB campus. Perfect for students or young professionals.', 'apartment', 'rent', 'Dago, Bandung', 'Bandung', 'West Java', 3500000, 1, 1, 35, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1460574283810-2aab119d8511?w=800&h=600&fit=crop']),
  
  ('Traditional Jogja House', 'Authentic Javanese house with traditional architecture in the heart of Yogyakarta cultural district.', 'house', 'sale', 'Malioboro Street, Yogyakarta', 'Yogyakarta', 'DIY Yogyakarta', 950000000, 3, 2, 150, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop']),
  
  ('Commercial Space Jakarta', 'Prime commercial space in busy business district. Ideal for retail or office use.', 'commercial', 'lease', 'Sudirman, Jakarta', 'Jakarta', 'DKI Jakarta', 25000000, 0, 2, 200, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1527576539890-dfa815648363?w=800&h=600&fit=crop']),
  
  ('Minimalist House Tangerang', 'Modern minimalist design house in gated community. Safe and family-friendly environment.', 'house', 'sale', 'BSD City, Tangerang', 'Tangerang', 'Banten', 1250000000, 3, 2, 120, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=800&h=600&fit=crop']),
  
  ('Luxury Villa Ubud Bali', 'Serene villa surrounded by rice fields and tropical gardens. Perfect retreat location.', 'villa', 'rent', 'Ubud Center, Bali', 'Denpasar', 'Bali', 35000000, 4, 3, 300, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&h=600&fit=crop']),
  
  ('Apartment Seminyak Bali', 'Stylish 2-bedroom apartment near beach and nightlife. Fully furnished with modern amenities.', 'apartment', 'rent', 'Seminyak Beach, Bali', 'Denpasar', 'Bali', 18000000, 2, 2, 95, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1551038247-3d9af20df552?w=800&h=600&fit=crop']),
  
  ('Investment Land Bekasi', 'Strategic land for development near new toll road. Great investment opportunity.', 'land', 'sale', 'Cikarang, Bekasi', 'Bekasi', 'West Java', 500000000, 0, 0, 1000, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=600&fit=crop']),
  
  ('Family House Medan', 'Spacious family house with large garden in quiet residential area of Medan.', 'house', 'sale', 'Medan Polonia', 'Medan', 'North Sumatra', 750000000, 4, 3, 200, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1439886183900-e79ec0057170?w=800&h=600&fit=crop']),
  
  ('Kost Exclusive Jakarta', 'Premium boarding house near universities. Individual AC, WiFi, and security.', 'house', 'rent', 'Salemba, Jakarta', 'Jakarta', 'DKI Jakarta', 2500000, 1, 1, 25, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop'])

ON CONFLICT DO NOTHING;
