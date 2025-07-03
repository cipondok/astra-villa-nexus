-- Link service categories (4th level) to approved service names (3rd level)
-- Update some service categories to link them to approved service names

UPDATE public.vendor_service_categories SET 
approved_service_name_id = (SELECT id FROM approved_service_names WHERE service_name = 'Electrical Installation' LIMIT 1),
implementation_type = 'Residential'
WHERE name = 'Electrical' AND implementation_type IS NULL;

UPDATE public.vendor_service_categories SET 
approved_service_name_id = (SELECT id FROM approved_service_names WHERE service_name = 'Smart Home Setup' LIMIT 1),
implementation_type = 'Full System'
WHERE name = 'Home Automation' AND implementation_type IS NULL;

UPDATE public.vendor_service_categories SET 
approved_service_name_id = (SELECT id FROM approved_service_names WHERE service_name = 'Plumbing Services' LIMIT 1),
implementation_type = 'Residential'
WHERE name = 'Plumbing' AND implementation_type IS NULL;

UPDATE public.vendor_service_categories SET 
approved_service_name_id = (SELECT id FROM approved_service_names WHERE service_name = 'House Cleaning' LIMIT 1),
implementation_type = 'Regular Cleaning'
WHERE name = 'Cleaning' AND implementation_type IS NULL;

-- Add some implementation type examples for testing
INSERT INTO public.vendor_service_categories (name, description, icon, approved_service_name_id, implementation_type) VALUES
('Residential Electrical', 'Residential electrical implementation', '🏡', (SELECT id FROM approved_service_names WHERE service_name = 'Electrical Installation'), 'Residential'),
('Commercial Electrical', 'Commercial electrical implementation', '🏢', (SELECT id FROM approved_service_names WHERE service_name = 'Electrical Installation'), 'Commercial'),
('Industrial Electrical', 'Industrial electrical implementation', '🏭', (SELECT id FROM approved_service_names WHERE service_name = 'Electrical Installation'), 'Industrial'),
('Smart Home Basic', 'Basic smart home setup', '📱', (SELECT id FROM approved_service_names WHERE service_name = 'Smart Home Setup'), 'Basic Setup'),
('Smart Home Premium', 'Premium smart home setup', '🏠', (SELECT id FROM approved_service_names WHERE service_name = 'Smart Home Setup'), 'Premium Setup');