-- Add more diverse product categories beyond household items using proper UUID generation
INSERT INTO public.vendor_main_categories (name, description, icon, type, display_order, is_active, discount_eligible) VALUES
  ('Automotive & Transportation', 'Vehicles, parts, accessories, and transportation equipment', '🚗', 'product', 10, true, true),
  ('Sports & Recreation', 'Sports equipment, outdoor gear, fitness products', '⚽', 'product', 11, true, true),
  ('Health & Beauty', 'Healthcare products, cosmetics, wellness items', '💊', 'product', 12, true, true),
  ('Books & Media', 'Books, magazines, digital media, educational materials', '📚', 'product', 13, true, true),
  ('Industrial & Manufacturing', 'Industrial equipment, machinery, manufacturing tools', '🏭', 'product', 14, true, true),
  ('Food & Beverages', 'Food products, drinks, culinary ingredients', '🍎', 'product', 15, true, true),
  ('Agriculture & Farming', 'Agricultural products, farming equipment, livestock', '🌾', 'product', 16, true, true),
  ('Business & Office', 'Office supplies, business equipment, commercial products', '💼', 'product', 17, true, true),
  ('Arts & Crafts', 'Art supplies, craft materials, creative tools', '🎨', 'product', 18, true, true),
  ('Toys & Games', 'Children toys, board games, entertainment products', '🧸', 'product', 19, true, true);

-- Get the IDs of the newly created categories for subcategories
DO $$
DECLARE
    auto_id UUID;
    sports_id UUID;
    health_id UUID;
    industrial_id UUID;
    agri_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO auto_id FROM vendor_main_categories WHERE name = 'Automotive & Transportation';
    SELECT id INTO sports_id FROM vendor_main_categories WHERE name = 'Sports & Recreation';
    SELECT id INTO health_id FROM vendor_main_categories WHERE name = 'Health & Beauty';
    SELECT id INTO industrial_id FROM vendor_main_categories WHERE name = 'Industrial & Manufacturing';
    SELECT id INTO agri_id FROM vendor_main_categories WHERE name = 'Agriculture & Farming';
    
    -- Add subcategories
    INSERT INTO public.vendor_sub_categories (name, description, icon, main_category_id, display_order, is_active) VALUES
        -- Automotive & Transportation subcategories
        ('Cars & Motorcycles', 'Vehicles for personal transportation', '🚗', auto_id, 1, true),
        ('Auto Parts & Accessories', 'Vehicle parts, accessories, and modifications', '🔧', auto_id, 2, true),
        ('Commercial Vehicles', 'Trucks, buses, commercial transportation', '🚛', auto_id, 3, true),
        
        -- Sports & Recreation subcategories
        ('Fitness Equipment', 'Exercise machines, weights, fitness gear', '🏋️', sports_id, 1, true),
        ('Outdoor & Camping', 'Camping gear, outdoor equipment, adventure sports', '🏕️', sports_id, 2, true),
        ('Team Sports', 'Football, basketball, volleyball equipment', '⚽', sports_id, 3, true),
        
        -- Health & Beauty subcategories
        ('Medical Equipment', 'Healthcare devices, medical supplies', '🩺', health_id, 1, true),
        ('Cosmetics & Skincare', 'Beauty products, skincare, makeup', '💄', health_id, 2, true),
        ('Supplements & Vitamins', 'Health supplements, vitamins, nutrition', '💊', health_id, 3, true),
        
        -- Industrial & Manufacturing subcategories
        ('Heavy Machinery', 'Construction equipment, industrial machines', '🚜', industrial_id, 1, true),
        ('Manufacturing Tools', 'Production tools, factory equipment', '🔨', industrial_id, 2, true),
        ('Safety Equipment', 'Industrial safety gear, protective equipment', '🦺', industrial_id, 3, true),
        
        -- Agriculture & Farming subcategories
        ('Farm Equipment', 'Tractors, plows, agricultural machinery', '🚜', agri_id, 1, true),
        ('Seeds & Plants', 'Agricultural seeds, plants, crops', '🌱', agri_id, 2, true),
        ('Livestock & Pets', 'Animals, pet supplies, veterinary products', '🐄', agri_id, 3, true);
END $$;