-- Phase 3 perf pass 1: composite index for the dominant PostgREST query on properties
-- Top slow query: WHERE status = $ AND approval_status = $ (13 calls, 4.7s mean, 61s total)
CREATE INDEX IF NOT EXISTS idx_properties_status_approval
  ON public.properties (status, approval_status);

-- Common marketplace sort: approved+active listings by recency
CREATE INDEX IF NOT EXISTS idx_properties_approval_created
  ON public.properties (approval_status, created_at DESC)
  WHERE status = 'active';

-- Owner dashboards frequently filter by owner
CREATE INDEX IF NOT EXISTS idx_properties_owner_status
  ON public.properties (owner_id, status)
  WHERE owner_id IS NOT NULL;