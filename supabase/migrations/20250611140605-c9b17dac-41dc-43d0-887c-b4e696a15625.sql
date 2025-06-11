
-- Insert main categories
INSERT INTO public.vendor_service_categories (name, description, icon, display_order) VALUES
('Construction & Renovation', 'Building, renovation, and construction services', '🏗️', 1),
('Interior Design', 'Interior design and space planning services', '🎨', 2),
('Landscaping', 'Garden design and outdoor space services', '🌿', 3),
('Cleaning & Maintenance', 'Cleaning and property maintenance services', '🧹', 4),
('Smart Home Technology', 'Home automation and technology services', '💻', 5),
('Real Estate Services', 'Property-related professional services', '🏘️', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Construction & Renovation
INSERT INTO public.vendor_service_categories (name, description, icon, display_order) VALUES
('Home Construction', 'Complete home building services', '🏠', 101),
('Interior Renovation', 'Interior remodeling and renovation', '🔨', 102),
('Structural Repairs', 'Building structural repair services', '🔧', 103),
('Extension Building', 'Home extension and addition services', '📐', 104)
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Interior Design
INSERT INTO public.vendor_service_categories (name, description, icon, display_order) VALUES
('Space Planning', 'Room layout and space optimization', '📏', 201),
('Furniture Selection', 'Furniture consultation and selection', '🪑', 202),
('Lighting Design', 'Interior lighting design and installation', '💡', 203),
('Color Consultation', 'Color scheme and palette consultation', '🎨', 204)
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Landscaping
INSERT INTO public.vendor_service_categories (name, description, icon, display_order) VALUES
('Garden Design', 'Garden planning and landscape design', '🌻', 301),
('Lawn Maintenance', 'Grass cutting and lawn care services', '🌱', 302),
('Irrigation Systems', 'Sprinkler and watering system installation', '💧', 303),
('Outdoor Lighting', 'Garden and outdoor lighting installation', '🔆', 304)
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Cleaning & Maintenance
INSERT INTO public.vendor_service_categories (name, description, icon, display_order) VALUES
('Deep Cleaning', 'Thorough cleaning and sanitization services', '🧽', 401),
('Pool Maintenance', 'Swimming pool cleaning and maintenance', '🏊', 402),
('Pest Control', 'Pest prevention and elimination services', '🐜', 403),
('HVAC Servicing', 'Heating, ventilation, and air conditioning services', '❄️', 404)
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Smart Home Technology
INSERT INTO public.vendor_service_categories (name, description, icon, display_order) VALUES
('Home Automation', 'Smart home system installation and setup', '🏡', 501),
('Security Systems', 'Home security and surveillance systems', '🔒', 502),
('Audio-Visual Setup', 'Entertainment system installation', '📺', 503),
('Network Installation', 'Home networking and WiFi setup', '📶', 504)
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Real Estate Services
INSERT INTO public.vendor_service_categories (name, description, icon, display_order) VALUES
('Property Valuation', 'Real estate appraisal and valuation', '💰', 601),
('Home Staging', 'Property staging for sale or rent', '🏆', 602),
('Legal Consultation', 'Real estate legal advice and services', '⚖️', 603),
('Relocation Services', 'Moving and relocation assistance', '📦', 604)
ON CONFLICT (name) DO NOTHING;
