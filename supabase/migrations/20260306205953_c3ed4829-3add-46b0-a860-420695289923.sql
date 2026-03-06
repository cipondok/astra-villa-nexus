
-- Knowledge Graph Edges table
CREATE TABLE IF NOT EXISTS public.knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  weight NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id, relation_type, target_type, target_id)
);

-- Indexes for fast graph traversal
CREATE INDEX IF NOT EXISTS idx_kge_source ON public.knowledge_graph_edges (source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_kge_target ON public.knowledge_graph_edges (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_kge_relation ON public.knowledge_graph_edges (relation_type);
CREATE INDEX IF NOT EXISTS idx_kge_weight ON public.knowledge_graph_edges (weight DESC);

-- Enable RLS
ALTER TABLE public.knowledge_graph_edges ENABLE ROW LEVEL SECURITY;

-- Public read access (graph insights are non-sensitive aggregated data)
CREATE POLICY "Anyone can read knowledge graph edges"
  ON public.knowledge_graph_edges FOR SELECT USING (true);

-- Only service role can insert/update (populated by engine)
CREATE POLICY "Service role can manage edges"
  ON public.knowledge_graph_edges FOR ALL
  USING (auth.role() = 'service_role');
