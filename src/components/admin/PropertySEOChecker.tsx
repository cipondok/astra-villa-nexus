import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, RefreshCw, Zap, CheckCircle2, XCircle, AlertTriangle, 
  Loader2, Target, TrendingUp, Globe, BarChart3, FileText, 
  Hash, Eye, Lightbulb, ArrowUpRight, ArrowDownRight, Minus,
  Sparkles, X, Plus, Tag, Flame, MapPin
} from 'lucide-react';
import {
  usePropertySeoAnalyses,
  usePropertySeoAnalysis,
  useSeoStats,
  useFilteredSeoStats,
  useAnalyzeBatch,
  useAutoOptimize,
  useAnalyzeProperty,
  useApplySeo,
  useContentOptimize,
  useSeoTrendKeywords,
  type PropertySeoAnalysis,
  type ContentOptimization,
  type SeoTrendKeyword,
  type SeoLocationFilters,
} from '@/hooks/useSeoIntelligence';
import SearchPagination from '@/components/search/SearchPagination';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import StateSeoOverviewTab from './seo/StateSeoOverviewTab';
import SeoHistoryTab from './seo/SeoHistoryTab';
import SeoDashboardCharts from './seo/SeoDashboardCharts';
import AiJobsTab from './seo/AiJobsTab';

// ─── Helpers ────────────────────────────────────────────────
const ScoreBadge = ({ score }: { score: number }) => {
  const variant = score >= 80 ? 'default' : score >= 60 ? 'secondary' : score >= 40 ? 'outline' : 'destructive';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor';
  return <Badge variant={variant} className="text-[10px]">{score}/100 · {label}</Badge>;
};

const CheckItem = ({ passed, label, suggestion }: { passed: boolean; label: string; suggestion: string }) => (
  <div className="flex items-start gap-2 p-2 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors">
    {passed ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 shrink-0 mt-0.5" /> : <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{suggestion}</p>
    </div>
  </div>
);

const CharLengthBar = ({ length, min, max, label }: { length: number; min: number; max: number; label: string }) => {
  const pct = Math.min((length / (max * 1.5)) * 100, 100);
  const color = length >= min && length <= max ? 'bg-chart-1' : length >= min * 0.8 && length <= max * 1.2 ? 'bg-chart-4' : 'bg-destructive';
  const status = length >= min && length <= max ? 'Ideal' : length < min ? 'Too Short' : 'Too Long';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", length >= min && length <= max ? "text-chart-1" : length < min ? "text-destructive" : "text-chart-4")}>
          {length} chars · {status} ({min}-{max})
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const KeywordStrengthBadge = ({ volume, competition }: { volume: number; competition: string }) => {
  const isStrong = volume > 500 && competition === 'low';
  const isMedium = volume > 200 || competition === 'medium';
  return (
    <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0",
      isStrong ? "border-chart-1/50 text-chart-1" : isMedium ? "border-chart-4/50 text-chart-4" : "border-muted-foreground/50 text-muted-foreground"
    )}>
      {isStrong ? '🔥 Strong' : isMedium ? '⚡ Medium' : '💤 Weak'}
    </Badge>
  );
};

// ─── Progress Overlay ────────────────────────────────────────
const AnalysisProgress = ({ label, isPending }: { label: string; isPending: boolean }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPending) { setProgress(0); return; }
    setProgress(5);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 8;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isPending]);

  // When done, flash to 100
  useEffect(() => {
    if (!isPending && progress > 0) {
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 1200);
      return () => clearTimeout(t);
    }
  }, [isPending]);

  if (!isPending && progress === 0) return null;

  return (
    <Card className="bg-primary/5 border-primary/20 animate-in fade-in">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">{label}</p>
            <Progress value={progress} className="h-1.5 mt-1.5" />
          </div>
          <span className="text-xs font-bold text-primary tabular-nums">{Math.round(progress)}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── All 38 Indonesian Provinces ────────────────────────────
const INDONESIA_PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan',
  'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur',
  'Banten', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Papua Barat Daya',
].sort();

// ─── State SEO Stats Hook ───────────────────────────────────
function useStateSeoStats() {
  return useQuery({
    queryKey: ['state-seo-overview'],
    queryFn: async () => {
      // Get property counts per state
      const { data: propData } = await (supabase.from('properties') as any)
        .select('state')
        .not('state', 'is', null)
        .limit(1000);

      // Get SEO analyses with property state info
      const { data: seoData } = await (supabase.from('property_seo_analysis') as any)
        .select('property_id, seo_score, keyword_score, seo_keywords')
        .limit(1000);

      // Build state map
      const stateMap: Record<string, { total: number; analyzed: number; totalScore: number; totalKeywordScore: number; topKeywords: Record<string, number> }> = {};
      INDONESIA_PROVINCES.forEach(s => {
        stateMap[s] = { total: 0, analyzed: 0, totalScore: 0, totalKeywordScore: 0, topKeywords: {} };
      });

      // Count properties per state (normalize names)
      const stateNormMap: Record<string, string> = {};
      INDONESIA_PROVINCES.forEach(p => { stateNormMap[p.toLowerCase()] = p; });
      // Add common aliases
      const aliases: Record<string, string> = {
        'di yogyakarta': 'DI Yogyakarta', 'diy yogyakarta': 'DI Yogyakarta',
        'dki jakarta': 'DKI Jakarta', 'central java': 'Jawa Tengah',
        'east java': 'Jawa Timur', 'west java': 'Jawa Barat',
        'north sulawesi': 'Sulawesi Utara', 'south sulawesi': 'Sulawesi Selatan',
        'north sumatra': 'Sumatera Utara', 'west kalimantan': 'Kalimantan Barat',
        'west nusa tenggara': 'Nusa Tenggara Barat',
      };

      const propStateMap: Record<string, string> = {}; // property_id -> normalized state
      (propData || []).forEach((p: any) => {
        const raw = (p.state || '').trim();
        const norm = stateNormMap[raw.toLowerCase()] || aliases[raw.toLowerCase()] || raw;
        if (stateMap[norm]) {
          stateMap[norm].total++;
        }
      });

      // Map SEO data (we need property->state mapping)
      // For now, just use counts from seoData length
      const seoPropertyIds = new Set((seoData || []).map((s: any) => s.property_id));

      // We need to get property states for SEO-analyzed properties
      // Fetch in 50-ID chunks to prevent URL length overflow
      if (seoPropertyIds.size > 0) {
        const allIds = Array.from(seoPropertyIds);
        const CHUNK_SIZE = 50;
        const analyzedProps: any[] = [];
        for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
          const chunk = allIds.slice(i, i + CHUNK_SIZE);
          const { data } = await (supabase.from('properties') as any)
            .select('id, state')
            .in('id', chunk);
          if (data) analyzedProps.push(...data);
        }

        analyzedProps.forEach((p: any) => {
          const raw = (p.state || '').trim();
          const norm = stateNormMap[raw.toLowerCase()] || aliases[raw.toLowerCase()] || raw;
          if (!stateMap[norm]) return;
          const seo = (seoData || []).find((s: any) => s.property_id === p.id);
          if (seo) {
            stateMap[norm].analyzed++;
            stateMap[norm].totalScore += seo.seo_score || 0;
            stateMap[norm].totalKeywordScore += seo.keyword_score || 0;
            (seo.seo_keywords || []).forEach((kw: string) => {
              stateMap[norm].topKeywords[kw] = (stateMap[norm].topKeywords[kw] || 0) + 1;
            });
          }
        });
      }

      return INDONESIA_PROVINCES.map(state => {
        const d = stateMap[state];
        const avgScore = d.analyzed > 0 ? Math.round(d.totalScore / d.analyzed) : 0;
        const avgKwScore = d.analyzed > 0 ? Math.round(d.totalKeywordScore / d.analyzed) : 0;
        const topKws = Object.entries(d.topKeywords).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([kw]) => kw);
        return {
          state,
          totalProperties: d.total,
          analyzedCount: d.analyzed,
          avgSeoScore: avgScore,
          avgKeywordScore: avgKwScore,
          topKeywords: topKws,
          status: d.total === 0 ? 'no-data' : d.analyzed === 0 ? 'unanalyzed' : avgScore >= 70 ? 'good' : avgScore >= 40 ? 'needs-work' : 'poor',
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Location Filters Hook ──────────────────────────────────
function useLocationFilters() {
  return { states: INDONESIA_PROVINCES };
}

function useCitiesByState(state: string) {
  return useQuery({
    queryKey: ['seo-filter-cities', state],
    queryFn: async () => {
      const { data, error } = await (supabase.from('properties') as any)
        .select('city')
        .eq('state', state)
        .not('city', 'is', null)
        .limit(1000);
      if (error) throw error;
      const unique = [...new Set((data || []).map((d: any) => d.city).filter(Boolean))].sort() as string[];
      return unique;
    },
    enabled: !!state,
    staleTime: 10 * 60 * 1000,
  });
}

function useAreasByCity(city: string) {
  return useQuery({
    queryKey: ['seo-filter-areas', city],
    queryFn: async () => {
      const { data, error } = await (supabase.from('properties') as any)
        .select('location')
        .eq('city', city)
        .not('location', 'is', null)
        .limit(1000);
      if (error) throw error;
      const unique = [...new Set((data || []).map((d: any) => d.location).filter(Boolean))].sort() as string[];
      return unique;
    },
    enabled: !!city,
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Property Search Hook ────────────────────────────────────
function usePropertySearch(searchTerm: string, filters: { state?: string; city?: string; area?: string }) {
  return useQuery({
    queryKey: ['property-search-seo', searchTerm, filters],
    queryFn: async () => {
      let query = (supabase.from('properties') as any)
        .select('id, title, location, property_type, state, city')
        .limit(25);
      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      if (filters.state) query = query.eq('state', filters.state);
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.area) query = query.ilike('location', `%${filters.area}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as { id: string; title: string; location: string; property_type: string; state: string; city: string }[];
    },
    enabled: searchTerm.length >= 2 || searchTerm.length === 0,
    staleTime: 30 * 1000,
  });
}

// ─── Main Component ──────────────────────────────────────────
const PropertySEOChecker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<PropertySeoAnalysis | null>(null);
  
  // Location filters
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterArea, setFilterArea] = useState('');
  
  // Pagination
  const [allPage, setAllPage] = useState(1);
  const [weakPage, setWeakPage] = useState(1);
  const [topPage, setTopPage] = useState(1);
  const PAGE_SIZE = 25;
  
  // Manual property search
  const [propertySearch, setPropertySearch] = useState('');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  
  // Keywords manager
  const [newKeyword, setNewKeyword] = useState('');
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  
  // Trending keywords filters
  const [trendCategory, setTrendCategory] = useState('');
  const [trendLanguage, setTrendLanguage] = useState('');
  
  // AI optimization state
  const [aiResult, setAiResult] = useState<ContentOptimization | null>(null);
  const [autoOptThreshold, setAutoOptThreshold] = useState(70);
  
  // AI Auto-Fix state selection
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
  const [showAutoFixConfirm, setShowAutoFixConfirm] = useState(false);
  const [autoFixThreshold, setAutoFixThreshold] = useState(70);

  // Location filter object
  const locationFilters: SeoLocationFilters = useMemo(() => ({
    state: filterState && filterState !== '__all__' ? filterState : undefined,
    city: filterCity && filterCity !== '__all__' ? filterCity : undefined,
    area: filterArea && filterArea !== '__all__' ? filterArea : undefined,
  }), [filterState, filterCity, filterArea]);

  // Location data
  const { states } = useLocationFilters();
  const { data: cities = [] } = useCitiesByState(filterState);
  const { data: areas = [] } = useAreasByCity(filterCity);

  // Hooks
  const { data: stats, isLoading: statsLoading } = useSeoStats();
  const { data: filteredStats } = useFilteredSeoStats(locationFilters);
  const { data: stateSeoOverview = [], isLoading: stateOverviewLoading } = useStateSeoStats();
  const { data: allResult, isLoading: analysesLoading } = usePropertySeoAnalyses({ location: locationFilters, page: allPage, pageSize: PAGE_SIZE });
  const { data: weakResult } = usePropertySeoAnalyses({ filter: 'weak', location: locationFilters, page: weakPage, pageSize: PAGE_SIZE });
  const { data: topResult } = usePropertySeoAnalyses({ filter: 'excellent', location: locationFilters, page: topPage, pageSize: PAGE_SIZE });
  const allAnalyses = allResult?.data || [];
  const allTotalCount = allResult?.totalCount || 0;
  const weakListings = weakResult?.data || [];
  const weakTotalCount = weakResult?.totalCount || 0;
  const topListings = topResult?.data || [];
  const topTotalCount = topResult?.totalCount || 0;
  const { data: searchResults = [] } = usePropertySearch(propertySearch, { state: filterState, city: filterCity, area: filterArea });
  const { data: trendKeywords = [], isLoading: trendsLoading } = useSeoTrendKeywords({ 
    category: trendCategory || undefined, 
    language: trendLanguage || undefined, 
    limit: 30 
  });
  
  const analyzeBatch = useAnalyzeBatch();
  const autoOptimize = useAutoOptimize();
  const analyzeProperty = useAnalyzeProperty();
  const applySeo = useApplySeo();
  const contentOptimize = useContentOptimize();

  // Reset city/area on state change, reset pages on any filter change
  useEffect(() => { setFilterCity(''); setFilterArea(''); setAllPage(1); setWeakPage(1); setTopPage(1); }, [filterState]);
  useEffect(() => { setFilterArea(''); setAllPage(1); setWeakPage(1); setTopPage(1); }, [filterCity]);
  useEffect(() => { setAllPage(1); setWeakPage(1); setTopPage(1); }, [filterArea]);

  // Auto-analyze on property click if stale (>1hr)
  const handlePropertyClick = useCallback((analysis: PropertySeoAnalysis) => {
    setSelectedAnalysis(analysis);
    setSelectedPropertyId(analysis.property_id);
    setCustomKeywords(analysis.custom_keywords || []);
    setAiResult(null);
    setActiveTab('detail');
    
    // Auto-check if older than 1 hour
    const lastAnalyzed = new Date(analysis.last_analyzed_at).getTime();
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (lastAnalyzed < oneHourAgo && !analyzeProperty.isPending) {
      analyzeProperty.mutate(analysis.property_id);
    }
  }, [analyzeProperty]);

  // Manual property select from search
  const handleManualSelect = useCallback((property: { id: string; title: string }) => {
    setSelectedPropertyId(property.id);
    setPropertySearch('');
    setShowPropertyDropdown(false);
    setAiResult(null);
    setActiveTab('detail');
    // Always trigger analysis for manually selected property
    analyzeProperty.mutate(property.id);
  }, [analyzeProperty]);

  // Fetch the analysis for manually selected property
  const { data: manualAnalysis } = usePropertySeoAnalysis(selectedPropertyId || undefined);
  
  // Use manual analysis if no click-selected analysis, or if they match
  const currentAnalysis = useMemo(() => {
    if (manualAnalysis && selectedPropertyId === manualAnalysis.property_id) return manualAnalysis;
    return selectedAnalysis;
  }, [manualAnalysis, selectedAnalysis, selectedPropertyId]);

  // Sync custom keywords when analysis changes
  useEffect(() => {
    if (currentAnalysis) {
      setCustomKeywords(currentAnalysis.custom_keywords || []);
    }
  }, [currentAnalysis?.property_id]);

  // AI Content Optimize
  const handleAiOptimize = useCallback(() => {
    if (!selectedPropertyId) return;
    contentOptimize.mutate(selectedPropertyId, {
      onSuccess: (data) => setAiResult(data),
    });
  }, [selectedPropertyId, contentOptimize]);

  // Save custom keywords
  const handleSaveKeywords = useCallback(async () => {
    if (!currentAnalysis) return;
    const { error } = await (supabase.from('property_seo_analysis') as any)
      .update({ custom_keywords: customKeywords })
      .eq('property_id', currentAnalysis.property_id);
    if (error) {
      const { toast: t } = await import('sonner');
      t.error('Failed to save keywords');
    } else {
      const { toast: t } = await import('sonner');
      t.success('Custom keywords saved!');
    }
  }, [currentAnalysis, customKeywords]);

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim().toLowerCase();
    if (trimmed && !customKeywords.includes(trimmed)) {
      setCustomKeywords(prev => [...prev, trimmed]);
    }
    setNewKeyword('');
  };

  const removeKeyword = (kw: string) => {
    setCustomKeywords(prev => prev.filter(k => k !== kw));
  };

  // Apply trending keyword to property
  const applyTrendKeyword = (keyword: string) => {
    if (!customKeywords.includes(keyword.toLowerCase())) {
      setCustomKeywords(prev => [...prev, keyword.toLowerCase()]);
    }
  };

  const filteredAnalyses = useMemo(() => {
    if (!searchQuery) return allAnalyses;
    return allAnalyses.filter(item =>
      item.seo_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seo_keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allAnalyses, searchQuery]);

  const getScoreBreakdown = (analysis: PropertySeoAnalysis) => [
    { label: 'Title Optimization', passed: analysis.title_score >= 70, suggestion: analysis.title_score >= 70 ? 'Title is well-optimized' : 'Improve title with target keywords and proper length (50-60 chars)' },
    { label: 'Meta Description', passed: analysis.description_score >= 70, suggestion: analysis.description_score >= 70 ? 'Description is compelling' : 'Write a compelling description (120-160 chars) with keywords' },
    { label: 'Keyword Coverage', passed: analysis.keyword_score >= 70, suggestion: analysis.keyword_score >= 70 ? 'Good keyword coverage' : `Missing keywords: ${analysis.missing_keywords?.slice(0, 3).join(', ') || 'N/A'}` },
    { label: 'Image Alt Tags', passed: (analysis.image_score || 0) >= 70, suggestion: (analysis.image_score || 0) >= 70 ? 'Images have good alt text coverage' : 'Add descriptive alt text to all property images for better SEO' },
    { label: 'Hashtag Strategy', passed: analysis.hashtag_score >= 70, suggestion: analysis.hashtag_score >= 70 ? 'Hashtags are effective' : 'Add relevant hashtags for social discovery' },
    { label: 'Location SEO', passed: analysis.location_score >= 70, suggestion: analysis.location_score >= 70 ? 'Location signals are strong' : 'Include location-specific keywords (city, area, neighborhood)' },
  ];

  return (
    <div className="space-y-4">
      {/* Header + Actions */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Property SEO Checker
          </h2>
          <p className="text-xs text-muted-foreground">Auto-check on click · AI recommendations · Keyword manager</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => analyzeBatch.mutate({ limit: 20, filter: 'unanalyzed', ...locationFilters })} disabled={analyzeBatch.isPending}>
            {analyzeBatch.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
            Analyze Batch
          </Button>
          <div className="flex items-center gap-1">
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={autoOptThreshold}
              onChange={(e) => setAutoOptThreshold(Number(e.target.value))}
            >
              <option value={50}>Score &lt; 50</option>
              <option value={60}>Score &lt; 60</option>
              <option value={70}>Score &lt; 70</option>
              <option value={80}>Score &lt; 80</option>
            </select>
            <Button size="sm" onClick={() => autoOptimize.mutate({ threshold: autoOptThreshold, limit: 20, ...locationFilters })} disabled={autoOptimize.isPending}>
              {autoOptimize.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1.5" />}
              Auto-Optimize
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <AnalysisProgress label="Analyzing batch properties... This may take a moment." isPending={analyzeBatch.isPending} />
      <AnalysisProgress label="Auto-optimizing weak listings..." isPending={autoOptimize.isPending} />
      <AnalysisProgress label="Analyzing property SEO..." isPending={analyzeProperty.isPending} />

      {/* Location Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Filter by Location</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All States / Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All States</SelectItem>
                {states.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCity} onValueChange={setFilterCity} disabled={!filterState || filterState === '__all__'}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Cities</SelectItem>
                {cities.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterArea} onValueChange={setFilterArea} disabled={!filterCity || filterCity === '__all__'}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Areas</SelectItem>
                {areas.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(filterState && filterState !== '__all__') && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] mt-2" onClick={() => { setFilterState(''); setFilterCity(''); setFilterArea(''); }}>
              <X className="h-3 w-3 mr-1" /> Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Manual Property Selector */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Manual Property Selector</span>
            {analyzeProperty.isPending && <Badge variant="secondary" className="text-[10px] animate-pulse"><Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />Analyzing...</Badge>}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search any property by title to analyze..."
              value={propertySearch}
              onChange={(e) => { setPropertySearch(e.target.value); setShowPropertyDropdown(true); }}
              onFocus={() => setShowPropertyDropdown(true)}
              className="pl-9 h-8 text-xs"
            />
            {propertySearch && (
              <button onClick={() => { setPropertySearch(''); setShowPropertyDropdown(false); }} className="absolute right-2 top-2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            {showPropertyDropdown && propertySearch.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground text-center">No properties found</div>
                ) : searchResults.map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0"
                    onClick={() => handleManualSelect(p)}
                  >
                    <p className="text-xs font-medium truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">{p.location} · {p.property_type} {p.state ? `· ${p.state}` : ''}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtered Location SEO Status */}
      {filteredStats && (
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                SEO Status: {locationFilters.state}{locationFilters.city ? ` › ${locationFilters.city}` : ''}{locationFilters.area ? ` › ${locationFilters.area}` : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center p-2 rounded-lg border border-border bg-card">
                <p className="text-lg font-bold">{filteredStats.totalProperties}</p>
                <p className="text-[9px] text-muted-foreground">Total Properties</p>
              </div>
                <div className="text-center p-2 rounded-lg border border-border bg-card">
                <p className="text-lg font-bold text-chart-2">{filteredStats.analyzedCount}<span className="text-[10px] text-muted-foreground font-normal">/{filteredStats.totalProperties}</span></p>
                <p className="text-[9px] text-muted-foreground">Analyzed</p>
              </div>
                <div className="text-center p-2 rounded-lg border border-border bg-card">
                <p className={cn("text-lg font-bold", filteredStats.avgScore >= 70 ? "text-chart-1" : filteredStats.avgScore >= 40 ? "text-chart-4" : "text-destructive")}>{filteredStats.avgScore}</p>
                <p className="text-[9px] text-muted-foreground">Avg SEO Score</p>
                {stats && filteredStats.avgScore > 0 && (
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    {filteredStats.avgScore >= stats.avgScore ? (
                      <ArrowUpRight className="h-2.5 w-2.5 text-chart-1" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5 text-destructive" />
                    )}
                    <span className="text-[8px] text-muted-foreground">vs {stats.avgScore} global</span>
                  </div>
                )}
              </div>
              <div className="text-center p-2 rounded-lg border border-border bg-card">
                <div className="flex justify-center gap-2 text-[10px]">
                  <span className="text-chart-1 font-bold">{filteredStats.excellent}✓</span>
                  <span className="text-primary font-bold">{filteredStats.good}</span>
                  <span className="text-chart-4 font-bold">{filteredStats.needsImprovement}</span>
                  <span className="text-destructive font-bold">{filteredStats.poor}✗</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Score Breakdown</p>
              </div>
            </div>
            {/* Score distribution bar for filtered */}
            {filteredStats.analyzedCount > 0 && (
              <div className="space-y-1">
                <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
                  <div className="bg-chart-1 transition-all" style={{ width: `${(filteredStats.excellent / filteredStats.analyzedCount) * 100}%` }} />
                  <div className="bg-primary transition-all" style={{ width: `${(filteredStats.good / filteredStats.analyzedCount) * 100}%` }} />
                  <div className="bg-chart-4 transition-all" style={{ width: `${(filteredStats.needsImprovement / filteredStats.analyzedCount) * 100}%` }} />
                  <div className="bg-destructive transition-all" style={{ width: `${(filteredStats.poor / filteredStats.analyzedCount) * 100}%` }} />
                </div>
              </div>
            )}
            {/* Top keywords for location */}
            {filteredStats.topKeywords.length > 0 && (
              <div className="mt-2">
                <p className="text-[9px] text-muted-foreground mb-1">Top Keywords in Region</p>
                <div className="flex flex-wrap gap-1">
                  {filteredStats.topKeywords.map(kw => (
                    <Badge key={kw} variant="outline" className="text-[8px] px-1.5 py-0 border-primary/30 text-primary">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {[
          { label: 'Avg SEO Score', value: stats?.avgScore ?? 0, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
          { label: 'Total Properties', value: stats?.totalProperties ?? 0, icon: Globe, color: 'text-chart-2', bg: 'bg-chart-2/5 border-chart-2/20' },
          { label: 'Analyzed', value: stats?.analyzedCount ?? 0, icon: Target, color: 'text-chart-2', bg: 'bg-chart-2/5 border-chart-2/20' },
          { label: 'Good (≥70)', value: (stats?.excellent ?? 0) + (stats?.good ?? 0), icon: CheckCircle2, color: 'text-chart-1', bg: 'bg-chart-1/5 border-chart-1/20' },
          { label: 'Needs Work', value: stats?.needsImprovement ?? 0, icon: TrendingUp, color: 'text-chart-4', bg: 'bg-chart-4/5 border-chart-4/20' },
          { label: 'Poor (<40)', value: stats?.poor ?? 0, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
          { label: 'Unanalyzed', value: (stats?.totalProperties ?? 0) - (stats?.analyzedCount ?? 0), icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/40' },
        ].map(stat => (
          <Card key={stat.label} className={stat.bg}>
            <CardContent className="p-2.5 text-center">
              <stat.icon className={cn("h-4 w-4 mx-auto mb-1", stat.color)} />
              <p className={cn("text-xl font-bold tabular-nums", stat.color)}>{statsLoading ? '...' : stat.value}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Distribution */}
      {stats && (
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Score Distribution</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
              {stats.analyzedCount > 0 && (
                <>
                  <div className="bg-chart-1 transition-all" style={{ width: `${(stats.excellent / stats.analyzedCount) * 100}%` }} />
                  <div className="bg-primary transition-all" style={{ width: `${(stats.good / stats.analyzedCount) * 100}%` }} />
                  <div className="bg-chart-4 transition-all" style={{ width: `${(stats.needsImprovement / stats.analyzedCount) * 100}%` }} />
                  <div className="bg-destructive transition-all" style={{ width: `${(stats.poor / stats.analyzedCount) * 100}%` }} />
                </>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-chart-1" /> Excellent</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Good</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-chart-4" /> Needs Work</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive" /> Poor</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Charts */}
      <SeoDashboardCharts stats={stats} stateSeoOverview={stateSeoOverview} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="bg-muted/40 border border-border/30 flex-wrap">
          <TabsTrigger value="dashboard" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />All Properties</TabsTrigger>
          <TabsTrigger value="states" className="text-xs gap-1"><MapPin className="h-3 w-3" />State Overview</TabsTrigger>
          <TabsTrigger value="weak" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" />Weak ({weakTotalCount})</TabsTrigger>
          <TabsTrigger value="top" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Top ({topTotalCount})</TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs gap-1"><Flame className="h-3 w-3" />Keywords</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1"><TrendingUp className="h-3 w-3" />History</TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs gap-1"><Loader2 className="h-3 w-3" />AI Jobs</TabsTrigger>
          {currentAnalysis && <TabsTrigger value="detail" className="text-xs gap-1"><Eye className="h-3 w-3" />Detail</TabsTrigger>}
        </TabsList>

        {/* ─── State SEO Overview Tab ─── */}
        <TabsContent value="states" className="space-y-3">
          <StateSeoOverviewTab
            stateSeoOverview={stateSeoOverview}
            stateOverviewLoading={stateOverviewLoading}
            selectedStates={selectedStates}
            setSelectedStates={setSelectedStates}
            autoFixThreshold={autoFixThreshold}
            setAutoFixThreshold={setAutoFixThreshold}
            showAutoFixConfirm={showAutoFixConfirm}
            setShowAutoFixConfirm={setShowAutoFixConfirm}
            autoOptimize={autoOptimize}
            filterState={filterState}
            setFilterState={setFilterState}
            setActiveTab={setActiveTab}
          />
        </TabsContent>

        {/* ─── All Properties Tab ─── */}
        <TabsContent value="dashboard" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by title or keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
          </div>
          {analysesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredAnalyses.length > 0 ? (
            <div className="space-y-2">
              {filteredAnalyses.map(item => (
                <Card key={item.id} className="bg-card/60 border-border/40 hover:border-primary/30 transition-all cursor-pointer" onClick={() => handlePropertyClick(item)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.seo_title || 'Untitled Property'}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.seo_description?.slice(0, 100)}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {item.seo_keywords?.slice(0, 4).map(kw => (
                            <Badge key={kw} variant="outline" className="text-[8px] px-1 py-0">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <ScoreBadge score={item.seo_score} />
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={(e) => { e.stopPropagation(); analyzeProperty.mutate(item.property_id); }} disabled={analyzeProperty.isPending}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Re-analyze
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={(e) => { e.stopPropagation(); applySeo.mutate(item.property_id); }} disabled={applySeo.isPending}>
                            <Zap className="h-3 w-3 mr-1" /> Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <SearchPagination
                currentPage={allPage}
                totalPages={Math.ceil(allTotalCount / PAGE_SIZE)}
                totalCount={allTotalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setAllPage}
                disabled={analysesLoading}
              />
            </div>
          ) : (
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-8 text-center">
                <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No analyzed properties found</p>
                <Button size="sm" className="mt-3" onClick={() => analyzeBatch.mutate({ limit: 20, filter: 'unanalyzed', ...locationFilters })}>Start Analyzing</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Weak Tab ─── */}
        <TabsContent value="weak" className="space-y-2">
          {weakListings.length > 0 ? (
            <>
              {weakListings.map(item => (
                <Card key={item.id} className="bg-card/60 border-border/40 border-l-2 border-l-destructive hover:border-primary/30 cursor-pointer transition-all" onClick={() => handlePropertyClick(item)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.seo_title || 'Untitled'}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.missing_keywords?.slice(0, 3).map(kw => (
                            <Badge key={kw} variant="destructive" className="text-[8px] px-1 py-0">Missing: {kw}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ScoreBadge score={item.seo_score} />
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={(e) => { e.stopPropagation(); applySeo.mutate(item.property_id); }}>
                          <Zap className="h-3 w-3 mr-1" /> Fix
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <SearchPagination
                currentPage={weakPage}
                totalPages={Math.ceil(weakTotalCount / PAGE_SIZE)}
                totalCount={weakTotalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setWeakPage}
              />
            </>
          ) : (
            <Card className="bg-card/60"><CardContent className="p-8 text-center text-sm text-muted-foreground">No weak listings — great job! 🎉</CardContent></Card>
          )}
        </TabsContent>

        {/* ─── Top Tab ─── */}
        <TabsContent value="top" className="space-y-2">
          {topListings.length > 0 ? (
            <>
              {topListings.map(item => (
                <Card key={item.id} className="bg-card/60 border-border/40 border-l-2 border-l-chart-1 hover:border-primary/30 cursor-pointer transition-all" onClick={() => handlePropertyClick(item)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.seo_title || 'Untitled'}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.seo_keywords?.slice(0, 5).map(kw => (
                            <Badge key={kw} variant="secondary" className="text-[8px] px-1 py-0">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                      <ScoreBadge score={item.seo_score} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <SearchPagination
                currentPage={topPage}
                totalPages={Math.ceil(topTotalCount / PAGE_SIZE)}
                totalCount={topTotalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setTopPage}
              />
            </>
          ) : (
            <Card className="bg-card/60"><CardContent className="p-8 text-center text-sm text-muted-foreground">No excellent listings yet. Run Auto-Optimize!</CardContent></Card>
          )}
        </TabsContent>

        {/* ─── Trending Keywords Tab ─── */}
        <TabsContent value="keywords" className="space-y-3">
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-destructive" />
                Trending & Strong Keywords
              </CardTitle>
              <CardDescription className="text-[10px]">
                Discover high-volume, low-competition keywords to boost property rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {/* Filters */}
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Filter by category..."
                  value={trendCategory}
                  onChange={(e) => setTrendCategory(e.target.value)}
                  className="h-7 text-xs flex-1"
                />
                <Input
                  placeholder="Language..."
                  value={trendLanguage}
                  onChange={(e) => setTrendLanguage(e.target.value)}
                  className="h-7 text-xs w-24"
                />
              </div>

              {trendsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : trendKeywords.length > 0 ? (
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-2 py-1 text-[9px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30">
                    <span className="col-span-4">Keyword</span>
                    <span className="col-span-2">Volume</span>
                    <span className="col-span-2">Trend</span>
                    <span className="col-span-2">Competition</span>
                    <span className="col-span-2">Action</span>
                  </div>
                  {trendKeywords.map(tk => (
                    <div key={tk.id} className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-md hover:bg-accent/30 transition-colors border border-transparent hover:border-border/30">
                      <div className="col-span-4 flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium truncate">{tk.keyword}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs">{tk.search_volume?.toLocaleString() || '-'}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        {tk.trend_direction === 'up' ? (
                          <ArrowUpRight className="h-3 w-3 text-chart-1" />
                        ) : tk.trend_direction === 'down' ? (
                          <ArrowDownRight className="h-3 w-3 text-destructive" />
                        ) : (
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="text-[10px]">{tk.trend_score}</span>
                      </div>
                      <div className="col-span-2">
                        <KeywordStrengthBadge volume={tk.search_volume} competition={tk.competition_level} />
                      </div>
                      <div className="col-span-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-[9px]"
                          onClick={() => applyTrendKeyword(tk.keyword)}
                          disabled={!currentAnalysis}
                        >
                          <Plus className="h-2.5 w-2.5 mr-0.5" /> Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No trending keywords found. Try different filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── History Tab ─── */}
        <TabsContent value="history" className="space-y-3">
          <SeoHistoryTab />
        </TabsContent>

        {/* ─── AI Jobs Tab ─── */}
        <TabsContent value="jobs" className="space-y-3">
          <AiJobsTab />
        </TabsContent>

        {/* ─── Detail View Tab ─── */}
        <TabsContent value="detail">
          {currentAnalysis ? (
            <div className="space-y-3">
              {/* Header Card */}
              <Card className="bg-card/60 border-border/40">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm">{currentAnalysis.seo_title || 'Untitled Property'}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => analyzeProperty.mutate(currentAnalysis.property_id)} disabled={analyzeProperty.isPending}>
                        {analyzeProperty.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                        Re-analyze
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAiOptimize} disabled={contentOptimize.isPending}>
                        {contentOptimize.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                        AI Optimize
                      </Button>
                      <Button size="sm" className="h-7 text-xs" onClick={() => applySeo.mutate(currentAnalysis.property_id)} disabled={applySeo.isPending}>
                        <Zap className="h-3 w-3 mr-1" /> Apply SEO
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[10px] line-clamp-2">{currentAnalysis.seo_description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex items-center gap-3 mb-3">
                    <ScoreBadge score={currentAnalysis.seo_score} />
                    <Badge variant="outline" className="text-[10px]">Difficulty: {currentAnalysis.ranking_difficulty}</Badge>
                    <Badge variant="outline" className="text-[10px]">AI: {currentAnalysis.ai_model_used}</Badge>
                    {analyzeProperty.isPending && (
                      <Badge variant="secondary" className="text-[10px] animate-pulse">
                        <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" /> Analyzing...
                      </Badge>
                    )}
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {[
                      { label: 'Title (25%)', score: currentAnalysis.title_score, icon: FileText },
                      { label: 'Description (25%)', score: currentAnalysis.description_score, icon: FileText },
                      { label: 'Keywords (25%)', score: currentAnalysis.keyword_score, icon: Hash },
                      { label: 'Image Alt (25%)', score: currentAnalysis.image_score || 0, icon: Eye },
                      { label: 'Hashtags', score: currentAnalysis.hashtag_score, icon: Hash },
                      { label: 'Location', score: currentAnalysis.location_score, icon: Globe },
                    ].map(sub => (
                      <div key={sub.label} className="text-center p-2 rounded-lg border border-border/50 bg-muted/20">
                        <sub.icon className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
                        <p className="text-lg font-bold">{sub.score}</p>
                        <p className="text-[8px] text-muted-foreground">{sub.label}</p>
                        <Progress value={sub.score} className="h-1 mt-1" />
                      </div>
                    ))}
                  </div>

                  {/* Title & Description Length Checker */}
                  <div className="space-y-2 mb-3 p-2.5 rounded-lg border border-border/50 bg-muted/10">
                    <p className="text-xs font-medium flex items-center gap-1"><FileText className="h-3 w-3 text-primary" /> Title & Description Checker</p>
                    <CharLengthBar length={currentAnalysis.seo_title?.length || 0} min={50} max={60} label="Title" />
                    <CharLengthBar length={currentAnalysis.seo_description?.length || 0} min={120} max={160} label="Description" />
                  </div>

                  {/* SEO Checklist */}
                  <div className="space-y-1.5 mb-3">
                    <p className="text-xs font-medium flex items-center gap-1"><Lightbulb className="h-3 w-3 text-chart-4" /> SEO Checklist</p>
                    {getScoreBreakdown(currentAnalysis).map((check, i) => (
                      <CheckItem key={i} {...check} />
                    ))}
                  </div>

                  {/* Keywords & Hashtags (existing + suggested) */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Current Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {currentAnalysis.seo_keywords?.map(kw => (
                          <Badge key={kw} variant="secondary" className="text-[8px] px-1.5 py-0">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Suggested Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {currentAnalysis.suggested_keywords?.map(kw => (
                          <Badge key={kw} variant="outline" className="text-[8px] px-1.5 py-0 border-chart-1/30 text-chart-1 cursor-pointer hover:bg-chart-1/10" onClick={() => addKeyword(kw)}>
                            <Plus className="h-2 w-2 mr-0.5" />{kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Keywords Manager */}
              <Card className="bg-card/60 border-border/40">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4 text-chart-2" />
                    Manual Keywords Manager
                  </CardTitle>
                  <CardDescription className="text-[10px]">Add, remove, and manage custom keywords for this property</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {/* Add keyword input */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add a keyword..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(newKeyword); } }}
                      className="h-7 text-xs flex-1"
                    />
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addKeyword(newKeyword)} disabled={!newKeyword.trim()}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                    <Button size="sm" className="h-7 text-xs" onClick={handleSaveKeywords}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Save
                    </Button>
                  </div>
                  
                  {/* Keywords tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {customKeywords.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground">No custom keywords yet. Add keywords above or click suggested keywords.</p>
                    ) : customKeywords.map(kw => {
                      // Check against trend data for strength
                      const trend = trendKeywords.find(t => t.keyword.toLowerCase() === kw.toLowerCase());
                      return (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="text-[10px] px-2 py-0.5 flex items-center gap-1 group"
                        >
                          {kw}
                          {trend && <KeywordStrengthBadge volume={trend.search_volume} competition={trend.competition_level} />}
                          <button onClick={() => removeKeyword(kw)} className="ml-1 opacity-50 group-hover:opacity-100">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations Card */}
              {aiResult && (
                <Card className="bg-card/60 border-border/40 border-l-2 border-l-primary">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription className="text-[10px]">AI-optimized suggestions — review and apply</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    {/* Title comparison */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground">Title</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-md border border-border/50 bg-muted/20">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Current</p>
                          <p className="text-xs">{currentAnalysis.seo_title}</p>
                          <CharLengthBar length={currentAnalysis.seo_title?.length || 0} min={50} max={60} label="" />
                        </div>
                        <div className="p-2 rounded-md border border-chart-1/30 bg-chart-1/5">
                          <p className="text-[9px] text-chart-1 mb-0.5">AI Optimized</p>
                          <p className="text-xs font-medium">{aiResult.optimized_title}</p>
                          <CharLengthBar length={aiResult.optimized_title?.length || 0} min={50} max={60} label="" />
                        </div>
                      </div>
                    </div>

                    {/* Description comparison */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground">Description</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-md border border-border/50 bg-muted/20">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Current</p>
                          <p className="text-[10px] line-clamp-3">{currentAnalysis.seo_description}</p>
                        </div>
                        <div className="p-2 rounded-md border border-chart-1/30 bg-chart-1/5">
                          <p className="text-[9px] text-chart-1 mb-0.5">AI Optimized</p>
                          <p className="text-[10px] line-clamp-3 font-medium">{aiResult.optimized_description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Focus & Secondary Keywords */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Focus Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {aiResult.focus_keywords?.map(kw => (
                            <Badge key={kw} variant="default" className="text-[8px] px-1.5 py-0 cursor-pointer" onClick={() => addKeyword(kw)}>
                              <Plus className="h-2 w-2 mr-0.5" />{kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Secondary Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {aiResult.secondary_keywords?.map(kw => (
                            <Badge key={kw} variant="outline" className="text-[8px] px-1.5 py-0 cursor-pointer" onClick={() => addKeyword(kw)}>
                              <Plus className="h-2 w-2 mr-0.5" />{kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Readability Tips */}
                    {aiResult.readability_tips?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Readability Tips</p>
                        <div className="space-y-1">
                          {aiResult.readability_tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px] text-foreground/80">
                              <Lightbulb className="h-3 w-3 text-chart-4 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Score */}
                    <div className="flex items-center justify-between p-2 rounded-md border border-border/50 bg-muted/10">
                      <span className="text-xs text-muted-foreground">AI Content Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={aiResult.content_score} className="w-20 h-1.5" />
                        <span className="text-xs font-bold">{aiResult.content_score}/100</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Button size="sm" className="w-full h-8 text-xs" onClick={() => applySeo.mutate(currentAnalysis.property_id)} disabled={applySeo.isPending}>
                      {applySeo.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
                      Apply All AI Suggestions
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!aiResult && !contentOptimize.isPending && (
                <Card className="bg-card/60 border-border/40 border-dashed">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground mb-2">Click "AI Optimize" to get AI-powered recommendations for this property</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAiOptimize}>
                      <Sparkles className="h-3 w-3 mr-1" /> Get AI Recommendations
                    </Button>
                  </CardContent>
                </Card>
              )}

              {contentOptimize.isPending && (
                <Card className="bg-card/60 border-border/40">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">AI is analyzing and optimizing content...</p>
                    <Progress value={65} className="h-1.5 mt-3 max-w-xs mx-auto" />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-card/60"><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a property from the list or use the manual selector above</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertySEOChecker;
