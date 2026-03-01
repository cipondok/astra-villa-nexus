
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS developer_certified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_checked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_partner BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.properties.ownership_verified IS 'Property ownership documents verified by legal team';
COMMENT ON COLUMN public.properties.developer_certified IS 'Developed by a certified/registered developer';
COMMENT ON COLUMN public.properties.legal_checked IS 'Legal documents (SHM/HGB, IMB, permits) reviewed and cleared';
COMMENT ON COLUMN public.properties.premium_partner IS 'Listed by exclusive Premium Partner with top trust rating';
