
-- Create a table to store office locations
CREATE TABLE public.office_locations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en text NOT NULL,
    name_id text NOT NULL,
    address_en text NOT NULL,
    address_id text NOT NULL,
    phone text,
    business_hours_en text,
    business_hours_id text,
    is_main_office boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add a comment to the table
COMMENT ON TABLE public.office_locations IS 'Stores information about company offices for display in the footer.';

-- Enable Row Level Security
ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active offices
CREATE POLICY "Public can read active office locations"
  ON public.office_locations
  FOR SELECT
  USING (is_active = true);

-- Policy for admin management
CREATE POLICY "Admins can manage office locations"
  ON public.office_locations
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Insert existing office data into the new table
INSERT INTO public.office_locations (name_en, name_id, address_en, address_id, phone, business_hours_en, business_hours_id, is_main_office, display_order)
VALUES
('Jakarta Head Office', 'Kantor Pusat Jakarta', 'Menara Astra, Jl. Jend. Sudirman Kav. 5-6, Jakarta 10220', 'Menara Astra, Jl. Jend. Sudirman Kav. 5-6, Jakarta 10220', '+62 21 1234 5678', 'Mon-Fri: 9:00 AM - 6:00 PM', 'Sen-Jum: 09:00 - 18:00', true, 1),
('Bali Regional Office', 'Kantor Regional Bali', 'Jl. Raya Sanur No. 88, Denpasar, Bali 80228', 'Jl. Raya Sanur No. 88, Denpasar, Bali 80228', '+62 361 234 567', 'Mon-Fri: 9:00 AM - 6:00 PM', 'Sen-Jum: 09:00 - 18:00', false, 2),
('Surabaya Branch', 'Cabang Surabaya', 'Jl. Pemuda No. 118, Surabaya, East Java 60271', 'Jl. Pemuda No. 118, Surabaya, Jawa Timur 60271', '+62 31 345 678', 'Mon-Fri: 9:00 AM - 6:00 PM', 'Sen-Jum: 09:00 - 18:00', false, 3),
('Bandung Branch', 'Cabang Bandung', 'Jl. Asia Afrika No. 8, Bandung, West Java 40111', 'Jl. Asia Afrika No. 8, Bandung, Jawa Barat 40111', '+62 22 456 789', 'Mon-Fri: 9:00 AM - 6:00 PM', 'Sen-Jum: 09:00 - 18:00', false, 4),
('Medan Branch', 'Cabang Medan', 'Jl. Jend. Gatot Subroto No. 456, Medan, North Sumatra 20234', 'Jl. Jend. Gatot Subroto No. 456, Medan, Sumatera Utara 20234', '+62 61 567 890', 'Mon-Fri: 9:00 AM - 6:00 PM', 'Sen-Jum: 09:00 - 18:00', false, 5);

-- Add a trigger to update 'updated_at' timestamp on any change
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_office_locations_updated_at
  BEFORE UPDATE
  ON
    public.office_locations
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();
