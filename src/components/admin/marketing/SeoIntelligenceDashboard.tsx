import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain, TrendingUp, Zap, Target, BarChart3, AlertTriangle,
  ArrowUp, ArrowDown, Minus, Loader2, Sparkles, Search,
  Hash, Globe, RefreshCw, CheckCircle, XCircle, Eye, Copy,
  FileText, Users, Wand2, ExternalLink, ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  useSeoStats,
  usePropertySeoAnalyses,
  useSeoTrendKeywords,
  useAnalyzeBatch,
  useAutoOptimize,
  useAnalyzeProperty,
  useApplySeo,
  useContentOptimize,
  useCompetitorAnalysis,
  useSerpPreview,
  type PropertySeoAnalysis,
  type ContentOptimization,
  type CompetitorData,
  type CompetitorInsights,
  type SerpPreview,
} from '@/hooks/useSeoIntelligence';

const SeoIntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisFilter, setAnalysisFilter] = useState<string | undefined>();
  const [batchProgress, setBatchProgress] = useState<{ running: boolean; analyzed: number; total: number } | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [competitorLocation, setCompetitorLocation] = useState('');
  const [competitorType, setCompetitorType] = useState('');

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useSeoStats();
  const { data: analyses = [], isLoading: loadingAnalyses } = usePropertySeoAnalyses({ limit: 100, filter: analysisFilter });
  const { data: trendingId = [] } = useSeoTrendKeywords({ language: 'id', limit: 15 });
  const { data: trendingEn = [] } = useSeoTrendKeywords({ language: 'en', limit: 10 });
  const analyzeBatch = useAnalyzeBatch();
  const autoOptimize = useAutoOptimize();
  const analyzeProperty = useAnalyzeProperty();
  const applySeo = useApplySeo();
  const contentOptimize = useContentOptimize();
  const competitorAnalysis = useCompetitorAnalysis();
  const serpPreview = useSerpPreview();

  const runFullBatchAnalysis = async () => {
    const total = stats?.unanalyzedCount || 0;
    if (total === 0) return;
    setBatchProgress({ running: true, analyzed: 0, total });
    let totalAnalyzed = 0;
    
    while (true) {
      try {
        const { data, error } = await supabase.functions.invoke('seo-analyzer', {
          body: { action: 'analyze-batch', limit: 50, offset: 0, filter: 'unanalyzed' },
        });
        if (error) throw error;
        const count = data?.analyzed || 0;
        if (count === 0) break;
        totalAnalyzed += count;
        setBatchProgress({ running: true, analyzed: totalAnalyzed, total });
        refetchStats();
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error('Batch analysis error:', e);
        break;
      }
    }
    
    setBatchProgress({ running: false, analyzed: totalAnalyzed, total });
    refetchStats();
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-500 bg-green-500/10';
      case 'good': return 'text-blue-500 bg-blue-500/10';
      case 'needs_improvement': return 'text-amber-500 bg-amber-500/10';
      case 'poor': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'needs_improvement': return 'Needs Work';
      case 'poor': return 'Poor';
      default: return rating;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getTrendIcon = (dir: string) => {
    if (dir === 'rising') return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (dir === 'falling') return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getCompetitionBadge = (level: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500/10 text-green-600',
      medium: 'bg-amber-500/10 text-amber-600',
      high: 'bg-red-500/10 text-red-600',
    };
    return <Badge className={`text-xs ${colors[level] || ''}`}>{level}</Badge>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            SEO Intelligence Engine
          </h2>
          <p className="text-sm text-muted-foreground">AI-powered keyword intelligence, competitor analysis & content optimization</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={runFullBatchAnalysis}
            disabled={batchProgress?.running || analyzeBatch.isPending}
          >
            {batchProgress?.running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing... {batchProgress.analyzed}/{batchProgress.total}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze All ({stats?.unanalyzedCount || 0})
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => autoOptimize.mutate({ threshold: 50, limit: 20 })}
            disabled={autoOptimize.isPending}
          >
            {autoOptimize.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Auto-Optimize Weak
          </Button>
        </div>
      </div>

      {/* Batch Progress Bar */}
      {batchProgress?.running && (
        <Card className="border border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Batch Analysis Running...</span>
              <span className="text-sm text-muted-foreground">{batchProgress.analyzed}/{batchProgress.total}</span>
            </div>
            <Progress value={(batchProgress.analyzed / batchProgress.total) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg SEO Score', value: stats?.avgScore || 0, icon: Target, color: getScoreColor(stats?.avgScore || 0) },
          { label: 'Analyzed', value: stats?.analyzedCount || 0, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Unanalyzed', value: stats?.unanalyzedCount || 0, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Excellent', value: stats?.excellent || 0, icon: Sparkles, color: 'text-green-500' },
          { label: 'Poor', value: stats?.poor || 0, icon: XCircle, color: 'text-red-500' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border border-border rounded-[6px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <div>
                  <p className={`text-lg font-bold ${stat.color}`}>{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Distribution */}
      {stats && stats.analyzedCount > 0 && (
        <Card className="bg-card border border-border rounded-[6px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SEO Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Excellent (80+)', count: stats.excellent, color: 'bg-green-500', pct: (stats.excellent / stats.analyzedCount) * 100 },
                { label: 'Good (60-79)', count: stats.good, color: 'bg-blue-500', pct: (stats.good / stats.analyzedCount) * 100 },
                { label: 'Needs Work (40-59)', count: stats.needsImprovement, color: 'bg-amber-500', pct: (stats.needsImprovement / stats.analyzedCount) * 100 },
                { label: 'Poor (<40)', count: stats.poor, color: 'bg-red-500', pct: (stats.poor / stats.analyzedCount) * 100 },
              ].map((d) => (
                <div key={d.label} className="text-center">
                  <div className="text-lg font-bold">{d.count}</div>
                  <div className="text-xs text-muted-foreground mb-1">{d.label}</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 flex-wrap h-auto">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Property SEO
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-1" /> Trends
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-1" /> Content Optimizer
          </TabsTrigger>
          <TabsTrigger value="serp">
            <Eye className="h-4 w-4 mr-1" /> SERP Preview
          </TabsTrigger>
          <TabsTrigger value="competitor">
            <Users className="h-4 w-4 mr-1" /> Competitor Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="h-4 w-4 mr-1" /> AI Recs
          </TabsTrigger>
        </TabsList>

        {/* Property SEO Analysis Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card className="border border-border rounded-[6px]">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Property SEO Scores</CardTitle>
                <div className="flex gap-2">
                  {[
                    { label: 'All', value: undefined },
                    { label: 'Weak', value: 'weak' },
                    { label: 'Excellent', value: 'excellent' },
                  ].map((f) => (
                    <Button
                      key={f.label}
                      size="sm"
                      variant={analysisFilter === f.value ? 'default' : 'outline'}
                      onClick={() => setAnalysisFilter(f.value)}
                      className="text-xs h-7"
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Score</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAnalyses ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : analyses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No analyses yet. Click "Analyze All" to start.
                        </TableCell>
                      </TableRow>
                    ) : (
                      analyses.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-lg ${getScoreColor(a.seo_score)}`}>{a.seo_score}</span>
                              <Progress value={a.seo_score} className="w-12 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getRatingColor(a.seo_rating)}`}>
                              {getRatingLabel(a.seo_rating)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs">{a.seo_title}</TableCell>
                          <TableCell><MiniScore score={a.keyword_score} /></TableCell>
                          <TableCell><MiniScore score={a.location_score} /></TableCell>
                          <TableCell>{getCompetitionBadge(a.ranking_difficulty)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => analyzeProperty.mutate(a.property_id)}
                                disabled={analyzeProperty.isPending}
                                title="Re-analyze"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => applySeo.mutate(a.property_id)}
                                disabled={applySeo.isPending}
                                title="Apply SEO to listing"
                              >
                                <Wand2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  setSelectedPropertyId(a.property_id);
                                  setActiveTab('serp');
                                  serpPreview.mutate(a.property_id);
                                }}
                                title="SERP Preview"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Keywords Tab */}
        <TabsContent value="trending" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border rounded-[6px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  🇮🇩 Bahasa Indonesia Keywords
                </CardTitle>
                <CardDescription>Top trending property keywords in Indonesian</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {trendingId.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8 text-sm">No trending keywords data yet</p>
                    ) : trendingId.map((kw, idx) => (
                      <div key={kw.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-[6px]">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{kw.keyword}</p>
                            <p className="text-xs text-muted-foreground">
                              Vol: {kw.search_volume?.toLocaleString()} • Score: {kw.trend_score}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(kw.trend_direction)}
                          {getCompetitionBadge(kw.competition_level)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-[6px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  🌏 English Keywords
                </CardTitle>
                <CardDescription>International property search keywords</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {trendingEn.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8 text-sm">No trending keywords data yet</p>
                    ) : trendingEn.map((kw, idx) => (
                      <div key={kw.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-[6px]">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{kw.keyword}</p>
                            <p className="text-xs text-muted-foreground">
                              Vol: {kw.search_volume?.toLocaleString()} • Score: {kw.trend_score}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(kw.trend_direction)}
                          {getCompetitionBadge(kw.competition_level)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Optimizer Tab */}
        <TabsContent value="content" className="mt-4">
          <div className="space-y-4">
            <Card className="border border-border rounded-[6px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  AI Content Optimizer
                </CardTitle>
                <CardDescription>Select a property from the SEO table to generate optimized content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Select value={selectedPropertyId || ''} onValueChange={setSelectedPropertyId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select analyzed property..." />
                    </SelectTrigger>
                    <SelectContent>
                      {analyses.map((a) => (
                        <SelectItem key={a.property_id} value={a.property_id}>
                          <span className={getScoreColor(a.seo_score)}>[{a.seo_score}]</span> {a.seo_title?.slice(0, 50)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => selectedPropertyId && contentOptimize.mutate(selectedPropertyId)}
                    disabled={!selectedPropertyId || contentOptimize.isPending}
                  >
                    {contentOptimize.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                    Optimize
                  </Button>
                </div>

                {contentOptimize.data && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-muted-foreground">Optimized Title</label>
                            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => copyToClipboard(contentOptimize.data.optimized_title)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="p-2 bg-green-500/5 border border-green-500/20 rounded-[6px] text-sm">{contentOptimize.data.optimized_title}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-muted-foreground">Meta Title ({contentOptimize.data.meta_title?.length || 0}/60)</label>
                            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => copyToClipboard(contentOptimize.data.meta_title)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="p-2 bg-muted/50 rounded-[6px] text-sm">{contentOptimize.data.meta_title}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-muted-foreground">Meta Description ({contentOptimize.data.meta_description?.length || 0}/160)</label>
                            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => copyToClipboard(contentOptimize.data.meta_description)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="p-2 bg-muted/50 rounded-[6px] text-sm">{contentOptimize.data.meta_description}</div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Expected Score After Optimization</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-2xl font-bold ${getScoreColor(contentOptimize.data.content_score)}`}>
                              {contentOptimize.data.content_score}
                            </span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-muted-foreground">Optimized Description</label>
                            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => copyToClipboard(contentOptimize.data.optimized_description)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <ScrollArea className="h-[120px]">
                            <div className="p-2 bg-green-500/5 border border-green-500/20 rounded-[6px] text-sm">{contentOptimize.data.optimized_description}</div>
                          </ScrollArea>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Focus Keywords</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contentOptimize.data.focus_keywords?.map((k: string) => (
                              <Badge key={k} className="text-xs bg-primary/10 text-primary cursor-pointer" onClick={() => copyToClipboard(k)}>{k}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Hashtags</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contentOptimize.data.hashtags?.map((h: string) => (
                              <Badge key={h} variant="outline" className="text-xs cursor-pointer" onClick={() => copyToClipboard(h)}>{h}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Readability Tips</label>
                          <ul className="mt-1 space-y-1">
                            {contentOptimize.data.readability_tips?.map((tip: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-1">
                                <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />{tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Apply button */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (selectedPropertyId) applySeo.mutate(selectedPropertyId);
                        }}
                        disabled={!selectedPropertyId || applySeo.isPending}
                      >
                        {applySeo.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                        Apply to Listing
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SERP Preview Tab */}
        <TabsContent value="serp" className="mt-4">
          <div className="space-y-4">
            <Card className="border border-border rounded-[6px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Google Search Preview
                </CardTitle>
                <CardDescription>See how your listings appear in Google search results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Select value={selectedPropertyId || ''} onValueChange={(v) => {
                    setSelectedPropertyId(v);
                    serpPreview.mutate(v);
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select property to preview..." />
                    </SelectTrigger>
                    <SelectContent>
                      {analyses.map((a) => (
                        <SelectItem key={a.property_id} value={a.property_id}>
                          <span className={getScoreColor(a.seo_score)}>[{a.seo_score}]</span> {a.seo_title?.slice(0, 50)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {serpPreview.isPending && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}

                {serpPreview.data && (
                  <div className="space-y-6">
                    {/* Current SERP */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">❌ Current (Before SEO)</h4>
                      <SerpCard preview={serpPreview.data.current} />
                    </div>

                    {/* Optimized SERP */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">✅ Optimized (After SEO)</h4>
                      <SerpCard preview={serpPreview.data.optimized} />
                    </div>

                    {/* Improvements */}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Title Changed: {serpPreview.data.improvements?.title_changed ? '✅' : '❌'}</span>
                      <span>Description Changed: {serpPreview.data.improvements?.description_changed ? '✅' : '❌'}</span>
                      <span>SEO Score: <span className={getScoreColor(serpPreview.data.improvements?.seo_score || 0)}>{serpPreview.data.improvements?.seo_score}</span></span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Competitor Analysis Tab */}
        <TabsContent value="competitor" className="mt-4">
          <div className="space-y-4">
            <Card className="border border-border rounded-[6px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Competitor Keyword Analysis
                </CardTitle>
                <CardDescription>Analyze competitor listings in your target market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Location (e.g., Bali, Jakarta)..."
                    value={competitorLocation}
                    onChange={(e) => setCompetitorLocation(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Property type..."
                    value={competitorType}
                    onChange={(e) => setCompetitorType(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => competitorAnalysis.mutate({ location: competitorLocation, propertyType: competitorType })}
                    disabled={competitorAnalysis.isPending || (!competitorLocation && !competitorType)}
                  >
                    {competitorAnalysis.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                    Analyze
                  </Button>
                </div>

                {competitorAnalysis.isPending && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}

                {competitorAnalysis.data && (
                  <div className="space-y-4">
                    {/* AI Insights */}
                    {competitorAnalysis.data.insights && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Card className="bg-muted/30 border-0">
                          <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground">Market Saturation</p>
                            <p className="text-lg font-bold capitalize">{competitorAnalysis.data.insights.market_saturation}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30 border-0">
                          <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground">Price Positioning</p>
                            <p className="text-lg font-bold capitalize">{competitorAnalysis.data.insights.price_positioning?.replace('_', ' ')}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30 border-0">
                          <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground">Difficulty Score</p>
                            <p className={`text-lg font-bold ${getScoreColor(100 - (competitorAnalysis.data.insights.difficulty_score || 0))}`}>
                              {competitorAnalysis.data.insights.difficulty_score}/100
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Keyword Gaps */}
                    {competitorAnalysis.data.insights?.keyword_gaps && (
                      <Card className="bg-green-500/5 border border-green-500/20">
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-green-600 mb-2">🎯 Untapped Keyword Opportunities</p>
                          <div className="flex flex-wrap gap-1">
                            {competitorAnalysis.data.insights.keyword_gaps.map((k: string) => (
                              <Badge key={k} className="bg-green-500/10 text-green-600 text-xs cursor-pointer" onClick={() => copyToClipboard(k)}>{k}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {competitorAnalysis.data.insights?.recommendations && (
                      <Card className="border border-border rounded-[6px]">
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">💡 Strategic Recommendations</p>
                          <ul className="space-y-2">
                            {competitorAnalysis.data.insights.recommendations.map((r: string, i: number) => (
                              <li key={i} className="flex gap-2 text-sm">
                                <span className="text-primary font-bold">{i + 1}.</span> {r}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Competitor Listings */}
                    <ScrollArea className="h-[300px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Listing</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>SEO Score</TableHead>
                            <TableHead>Keywords</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {competitorAnalysis.data.competitors?.map((c: CompetitorData) => (
                            <TableRow key={c.id}>
                              <TableCell className="max-w-[200px] truncate text-xs">{c.title}</TableCell>
                              <TableCell className="text-xs">{c.location}</TableCell>
                              <TableCell>
                                {c.seo_score !== null ? (
                                  <span className={`font-bold ${getScoreColor(c.seo_score)}`}>{c.seo_score}</span>
                                ) : (
                                  <Badge variant="outline" className="text-xs">N/A</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {c.keywords?.slice(0, 3).map((k: string) => (
                                    <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border rounded-[6px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Weak Listings Needing SEO
                </CardTitle>
                <CardDescription>Properties scoring below 50 that need optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {analyses.filter(a => a.seo_score < 50).slice(0, 10).map((a) => (
                      <div key={a.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-[6px]">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-bold ${getScoreColor(a.seo_score)}`}>{a.seo_score}/100</span>
                          <div className="flex gap-1">
                            <Badge className="bg-red-500/10 text-red-600 text-xs">{getRatingLabel(a.seo_rating)}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => analyzeProperty.mutate(a.property_id)}
                              disabled={analyzeProperty.isPending}
                              title="Re-analyze"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1 truncate">{a.seo_title}</p>
                        {a.missing_keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {a.missing_keywords.slice(0, 3).map((k) => (
                              <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {analyses.filter(a => a.seo_score < 50).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No weak listings found. Great SEO health! 🎉
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-[6px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Top Suggested Keywords
                </CardTitle>
                <CardDescription>Most frequently suggested keywords across all properties</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {getTopSuggestedKeywords(analyses).map(([keyword, count], idx) => (
                      <div key={keyword} className="flex items-center justify-between p-2 bg-primary/5 rounded-[6px]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                          <span className="text-sm cursor-pointer hover:text-primary" onClick={() => copyToClipboard(keyword)}>{keyword}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{count} listings</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// SERP Preview Card - simulates Google search result
function SerpCard({ preview }: { preview: SerpPreview }) {
  return (
    <div className="p-4 bg-card border border-border rounded-[6px] max-w-[600px]">
      <p className="text-xs text-green-600 mb-0.5">{preview.url}</p>
      <h3 className="text-blue-600 text-base font-medium hover:underline cursor-pointer mb-1 line-clamp-1">{preview.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{preview.description}</p>
      {preview.keywords && preview.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {preview.keywords.slice(0, 4).map((k) => (
            <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniScore({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-blue-500' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  return <span className={`text-xs font-medium ${color}`}>{score}</span>;
}

function getTopSuggestedKeywords(analyses: PropertySeoAnalysis[]): [string, number][] {
  const counts: Record<string, number> = {};
  analyses.forEach(a => {
    (a.suggested_keywords || []).forEach(k => {
      if (k) counts[k] = (counts[k] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15);
}

export default SeoIntelligenceDashboard;
