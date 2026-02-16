import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropertySeoAnalysis {
  id: string;
  property_id: string;
  seo_score: number;
  seo_rating: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  seo_hashtags: string[];
  title_score: number;
  description_score: number;
  keyword_score: number;
  hashtag_score: number;
  location_score: number;
  suggested_keywords: string[];
  missing_keywords: string[];
  ranking_difficulty: string;
  custom_title: string | null;
  custom_description: string | null;
  custom_keywords: string[];
  custom_hashtags: string[];
  ai_model_used: string;
  last_analyzed_at: string;
  created_at: string;
}

export interface SeoTrendKeyword {
  id: string;
  keyword: string;
  search_volume: number;
  trend_direction: string;
  trend_score: number;
  competition_level: string;
  location_relevance: string | null;
  property_type_relevance: string | null;
  category: string;
  language: string;
  source: string;
}

export interface ContentOptimization {
  optimized_title: string;
  optimized_description: string;
  meta_title: string;
  meta_description: string;
  focus_keywords: string[];
  secondary_keywords: string[];
  hashtags: string[];
  content_score: number;
  word_count_recommendation: number;
  readability_tips: string[];
  schema_suggestions: string[];
  propertyId: string;
  currentTitle: string;
}

export interface CompetitorInsights {
  market_saturation: string;
  avg_keyword_density: number;
  top_performing_keywords: string[];
  keyword_gaps: string[];
  price_positioning: string;
  recommendations: string[];
  difficulty_score: number;
}

export interface CompetitorData {
  id: string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  seo_score: number | null;
  seo_rating: string;
  keywords: string[];
}

export interface SerpPreview {
  title: string;
  description: string;
  url: string;
  type: string;
  keywords?: string[];
  score?: number;
}

export function usePropertySeoAnalyses(options?: { limit?: number; filter?: string }) {
  const { limit = 50, filter } = options || {};
  return useQuery({
    queryKey: ['property-seo-analyses', limit, filter],
    queryFn: async () => {
      let query = (supabase.from('property_seo_analysis') as any)
        .select('*')
        .order('seo_score', { ascending: true })
        .limit(limit);
      if (filter === 'weak') query = query.lt('seo_score', 50);
      if (filter === 'excellent') query = query.gte('seo_score', 80);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PropertySeoAnalysis[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function usePropertySeoAnalysis(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['property-seo-analysis', propertyId],
    queryFn: async () => {
      const { data, error } = await (supabase.from('property_seo_analysis') as any)
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();
      if (error) throw error;
      return data as PropertySeoAnalysis | null;
    },
    enabled: !!propertyId,
  });
}

export function useSeoTrendKeywords(options?: { category?: string; language?: string; limit?: number }) {
  const { category, language, limit = 20 } = options || {};
  return useQuery({
    queryKey: ['seo-trend-keywords', category, language, limit],
    queryFn: async () => {
      let query = (supabase.from('seo_trend_data') as any)
        .select('*')
        .order('trend_score', { ascending: false })
        .limit(limit);
      if (category) query = query.eq('category', category);
      if (language) query = query.eq('language', language);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SeoTrendKeyword[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeoStats() {
  return useQuery({
    queryKey: ['seo-intelligence-stats'],
    queryFn: async () => {
      const [analysesRes, trendsRes, propertiesRes] = await Promise.all([
        (supabase.from('property_seo_analysis') as any).select('seo_score, seo_rating'),
        (supabase.from('seo_trend_data') as any).select('id', { count: 'exact', head: true }),
        (supabase.from('properties') as any).select('id', { count: 'exact', head: true }),
      ]);

      const analyses = analysesRes.data || [];
      const totalProperties = propertiesRes.count || 0;
      const analyzedCount = analyses.length;
      const avgScore = analyses.length > 0
        ? Math.round(analyses.reduce((a: number, b: any) => a + (b.seo_score || 0), 0) / analyses.length)
        : 0;
      const excellent = analyses.filter((a: any) => a.seo_score >= 80).length;
      const good = analyses.filter((a: any) => a.seo_score >= 60 && a.seo_score < 80).length;
      const needsImprovement = analyses.filter((a: any) => a.seo_score >= 40 && a.seo_score < 60).length;
      const poor = analyses.filter((a: any) => a.seo_score < 40).length;

      return {
        totalProperties,
        analyzedCount,
        unanalyzedCount: totalProperties - analyzedCount,
        avgScore,
        excellent,
        good,
        needsImprovement,
        poor,
        trendKeywordsCount: trendsRes.count || 0,
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useAnalyzeProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'analyze-property', propertyId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property-seo-analyses'] });
      qc.invalidateQueries({ queryKey: ['property-seo-analysis'] });
      qc.invalidateQueries({ queryKey: ['seo-intelligence-stats'] });
      toast.success('Property SEO analysis complete');
    },
    onError: (e) => toast.error('Analysis failed: ' + e.message),
  });
}

export function useAnalyzeBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { limit?: number; filter?: string }) => {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'analyze-batch', ...params },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['property-seo-analyses'] });
      qc.invalidateQueries({ queryKey: ['seo-intelligence-stats'] });
      toast.success(`Analyzed ${data.analyzed} properties`);
    },
    onError: (e) => toast.error('Batch analysis failed: ' + e.message),
  });
}

export function useAutoOptimize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params?: { threshold?: number; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'auto-optimize', ...(params || {}) },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['property-seo-analyses'] });
      qc.invalidateQueries({ queryKey: ['seo-intelligence-stats'] });
      toast.success(`Auto-optimized ${data.optimized} weak listings`);
    },
    onError: (e) => toast.error('Auto-optimize failed: ' + e.message),
  });
}

// NEW: Apply SEO-optimized title/description to a property
export function useApplySeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'apply-seo', propertyId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property-seo-analyses'] });
      toast.success('SEO applied to property listing!');
    },
    onError: (e) => toast.error('Apply failed: ' + e.message),
  });
}

// NEW: AI content optimization for a property
export function useContentOptimize() {
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'content-optimize', propertyId },
      });
      if (error) throw error;
      return data as ContentOptimization;
    },
    onError: (e) => toast.error('Content optimization failed: ' + e.message),
  });
}

// NEW: Competitor analysis
export function useCompetitorAnalysis() {
  return useMutation({
    mutationFn: async (params: { location?: string; propertyType?: string }) => {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'competitor-analysis', ...params },
      });
      if (error) throw error;
      return data as { competitors: CompetitorData[]; insights: CompetitorInsights | null };
    },
    onError: (e) => toast.error('Competitor analysis failed: ' + e.message),
  });
}

// NEW: SERP preview
export function useSerpPreview() {
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'generate-serp-preview', propertyId },
      });
      if (error) throw error;
      return data as { current: SerpPreview; optimized: SerpPreview; improvements: any };
    },
    onError: (e) => toast.error('SERP preview failed: ' + e.message),
  });
}
