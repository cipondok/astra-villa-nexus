
-- Check-in/check-out records table
CREATE TABLE public.checkin_checkout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.rental_bookings(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID NOT NULL,
  record_type TEXT NOT NULL DEFAULT 'checkin', -- 'checkin' or 'checkout'
  performed_by UUID NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Condition documentation
  overall_condition TEXT DEFAULT 'good', -- 'excellent', 'good', 'fair', 'poor', 'damaged'
  condition_notes TEXT,
  photos TEXT[] DEFAULT '{}',
  
  -- Checklist items (stored as JSONB array)
  checklist JSONB DEFAULT '[]',
  
  -- Meter readings
  electricity_meter NUMERIC,
  water_meter NUMERIC,
  gas_meter NUMERIC,
  
  -- Keys & inventory
  keys_count INTEGER DEFAULT 0,
  keys_notes TEXT,
  inventory_notes TEXT,
  
  -- Signatures
  tenant_signature_at TIMESTAMPTZ,
  owner_signature_at TIMESTAMPTZ,
  tenant_agreed BOOLEAN DEFAULT false,
  owner_agreed BOOLEAN DEFAULT false,
  
  -- Damage assessment (for checkout)
  damages_found BOOLEAN DEFAULT false,
  damage_description TEXT,
  damage_photos TEXT[] DEFAULT '{}',
  estimated_repair_cost NUMERIC DEFAULT 0,
  deduct_from_deposit BOOLEAN DEFAULT false,
  
  status TEXT DEFAULT 'draft', -- 'draft', 'completed', 'disputed'
  dispute_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Storage bucket for check-in/out photos
INSERT INTO storage.buckets (id, name, public) VALUES ('checkin-photos', 'checkin-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.checkin_checkout_records ENABLE ROW LEVEL SECURITY;

-- Owners can manage records for their properties
CREATE POLICY "Owners can manage checkin records"
  ON public.checkin_checkout_records
  FOR ALL
  TO authenticated
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid())
    OR tenant_id = auth.uid()
  )
  WITH CHECK (
    property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid())
    OR tenant_id = auth.uid()
  );

-- Storage policies for checkin-photos
CREATE POLICY "Authenticated users can upload checkin photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'checkin-photos');

CREATE POLICY "Anyone can view checkin photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'checkin-photos');
