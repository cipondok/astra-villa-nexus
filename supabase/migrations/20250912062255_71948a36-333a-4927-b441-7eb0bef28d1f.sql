-- Create sample vendor business profiles and services for the existing vendor
INSERT INTO vendor_business_profiles (
  id,
  vendor_id,
  business_name,
  business_type,
  business_description,
  business_phone,
  business_email,
  rating,
  total_reviews,
  is_verified,
  is_active
) VALUES 
(
  gen_random_uuid(),
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'CleanPro Services',
  'cleaning',
  'Professional cleaning services for homes and offices',
  '+62-21-123-4567',
  'info@cleanpro.id',
  4.8,
  127,
  true,
  true
),
(
  gen_random_uuid(),
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'GreenThumb Landscaping',
  'landscaping',
  'Complete landscaping and garden maintenance services',
  '+62-21-234-5678',
  'contact@greenthumb.id',
  4.6,
  89,
  true,
  true
),
(
  gen_random_uuid(),
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  'FixIt Repair Services',
  'maintenance',
  'Home repair and maintenance solutions',
  '+62-21-345-6789',
  'hello@fixit.id',
  4.7,
  156,
  true,
  true
);

-- Now insert sample services using the business profiles we just created
INSERT INTO vendor_services (
  id,
  vendor_id,
  service_name,
  service_description,
  main_category_id,
  price_range,
  duration_value,
  duration_unit,
  service_location_city,
  is_active,
  admin_approval_status,
  featured,
  rating
) 
SELECT 
  gen_random_uuid(),
  'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee',
  CASE 
    WHEN vbp.business_name = 'CleanPro Services' THEN 'Deep House Cleaning'
    WHEN vbp.business_name = 'GreenThumb Landscaping' THEN 'Garden Design & Maintenance'
    WHEN vbp.business_name = 'FixIt Repair Services' THEN 'Home Appliance Repair'
  END,
  CASE 
    WHEN vbp.business_name = 'CleanPro Services' THEN 'Complete deep cleaning service for your home including all rooms, kitchen, and bathrooms'
    WHEN vbp.business_name = 'GreenThumb Landscaping' THEN 'Professional garden design, planting, and ongoing maintenance services'
    WHEN vbp.business_name = 'FixIt Repair Services' THEN 'Expert repair services for all major home appliances including warranty'
  END,
  '8f991bae-7636-43bf-83f3-241993a027bf',
  CASE 
    WHEN vbp.business_name = 'CleanPro Services' THEN '{"min": 150000, "max": 500000}'::jsonb
    WHEN vbp.business_name = 'GreenThumb Landscaping' THEN '{"min": 300000, "max": 1500000}'::jsonb
    WHEN vbp.business_name = 'FixIt Repair Services' THEN '{"min": 100000, "max": 800000}'::jsonb
  END,
  CASE 
    WHEN vbp.business_name = 'CleanPro Services' THEN 3
    WHEN vbp.business_name = 'GreenThumb Landscaping' THEN 4
    WHEN vbp.business_name = 'FixIt Repair Services' THEN 2
  END,
  'hours',
  'Jakarta',
  true,
  'approved',
  CASE WHEN vbp.business_name = 'CleanPro Services' THEN true ELSE false END,
  vbp.rating
FROM vendor_business_profiles vbp
WHERE vbp.vendor_id = 'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee'
  AND vbp.business_name IN ('CleanPro Services', 'GreenThumb Landscaping', 'FixIt Repair Services');