
-- Add more comprehensive demo properties for testing
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
  image_urls
) VALUES 
  ('Executive Apartment Kemang', 'High-end apartment in prestigious Kemang area with swimming pool and gym facilities.', 'apartment', 'rent', 'Kemang, South Jakarta', 'Jakarta', 'DKI Jakarta', 12000000, 2, 2, 85, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop']),
  
  ('Cozy House Depok', 'Affordable family house in quiet neighborhood with garden and parking space.', 'house', 'sale', 'Margonda Raya, Depok', 'Depok', 'West Java', 850000000, 3, 2, 100, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop']),
  
  ('Beachfront Resort Lombok', 'Exclusive resort property with private beach access and luxury amenities.', 'villa', 'sale', 'Senggigi Beach, Lombok', 'Mataram', 'West Nusa Tenggara', 5500000000, 6, 5, 500, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop']),
  
  ('Modern Loft Malang', 'Industrial-style loft apartment perfect for young professionals and creatives.', 'apartment', 'rent', 'Klojen, Malang', 'Malang', 'East Java', 4500000, 1, 1, 60, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop']),
  
  ('Shophouse Pontianak', 'Strategic shophouse in busy commercial area, perfect for business and investment.', 'commercial', 'sale', 'Jl. Gajah Mada, Pontianak', 'Pontianak', 'West Kalimantan', 1200000000, 0, 3, 150, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop']),
  
  ('Mountain Villa Puncak', 'Cool mountain retreat with panoramic views and fresh air atmosphere.', 'villa', 'rent', 'Puncak Pass, Bogor', 'Bogor', 'West Java', 8000000, 4, 3, 200, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop']),
  
  ('Compact Studio Surakarta', 'Efficient studio apartment near Universitas Sebelas Maret with modern facilities.', 'apartment', 'rent', 'Jebres, Surakarta', 'Surakarta', 'Central Java', 2800000, 1, 1, 25, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop']),
  
  ('Warehouse Karawang', 'Large warehouse facility for industrial use with loading dock and office space.', 'commercial', 'lease', 'Telukjambe, Karawang', 'Karawang', 'West Java', 45000000, 0, 2, 1200, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop']),
  
  ('Heritage House Semarang', 'Colonial-style heritage house with authentic architecture and historical value.', 'house', 'sale', 'Kota Lama, Semarang', 'Semarang', 'Central Java', 1650000000, 4, 3, 220, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop']),
  
  ('Luxury Condo Makassar', 'Premium condominium with city skyline views and 5-star facilities.', 'apartment', 'sale', 'Sudirman, Makassar', 'Makassar', 'South Sulawesi', 2800000000, 3, 2, 140, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop']),
  
  ('Affordable Townhouse Bekasi', 'Budget-friendly townhouse in family-oriented cluster with playground.', 'house', 'sale', 'Grand Galaxy City, Bekasi', 'Bekasi', 'West Java', 650000000, 2, 2, 72, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop']),
  
  ('Waterfront Villa Manado', 'Stunning waterfront villa with private dock and ocean access.', 'villa', 'rent', 'Boulevard, Manado', 'Manado', 'North Sulawesi', 25000000, 3, 3, 180, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop']),
  
  ('Office Space Medan', 'Modern office space in central business district with parking facilities.', 'commercial', 'lease', 'Jl. Imam Bonjol, Medan', 'Medan', 'North Sumatra', 15000000, 0, 4, 300, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop']),
  
  ('Garden House Cimahi', 'Peaceful house with large garden perfect for families with children.', 'house', 'sale', 'Cimahi Utara', 'Cimahi', 'West Java', 980000000, 3, 2, 150, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop']),
  
  ('Penthouse Surabaya', 'Exclusive penthouse with rooftop terrace and 360-degree city views.', 'apartment', 'sale', 'Tunjungan Plaza Area', 'Surabaya', 'East Java', 4200000000, 4, 3, 280, 'approved', (SELECT id FROM auth.users LIMIT 1), ARRAY['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop'])

ON CONFLICT DO NOTHING;
