import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FeedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  image_url: string | null;
  tags: string[];
  reading_time_min: number;
  is_featured: boolean;
  is_trending: boolean;
  ai_generated: boolean;
  views_count: number;
  market_heat_ref: { cluster_name?: string; market_heat_score?: number; heat_level?: string } | null;
  related_property_ids: string[];
  created_at: string;
  is_saved: boolean;
}

export interface ArticleDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  tags: string[];
  reading_time_min: number;
  is_featured: boolean;
  is_trending: boolean;
  ai_generated: boolean;
  views_count: number;
  market_heat_ref: any;
  created_at: string;
}

export interface RelatedProperty {
  id: string;
  title: string;
  price: number;
  city: string;
  property_type: string;
  thumbnail_url: string | null;
  investment_score: number;
  demand_heat_score: number;
}

export function useMarketIntelligenceFeed(category: string, limit = 20, offset = 0) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['market-intelligence-feed', category, limit, offset, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-feed', {
        body: { mode: 'feed', category, limit, offset, user_id: user?.id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as { articles: FeedArticle[]; total: number; has_more: boolean };
    },
    staleTime: 60_000,
  });
}

export function useArticleDetail(articleId: string | null) {
  return useQuery({
    queryKey: ['article-detail', articleId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-feed', {
        body: { mode: 'detail', article_id: articleId },
      });
      if (error) throw new Error(error.message);
      return data as { article: ArticleDetail; related_properties: RelatedProperty[] };
    },
    enabled: !!articleId,
    staleTime: 2 * 60_000,
  });
}

export function useToggleSaveArticle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (articleId: string) => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-feed', {
        body: { mode: 'toggle_save', user_id: user?.id, article_id: articleId },
      });
      if (error) throw new Error(error.message);
      return data as { saved: boolean };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-intelligence-feed'] });
      toast({ title: data.saved ? 'Article Saved' : 'Article Unsaved', description: data.saved ? 'Added to your reading list' : 'Removed from reading list' });
    },
  });
}

export function useGenerateIntelligenceArticles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-feed', {
        body: { mode: 'generate' },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; generated: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-intelligence-feed'] });
      toast({ title: 'Intelligence Generated', description: `${data.generated} articles created` });
    },
    onError: (err: Error) => {
      toast({ title: 'Generation Failed', description: err.message, variant: 'destructive' });
    },
  });
}
