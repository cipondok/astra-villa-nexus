
-- Knowledge Graph Edges table for storing entity relationships
CREATE TABLE IF NOT EXISTS public.knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL, -- 'user', 'property', 'city', 'developer', 'amenity'
  source_id TEXT NOT NULL,
  relation_type TEXT NOT NULL, -- 'viewed', 'saved', 'located_in', 'built_by', 'has_amenity', 'searched', 'inquired'
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  weight NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast graph traversal
CREATE INDEX IF NOT EXISTS idx_kge_source ON public.knowledge_graph_edges (source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_kge_target ON public.knowledge_graph_edges (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_kge_relation ON public.knowledge_graph_edges (relation_type);
CREATE INDEX IF NOT EXISTS idx_kge_source_relation ON public.knowledge_graph_edges (source_id, relation_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_kge_unique_edge ON public.knowledge_graph_edges (source_type, source_id, relation_type, target_type, target_id);

-- Enable RLS
ALTER TABLE public.knowledge_graph_edges ENABLE ROW LEVEL SECURITY;

-- Service role can do everything, authenticated users can read
CREATE POLICY "Service role full access" ON public.knowledge_graph_edges FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can read" ON public.knowledge_graph_edges FOR SELECT TO authenticated USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_kge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kge_updated_at
  BEFORE UPDATE ON public.knowledge_graph_edges
  FOR EACH ROW EXECUTE FUNCTION public.update_kge_updated_at();
