
-- Property Inspections table
CREATE TABLE public.property_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES auth.users(id),
  tenant_id UUID NOT NULL REFERENCES auth.users(id),
  inspection_type TEXT NOT NULL DEFAULT 'check_in' CHECK (inspection_type IN ('check_in', 'check_out')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'disputed')),
  inspection_date TIMESTAMPTZ,
  overall_condition TEXT CHECK (overall_condition IN ('excellent', 'good', 'fair', 'poor')),
  notes TEXT,
  tenant_signature_url TEXT,
  owner_signature_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inspection Items (checklist items)
CREATE TABLE public.inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.property_inspections(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  item_name TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'damaged', 'missing')),
  photo_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Storage bucket for inspection photos
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-photos', 'inspection-photos', true);

-- RLS for property_inspections
ALTER TABLE public.property_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage inspections for their properties"
  ON public.property_inspections FOR ALL TO authenticated
  USING (
    inspector_id = auth.uid() OR
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid())
  );

CREATE POLICY "Tenants can view their inspections"
  ON public.property_inspections FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

-- RLS for inspection_items
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage inspection items they have access to"
  ON public.inspection_items FOR ALL TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM public.property_inspections 
      WHERE inspector_id = auth.uid() OR tenant_id = auth.uid()
      OR property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid())
    )
  );

-- Storage policies for inspection-photos
CREATE POLICY "Authenticated users can upload inspection photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Anyone can view inspection photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'inspection-photos');

CREATE POLICY "Owners can delete inspection photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'inspection-photos');
