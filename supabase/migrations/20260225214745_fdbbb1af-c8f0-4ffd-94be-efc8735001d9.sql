
-- Seed demo rental bookings
INSERT INTO rental_bookings (property_id, customer_id, check_in_date, check_out_date, base_price, total_amount, total_days, booking_status, payment_status, deposit_amount, deposit_status, booking_type, contact_method, special_requests, terms_accepted)
VALUES
  ('826c839d-0c87-4b51-bbc8-9bc9cba078dd', 'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee', '2026-03-01', '2026-03-15', 5000000, 70000000, 14, 'confirmed', 'paid', 10000000, 'paid', 'monthly', 'whatsapp', 'Early check-in requested', true),
  ('295a6b19-cf1e-4bcb-9109-9233eaf03aad', 'd082657c-ab86-4236-8d94-efeb0e08fc00', '2026-03-10', '2026-06-10', 8000000, 240000000, 90, 'confirmed', 'partial', 20000000, 'paid', 'monthly', 'email', NULL, true),
  ('557de7a9-f4e2-4542-94c5-46897e67af8c', 'c4e90f30-500e-4645-91b3-5ed9a3d522aa', '2026-02-20', '2026-02-28', 3500000, 28000000, 8, 'completed', 'paid', 5000000, 'refunded', 'daily', 'phone', 'Need airport pickup', true),
  ('abb6ee07-86b2-4f9c-ac6b-337c7983c060', '5b27e6da-8233-43a1-86fd-ec95432ce2fa', '2026-04-01', '2026-04-30', 12000000, 360000000, 30, 'pending', 'unpaid', 30000000, 'pending', 'monthly', 'whatsapp', 'Furnished apartment preferred', true),
  ('e3d3bd6c-b361-4e13-bdf5-5d156a674926', 'befcfa64-6284-4430-9d05-81db3a82ceb6', '2026-03-05', '2026-03-12', 4500000, 31500000, 7, 'cancelled', 'refunded', 7000000, 'refunded', 'daily', 'email', 'Family trip cancelled', true),
  ('826c839d-0c87-4b51-bbc8-9bc9cba078dd', 'd082657c-ab86-4236-8d94-efeb0e08fc00', '2026-05-01', '2026-07-31', 5000000, 450000000, 90, 'pending', 'unpaid', 15000000, 'pending', 'quarterly', 'whatsapp', 'Long-term stay, need parking', true),
  ('557de7a9-f4e2-4542-94c5-46897e67af8c', '5b27e6da-8233-43a1-86fd-ec95432ce2fa', '2026-02-15', '2026-02-25', 3500000, 35000000, 10, 'confirmed', 'paid', 5000000, 'paid', 'daily', 'phone', NULL, true),
  ('295a6b19-cf1e-4bcb-9109-9233eaf03aad', 'c0ddd7cc-a92c-4d80-91b3-bdf963a3f3ee', '2026-06-01', '2026-12-01', 8000000, 1440000000, 180, 'confirmed', 'partial', 50000000, 'paid', 'yearly', 'email', 'Need home office setup', true);
