
-- First, let's clean up unused/old vendor services and add proper categorization

-- Add a category_type field to distinguish between products and services
ALTER TABLE public.vendor_main_categories 
ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'mixed' CHECK (category_type IN ('products', 'services', 'mixed'));

-- Add business_model field to vendor services to distinguish service types
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS business_model TEXT DEFAULT 'service_only' CHECK (business_model IN ('product_sales', 'service_only', 'both'));

-- Update existing categories with proper types
UPDATE public.vendor_main_categories SET category_type = 'mixed' WHERE id = 'vendor_cat_prop';
UPDATE public.vendor_main_categories SET category_type = 'mixed' WHERE id = 'vendor_cat_rental';
UPDATE public.vendor_main_categories SET category_type = 'mixed' WHERE id = 'vendor_cat_elect';
UPDATE public.vendor_main_categories SET category_type = 'products' WHERE id = 'vendor_cat_furn';
UPDATE public.vendor_main_categories SET category_type = 'services' WHERE id = 'vendor_cat_sub';
UPDATE public.vendor_main_categories SET category_type = 'products' WHERE id = 'vendor_cat_materials';
UPDATE public.vendor_main_categories SET category_type = 'services' WHERE id = 'vendor_cat_design';

-- Clean up inactive/unused services (older than 6 months with no bookings)
DELETE FROM public.vendor_services 
WHERE is_active = false 
  AND total_bookings = 0 
  AND created_at < (NOW() - INTERVAL '6 months');

-- Add specific subcategories for Electronics to separate products vs services
INSERT INTO public.vendor_subcategories (id, name, description, icon, main_category_id, display_order, is_active) VALUES
('elec_products', 'Electronic Products', 'TV, AC units, appliances for sale', '📱', 'vendor_cat_elect', 1, true),
('elec_repair', 'Repair Services', 'AC repair, TV repair, appliance fixing', '🔧', 'vendor_cat_elect', 2, true),
('elec_install', 'Installation Services', 'Electrical installation, setup services', '⚡', 'vendor_cat_elect', 3, true),
('elec_maintenance', 'Maintenance Services', 'Regular maintenance, check-ups', '🛠️', 'vendor_cat_elect', 4, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Add inventory tracking fields for product-selling vendors
ALTER TABLE public.vendor_services 
ADD COLUMN IF NOT EXISTS has_inventory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER,
ADD COLUMN IF NOT EXISTS product_warranty_months INTEGER;

-- Create vendor inventory table for product management
CREATE TABLE IF NOT EXISTS public.vendor_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id),
  service_id UUID REFERENCES public.vendor_services(id),
  product_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  current_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  cost_price NUMERIC(10,2),
  selling_price NUMERIC(10,2),
  supplier_info JSONB DEFAULT '{}',
  product_images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on inventory table
ALTER TABLE public.vendor_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory table
CREATE POLICY "Vendors can manage their own inventory" 
ON public.vendor_inventory 
FOR ALL 
USING (auth.uid() = vendor_id);

CREATE POLICY "Anyone can view active inventory" 
ON public.vendor_inventory 
FOR SELECT 
USING (is_active = true);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_vendor_inventory_updated_at
  BEFORE UPDATE ON public.vendor_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
