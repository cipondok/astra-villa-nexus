
CREATE OR REPLACE FUNCTION public.delete_admin_alerts_by_types(type_patterns text[])
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  deleted_count integer := 0;
  batch_ids uuid[];
BEGIN
  LOOP
    SELECT array_agg(id) INTO batch_ids
    FROM (
      SELECT id FROM admin_alerts 
      WHERE type = ANY(type_patterns) 
        OR EXISTS (SELECT 1 FROM unnest(type_patterns) p WHERE type ILIKE '%' || p || '%')
      LIMIT 500
    ) sub;
    
    IF batch_ids IS NULL OR array_length(batch_ids, 1) IS NULL THEN EXIT; END IF;
    
    DELETE FROM admin_alerts WHERE id = ANY(batch_ids);
    deleted_count := deleted_count + array_length(batch_ids, 1);
  END LOOP;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_alerts_count_by_types(type_patterns text[])
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::integer FROM admin_alerts 
  WHERE type = ANY(type_patterns)
    OR EXISTS (SELECT 1 FROM unnest(type_patterns) p WHERE type ILIKE '%' || p || '%');
$$;
