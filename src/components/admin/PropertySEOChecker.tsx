import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSeoAudit, type SeoAuditResult } from '@/hooks/useSeoAudit';
import { useTitleRewrite, type TitleRewriteResponse } from '@/hooks/useTitleRewrite';
import { useDescriptionRewrite, type DescriptionRewriteResponse } from '@/hooks/useDescriptionRewrite';
import { useTrafficPrediction, type TrafficPredictionResponse } from '@/hooks/useTrafficPrediction';
import { useInternalLinking, type InternalLinkingResponse } from '@/hooks/useInternalLinking';
import { useLandingPageGenerator, type LandingPageResponse, type LandingPageInput } from '@/hooks/useLandingPageGenerator';
import { useKeywordCluster, type KeywordClusterResponse, type KeywordClusterInput } from '@/hooks/useKeywordCluster';
import { useUrlSlugGenerator, type UrlSlugResponse } from '@/hooks/useUrlSlugGenerator';
import { useInvestmentAttractiveness, type InvestmentAttractivenessResponse } from '@/hooks/useInvestmentAttractiveness';
import { useMarketTrendPrediction, type MarketTrendResponse } from '@/hooks/useMarketTrendPrediction';
import { useRentalEstimate, type RentalEstimateResponse } from '@/hooks/useRentalEstimate';
import { generateInvestmentBadge } from '@/hooks/useInvestmentBadge';
import { useBuyerIntentAnalyzer, type BuyerIntentResponse } from '@/hooks/useBuyerIntentAnalyzer';
import { classifyLeadPriority } from '@/hooks/useLeadPriority';
import { useSalesReplyGenerator, type SalesReplyResponse } from '@/hooks/useSalesReplyGenerator';
import { usePriceBenchmark, type PriceBenchmarkResponse } from '@/hooks/usePriceBenchmark';
import { useMarketHeat, type MarketHeatResponse } from '@/hooks/useMarketHeat';
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
import SeoPlatformHealthTab from './seo/SeoPlatformHealthTab';

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
  const [auditResult, setAuditResult] = useState<SeoAuditResult | null>(null);
  const [titleRewriteResult, setTitleRewriteResult] = useState<TitleRewriteResponse | null>(null);
  const [descRewriteResult, setDescRewriteResult] = useState<DescriptionRewriteResponse | null>(null);
  const [trafficResult, setTrafficResult] = useState<TrafficPredictionResponse | null>(null);
  const [linkingResult, setLinkingResult] = useState<InternalLinkingResponse | null>(null);
  const [landingPageResult, setLandingPageResult] = useState<LandingPageResponse | null>(null);
  const [kwClusterResult, setKwClusterResult] = useState<KeywordClusterResponse | null>(null);
  const [urlSlugResult, setUrlSlugResult] = useState<UrlSlugResponse | null>(null);
  const [investAttrResult, setInvestAttrResult] = useState<InvestmentAttractivenessResponse | null>(null);
  const [iaPropertyType, setIaPropertyType] = useState('');
  const [iaTransactionType, setIaTransactionType] = useState('');
  const [iaPrice, setIaPrice] = useState('');
  const [iaBuildingSize, setIaBuildingSize] = useState('');
  const [iaLandSize, setIaLandSize] = useState('');
  const [iaNearby, setIaNearby] = useState('');
  const [marketTrendResult, setMarketTrendResult] = useState<MarketTrendResponse | null>(null);
  const [mtPropertyType, setMtPropertyType] = useState('');
  const [rentalEstResult, setRentalEstResult] = useState<RentalEstimateResponse | null>(null);
  const [rePropertyType, setRePropertyType] = useState('');
  const [rePrice, setRePrice] = useState('');
  const [reNearby, setReNearby] = useState('');
  const [badgeScore, setBadgeScore] = useState('');
  const [badgeTrend, setBadgeTrend] = useState<'UP' | 'STABLE' | 'DOWN'>('UP');
  const [badgeYield, setBadgeYield] = useState('');
  const [badgeResult, setBadgeResult] = useState<{ badge: string; color: string } | null>(null);
  const [biMessage, setBiMessage] = useState('');
  const [biPropertyType, setBiPropertyType] = useState('');
  const [biTransactionType, setBiTransactionType] = useState('');
  const [biCity, setBiCity] = useState('');
  const [buyerIntentResult, setBuyerIntentResult] = useState<BuyerIntentResponse | null>(null);
  const [lpScore, setLpScore] = useState('');
  const [lpBudgetLevel, setLpBudgetLevel] = useState('clear');
  const [lpVisitPlan, setLpVisitPlan] = useState('yes');
  const [lpTimeframe, setLpTimeframe] = useState('this_week');
  const [leadPriorityResult, setLeadPriorityResult] = useState<{ lead_priority: string; follow_up_strategy: string; urgency_color: string } | null>(null);
  const [srMessage, setSrMessage] = useState('');
  const [srLocation, setSrLocation] = useState('');
  const [salesReplyResult, setSalesReplyResult] = useState<SalesReplyResponse | null>(null);
  const [pbPropertyType, setPbPropertyType] = useState('villa');
  const [pbTransactionType, setPbTransactionType] = useState('sale');
  const [pbPrice, setPbPrice] = useState('');
  const [pbBuildingSize, setPbBuildingSize] = useState('');
  const [pbLandSize, setPbLandSize] = useState('');
  const [pbVillage, setPbVillage] = useState('');
  const [pbDistrict, setPbDistrict] = useState('');
  const [pbCity, setPbCity] = useState('');
  const [pbProvince, setPbProvince] = useState('');
  const [pbNearby, setPbNearby] = useState('');
  const [priceBenchmarkResult, setPriceBenchmarkResult] = useState<PriceBenchmarkResponse | null>(null);
  const [mhVillage, setMhVillage] = useState('');
  const [mhDistrict, setMhDistrict] = useState('');
  const [mhCity, setMhCity] = useState('');
  const [mhPropertyType, setMhPropertyType] = useState('rumah');
  const [marketHeatResult, setMarketHeatResult] = useState<MarketHeatResponse | null>(null);
  const [lpProvince, setLpProvince] = useState('');
  const [lpCity, setLpCity] = useState('');
  const [lpDistrict, setLpDistrict] = useState('');
  const [lpVillage, setLpVillage] = useState('');
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
  const seoAudit = useSeoAudit();
  const titleRewrite = useTitleRewrite();
  const descRewrite = useDescriptionRewrite();
  const trafficPrediction = useTrafficPrediction();
  const internalLinking = useInternalLinking();
  const landingPageGen = useLandingPageGenerator();
  const kwCluster = useKeywordCluster();
  const urlSlugGen = useUrlSlugGenerator();
  const investAttr = useInvestmentAttractiveness();
  const marketTrend = useMarketTrendPrediction();
  const rentalEst = useRentalEstimate();
  const buyerIntent = useBuyerIntentAnalyzer();
  const salesReply = useSalesReplyGenerator();
  const priceBenchmark = usePriceBenchmark();
  const marketHeat = useMarketHeat();

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
    setTitleRewriteResult(null);
    setDescRewriteResult(null);
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
    setTitleRewriteResult(null);
    setDescRewriteResult(null);
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

  const handleAiAudit = useCallback(() => {
    if (!selectedPropertyId) return;
    seoAudit.mutate(selectedPropertyId, {
      onSuccess: (data) => setAuditResult(data),
    });
  }, [selectedPropertyId, seoAudit]);

  const handleTitleRewrite = useCallback(() => {
    if (!selectedPropertyId) return;
    titleRewrite.mutate(selectedPropertyId, {
      onSuccess: (data) => setTitleRewriteResult(data),
    });
  }, [selectedPropertyId, titleRewrite]);

  const handleDescRewrite = useCallback(() => {
    if (!selectedPropertyId) return;
    descRewrite.mutate(selectedPropertyId, {
      onSuccess: (data) => setDescRewriteResult(data),
    });
  }, [selectedPropertyId, descRewrite]);

  const handleTrafficPrediction = useCallback(() => {
    if (!selectedPropertyId) return;
    trafficPrediction.mutate(selectedPropertyId, {
      onSuccess: (data) => setTrafficResult(data),
    });
  }, [selectedPropertyId, trafficPrediction]);

  const handleInternalLinking = useCallback(() => {
    if (!selectedPropertyId) return;
    internalLinking.mutate(selectedPropertyId, {
      onSuccess: (data) => setLinkingResult(data),
    });
  }, [selectedPropertyId, internalLinking]);

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
          { label: 'Avg SEO Score', value: stats?.avgScore ?? 0, icon: BarChart3, color: 'text-primary', bg: 'bg-card border-border' },
          { label: 'Total Properties', value: stats?.totalProperties ?? 0, icon: Globe, color: 'text-chart-2', bg: 'bg-card border-border' },
          { label: 'Analyzed', value: stats?.analyzedCount ?? 0, icon: Target, color: 'text-chart-2', bg: 'bg-card border-border' },
          { label: 'Good (≥70)', value: (stats?.excellent ?? 0) + (stats?.good ?? 0), icon: CheckCircle2, color: 'text-chart-1', bg: 'bg-card border-border' },
          { label: 'Needs Work', value: stats?.needsImprovement ?? 0, icon: TrendingUp, color: 'text-chart-4', bg: 'bg-card border-border' },
          { label: 'Poor (<40)', value: stats?.poor ?? 0, icon: XCircle, color: 'text-destructive', bg: 'bg-card border-border' },
          { label: 'Unanalyzed', value: (stats?.totalProperties ?? 0) - (stats?.analyzedCount ?? 0), icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-card border-border' },
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
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Score Distribution</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
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
        <TabsList className="bg-muted border border-border flex-wrap">
          <TabsTrigger value="dashboard" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />All Properties</TabsTrigger>
          <TabsTrigger value="states" className="text-xs gap-1"><MapPin className="h-3 w-3" />State Overview</TabsTrigger>
          <TabsTrigger value="weak" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" />Weak ({weakTotalCount})</TabsTrigger>
          <TabsTrigger value="top" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Top ({topTotalCount})</TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs gap-1"><Flame className="h-3 w-3" />Keywords</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1"><TrendingUp className="h-3 w-3" />History</TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs gap-1"><Loader2 className="h-3 w-3" />AI Jobs</TabsTrigger>
          <TabsTrigger value="platform-health" className="text-xs gap-1"><Sparkles className="h-3 w-3" />Platform Health</TabsTrigger>
          <TabsTrigger value="landing-gen" className="text-xs gap-1"><FileText className="h-3 w-3" />Landing Gen</TabsTrigger>
          <TabsTrigger value="kw-cluster" className="text-xs gap-1"><Hash className="h-3 w-3" />KW Cluster</TabsTrigger>
          <TabsTrigger value="url-slugs" className="text-xs gap-1"><Globe className="h-3 w-3" />URL Slugs</TabsTrigger>
          <TabsTrigger value="invest-attr" className="text-xs gap-1"><TrendingUp className="h-3 w-3" />Invest Score</TabsTrigger>
          <TabsTrigger value="market-trend" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />Trend</TabsTrigger>
          <TabsTrigger value="rental-est" className="text-xs gap-1"><Sparkles className="h-3 w-3" />Rental</TabsTrigger>
          <TabsTrigger value="invest-badge" className="text-xs gap-1"><Tag className="h-3 w-3" />Badge</TabsTrigger>
          <TabsTrigger value="buyer-intent" className="text-xs gap-1"><Flame className="h-3 w-3" />Intent</TabsTrigger>
          <TabsTrigger value="lead-priority" className="text-xs gap-1"><Target className="h-3 w-3" />Priority</TabsTrigger>
          <TabsTrigger value="sales-reply" className="text-xs gap-1"><Zap className="h-3 w-3" />Reply</TabsTrigger>
          <TabsTrigger value="price-bench" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />Benchmark</TabsTrigger>
          <TabsTrigger value="market-heat" className="text-xs gap-1"><Flame className="h-3 w-3" />Heat</TabsTrigger>
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
                <Card key={item.id} className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={() => handlePropertyClick(item)}>
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
            <Card className="bg-card border-border">
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
                <Card key={item.id} className="bg-card border-border border-l-2 border-l-destructive hover:border-primary/30 cursor-pointer transition-all" onClick={() => handlePropertyClick(item)}>
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
            <Card className="bg-card border-border"><CardContent className="p-8 text-center text-sm text-muted-foreground">No weak listings — great job! 🎉</CardContent></Card>
          )}
        </TabsContent>

        {/* ─── Top Tab ─── */}
        <TabsContent value="top" className="space-y-2">
          {topListings.length > 0 ? (
            <>
              {topListings.map(item => (
                <Card key={item.id} className="bg-card border-border border-l-2 border-l-chart-1 hover:border-primary/30 cursor-pointer transition-all" onClick={() => handlePropertyClick(item)}>
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
            <Card className="bg-card border-border"><CardContent className="p-8 text-center text-sm text-muted-foreground">No excellent listings yet. Run Auto-Optimize!</CardContent></Card>
          )}
        </TabsContent>

        {/* ─── Trending Keywords Tab ─── */}
        <TabsContent value="keywords" className="space-y-3">
          <Card className="bg-card border-border">
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

        {/* ─── Platform Health Tab ─── */}
        <TabsContent value="platform-health" className="space-y-3">
          <SeoPlatformHealthTab />
        </TabsContent>

        {/* ─── Landing Page Generator Tab ─── */}
        <TabsContent value="landing-gen" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                SEO Landing Page Content Generator
              </CardTitle>
              <CardDescription className="text-[10px]">
                Generate structured SEO content for property location landing pages
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Province *</label>
                  <Select value={lpProvince} onValueChange={setLpProvince}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select province" /></SelectTrigger>
                    <SelectContent>
                      {INDONESIA_PROVINCES.map(p => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City *</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Denpasar" value={lpCity} onChange={e => setLpCity(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">District</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Kuta Selatan" value={lpDistrict} onChange={e => setLpDistrict(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Village</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Ungasan" value={lpVillage} onChange={e => setLpVillage(e.target.value)} />
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!lpProvince || !lpCity || landingPageGen.isPending}
                onClick={() => {
                  landingPageGen.mutate(
                    { province: lpProvince, city: lpCity, district: lpDistrict, village: lpVillage },
                    { onSuccess: (data) => setLandingPageResult(data) }
                  );
                }}
              >
                {landingPageGen.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Generate Landing Page Content
              </Button>
            </CardContent>
          </Card>

          {landingPageGen.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is generating SEO landing page content...</p>
                <Progress value={60} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {landingPageResult && (
            <div className="space-y-3">
              {/* SEO Title & Meta */}
              <Card className="bg-card border-border border-l-2 border-l-primary">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Google SERP Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="p-3 rounded-md border border-border/50 bg-background space-y-1">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      {landingPageResult.result.seo_title}
                    </p>
                    <p className="text-[10px] text-chart-1 font-mono">
                      astra-villa-realty.lovable.app/properties/{lpCity.toLowerCase().replace(/\s+/g, '-')}
                    </p>
                    <p className="text-xs text-muted-foreground">{landingPageResult.result.meta_description}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] text-muted-foreground">{landingPageResult.result.seo_title.length}/65 chars</span>
                    <span className="text-[9px] text-muted-foreground">•</span>
                    <span className="text-[9px] text-muted-foreground">{landingPageResult.result.meta_description.length}/160 chars</span>
                  </div>
                </CardContent>
              </Card>

              {/* Content Sections */}
              {[
                { title: "📝 Intro Content", content: landingPageResult.result.intro_content, color: "chart-1" },
                { title: "💰 Investment Potential", content: landingPageResult.result.investment_section, color: "chart-2" },
                { title: "🏠 Rental Opportunity", content: landingPageResult.result.rental_potential_section, color: "chart-3" },
                { title: "🌴 Lifestyle & Attractions", content: landingPageResult.result.lifestyle_section, color: "chart-4" },
                { title: "🛣️ Infrastructure & Access", content: landingPageResult.result.infrastructure_section, color: "primary" },
              ].map((section, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-[11px] text-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
                  </CardContent>
                </Card>
              ))}

              {/* Keywords */}
              <Card className="bg-card border-border">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-primary" /> Target Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">Primary Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {landingPageResult.result.primary_keywords.map((kw, i) => (
                        <Badge key={i} variant="default" className="text-[9px]">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">Secondary Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {landingPageResult.result.secondary_keywords.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-[9px]">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─── Keyword Cluster Tab ─── */}
        <TabsContent value="kw-cluster" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Keyword Cluster Generator
              </CardTitle>
              <CardDescription className="text-[10px]">
                Generate 50 high-intent Indonesian property keywords clustered by search intent
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Province *</label>
                  <Select value={lpProvince} onValueChange={setLpProvince}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select province" /></SelectTrigger>
                    <SelectContent>
                      {INDONESIA_PROVINCES.map(p => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City *</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Denpasar" value={lpCity} onChange={e => setLpCity(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">District</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Kuta Selatan" value={lpDistrict} onChange={e => setLpDistrict(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Village</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Ungasan" value={lpVillage} onChange={e => setLpVillage(e.target.value)} />
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!lpProvince || !lpCity || kwCluster.isPending}
                onClick={() => {
                  kwCluster.mutate(
                    { province: lpProvince, city: lpCity, district: lpDistrict, village: lpVillage },
                    { onSuccess: (data) => setKwClusterResult(data) }
                  );
                }}
              >
                {kwCluster.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Hash className="h-3 w-3 mr-1" />}
                Generate Keyword Cluster
              </Button>
            </CardContent>
          </Card>

          {kwCluster.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is generating keyword clusters...</p>
                <Progress value={55} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {kwClusterResult && (
            <div className="space-y-3">
              {/* Summary */}
              <Card className="bg-card border-border border-l-2 border-l-primary">
                <CardContent className="p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg border border-border/50 bg-accent/20 text-center">
                      <p className="text-[9px] text-muted-foreground">Total Keywords</p>
                      <p className="text-lg font-bold text-foreground">{kwClusterResult.result.total_keywords}</p>
                    </div>
                    <div className="p-2 rounded-lg border border-border/50 bg-accent/20 text-center">
                      <p className="text-[9px] text-muted-foreground">Est. Combined Volume</p>
                      <p className="text-sm font-bold text-chart-1">{kwClusterResult.result.estimated_combined_volume}</p>
                    </div>
                    <div className="p-2 rounded-lg border border-border/50 bg-accent/20 text-center">
                      <p className="text-[9px] text-muted-foreground">Location</p>
                      <p className="text-[10px] font-medium text-foreground">{[kwClusterResult.location.village, kwClusterResult.location.city].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-md border border-chart-1/30 bg-chart-1/5">
                    <p className="text-[9px] text-muted-foreground mb-0.5">🏆 Top Opportunity</p>
                    <p className="text-[10px] font-medium text-chart-1">{kwClusterResult.result.top_opportunity}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Clusters */}
              {[
                { title: "🛒 Buy Intent", keywords: kwClusterResult.result.buy_keywords, color: "chart-1" },
                { title: "🏠 Rent Intent", keywords: kwClusterResult.result.rent_keywords, color: "chart-2" },
                { title: "💰 Investment Intent", keywords: kwClusterResult.result.investment_keywords, color: "chart-3" },
                { title: "🔥 Urgent Buyer (Long-tail)", keywords: kwClusterResult.result.urgent_keywords, color: "chart-4" },
                { title: "🌴 Lifestyle & Landmark", keywords: kwClusterResult.result.lifestyle_keywords, color: "primary" },
              ].map((cluster, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs flex items-center justify-between">
                      <span>{cluster.title}</span>
                      <Badge variant="outline" className="text-[8px]">{cluster.keywords.length} keywords</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {cluster.keywords.map((kw, j) => (
                        <Badge key={j} variant="outline" className={cn("text-[9px]",
                          `bg-${cluster.color}/5 border-${cluster.color}/20 text-${cluster.color}`
                        )}>{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── URL Slug Generator Tab ─── */}
        <TabsContent value="url-slugs" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                SEO URL Slug Generator
              </CardTitle>
              <CardDescription className="text-[10px]">
                Generate programmatic SEO landing page URL variations for location targeting
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Province *</label>
                  <Select value={lpProvince} onValueChange={setLpProvince}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select province" /></SelectTrigger>
                    <SelectContent>
                      {INDONESIA_PROVINCES.map(p => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City *</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Denpasar" value={lpCity} onChange={e => setLpCity(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">District</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Kuta Selatan" value={lpDistrict} onChange={e => setLpDistrict(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Village</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Ungasan" value={lpVillage} onChange={e => setLpVillage(e.target.value)} />
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!lpProvince || !lpCity || urlSlugGen.isPending}
                onClick={() => {
                  urlSlugGen.mutate(
                    { province: lpProvince, city: lpCity, district: lpDistrict, village: lpVillage },
                    { onSuccess: (data) => setUrlSlugResult(data) }
                  );
                }}
              >
                {urlSlugGen.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Globe className="h-3 w-3 mr-1" />}
                Generate URL Slugs
              </Button>
            </CardContent>
          </Card>

          {urlSlugGen.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is generating URL slug variations...</p>
                <Progress value={50} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {urlSlugResult && (
            <div className="space-y-3">
              {/* Summary */}
              <Card className="bg-card border-border border-l-2 border-l-primary">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{urlSlugResult.result.total_pages} Landing Pages</p>
                      <p className="text-[10px] text-muted-foreground">
                        {[urlSlugResult.location.village, urlSlugResult.location.city, urlSlugResult.location.province].filter(Boolean).join(' → ')}
                      </p>
                    </div>
                  </div>
                  {/* Sitemap Strategy */}
                  <div className="p-2 rounded-md border border-border/50 bg-accent/20">
                    <p className="text-[9px] text-muted-foreground mb-0.5">🗺️ Sitemap Strategy</p>
                    <p className="text-[10px] text-foreground leading-relaxed">{urlSlugResult.result.sitemap_strategy}</p>
                  </div>
                  {/* Implementation Priority */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground">📋 Implementation Priority</p>
                    <div className="space-y-0.5">
                      {urlSlugResult.result.implementation_priority.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px]">
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0 w-5 justify-center">{i + 1}</Badge>
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* URL Variations grouped by category */}
              {(() => {
                const grouped: Record<string, typeof urlSlugResult.result.seo_url_variations> = {};
                urlSlugResult.result.seo_url_variations.forEach(v => {
                  const cat = v.category;
                  if (!grouped[cat]) grouped[cat] = [];
                  grouped[cat].push(v);
                });
                const categoryLabels: Record<string, string> = {
                  jual_rumah: '🏠 Jual Rumah',
                  sewa_rumah: '🔑 Sewa Rumah',
                  investasi: '💰 Investasi Properti',
                  rumah_murah: '💵 Rumah Murah',
                  premium: '✨ Properti Premium',
                  tanah: '🌿 Tanah Dijual',
                };
                return Object.entries(grouped).map(([cat, variations]) => (
                  <Card key={cat} className="bg-card border-border">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-xs flex items-center justify-between">
                        <span>{categoryLabels[cat] || cat}</span>
                        <Badge variant="outline" className="text-[8px]">{variations.length} pages</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="space-y-1.5">
                        {variations.map((v, j) => (
                          <div key={j} className="p-2 rounded-md border border-border/50 bg-accent/10">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <Badge variant={
                                v.search_intent === 'TRANSACTIONAL' ? 'default' :
                                v.search_intent === 'COMMERCIAL' ? 'secondary' : 'outline'
                              } className="text-[8px] px-1.5 py-0">
                                {v.search_intent}
                              </Badge>
                              <span className="text-[8px] text-muted-foreground">~{v.estimated_volume}/mo</span>
                            </div>
                            <p className="text-[10px] font-mono text-chart-1 truncate">{v.slug}</p>
                            <p className="text-[10px] text-foreground mt-0.5">{v.suggested_title}</p>
                            <p className="text-[9px] text-muted-foreground">Target: {v.target_keyword}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          )}
        </TabsContent>

        {/* ─── Investment Attractiveness Tab ─── */}
        <TabsContent value="invest-attr" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Investment Attractiveness Analyzer
              </CardTitle>
              <CardDescription className="text-[10px]">
                AI-powered investment scoring for any property based on location, price, and market signals
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Property Type *</label>
                  <Select value={iaPropertyType} onValueChange={setIaPropertyType}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {['house', 'apartment', 'villa', 'kost', 'land', 'commercial', 'townhouse', 'shophouse', 'warehouse', 'office'].map(t => (
                        <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Transaction Type</label>
                  <Select value={iaTransactionType} onValueChange={setIaTransactionType}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale" className="text-xs">Sale</SelectItem>
                      <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Price (Rp) *</label>
                  <Input className="h-8 text-xs" type="number" placeholder="e.g. 2500000000" value={iaPrice} onChange={e => setIaPrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Building Size (sqm)</label>
                  <Input className="h-8 text-xs" type="number" placeholder="e.g. 150" value={iaBuildingSize} onChange={e => setIaBuildingSize(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Land Size (sqm)</label>
                  <Input className="h-8 text-xs" type="number" placeholder="e.g. 200" value={iaLandSize} onChange={e => setIaLandSize(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Province *</label>
                  <Select value={lpProvince} onValueChange={setLpProvince}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Province" /></SelectTrigger>
                    <SelectContent>
                      {INDONESIA_PROVINCES.map(p => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City *</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Denpasar" value={lpCity} onChange={e => setLpCity(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">District</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Kuta Selatan" value={lpDistrict} onChange={e => setLpDistrict(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Village</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Ungasan" value={lpVillage} onChange={e => setLpVillage(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Nearby Facilities</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Beach 500m, Airport 15min, Mall 2km" value={iaNearby} onChange={e => setIaNearby(e.target.value)} />
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!iaPropertyType || !iaPrice || !lpProvince || !lpCity || investAttr.isPending}
                onClick={() => {
                  investAttr.mutate(
                    {
                      property_type: iaPropertyType,
                      transaction_type: iaTransactionType || 'sale',
                      price: Number(iaPrice),
                      building_size: Number(iaBuildingSize) || undefined,
                      land_size: Number(iaLandSize) || undefined,
                      province: lpProvince,
                      city: lpCity,
                      district: lpDistrict,
                      village: lpVillage,
                      nearby_facilities: iaNearby,
                    },
                    { onSuccess: (data) => setInvestAttrResult(data) }
                  );
                }}
              >
                {investAttr.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                Analyze Investment
              </Button>
            </CardContent>
          </Card>

          {investAttr.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is analyzing investment attractiveness...</p>
                <Progress value={55} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {investAttrResult && (() => {
            const r = investAttrResult.result;
            const gradeColor = r.investment_grade === 'PRIME' ? 'text-chart-1' :
              r.investment_grade === 'HIGH' ? 'text-chart-2' :
              r.investment_grade === 'MEDIUM' ? 'text-chart-4' : 'text-destructive';
            const scoreBg = r.investment_score >= 81 ? 'bg-chart-1/20 border-chart-1/40' :
              r.investment_score >= 56 ? 'bg-chart-2/20 border-chart-2/40' :
              r.investment_score >= 31 ? 'bg-chart-4/20 border-chart-4/40' : 'bg-destructive/20 border-destructive/40';

            return (
              <div className="space-y-3">
                {/* Score Card */}
                <Card className={`border-2 ${scoreBg}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl font-bold text-foreground">{r.investment_score}</div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                    <Badge className={`mt-2 text-sm ${gradeColor}`} variant="outline">
                      {r.investment_grade}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {investAttrResult.input.property_type} · Rp {investAttrResult.input.price.toLocaleString()} · {investAttrResult.input.city}
                    </p>
                  </CardContent>
                </Card>

                {/* Analysis Sections */}
                {[
                  { icon: '📈', label: 'Capital Growth Potential', text: r.capital_growth_potential },
                  { icon: '💰', label: 'Rental Yield Potential', text: r.rental_yield_potential },
                  { icon: '🏗️', label: 'Location Growth Signal', text: r.location_growth_signal },
                ].map((section, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-3">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">{section.icon} {section.label}</p>
                      <p className="text-xs text-foreground leading-relaxed">{section.text}</p>
                    </CardContent>
                  </Card>
                ))}

                {/* Investment Summary */}
                <Card className="bg-card border-border border-l-2 border-l-primary">
                  <CardContent className="p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">🎯 Investment Summary</p>
                    <p className="text-xs text-foreground leading-relaxed">{r.investment_summary}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* ─── Market Trend Prediction Tab ─── */}
        <TabsContent value="market-trend" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Market Trend Prediction
              </CardTitle>
              <CardDescription className="text-[10px]">
                AI-powered property price movement prediction by location and property type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Province *</label>
                  <Select value={lpProvince} onValueChange={setLpProvince}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Province" /></SelectTrigger>
                    <SelectContent>
                      {INDONESIA_PROVINCES.map(p => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City *</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Bandung" value={lpCity} onChange={e => setLpCity(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">District</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Coblong" value={lpDistrict} onChange={e => setLpDistrict(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Village</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Dago" value={lpVillage} onChange={e => setLpVillage(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Property Type *</label>
                  <Select value={mtPropertyType} onValueChange={setMtPropertyType}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {['house', 'apartment', 'villa', 'kost', 'land', 'commercial', 'townhouse', 'shophouse'].map(t => (
                        <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!lpProvince || !lpCity || !mtPropertyType || marketTrend.isPending}
                onClick={() => {
                  marketTrend.mutate(
                    { province: lpProvince, city: lpCity, district: lpDistrict, village: lpVillage, property_type: mtPropertyType },
                    { onSuccess: (data) => setMarketTrendResult(data) }
                  );
                }}
              >
                {marketTrend.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <BarChart3 className="h-3 w-3 mr-1" />}
                Predict Market Trend
              </Button>
            </CardContent>
          </Card>

          {marketTrend.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is analyzing market trends...</p>
                <Progress value={50} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {marketTrendResult && (() => {
            const r = marketTrendResult.result;
            const trendIcon = r.price_trend === 'UP' ? '📈' : r.price_trend === 'DOWN' ? '📉' : '➡️';
            const trendColor = r.price_trend === 'UP' ? 'text-chart-2 border-chart-2/40 bg-chart-2/10' :
              r.price_trend === 'DOWN' ? 'text-destructive border-destructive/40 bg-destructive/10' :
              'text-chart-4 border-chart-4/40 bg-chart-4/10';

            return (
              <div className="space-y-3">
                {/* Trend Direction Card */}
                <Card className={`border-2 ${trendColor}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-1">{trendIcon}</div>
                    <Badge variant="outline" className="text-lg font-bold px-4 py-1">{r.price_trend}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {marketTrendResult.input.property_type} · {[marketTrendResult.input.village, marketTrendResult.input.city].filter(Boolean).join(', ')}
                    </p>
                  </CardContent>
                </Card>

                {/* Growth Estimates */}
                <div className="grid grid-cols-2 gap-2">
                  <Card className="bg-card border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-[9px] text-muted-foreground">1-Year Growth</p>
                      <p className="text-lg font-bold text-foreground">{r.one_year_growth_estimate}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-[9px] text-muted-foreground">5-Year Potential</p>
                      <p className="text-lg font-bold text-foreground">{r.five_year_growth_potential}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Growth Drivers */}
                <Card className="bg-card border-border">
                  <CardContent className="p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2">🚀 Growth Drivers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.growth_drivers.map((driver, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{driver}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Market Outlook */}
                <Card className="bg-card border-border border-l-2 border-l-primary">
                  <CardContent className="p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">🔮 Market Outlook</p>
                    <p className="text-xs text-foreground leading-relaxed">{r.market_outlook_summary}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* ─── Rental Yield Estimator Tab ─── */}
        <TabsContent value="rental-est" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Rental Yield Estimator
              </CardTitle>
              <CardDescription className="text-[10px]">
                AI-powered rental income and yield estimation for Indonesian property investors
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Property Type *</label>
                  <Select value={rePropertyType} onValueChange={setRePropertyType}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {['house', 'apartment', 'villa', 'kost', 'commercial', 'townhouse', 'shophouse'].map(t => (
                        <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Property Price (Rp) *</label>
                  <Input className="h-8 text-xs" type="number" placeholder="e.g. 2500000000" value={rePrice} onChange={e => setRePrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City *</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Bandung" value={lpCity} onChange={e => setLpCity(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">District</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Coblong" value={lpDistrict} onChange={e => setLpDistrict(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Village</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Dago" value={lpVillage} onChange={e => setLpVillage(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Nearby Demand Drivers</label>
                  <Input className="h-8 text-xs" placeholder="e.g. ITB, cafe, wisata" value={reNearby} onChange={e => setReNearby(e.target.value)} />
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!rePropertyType || !rePrice || !lpCity || rentalEst.isPending}
                onClick={() => {
                  rentalEst.mutate(
                    { price: Number(rePrice), property_type: rePropertyType, city: lpCity, district: lpDistrict, village: lpVillage, nearby_facilities: reNearby },
                    { onSuccess: (data) => setRentalEstResult(data) }
                  );
                }}
              >
                {rentalEst.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Estimate Rental Yield
              </Button>
            </CardContent>
          </Card>

          {rentalEst.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is estimating rental yield...</p>
                <Progress value={50} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {rentalEstResult && (() => {
            const r = rentalEstResult.result;
            const demandColor = r.tenant_demand_level === 'VERY_HIGH' ? 'text-chart-1' :
              r.tenant_demand_level === 'HIGH' ? 'text-chart-2' :
              r.tenant_demand_level === 'MODERATE' ? 'text-chart-4' : 'text-destructive';
            const demandBg = r.tenant_demand_level === 'VERY_HIGH' ? 'bg-chart-1/10 border-chart-1/40' :
              r.tenant_demand_level === 'HIGH' ? 'bg-chart-2/10 border-chart-2/40' :
              r.tenant_demand_level === 'MODERATE' ? 'bg-chart-4/10 border-chart-4/40' : 'bg-destructive/10 border-destructive/40';

            return (
              <div className="space-y-3">
                {/* Demand Level */}
                <Card className={`border-2 ${demandBg}`}>
                  <CardContent className="p-4 text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">Tenant Demand</p>
                    <Badge variant="outline" className={`text-lg font-bold px-4 py-1 ${demandColor}`}>
                      {r.tenant_demand_level.replace('_', ' ')}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {rentalEstResult.input.property_type} · Rp {rentalEstResult.input.price.toLocaleString()} · {rentalEstResult.input.city}
                    </p>
                  </CardContent>
                </Card>

                {/* Rent & Yield */}
                <div className="grid grid-cols-2 gap-2">
                  <Card className="bg-card border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-[9px] text-muted-foreground">💰 Monthly Rent</p>
                      <p className="text-sm font-bold text-foreground">{r.estimated_monthly_rent}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-[9px] text-muted-foreground">📊 Annual Yield</p>
                      <p className="text-sm font-bold text-foreground">{r.estimated_rental_yield_percent}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Advice */}
                <Card className="bg-card border-border border-l-2 border-l-primary">
                  <CardContent className="p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">🎯 Rental Investment Advice</p>
                    <p className="text-xs text-foreground leading-relaxed">{r.rental_investment_advice}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* ─── Investment Badge Tab ─── */}
        <TabsContent value="invest-badge" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Investment Badge Generator
              </CardTitle>
              <CardDescription className="text-[10px]">
                Generate a recommendation badge from investment score, price trend, and rental yield
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Investment Score *</label>
                  <Input className="h-8 text-xs" type="number" placeholder="0-100" value={badgeScore} onChange={e => setBadgeScore(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Price Trend *</label>
                  <Select value={badgeTrend} onValueChange={(v) => setBadgeTrend(v as 'UP' | 'STABLE' | 'DOWN')}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UP" className="text-xs">📈 UP</SelectItem>
                      <SelectItem value="STABLE" className="text-xs">➡️ STABLE</SelectItem>
                      <SelectItem value="DOWN" className="text-xs">📉 DOWN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Rental Yield *</label>
                  <Input className="h-8 text-xs" placeholder="e.g. 5.7% - 7.5%" value={badgeYield} onChange={e => setBadgeYield(e.target.value)} />
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!badgeScore || !badgeYield}
                onClick={() => {
                  const result = generateInvestmentBadge({
                    investment_score: Number(badgeScore),
                    price_trend: badgeTrend,
                    rental_yield: badgeYield,
                  });
                  setBadgeResult(result);
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                Generate Badge
              </Button>
            </CardContent>
          </Card>

          {badgeResult && (() => {
            const colorMap: Record<string, string> = {
              prime: 'bg-chart-1/20 border-chart-1 text-chart-1',
              high: 'bg-chart-2/20 border-chart-2 text-chart-2',
              rental: 'bg-primary/20 border-primary text-primary',
              land: 'bg-chart-4/20 border-chart-4 text-chart-4',
              speculative: 'bg-accent/40 border-accent-foreground/30 text-accent-foreground',
              low: 'bg-destructive/20 border-destructive text-destructive',
            };
            const classes = colorMap[badgeResult.color] || colorMap.low;

            return (
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center space-y-3">
                  <p className="text-[10px] text-muted-foreground">AI Investment Recommendation</p>
                  <Badge className={`text-lg font-bold px-6 py-2 border-2 ${classes}`} variant="outline">
                    {badgeResult.badge}
                  </Badge>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center">
                      <p className="text-[9px] text-muted-foreground">Score</p>
                      <p className="text-sm font-bold text-foreground">{badgeScore}/100</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-muted-foreground">Trend</p>
                      <p className="text-sm font-bold text-foreground">{badgeTrend}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-muted-foreground">Yield</p>
                      <p className="text-sm font-bold text-foreground">{badgeYield}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* ─── Buyer Intent Analyzer Tab ─── */}
        <TabsContent value="buyer-intent" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                Buyer Intent Analyzer
              </CardTitle>
              <CardDescription className="text-[10px]">
                Analyze inquiry messages to detect buying seriousness and recommend agent actions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">User Message *</label>
                <textarea
                  className="w-full h-20 text-xs p-2 rounded-md border border-input bg-background text-foreground resize-none"
                  placeholder="e.g. Saya butuh rumah segera untuk keluarga, sudah siapkan DP, bisa survey besok?"
                  value={biMessage}
                  onChange={e => setBiMessage(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Property Type</label>
                  <Select value={biPropertyType} onValueChange={setBiPropertyType}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {['house', 'apartment', 'villa', 'kost', 'land', 'commercial'].map(t => (
                        <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Transaction</label>
                  <Select value={biTransactionType} onValueChange={setBiTransactionType}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale" className="text-xs">Sale</SelectItem>
                      <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City</label>
                  <Input className="h-8 text-xs" placeholder="e.g. Jakarta" value={biCity} onChange={e => setBiCity(e.target.value)} />
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!biMessage || buyerIntent.isPending}
                onClick={() => {
                  buyerIntent.mutate(
                    { message: biMessage, property_type: biPropertyType, transaction_type: biTransactionType, city: biCity },
                    { onSuccess: (data) => setBuyerIntentResult(data) }
                  );
                }}
              >
                {buyerIntent.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Flame className="h-3 w-3 mr-1" />}
                Analyze Intent
              </Button>
            </CardContent>
          </Card>

          {buyerIntent.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is analyzing buyer intent...</p>
                <Progress value={50} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {buyerIntentResult && (() => {
            const r = buyerIntentResult.result;
            const levelColor = r.intent_level === 'HOT' ? 'text-destructive border-destructive/40 bg-destructive/10' :
              r.intent_level === 'HIGH' ? 'text-chart-1 border-chart-1/40 bg-chart-1/10' :
              r.intent_level === 'MEDIUM' ? 'text-chart-4 border-chart-4/40 bg-chart-4/10' :
              'text-muted-foreground border-border bg-muted/30';
            const fireEmoji = r.intent_level === 'HOT' ? '🔥🔥🔥' :
              r.intent_level === 'HIGH' ? '🔥🔥' :
              r.intent_level === 'MEDIUM' ? '🔥' : '❄️';

            return (
              <div className="space-y-3">
                {/* Score Card */}
                <Card className={`border-2 ${levelColor}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-1">{fireEmoji}</div>
                    <div className="text-4xl font-bold text-foreground">{r.buyer_intent_score}</div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                    <Badge variant="outline" className="mt-2 text-sm font-bold">{r.intent_level}</Badge>
                  </CardContent>
                </Card>

                {/* Detected Signals */}
                <Card className="bg-card border-border">
                  <CardContent className="p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2">🎯 Detected Signals</p>
                    <div className="space-y-1">
                      {r.detected_signals.map((signal, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                          <span className="text-foreground">{signal}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Action */}
                <Card className="bg-card border-border border-l-2 border-l-primary">
                  <CardContent className="p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">📋 Recommended Agent Action</p>
                    <p className="text-xs text-foreground leading-relaxed">{r.recommended_agent_action}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* ─── Lead Priority Tab ─── */}
        <TabsContent value="lead-priority" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Lead Follow-Up Priority
              </CardTitle>
              <CardDescription className="text-[10px]">
                Classify leads into priority levels for agent follow-up strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Buyer Intent Score *</label>
                  <Input className="h-8 text-xs" type="number" placeholder="0-100" value={lpScore} onChange={e => setLpScore(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Budget Level *</label>
                  <Select value={lpBudgetLevel} onValueChange={setLpBudgetLevel}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear" className="text-xs">💰 Clear (specific budget)</SelectItem>
                      <SelectItem value="vague" className="text-xs">🤔 Vague (rough range)</SelectItem>
                      <SelectItem value="none" className="text-xs">❌ None (no budget mentioned)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Visit Plan *</label>
                  <Select value={lpVisitPlan} onValueChange={setLpVisitPlan}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes" className="text-xs">✅ Yes (wants to survey)</SelectItem>
                      <SelectItem value="maybe" className="text-xs">🤷 Maybe (considering)</SelectItem>
                      <SelectItem value="no" className="text-xs">❌ No (no mention)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Timeframe *</label>
                  <Select value={lpTimeframe} onValueChange={setLpTimeframe}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_week" className="text-xs">⚡ This week</SelectItem>
                      <SelectItem value="this_month" className="text-xs">📅 This month</SelectItem>
                      <SelectItem value="no_timeline" className="text-xs">🕐 No timeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!lpScore}
                onClick={() => {
                  const result = classifyLeadPriority({
                    buyer_intent_score: Number(lpScore),
                    budget_level: lpBudgetLevel,
                    visit_plan: lpVisitPlan,
                    timeframe: lpTimeframe,
                  });
                  setLeadPriorityResult(result);
                }}
              >
                <Target className="h-3 w-3 mr-1" />
                Classify Lead
              </Button>
            </CardContent>
          </Card>

          {leadPriorityResult && (() => {
            const colorMap: Record<string, string> = {
              hot: 'bg-destructive/10 border-destructive text-destructive',
              warm: 'bg-chart-4/10 border-chart-4 text-chart-4',
              cold: 'bg-muted/30 border-border text-muted-foreground',
            };
            const emojiMap: Record<string, string> = {
              hot: '🔴',
              warm: '🟡',
              cold: '🔵',
            };
            const classes = colorMap[leadPriorityResult.urgency_color] || colorMap.cold;
            const emoji = emojiMap[leadPriorityResult.urgency_color] || '🔵';

            return (
              <div className="space-y-3">
                <Card className={`border-2 ${classes}`}>
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-2xl">{emoji}</div>
                    <Badge variant="outline" className="text-lg font-bold px-6 py-1">
                      {leadPriorityResult.lead_priority}
                    </Badge>
                    <div className="grid grid-cols-4 gap-1 pt-2">
                      <div className="text-center">
                        <p className="text-[8px] text-muted-foreground">Score</p>
                        <p className="text-xs font-bold text-foreground">{lpScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-muted-foreground">Budget</p>
                        <p className="text-xs font-bold text-foreground capitalize">{lpBudgetLevel}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-muted-foreground">Visit</p>
                        <p className="text-xs font-bold text-foreground capitalize">{lpVisitPlan}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-muted-foreground">Timeline</p>
                        <p className="text-xs font-bold text-foreground">{lpTimeframe.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border border-l-2 border-l-primary">
                  <CardContent className="p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">📋 Follow-Up Strategy</p>
                    <p className="text-xs text-foreground leading-relaxed">{leadPriorityResult.follow_up_strategy}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* ─── Sales Reply Generator Tab ─── */}
        <TabsContent value="sales-reply" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Sales Reply Generator
              </CardTitle>
              <CardDescription className="text-[10px]">
                Generate persuasive WhatsApp-style replies to buyer inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Buyer Message *</label>
                <textarea
                  className="w-full h-20 text-xs p-2 rounded-md border border-input bg-background text-foreground resize-none"
                  placeholder="e.g. Saya tertarik dengan rumah ini, masih available? Budget saya sekitar 1.3M"
                  value={srMessage}
                  onChange={e => setSrMessage(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Property Location</label>
                <Input className="h-8 text-xs" placeholder="e.g. Dago, Bandung" value={srLocation} onChange={e => setSrLocation(e.target.value)} />
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!srMessage || salesReply.isPending}
                onClick={() => {
                  salesReply.mutate(
                    { message: srMessage, location: srLocation },
                    { onSuccess: (data) => setSalesReplyResult(data) }
                  );
                }}
              >
                {salesReply.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
                Generate Reply
              </Button>
            </CardContent>
          </Card>

          {salesReply.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is crafting your reply...</p>
                <Progress value={50} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {salesReplyResult && (
            <Card className="bg-card border-border border-l-2 border-l-chart-2">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-muted-foreground">💬 Ready-to-Send Reply</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(salesReplyResult.result.reply_text);
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                  <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
                    {salesReplyResult.result.reply_text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Price Benchmark Tab ─── */}
        <TabsContent value="price-bench" className="space-y-3">
          <Card className="bg-card border-border">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Price Benchmark AI
              </CardTitle>
              <CardDescription className="text-[10px]">
                Analyze property price position vs market level
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Property Type</label>
                  <select className="w-full h-8 text-xs p-1 rounded-md border border-input bg-background text-foreground" value={pbPropertyType} onChange={e => setPbPropertyType(e.target.value)}>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Transaction</label>
                  <select className="w-full h-8 text-xs p-1 rounded-md border border-input bg-background text-foreground" value={pbTransactionType} onChange={e => setPbTransactionType(e.target.value)}>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Price (Rp) *</label>
                <Input className="h-8 text-xs" type="number" placeholder="e.g. 3500000000" value={pbPrice} onChange={e => setPbPrice(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Building (sqm)</label>
                  <Input className="h-8 text-xs" type="number" placeholder="250" value={pbBuildingSize} onChange={e => setPbBuildingSize(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Land (sqm)</label>
                  <Input className="h-8 text-xs" type="number" placeholder="300" value={pbLandSize} onChange={e => setPbLandSize(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">City *</label>
                  <Input className="h-8 text-xs" placeholder="Bandung" value={pbCity} onChange={e => setPbCity(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Province</label>
                  <Input className="h-8 text-xs" placeholder="Jawa Barat" value={pbProvince} onChange={e => setPbProvince(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">District</label>
                  <Input className="h-8 text-xs" placeholder="Coblong" value={pbDistrict} onChange={e => setPbDistrict(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Village</label>
                  <Input className="h-8 text-xs" placeholder="Dago" value={pbVillage} onChange={e => setPbVillage(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Nearby Facilities</label>
                <Input className="h-8 text-xs" placeholder="ITB Campus, Dago Toll, Parahyangan Hills" value={pbNearby} onChange={e => setPbNearby(e.target.value)} />
              </div>
              <Button
                size="sm"
                className="h-8 text-xs w-full"
                disabled={!pbPrice || !pbCity || priceBenchmark.isPending}
                onClick={() => {
                  priceBenchmark.mutate(
                    {
                      property_type: pbPropertyType,
                      transaction_type: pbTransactionType,
                      price: Number(pbPrice),
                      building_size: Number(pbBuildingSize) || 0,
                      land_size: Number(pbLandSize) || 0,
                      village: pbVillage,
                      district: pbDistrict,
                      city: pbCity,
                      province: pbProvince,
                      nearby_facilities: pbNearby,
                    },
                    { onSuccess: (data) => setPriceBenchmarkResult(data) }
                  );
                }}
              >
                {priceBenchmark.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <BarChart3 className="h-3 w-3 mr-1" />}
                Analyze Price
              </Button>
            </CardContent>
          </Card>

          {priceBenchmark.isPending && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                <p className="text-xs text-muted-foreground">AI is benchmarking your price...</p>
                <Progress value={50} className="h-1.5 mt-3 max-w-xs mx-auto" />
              </CardContent>
            </Card>
          )}

          {priceBenchmarkResult && (
            <Card className="bg-card border-border border-l-2 border-l-primary">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={
                    priceBenchmarkResult.result.price_position === "BELOW MARKET" ? "default" :
                    priceBenchmarkResult.result.price_position === "FAIR MARKET" ? "secondary" :
                    priceBenchmarkResult.result.price_position === "PREMIUM JUSTIFIED" ? "outline" :
                    "destructive"
                  } className="text-[10px]">
                    {priceBenchmarkResult.result.price_position === "BELOW MARKET" && "🟢"}
                    {priceBenchmarkResult.result.price_position === "FAIR MARKET" && "🔵"}
                    {priceBenchmarkResult.result.price_position === "ABOVE MARKET" && "🔴"}
                    {priceBenchmarkResult.result.price_position === "PREMIUM JUSTIFIED" && "🟡"}
                    {" "}{priceBenchmarkResult.result.price_position}
                  </Badge>
                  <span className="text-lg font-bold text-primary">{priceBenchmarkResult.result.price_attractiveness_score}/100</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">📊 Estimated Market Range</p>
                    <p className="text-xs text-foreground">{priceBenchmarkResult.result.estimated_market_price_range}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">💡 Benchmark Insight</p>
                    <p className="text-xs text-foreground leading-relaxed">{priceBenchmarkResult.result.benchmark_insight}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">🧠 Buyer Psychology</p>
                    <p className="text-xs text-foreground leading-relaxed">{priceBenchmarkResult.result.buyer_psychology_effect}</p>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${priceBenchmarkResult.result.price_attractiveness_score}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">Price Attractiveness Score</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detail">
          {currentAnalysis ? (
            <div className="space-y-3">
              {/* Header Card */}
              <Card className="bg-card border-border">
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
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAiAudit} disabled={seoAudit.isPending}>
                        {seoAudit.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Target className="h-3 w-3 mr-1" />}
                        AI Audit
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleTitleRewrite} disabled={titleRewrite.isPending}>
                        {titleRewrite.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}
                        Rewrite Title
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleDescRewrite} disabled={descRewrite.isPending}>
                        {descRewrite.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}
                        Rewrite Description
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleTrafficPrediction} disabled={trafficPrediction.isPending}>
                        {trafficPrediction.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                        Traffic Predict
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleInternalLinking} disabled={internalLinking.isPending}>
                        {internalLinking.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Globe className="h-3 w-3 mr-1" />}
                        Internal Links
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
              <Card className="bg-card border-border">
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
                <Card className="bg-card border-border border-l-2 border-l-primary">
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
                <Card className="bg-card border-border border-dashed">
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
                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">AI is analyzing and optimizing content...</p>
                    <Progress value={65} className="h-1.5 mt-3 max-w-xs mx-auto" />
                  </CardContent>
                </Card>
              )}

              {/* AI Audit Results */}
              {seoAudit.isPending && (
                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">AI is performing deep SEO audit...</p>
                    <Progress value={45} className="h-1.5 mt-3 max-w-xs mx-auto" />
                  </CardContent>
                </Card>
              )}

              {auditResult && (
                <Card className="bg-card border-border">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        AI SEO Audit Report
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={auditResult.ranking_probability === 'HIGH' ? 'default' : auditResult.ranking_probability === 'MEDIUM' ? 'secondary' : 'destructive'} className="text-[10px]">
                          Ranking: {auditResult.ranking_probability}
                        </Badge>
                        <ScoreBadge score={auditResult.seo_score} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    {/* Score Grid - 7 dimensions */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { icon: <MapPin className="h-3 w-3" />, label: "Location Depth", score: auditResult.location_depth_score, color: "text-primary" },
                        { icon: <Flame className="h-3 w-3" />, label: "Emotional Triggers", score: auditResult.emotional_trigger_score, color: "text-chart-3" },
                        { icon: <TrendingUp className="h-3 w-3" />, label: "Investment Lang", score: auditResult.investment_language_score, color: "text-chart-1" },
                        { icon: <Globe className="h-3 w-3" />, label: "Location Competition", score: auditResult.location_competition_score, color: "text-chart-4" },
                        { icon: <Target className="h-3 w-3" />, label: "Buyer Intent", score: auditResult.buyer_intent_score, color: "text-chart-2" },
                        { icon: <FileText className="h-3 w-3" />, label: "Content Unique", score: auditResult.content_uniqueness_score, color: "text-primary" },
                        { icon: <BarChart3 className="h-3 w-3" />, label: "Traffic Potential", score: auditResult.traffic_potential_score, color: "text-chart-1" },
                      ].map((item, i) => (
                        <div key={i} className="p-1.5 rounded-lg border border-border/50 bg-accent/20 text-center">
                          <div className={cn("mx-auto mb-0.5", item.color)}>{item.icon}</div>
                          <p className="text-[8px] text-muted-foreground leading-tight">{item.label}</p>
                          <p className={cn("text-sm font-bold", item.score >= 70 ? "text-chart-1" : item.score >= 40 ? "text-chart-4" : "text-destructive")}>{item.score}</p>
                        </div>
                      ))}
                    </div>

                    {/* Title Feedback */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Title Feedback</p>
                      <p className="text-xs text-foreground bg-accent/30 p-2 rounded-md">{auditResult.title_feedback}</p>
                    </div>

                    {/* Description Feedback */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Description Feedback</p>
                      <p className="text-xs text-foreground bg-accent/30 p-2 rounded-md">{auditResult.description_feedback}</p>
                    </div>

                    {/* Competitive Analysis */}
                    {auditResult.competitive_analysis && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Competitive Analysis</p>
                        <p className="text-xs text-foreground bg-chart-4/10 border border-chart-4/20 p-2 rounded-md">{auditResult.competitive_analysis}</p>
                      </div>
                    )}

                    {/* Keyword Suggestions */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Keyword Suggestions</p>
                      <div className="flex flex-wrap gap-1">
                        {auditResult.keyword_suggestions.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] bg-primary/5 border-primary/20">{kw}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Content Gap Keywords */}
                    {auditResult.content_gap_keywords?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Content Gap (Competitor Keywords You're Missing)</p>
                        <div className="flex flex-wrap gap-1">
                          {auditResult.content_gap_keywords.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] bg-destructive/5 border-destructive/20 text-destructive">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Improvement Actions */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Improvement Actions</p>
                      <div className="space-y-1">
                        {auditResult.improvement_actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-2 p-1.5 rounded border border-border/50 bg-accent/10">
                            <ArrowUpRight className="h-3 w-3 text-chart-1 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-foreground">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Title Rewrite Result */}
              {titleRewriteResult && (
                <Card className="bg-card border-border border-l-2 border-l-chart-1">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-chart-1" />
                      AI Title Rewrite — 3 Variants
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Optimized for Google ranking & buyer CTR · Indonesian language · Max 65 chars
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    {/* Original title */}
                    <div className="p-2 rounded-md border border-border/50 bg-muted/20">
                      <p className="text-[9px] text-muted-foreground mb-0.5">Original Title</p>
                      <p className="text-xs text-foreground">{titleRewriteResult.original_title}</p>
                      <p className="text-[8px] text-muted-foreground mt-1">{titleRewriteResult.original_title.length} chars</p>
                    </div>

                    {/* Original Issues */}
                    {titleRewriteResult.result.original_issues?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-chart-4" /> Issues Found
                        </p>
                        <div className="space-y-1">
                          {titleRewriteResult.result.original_issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 rounded border border-chart-4/20 bg-chart-4/5">
                              <XCircle className="h-3 w-3 text-chart-4 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-foreground">{issue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Title Variants */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-chart-1" /> Optimized Variants (ranked by CTR)
                      </p>
                      {titleRewriteResult.result.titles.map((variant, i) => (
                        <div key={i} className={cn(
                          "p-2.5 rounded-md border",
                          i === 0 ? "border-chart-1/40 bg-chart-1/5" : "border-border/50 bg-accent/10"
                        )}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {i === 0 && <Badge className="text-[8px] px-1.5 py-0 bg-chart-1 text-chart-1-foreground">Best</Badge>}
                                <Badge variant={
                                  variant.predicted_ctr === 'VERY_HIGH' ? 'default' :
                                  variant.predicted_ctr === 'HIGH' ? 'secondary' : 'outline'
                                } className="text-[8px] px-1.5 py-0">
                                  CTR: {variant.predicted_ctr}
                                </Badge>
                                <span className="text-[8px] text-muted-foreground">{variant.title.length}/65 chars</span>
                              </div>
                              <p className={cn("text-xs font-medium", i === 0 ? "text-chart-1" : "text-foreground")}>{variant.title}</p>
                              <p className="text-[9px] text-muted-foreground mt-1">{variant.reasoning}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Keywords Used */}
                    {titleRewriteResult.result.keywords_used?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Hash className="h-3 w-3" /> SEO Keywords Embedded
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {titleRewriteResult.result.keywords_used.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] bg-chart-1/5 border-chart-1/20 text-chart-1">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Description Rewrite Result */}
              {descRewriteResult && (
                <Card className="bg-card border-border border-l-2 border-l-chart-2">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-chart-2" />
                      AI Description Rewrite
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      SEO-optimized description with lifestyle storytelling, investment angles & urgency triggers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    {/* Original Issues */}
                    {descRewriteResult.result.original_issues?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-chart-4" /> Original Issues
                        </p>
                        <div className="space-y-1">
                          {descRewriteResult.result.original_issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 rounded border border-chart-4/20 bg-chart-4/5">
                              <XCircle className="h-3 w-3 text-chart-4 shrink-0 mt-0.5" />
                              <span className="text-[10px] text-foreground">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rewritten Description */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-chart-2" /> Rewritten Description ({descRewriteResult.result.word_count} words)
                      </p>
                      <div className="p-3 rounded-md border border-chart-2/30 bg-chart-2/5">
                        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{descRewriteResult.result.description}</p>
                      </div>
                    </div>

                    {/* Improvements Made */}
                    {descRewriteResult.result.improvements?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-chart-2" /> Improvements Made
                        </p>
                        <div className="space-y-1">
                          {descRewriteResult.result.improvements.map((imp, i) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 rounded border border-chart-2/20 bg-chart-2/5">
                              <CheckCircle2 className="h-3 w-3 text-chart-2 shrink-0 mt-0.5" />
                              <span className="text-[10px] text-foreground">{imp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEO Elements Breakdown */}
                    {descRewriteResult.result.seo_elements && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Target className="h-3 w-3 text-chart-3" /> SEO Elements Used
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded border border-border/50 bg-muted/20">
                            <p className="text-[9px] text-muted-foreground mb-0.5">🏡 Lifestyle Hook</p>
                            <p className="text-[10px] text-foreground">{descRewriteResult.result.seo_elements.lifestyle_hook}</p>
                          </div>
                          <div className="p-2 rounded border border-border/50 bg-muted/20">
                            <p className="text-[9px] text-muted-foreground mb-0.5">⏰ Urgency Trigger</p>
                            <p className="text-[10px] text-foreground">{descRewriteResult.result.seo_elements.urgency_trigger}</p>
                          </div>
                          <div className="p-2 rounded border border-border/50 bg-muted/20">
                            <p className="text-[9px] text-muted-foreground mb-0.5">📈 Investment Angle</p>
                            <p className="text-[10px] text-foreground">{descRewriteResult.result.seo_elements.investment_angle}</p>
                          </div>
                          <div className="p-2 rounded border border-border/50 bg-muted/20">
                            <p className="text-[9px] text-muted-foreground mb-0.5">📍 Infrastructure</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {descRewriteResult.result.seo_elements.infrastructure_mentioned.map((inf, i) => (
                                <Badge key={i} variant="outline" className="text-[8px] bg-chart-3/5 border-chart-3/20 text-chart-3">{inf}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Keywords Embedded */}
                    {descRewriteResult.result.keywords_embedded?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Search className="h-3 w-3 text-chart-2" /> Keywords Embedded
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {descRewriteResult.result.keywords_embedded.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] bg-chart-2/5 border-chart-2/20 text-chart-2">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Traffic Prediction Loading */}
              {trafficPrediction.isPending && (
                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">AI is predicting traffic & lead potential...</p>
                    <Progress value={55} className="h-1.5 mt-3 max-w-xs mx-auto" />
                  </CardContent>
                </Card>
              )}

              {/* Traffic Prediction Result */}
              {trafficResult && (
                <Card className="bg-card border-border border-l-2 border-l-chart-4">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-chart-4" />
                      SEO Traffic Prediction
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Organic search demand, click potential & lead forecast for {trafficResult.property_summary.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg border border-border/50 bg-accent/20 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">🔍 Search Demand</p>
                        <p className="text-sm font-bold text-foreground">{trafficResult.result.estimated_search_demand}</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-border/50 bg-accent/20 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">👆 Monthly Clicks</p>
                        <p className="text-sm font-bold text-foreground">{trafficResult.result.estimated_monthly_clicks}</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-border/50 bg-accent/20 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">📩 Monthly Leads</p>
                        <p className="text-sm font-bold text-foreground">{trafficResult.result.estimated_monthly_leads}</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-border/50 bg-accent/20 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">💰 Investment Score</p>
                        <p className={cn("text-sm font-bold", 
                          trafficResult.result.investment_attractiveness_score >= 70 ? "text-chart-1" : 
                          trafficResult.result.investment_attractiveness_score >= 40 ? "text-chart-4" : "text-destructive"
                        )}>
                          {trafficResult.result.investment_attractiveness_score}/100
                        </p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={trafficResult.result.competitive_difficulty === 'LOW' ? 'default' : trafficResult.result.competitive_difficulty === 'MEDIUM' ? 'secondary' : 'destructive'} className="text-[9px]">
                        Competition: {trafficResult.result.competitive_difficulty}
                      </Badge>
                      <Badge variant={trafficResult.result.growth_trend === 'RISING' ? 'default' : trafficResult.result.growth_trend === 'STABLE' ? 'secondary' : 'destructive'} className="text-[9px]">
                        Trend: {trafficResult.result.growth_trend}
                      </Badge>
                      <Badge variant="outline" className="text-[9px]">
                        Confidence: {trafficResult.result.confidence_level}
                      </Badge>
                    </div>

                    {/* Demand Breakdown */}
                    {trafficResult.result.demand_breakdown && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" /> Demand Breakdown
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="p-2 rounded border border-border/50 bg-muted/20 text-center">
                            <p className="text-[8px] text-muted-foreground">🛒 Transactional</p>
                            <p className="text-[10px] font-medium text-foreground">{trafficResult.result.demand_breakdown.transactional_searches}</p>
                          </div>
                          <div className="p-2 rounded border border-border/50 bg-muted/20 text-center">
                            <p className="text-[8px] text-muted-foreground">📚 Informational</p>
                            <p className="text-[10px] font-medium text-foreground">{trafficResult.result.demand_breakdown.informational_searches}</p>
                          </div>
                          <div className="p-2 rounded border border-border/50 bg-muted/20 text-center">
                            <p className="text-[8px] text-muted-foreground">📍 Branded/Location</p>
                            <p className="text-[10px] font-medium text-foreground">{trafficResult.result.demand_breakdown.branded_searches}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Keyword Opportunities */}
                    {trafficResult.result.keyword_opportunities?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Hash className="h-3 w-3 text-chart-4" /> Keyword Opportunities
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {trafficResult.result.keyword_opportunities.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] bg-chart-4/5 border-chart-4/20 text-chart-4">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reasoning */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> Prediction Reasoning
                      </p>
                      <p className="text-[10px] text-foreground bg-accent/30 p-2 rounded-md leading-relaxed">{trafficResult.result.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Internal Linking Loading */}
              {internalLinking.isPending && (
                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">AI is generating internal linking suggestions...</p>
                    <Progress value={50} className="h-1.5 mt-3 max-w-xs mx-auto" />
                  </CardContent>
                </Card>
              )}

              {/* Internal Linking Result */}
              {linkingResult && (
                <Card className="bg-card border-border border-l-2 border-l-chart-3">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4 text-chart-3" />
                      Internal Linking Suggestions
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Smart link recommendations to boost SEO authority for {linkingResult.property_summary.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    {/* Strategy & Authority */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-md border border-border/50 bg-accent/20">
                        <p className="text-[9px] text-muted-foreground mb-0.5">📈 Estimated Authority Boost</p>
                        <p className="text-[10px] font-medium text-chart-1">{linkingResult.result.estimated_authority_boost}</p>
                      </div>
                      <div className="p-2 rounded-md border border-border/50 bg-accent/20">
                        <p className="text-[9px] text-muted-foreground mb-0.5">🏛️ Pillar Page</p>
                        <p className="text-[10px] font-medium text-foreground">{linkingResult.result.pillar_page_recommendation}</p>
                      </div>
                    </div>

                    {/* Strategy */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> Linking Strategy
                      </p>
                      <p className="text-[10px] text-foreground bg-accent/30 p-2 rounded-md leading-relaxed">{linkingResult.result.linking_strategy}</p>
                    </div>

                    {/* Link Suggestions */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-chart-3" /> Suggested Links ({linkingResult.result.internal_link_suggestions.length})
                      </p>
                      <div className="space-y-1.5">
                        {linkingResult.result.internal_link_suggestions.map((link, i) => (
                          <div key={i} className={cn(
                            "p-2 rounded-md border",
                            link.seo_value === 'HIGH' ? "border-chart-1/30 bg-chart-1/5" :
                            link.seo_value === 'MEDIUM' ? "border-chart-4/30 bg-chart-4/5" :
                            "border-border/50 bg-muted/20"
                          )}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                  <Badge variant={
                                    link.seo_value === 'HIGH' ? 'default' :
                                    link.seo_value === 'MEDIUM' ? 'secondary' : 'outline'
                                  } className="text-[8px] px-1.5 py-0">
                                    {link.seo_value}
                                  </Badge>
                                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-chart-3/30 text-chart-3">
                                    {link.link_type.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                <p className="text-[10px] font-medium text-foreground">
                                  <span className="text-chart-3 underline">{link.anchor_text}</span>
                                </p>
                                <p className="text-[9px] text-muted-foreground mt-0.5 font-mono truncate">{link.target_url}</p>
                                <p className="text-[9px] text-muted-foreground mt-0.5">{link.reasoning}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-card border-border"><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a property from the list or use the manual selector above</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertySEOChecker;
