-- Clear existing vendor categories to start fresh
TRUNCATE vendor_service_categories, vendor_subcategories CASCADE;

-- Insert main categories for ASTRA Villa services
INSERT INTO vendor_service_categories (name, description, icon, display_order, type, is_active) VALUES
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
FROM vendor_service_categories vsc,
(VALUES 
  ('Property Services', 'Property Management', 'Complete property management solutions', '📊', 1),
  ('Property Services', 'Leasing & Rentals', 'Comprehensive rental and leasing services', '🏠', 2),
  ('Property Services', 'Documentation', 'Legal documentation and certification services', '📄', 3)
) AS subcats(main_name, subcategory_name, subcategory_description, subcategory_icon, subcategory_order)
WHERE vsc.name = subcats.main_name;

-- Insert subcategories for Home & Lifestyle Services
INSERT INTO vendor_subcategories (main_category_id, name, description, icon, display_order, is_active)
SELECT 
  id as main_category_id,
  subcategory_name,
  subcategory_description,
  subcategory_icon,
  subcategory_order,
  true
FROM vendor_service_categories vsc,
(VALUES 
  ('Home & Lifestyle Services', 'Cleaning Services', 'Professional cleaning solutions for all spaces', '🧹', 1),
  ('Home & Lifestyle Services', 'Renovation & Repairs', 'Complete renovation and repair services', '🔨', 2),
  ('Home & Lifestyle Services', 'Security & Installations', 'Security systems and smart home installations', '🔒', 3),
  ('Home & Lifestyle Services', 'Furniture & Interior', 'Furniture sales, installation, and interior design', '🛋️', 4)
) AS subcats(main_name, subcategory_name, subcategory_description, subcategory_icon, subcategory_order)
WHERE vsc.name = subcats.main_name;

-- Insert subcategories for Lifestyle & Daily Needs
INSERT INTO vendor_subcategories (main_category_id, name, description, icon, display_order, is_active)
SELECT 
  id as main_category_id,
  subcategory_name,
  subcategory_description,
  subcategory_icon,
  subcategory_order,
  true
FROM vendor_service_categories vsc,
(VALUES 
  ('Lifestyle & Daily Needs', 'Laundry & Cleaning', 'Door-to-door laundry and cleaning services', '👕', 1),
  ('Lifestyle & Daily Needs', 'Home Shifting & Logistics', 'Complete moving and logistics solutions', '📦', 2),
  ('Lifestyle & Daily Needs', 'On-Demand Home Services', 'Quick on-demand repair and maintenance services', '⚡', 3)
) AS subcats(main_name, subcategory_name, subcategory_description, subcategory_icon, subcategory_order)
WHERE vsc.name = subcats.main_name;

-- Insert subcategories for Vendor & Client Marketplace
INSERT INTO vendor_subcategories (main_category_id, name, description, icon, display_order, is_active)
SELECT 
  id as main_category_id,
  subcategory_name,
  subcategory_description,
  subcategory_icon,
  subcategory_order,
  true
FROM vendor_service_categories vsc,
(VALUES 
  ('Vendor & Client Marketplace', 'Property Service Vendors', 'Specialized property service providers', '🏢', 1),
  ('Vendor & Client Marketplace', 'Cleaning & Repair Vendors', 'Professional cleaning and repair specialists', '🧽', 2),
  ('Vendor & Client Marketplace', 'Security & Furniture Vendors', 'Security and furniture solution providers', '🛡️', 3),
  ('Vendor & Client Marketplace', 'Interior Designers / Architects', 'Professional design and architecture services', '📐', 4),
  ('Vendor & Client Marketplace', 'Commission & Subscriptions', 'Vendor commission and subscription management', '💰', 5)
) AS subcats(main_name, subcategory_name, subcategory_description, subcategory_icon, subcategory_order)
WHERE vsc.name = subcats.main_name;

-- Insert subcategories for Extra Value Services
INSERT INTO vendor_subcategories (main_category_id, name, description, icon, display_order, is_active)
SELECT 
  id as main_category_id,
  subcategory_name,
  subcategory_description,
  subcategory_icon,
  subcategory_order,
  true
FROM vendor_service_categories vsc,
(VALUES 
  ('Extra Value Services', 'ASTRA Villa Concierge', 'Premium concierge and VIP services', '🎩', 1),
  ('Extra Value Services', 'Technology Integration', 'Advanced technology solutions and virtual services', '💻', 2)
) AS subcats(main_name, subcategory_name, subcategory_description, subcategory_icon, subcategory_order)
WHERE vsc.name = subcats.main_name;

-- Insert approved service names for detailed services under Property Management
INSERT INTO approved_service_names (service_name, category_id, subcategory_id, is_active, display_order)
SELECT 
  service_name,
  vsc.id as category_id,
  vsub.id as subcategory_id,
  true,
  service_order
FROM vendor_service_categories vsc
JOIN vendor_subcategories vsub ON vsc.id = vsub.main_category_id,
(VALUES 
  ('Property Services', 'Property Management', 'Buy & Sell Transactions', 1),
  ('Property Services', 'Property Management', 'Ownership Name Change / Shift', 2),
  ('Property Services', 'Property Management', 'Legal Settlement (Notary, PPAT, IMB, AJB)', 3),
  ('Property Services', 'Property Management', 'KPR (Mortgage) Processing', 4),
  ('Property Services', 'Property Management', 'Bank Loan Assistance', 5),
  ('Property Services', 'Property Management', 'Property Tax & BPHTB', 6),
  
  ('Property Services', 'Leasing & Rentals', 'Tenant Search & Screening', 1),
  ('Property Services', 'Leasing & Rentals', 'Rental Agreement Drafting', 2),
  ('Property Services', 'Leasing & Rentals', 'Rent Collection & Monitoring', 3),
  ('Property Services', 'Leasing & Rentals', 'Short-Term (Airbnb / Staycation)', 4),
  
  ('Property Services', 'Documentation', 'Title Deed Services', 1),
  ('Property Services', 'Documentation', 'Certification & Permits', 2),
  ('Property Services', 'Documentation', 'Dispute Resolution', 3),
  
  ('Home & Lifestyle Services', 'Cleaning Services', 'General Cleaning (Daily/Weekly)', 1),
  ('Home & Lifestyle Services', 'Cleaning Services', 'Deep Cleaning (Villa/Office)', 2),
  ('Home & Lifestyle Services', 'Cleaning Services', 'Carpet, Sofa, Mattress Cleaning', 3),
  ('Home & Lifestyle Services', 'Cleaning Services', 'Pool & Garden Cleaning', 4),
  
  ('Home & Lifestyle Services', 'Renovation & Repairs', 'Painting & Wall Finishing', 1),
  ('Home & Lifestyle Services', 'Renovation & Repairs', 'Electrical Works', 2),
  ('Home & Lifestyle Services', 'Renovation & Repairs', 'Plumbing & Water System', 3),
  ('Home & Lifestyle Services', 'Renovation & Repairs', 'Roofing & Flooring', 4),
  ('Home & Lifestyle Services', 'Renovation & Repairs', 'Kitchen / Bathroom Renovation', 5),
  
  ('Home & Lifestyle Services', 'Security & Installations', 'CCTV & Smart Home', 1),
  ('Home & Lifestyle Services', 'Security & Installations', 'Security Guards', 2),
  ('Home & Lifestyle Services', 'Security & Installations', 'Alarm & Access Control', 3),
  
  ('Home & Lifestyle Services', 'Furniture & Interior', 'Furniture Sales', 1),
  ('Home & Lifestyle Services', 'Furniture & Interior', 'Furniture Installation', 2),
  ('Home & Lifestyle Services', 'Furniture & Interior', 'Interior Designing', 3),
  ('Home & Lifestyle Services', 'Furniture & Interior', 'Home Decoration', 4),
  
  ('Lifestyle & Daily Needs', 'Laundry & Cleaning', 'Clothes Laundry', 1),
  ('Lifestyle & Daily Needs', 'Laundry & Cleaning', 'Dry Cleaning', 2),
  ('Lifestyle & Daily Needs', 'Laundry & Cleaning', 'Ironing Services', 3),
  
  ('Lifestyle & Daily Needs', 'Home Shifting & Logistics', 'House / Apartment Moving', 1),
  ('Lifestyle & Daily Needs', 'Home Shifting & Logistics', 'Packing & Unpacking', 2),
  ('Lifestyle & Daily Needs', 'Home Shifting & Logistics', 'Vehicle Transport', 3),
  
  ('Lifestyle & Daily Needs', 'On-Demand Home Services', 'Electrician', 1),
  ('Lifestyle & Daily Needs', 'On-Demand Home Services', 'Plumber', 2),
  ('Lifestyle & Daily Needs', 'On-Demand Home Services', 'AC Service', 3),
  ('Lifestyle & Daily Needs', 'On-Demand Home Services', 'Handyman', 4),
  
  ('Extra Value Services', 'ASTRA Villa Concierge', 'Villa Management Subscription', 1),
  ('Extra Value Services', 'ASTRA Villa Concierge', 'VIP Client Handling', 2),
  ('Extra Value Services', 'ASTRA Villa Concierge', 'Multilingual Assistance', 3),
  
  ('Extra Value Services', 'Technology Integration', '3D Virtual Tour', 1),
  ('Extra Value Services', 'Technology Integration', 'AI Property Assistance', 2),
  ('Extra Value Services', 'Technology Integration', 'AR/VR Viewing', 3)
) AS services(main_name, sub_name, service_name, service_order)
WHERE vsc.name = services.main_name AND vsub.name = services.sub_name;