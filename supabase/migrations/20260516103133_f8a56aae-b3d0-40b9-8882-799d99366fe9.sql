
-- Clean recreate of MVP tables
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Updated-at helper (reuse if exists)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- admin_users: email allowlist
CREATE TABLE public.admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

CREATE POLICY "admin_users readable by admins" ON public.admin_users
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin_users writable by admins" ON public.admin_users
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.admin_users (email) VALUES ('astravillarealty@gmail.com');

-- properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  price_idr BIGINT NOT NULL DEFAULT 0,
  listing_type TEXT NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale','rent')),
  bedrooms INT NOT NULL DEFAULT 0,
  bathrooms INT NOT NULL DEFAULT 0,
  land_sqm INT NOT NULL DEFAULT 0,
  building_sqm INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','sold')),
  featured BOOLEAN NOT NULL DEFAULT false,
  cover_image TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_featured ON public.properties(featured) WHERE featured = true;

CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published properties are public" ON public.properties
  FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins manage properties" ON public.properties
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'website' CHECK (source IN ('website','whatsapp','contact')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read leads" ON public.leads
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update leads" ON public.leads
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete leads" ON public.leads
  FOR DELETE TO authenticated USING (public.is_admin());

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');
DROP POLICY IF EXISTS "Admins upload property images" ON storage.objects;
CREATE POLICY "Admins upload property images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admins update property images" ON storage.objects;
CREATE POLICY "Admins update property images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admins delete property images" ON storage.objects;
CREATE POLICY "Admins delete property images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin());
