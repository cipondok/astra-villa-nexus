
-- Insert demo properties for Property Owner dashboard
-- Using cs@astravilla.com user ID

-- First, let's get the user ID for cs@astravilla.com
-- We'll use a direct insert assuming the user exists

INSERT INTO public.properties (
  owner_id,
  title,
  description,
  property_type,
  listing_type,
  location,
  price,
  bedrooms,
  bathrooms,
  area_sqm,
  status,
  approval_status,
  images,
  created_at
) VALUES 
-- Property 1: Luxury Villa in Bali
(
  (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1),
  'Luxury Beachfront Villa in Seminyak',
  'Stunning 4-bedroom villa with private pool, ocean views, and modern amenities. Perfect for vacation rentals or permanent residence. Features marble floors, high-end appliances, and tropical garden.',
  'villa',
  'sale',
  'Seminyak, Bali',
  8500000000,
  4,
  3,
  450,
  'active',
  'approved',
  ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
  ],
  NOW()
),

-- Property 2: Modern Apartment in Jakarta
(
  (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1),
  'Modern Penthouse Apartment SCBD',
  'Contemporary 3-bedroom penthouse in Jakarta''s business district. Floor-to-ceiling windows, premium finishes, and city skyline views. Building amenities include gym, pool, and 24/7 security.',
  'apartment',
  'rent',
  'SCBD, Jakarta Selatan',
  25000000,
  3,
  2,
  180,
  'active',
  'approved',
  ARRAY[
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560449752-4f9df4963a50?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop'
  ],
  NOW()
),

-- Property 3: Traditional House in Yogyakarta
(
  (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1),
  'Traditional Javanese House with Modern Touch',
  'Beautifully restored traditional Joglo house combining heritage architecture with modern conveniences. Large courtyard, teak wood structure, and authentic cultural elements.',
  'house',
  'sale',
  'Kotagede, Yogyakarta',
  2750000000,
  5,
  4,
  320,
  'active',
  'pending',
  ARRAY[
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
  ],
  NOW()
),

-- Property 4: Commercial Space in Surabaya
(
  (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1),
  'Prime Commercial Space Tunjungan Plaza Area',
  'Strategic commercial property in Surabaya''s business hub. Ground floor retail space with high foot traffic, perfect for restaurants, cafes, or retail stores. Ready for immediate occupancy.',
  'commercial',
  'lease',
  'Tunjungan, Surabaya',
  150000000,
  0,
  2,
  200,
  'active',
  'approved',
  ARRAY[
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'
  ],
  NOW()
),

-- Property 5: Investment Land in Bandung
(
  (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1),
  'Prime Development Land in Bandung Hills',
  'Excellent investment opportunity! 2000 sqm of development-ready land in prestigious Bandung hills area. Perfect for luxury residential development or resort project. Clear certificates and permits.',
  'land',
  'sale',
  'Lembang, Bandung',
  5200000000,
  NULL,
  NULL,
  2000,
  'active',
  'approved',
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  ],
  NOW()
);

-- Update property features for better demo data
UPDATE public.properties 
SET property_features = jsonb_build_object(
  'parking', true,
  'security', true,
  'pool', true,
  'garden', true,
  'furnished', true,
  'air_conditioning', true,
  'internet', true
)
WHERE owner_id = (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1)
  AND property_type = 'villa';

UPDATE public.properties 
SET property_features = jsonb_build_object(
  'parking', true,
  'security', true,
  'gym', true,
  'elevator', true,
  'furnished', true,
  'air_conditioning', true,
  'internet', true,
  'balcony', true
)
WHERE owner_id = (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1)
  AND property_type = 'apartment';

UPDATE public.properties 
SET property_features = jsonb_build_object(
  'parking', true,
  'security', false,
  'garden', true,
  'traditional_architecture', true,
  'renovated', true,
  'air_conditioning', true,
  'internet', true
)
WHERE owner_id = (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1)
  AND property_type = 'house';

UPDATE public.properties 
SET property_features = jsonb_build_object(
  'parking', true,
  'security', true,
  'high_traffic', true,
  'ground_floor', true,
  'ready_to_occupy', true,
  'air_conditioning', true,
  'internet', true
)
WHERE owner_id = (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1)
  AND property_type = 'commercial';

UPDATE public.properties 
SET property_features = jsonb_build_object(
  'clear_certificate', true,
  'development_ready', true,
  'hill_view', true,
  'strategic_location', true,
  'investment_grade', true
)
WHERE owner_id = (SELECT id FROM public.profiles WHERE email = 'cs@astravilla.com' LIMIT 1)
  AND property_type = 'land';
