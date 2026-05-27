
UPDATE public.properties
SET
  latitude  = -7.3 + (random() - 0.5) * 1.6,
  longitude = 110.2 + (random() - 0.5) * 2.0
WHERE status = 'active'
  AND (latitude IS NULL OR longitude IS NULL);

UPDATE public.properties
SET development_status = CASE
  WHEN random() < 0.15 THEN 'pre_launch'
  WHEN random() < 0.30 THEN 'new_project'
  ELSE 'completed'
END
WHERE status = 'active' AND development_status IS NULL;
