DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='rental_bookings' AND column_name='property_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                     WHERE table_schema='public' AND table_name='rental_bookings'
                       AND constraint_name='rental_bookings_property_id_fkey') THEN
    ALTER TABLE public.rental_bookings
      ADD CONSTRAINT rental_bookings_property_id_fkey
      FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL NOT VALID;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='orders' AND column_name='property_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                     WHERE table_schema='public' AND table_name='orders'
                       AND constraint_name='orders_property_id_fkey') THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_property_id_fkey
      FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL NOT VALID;
  END IF;
END $$;