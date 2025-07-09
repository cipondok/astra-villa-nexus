-- Update existing services with appropriate categories
UPDATE vendor_services 
SET service_category = 'Cleaning',
    updated_at = now()
WHERE service_name IN ('Cloth Longniddry', 'Cleaning') 
  AND service_category IS NULL;

-- Let's also create some sample services to populate the services page better
INSERT INTO vendor_services (
  vendor_id,
  service_name,
  service_category,
  service_description,
  location_type,
  duration_value,
  duration_unit,
  currency,
  admin_approval_status,
  is_active
) VALUES 
-- Use the existing vendor ID from the current services
((SELECT vendor_id FROM vendor_services LIMIT 1), 
 'Deep House Cleaning', 
 'Cleaning', 
 'Comprehensive deep cleaning service for your entire home including all rooms, kitchen, and bathrooms',
 'on_site',
 4,
 'hours',
 'IDR',
 'approved',
 true),

((SELECT vendor_id FROM vendor_services LIMIT 1), 
 'Electrical Repairs', 
 'Electrical', 
 'Professional electrical repair and installation services for residential properties',
 'on_site',
 2,
 'hours',
 'IDR',
 'approved',
 true),

((SELECT vendor_id FROM vendor_services LIMIT 1), 
 'Plumbing Services', 
 'Plumbing', 
 'Complete plumbing solutions including repairs, installations, and maintenance',
 'on_site',
 3,
 'hours',
 'IDR',
 'approved',
 true),

((SELECT vendor_id FROM vendor_services LIMIT 1), 
 'Interior Painting', 
 'Painting', 
 'Professional interior painting services with premium quality paints and finishes',
 'on_site',
 6,
 'hours',
 'IDR',
 'approved',
 true),

((SELECT vendor_id FROM vendor_services LIMIT 1), 
 'Garden Landscaping', 
 'Landscaping', 
 'Complete landscaping services including garden design, plant installation, and maintenance',
 'on_site',
 8,
 'hours',
 'IDR',
 'approved',
 true);