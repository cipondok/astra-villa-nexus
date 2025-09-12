-- Clear existing vendor categories to start fresh
TRUNCATE vendor_main_categories, vendor_subcategories CASCADE;

-- Insert main categories for ASTRA Villa services
INSERT INTO vendor_main_categories (name, description, icon, display_order, type, is_active) VALUES
-- 1. Property Services
('Property Services', 'Comprehensive property management, legal, and financial services', '🏠', 1, 'service', true),

-- 2. Home & Lifestyle Services  
('Home & Lifestyle Services', 'Complete home maintenance, renovation, and lifestyle enhancement services', '🏡', 2, 'service', true),

-- 3. Lifestyle & Daily Needs (Door-to-Door)
('Lifestyle & Daily Needs', 'Convenient door-to-door services for daily lifestyle needs', '🚪', 3, 'service', true),

-- 4. Vendor & Client Marketplace
('Vendor & Client Marketplace', 'Platform connecting specialized vendors with clients', '🤝', 4, 'service', true),

-- 5. Extra Value Services
('Extra Value Services', 'Premium concierge and technology-enhanced services', '⭐', 5, 'service', true);

-- Insert subcategories for Property Services
INSERT INTO vendor_subcategories (main_category_id, name, description, icon, display_order, is_active) 
SELECT 
  id as main_category_id,
  subcategory_name,
  subcategory_description,
  subcategory_icon,
  subcategory_order,
  true
FROM vendor_main_categories vmc,
(VALUES 
  ('Property Services', 'Property Management', 'Complete property management solutions', '📊', 1),
  ('Property Services', 'Leasing & Rentals', 'Comprehensive rental and leasing services', '🏠', 2),
  ('Property Services', 'Documentation', 'Legal documentation and certification services', '📄', 3),
  
  ('Home & Lifestyle Services', 'Cleaning Services', 'Professional cleaning solutions for all spaces', '🧹', 1),
  ('Home & Lifestyle Services', 'Renovation & Repairs', 'Complete renovation and repair services', '🔨', 2),
  ('Home & Lifestyle Services', 'Security & Installations', 'Security systems and smart home installations', '🔒', 3),
  ('Home & Lifestyle Services', 'Furniture & Interior', 'Furniture sales, installation, and interior design', '🛋️', 4),
  
  ('Lifestyle & Daily Needs', 'Laundry & Cleaning', 'Door-to-door laundry and cleaning services', '👕', 1),
  ('Lifestyle & Daily Needs', 'Home Shifting & Logistics', 'Complete moving and logistics solutions', '📦', 2),
  ('Lifestyle & Daily Needs', 'On-Demand Home Services', 'Quick on-demand repair and maintenance services', '⚡', 3),
  
  ('Vendor & Client Marketplace', 'Property Service Vendors', 'Specialized property service providers', '🏢', 1),
  ('Vendor & Client Marketplace', 'Cleaning & Repair Vendors', 'Professional cleaning and repair specialists', '🧽', 2),
  ('Vendor & Client Marketplace', 'Security & Furniture Vendors', 'Security and furniture solution providers', '🛡️', 3),
  ('Vendor & Client Marketplace', 'Interior Designers / Architects', 'Professional design and architecture services', '📐', 4),
  ('Vendor & Client Marketplace', 'Commission & Subscriptions', 'Vendor commission and subscription management', '💰', 5),
  
  ('Extra Value Services', 'ASTRA Villa Concierge', 'Premium concierge and VIP services', '🎩', 1),
  ('Extra Value Services', 'Technology Integration', 'Advanced technology solutions and virtual services', '💻', 2)
) AS subcats(main_name, subcategory_name, subcategory_description, subcategory_icon, subcategory_order)
WHERE vmc.name = subcats.main_name;