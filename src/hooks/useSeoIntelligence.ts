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

export interface SeoLocationFilters {
  state?: string;
  city?: string;
  area?: string;
}

export function usePropertySeoAnalyses(options?: { 
  limit?: number; 
  filter?: string; 
  location?: SeoLocationFilters;
  page?: number;
  pageSize?: number;
}) {
  const { limit, filter, location, page = 1, pageSize = 25 } = options || {};
  const hasLocationFilter = location?.state && location.state !== '__all__';

  return useQuery({
    queryKey: ['property-seo-analyses', filter, location?.state, location?.city, location?.area, page, pageSize],
    queryFn: async () => {
      // If location filters are active, first get matching property IDs
      let propertyIds: string[] | null = null;
      
      if (hasLocationFilter) {
        let propQuery = (supabase.from('properties') as any)
          .select('id')
          .limit(1000);
        
        if (location?.state && location.state !== '__all__') {
          propQuery = propQuery.eq('state', location.state);
        }
        if (location?.city && location.city !== '__all__') {
          propQuery = propQuery.eq('city', location.city);
        }
        if (location?.area && location.area !== '__all__') {
          propQuery = propQuery.ilike('location', `%${location.area}%`);
        }
        
        const { data: propData } = await propQuery;
        propertyIds = (propData || []).map((p: any) => p.id);
        
        if (propertyIds.length === 0) {
          return { data: [] as PropertySeoAnalysis[], totalCount: 0 };
        }
      }

      // Build SEO query with count
      let query = (supabase.from('property_seo_analysis') as any)
        .select('*', { count: 'exact' })
        .order('seo_score', { ascending: true });

      if (filter === 'weak') query = query.lt('seo_score', 50);
      if (filter === 'excellent') query = query.gte('seo_score', 80);
      
      // Filter by property IDs if location filter is active
      if (propertyIds) {
        // Supabase .in() has a limit, chunk if needed
        const ids = propertyIds.slice(0, 500);
        query = query.in('property_id', ids);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { 
        data: (data || []) as PropertySeoAnalysis[], 
        totalCount: count || 0 
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for filtered location SEO summary stats
export function useFilteredSeoStats(location?: SeoLocationFilters) {
  const hasFilter = location?.state && location.state !== '__all__';
  
  return useQuery({
    queryKey: ['filtered-seo-stats', location?.state, location?.city, location?.area],
    queryFn: async () => {
      if (!hasFilter) return null;

      // Get property IDs matching location
      let propQuery = (supabase.from('properties') as any)
        .select('id')
        .limit(1000);
      
      if (location?.state && location.state !== '__all__') propQuery = propQuery.eq('state', location.state);
      if (location?.city && location.city !== '__all__') propQuery = propQuery.eq('city', location.city);
      if (location?.area && location.area !== '__all__') propQuery = propQuery.ilike('location', `%${location.area}%`);

      const { data: propData } = await propQuery;
      const propertyIds = (propData || []).map((p: any) => p.id);
      const totalProperties = propertyIds.length;

      if (totalProperties === 0) {
        return { totalProperties: 0, analyzedCount: 0, avgScore: 0, excellent: 0, good: 0, needsImprovement: 0, poor: 0, topKeywords: [] as string[] };
      }

      // Get SEO analyses for those properties
      const { data: seoData } = await (supabase.from('property_seo_analysis') as any)
        .select('seo_score, seo_keywords, keyword_score')
        .in('property_id', propertyIds.slice(0, 500));

      const analyses = seoData || [];
      const analyzedCount = analyses.length;
      const avgScore = analyzedCount > 0 ? Math.round(analyses.reduce((a: number, b: any) => a + (b.seo_score || 0), 0) / analyzedCount) : 0;
      const excellent = analyses.filter((a: any) => a.seo_score >= 80).length;
      const good = analyses.filter((a: any) => a.seo_score >= 60 && a.seo_score < 80).length;
      const needsImprovement = analyses.filter((a: any) => a.seo_score >= 40 && a.seo_score < 60).length;
      const poor = analyses.filter((a: any) => a.seo_score < 40).length;

      // Top keywords
      const kwCount: Record<string, number> = {};
      analyses.forEach((a: any) => {
        (a.seo_keywords || []).forEach((kw: string) => { kwCount[kw] = (kwCount[kw] || 0) + 1; });
      });
      const topKeywords = Object.entries(kwCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([kw]) => kw);

      return { totalProperties, analyzedCount, avgScore, excellent, good, needsImprovement, poor, topKeywords };
    },
    enabled: !!hasFilter,
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
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'seo_generate', payload: { action: 'analyze-property', propertyId } },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property-seo-analyses'] });
      qc.invalidateQueries({ queryKey: ['property-seo-analysis'] });
      qc.invalidateQueries({ queryKey: ['seo-intelligence-stats'] });
      qc.invalidateQueries({ queryKey: ['filtered-seo-stats'] });
      toast.success('Property SEO analysis complete');
    },
    onError: (e) => toast.error('Analysis failed: ' + e.message),
  });
}

export function useAnalyzeBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { limit?: number; filter?: string; state?: string; city?: string; area?: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'seo_generate', payload: { action: 'analyze-batch', ...params } },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['property-seo-analyses'] });
      qc.invalidateQueries({ queryKey: ['seo-intelligence-stats'] });
      qc.invalidateQueries({ queryKey: ['filtered-seo-stats'] });
      toast.success(`Analyzed ${data.analyzed} properties`);
    },
    onError: (e) => toast.error('Batch analysis failed: ' + e.message),
  });
}

export function useAutoOptimize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params?: { threshold?: number; limit?: number }) => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'seo_generate', payload: { action: 'auto-optimize', ...(params || {}) } },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['property-seo-analyses'] });
      qc.invalidateQueries({ queryKey: ['seo-intelligence-stats'] });
      qc.invalidateQueries({ queryKey: ['filtered-seo-stats'] });
      toast.success(`Auto-optimized ${data.optimized} weak listings`);
    },
    onError: (e) => toast.error('Auto-optimize failed: ' + e.message),
  });
}

export function useApplySeo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'seo_generate', payload: { action: 'apply-seo', propertyId } },
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

export function useContentOptimize() {
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'seo_generate', payload: { action: 'content-optimize', propertyId } },
      });
      if (error) throw error;
      return data as ContentOptimization;
    },
    onError: (e) => toast.error('Content optimization failed: ' + e.message),
  });
}

export function useCompetitorAnalysis() {
  return useMutation({
    mutationFn: async (params: { location?: string; propertyType?: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'seo_generate', payload: { action: 'competitor-analysis', ...params } },
      });
      if (error) throw error;
      return data as { competitors: CompetitorData[]; insights: CompetitorInsights | null };
    },
    onError: (e) => toast.error('Competitor analysis failed: ' + e.message),
  });
}

export function useSerpPreview() {
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'seo_generate', payload: { action: 'generate-serp-preview', propertyId } },
      });
      if (error) throw error;
      return data as { current: SerpPreview; optimized: SerpPreview; improvements: any };
    },
    onError: (e) => toast.error('SERP preview failed: ' + e.message),
  });
}
