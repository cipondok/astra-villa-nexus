import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain, TrendingUp, Zap, Target, BarChart3, AlertTriangle,
  ArrowUp, ArrowDown, Minus, Loader2, Sparkles, Search,
  Hash, Globe, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import {
  useSeoStats,
  usePropertySeoAnalyses,
  useSeoTrendKeywords,
  useAnalyzeBatch,
  useAutoOptimize,
  type PropertySeoAnalysis,
} from '@/hooks/useSeoIntelligence';

const SeoIntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisFilter, setAnalysisFilter] = useState<string | undefined>();

  const { data: stats, isLoading: loadingStats } = useSeoStats();
  const { data: analyses = [], isLoading: loadingAnalyses } = usePropertySeoAnalyses({ limit: 100, filter: analysisFilter });
  const { data: trendingId = [] } = useSeoTrendKeywords({ language: 'id', limit: 15 });
  const { data: trendingEn = [] } = useSeoTrendKeywords({ language: 'en', limit: 10 });
  const analyzeBatch = useAnalyzeBatch();
  const autoOptimize = useAutoOptimize();

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
      case 'needs_improvement': return 'Needs Improvement';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            SEO Intelligence Engine
          </h2>
          <p className="text-sm text-muted-foreground">AI-powered keyword intelligence & property SEO optimization</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => analyzeBatch.mutate({ limit: 20, filter: 'unanalyzed' })}
            disabled={analyzeBatch.isPending}
          >
            {analyzeBatch.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analyze Unscanned ({stats?.unanalyzedCount || 0})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => autoOptimize.mutate({ threshold: 50, limit: 10 })}
            disabled={autoOptimize.isPending}
          >
            {autoOptimize.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Auto-Optimize Weak
          </Button>
        </div>
      </div>

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
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
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
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" /> Property SEO
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-1" /> Trending Keywords
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="h-4 w-4 mr-1" /> AI Recommendations
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
                      <TableHead>Desc</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>SEO Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAnalyses ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : analyses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No analyses yet. Click "Analyze Unscanned" to start.
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
                          <TableCell><MiniScore score={a.title_score} /></TableCell>
                          <TableCell><MiniScore score={a.description_score} /></TableCell>
                          <TableCell><MiniScore score={a.keyword_score} /></TableCell>
                          <TableCell><MiniScore score={a.location_score} /></TableCell>
                          <TableCell>{getCompetitionBadge(a.ranking_difficulty)}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {a.seo_title}
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
                    {trendingId.map((kw, idx) => (
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
                    {trendingEn.map((kw, idx) => (
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
                          <Badge className="bg-red-500/10 text-red-600 text-xs">{getRatingLabel(a.seo_rating)}</Badge>
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
                          <span className="text-sm">{keyword}</span>
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
