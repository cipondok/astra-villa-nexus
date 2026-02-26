-- Property announcements for owner-to-tenant communication
CREATE TABLE public.property_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'maintenance', 'billing', 'rules', 'event', 'emergency')),
  is_pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track which tenants have read announcements
CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES public.property_announcements(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, tenant_id)
);

ALTER TABLE public.property_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own announcements
CREATE POLICY "Owners can manage announcements" ON public.property_announcements
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Tenants can read announcements for properties they have bookings on
CREATE POLICY "Tenants can read announcements" ON public.property_announcements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_bookings rb
      WHERE rb.property_id = property_announcements.property_id
        AND rb.customer_id = auth.uid()
        AND rb.booking_status IN ('confirmed', 'pending')
    )
  );

-- Tenants can manage their own reads
CREATE POLICY "Tenants manage own reads" ON public.announcement_reads
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- Owners can see read status
CREATE POLICY "Owners can view reads" ON public.announcement_reads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.property_announcements pa
      WHERE pa.id = announcement_reads.announcement_id
        AND pa.owner_id = auth.uid()
    )
  );