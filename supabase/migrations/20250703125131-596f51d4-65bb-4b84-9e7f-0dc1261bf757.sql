-- Add more service names with category relationships
INSERT INTO public.approved_service_names (service_name, description, category_id) VALUES
-- Home Services
('Deep House Cleaning', 'Comprehensive deep cleaning for homes', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%cleaning%' LIMIT 1)),
('Move-in/Move-out Cleaning', 'Specialized cleaning for property transitions', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%cleaning%' LIMIT 1)),
('Office Cleaning Services', 'Commercial office cleaning', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%cleaning%' LIMIT 1)),

-- Technical Services  
('HVAC Installation', 'Heating, ventilation, and air conditioning installation', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%technical%' LIMIT 1)),
('Smart Home Setup', 'Installation and configuration of smart home devices', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%technical%' LIMIT 1)),
('Network Installation', 'Home and office network setup', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%technical%' LIMIT 1)),

-- Repair Services
('Motorcycle Repair', 'Motorcycle maintenance and repair services', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%repair%' LIMIT 1)),
('Computer Repair', 'Laptop and desktop computer repair', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%repair%' LIMIT 1)),
('Mobile Phone Repair', 'Smartphone and tablet repair services', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%repair%' LIMIT 1)),

-- Beauty & Wellness
('Hair Cutting & Styling', 'Professional hair services', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%beauty%' LIMIT 1)),
('Massage Therapy', 'Therapeutic and relaxation massage', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%beauty%' LIMIT 1)),
('Nail Services', 'Manicure, pedicure, and nail art', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%beauty%' LIMIT 1)),

-- Education & Training
('Private Tutoring', 'One-on-one academic tutoring', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%education%' LIMIT 1)),
('Language Classes', 'Foreign language instruction', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%education%' LIMIT 1)),
('Music Lessons', 'Individual music instrument lessons', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%education%' LIMIT 1)),

-- Event Services
('Wedding Photography', 'Professional wedding photography services', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%event%' LIMIT 1)),
('Catering Services', 'Event and party catering', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%event%' LIMIT 1)),
('Event Planning', 'Complete event planning and coordination', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%event%' LIMIT 1)),

-- Transportation
('Moving Services', 'Residential and commercial moving', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%transport%' LIMIT 1)),
('Delivery Services', 'Package and goods delivery', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%transport%' LIMIT 1)),
('Car Wash & Detailing', 'Automotive cleaning and detailing', (SELECT id FROM vendor_service_categories WHERE name ILIKE '%transport%' LIMIT 1));

-- Update existing service names to have proper category associations
UPDATE public.approved_service_names SET 
category_id = (SELECT id FROM vendor_service_categories WHERE name ILIKE '%home%' OR name ILIKE '%maintenance%' LIMIT 1)
WHERE service_name IN ('AC Repair & Maintenance', 'Plumbing Services', 'Electrical Installation', 'Appliance Repair');

UPDATE public.approved_service_names SET 
category_id = (SELECT id FROM vendor_service_categories WHERE name ILIKE '%cleaning%' LIMIT 1)
WHERE service_name = 'House Cleaning';

UPDATE public.approved_service_names SET 
category_id = (SELECT id FROM vendor_service_categories WHERE name ILIKE '%security%' LIMIT 1)
WHERE service_name = 'Home Security Installation';

UPDATE public.approved_service_names SET 
category_id = (SELECT id FROM vendor_service_categories WHERE name ILIKE '%garden%' OR name ILIKE '%landscape%' LIMIT 1)
WHERE service_name = 'Landscaping & Gardening';