import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KnowledgeGraphInsights {
  trending_cities: Array<{ city: string; score: number; property_count: number }>;
  popular_property_types: Array<{ type: string; count: number }>;
  top_amenities: Array<{ amenity: string; count: number }>;
  top_developers: Array<{ developer: string; count: number }>;
  investor_interest_areas: Array<{ city: string; views: number; saves: number; interest_ratio: number }>;
  graph_stats: {
    total_edges: number;
    entity_types: string[];
    relation_types: string[];
  };
  queried_at: string;
}

export interface GraphBuildResult {
  edges_created: number;
  breakdown: Record<string, number>;
  built_at: string;
}

export function useKnowledgeGraphInsights() {
  return useQuery({
    queryKey: ['knowledge-graph-insights'],
    queryFn: async (): Promise<KnowledgeGraphInsights> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'knowledge_graph', action: 'query' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as KnowledgeGraphInsights;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useBuildKnowledgeGraph() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<GraphBuildResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'knowledge_graph', action: 'build' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as GraphBuildResult;
    },
    onSuccess: (data) => {
      toast.success(`Knowledge graph built: ${data.edges_created} edges created`);
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph-insights'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to build knowledge graph');
    },
  });
}
