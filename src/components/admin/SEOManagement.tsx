import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, TrendingUp, Globe, BarChart3, ExternalLink, Edit, 
  RefreshCw, Zap, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Minus,
  Loader2, Target, Hash
} from 'lucide-react';
import { 
  usePropertySeoAnalyses, 
  useSeoStats, 
  useSeoTrendKeywords, 
  useAnalyzeBatch, 
  useAutoOptimize 
} from '@/hooks/useSeoIntelligence';

const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 80 ? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
    : score >= 60 ? 'bg-primary/10 text-primary border-primary/20'
    : score >= 40 ? 'bg-chart-3/10 text-chart-3 border-chart-3/20'
    : 'bg-destructive/10 text-destructive border-destructive/20';
  return <Badge className={color}>{score}/100</Badge>;
};

const TrendIcon = ({ direction }: { direction: string }) => {
  if (direction === 'up') return <ArrowUpRight className="h-3 w-3 text-chart-1" />;
  if (direction === 'down') return <ArrowDownRight className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const SEOManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading: statsLoading } = useSeoStats();
  const { data: weakListings, isLoading: weakLoading } = usePropertySeoAnalyses({ limit: 10, filter: 'weak' });
  const { data: topListings } = usePropertySeoAnalyses({ limit: 5, filter: 'excellent' });
  const { data: trendKeywords, isLoading: trendsLoading } = useSeoTrendKeywords({ limit: 15 });
  const analyzeBatch = useAnalyzeBatch();
  const autoOptimize = useAutoOptimize();

  const filteredWeak = weakListings?.filter(item =>
    !searchQuery || item.seo_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">SEO Management</h2>
          <p className="text-muted-foreground text-sm">Live SEO intelligence & optimization</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => analyzeBatch.mutate({ limit: 20, filter: 'unanalyzed' })}
            disabled={analyzeBatch.isPending}
          >
            {analyzeBatch.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Analyze Batch
          </Button>
          <Button
            onClick={() => autoOptimize.mutate({ threshold: 50, limit: 10 })}
            disabled={autoOptimize.isPending}
          >
            {autoOptimize.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            Auto-Optimize
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.avgScore ?? 0}</p>
            <Progress value={stats?.avgScore ?? 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Analyzed</p>
            <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.analyzedCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">of {stats?.totalProperties ?? 0} properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Excellent (80+)</p>
            <p className="text-2xl font-bold text-chart-1">{statsLoading ? '...' : stats?.excellent ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Needs Work (&lt;50)</p>
            <p className="text-2xl font-bold text-destructive">{statsLoading ? '...' : (stats?.needsImprovement ?? 0) + (stats?.poor ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weak">Weak Listings</TabsTrigger>
          <TabsTrigger value="trends">Trend Keywords</TabsTrigger>
          <TabsTrigger value="top">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Score Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Excellent (80-100)', count: stats?.excellent ?? 0, color: 'bg-chart-1' },
                  { label: 'Good (60-79)', count: stats?.good ?? 0, color: 'bg-primary' },
                  { label: 'Needs Improvement (40-59)', count: stats?.needsImprovement ?? 0, color: 'bg-chart-3' },
                  { label: 'Poor (<40)', count: stats?.poor ?? 0, color: 'bg-destructive' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline" className="w-full justify-start"
                  onClick={() => analyzeBatch.mutate({ limit: 50, filter: 'unanalyzed' })}
                  disabled={analyzeBatch.isPending}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Analyze All Unanalyzed Properties
                </Button>
                <Button
                  variant="outline" className="w-full justify-start"
                  onClick={() => autoOptimize.mutate({ threshold: 40, limit: 20 })}
                  disabled={autoOptimize.isPending}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Fix Poor Listings (score &lt; 40)
                </Button>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {stats?.trendKeywordsCount ?? 0} trend keywords tracked
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weak">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-chart-3" />
                  Weak Listings (Score &lt; 50)
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {weakLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredWeak && filteredWeak.length > 0 ? (
                <div className="space-y-2">
                  {filteredWeak.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.seo_title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.seo_description?.slice(0, 80)}...</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.missing_keywords?.slice(0, 3).map((kw: string) => (
                            <Badge key={kw} variant="outline" className="text-[10px] px-1.5 py-0">
                              Missing: {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <ScoreBadge score={item.seo_score} />
                        <Badge variant="outline" className="text-xs">{item.ranking_difficulty}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No weak listings found. Great job! 🎉
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : trendKeywords && trendKeywords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trendKeywords.map((kw) => (
                    <div key={kw.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{kw.keyword}</span>
                        <TrendIcon direction={kw.trend_direction} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{kw.competition_level}</Badge>
                        <Badge variant="secondary" className="text-xs">{kw.search_volume?.toLocaleString()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No trend data available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-chart-1" />
                Top Performers (Score 80+)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topListings && topListings.length > 0 ? (
                <div className="space-y-2">
                  {topListings.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.seo_title || 'Untitled'}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.seo_keywords?.slice(0, 4).map((kw: string) => (
                            <Badge key={kw} variant="secondary" className="text-[10px] px-1.5 py-0">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                      <ScoreBadge score={item.seo_score} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No excellent listings yet. Run Auto-Optimize to improve scores.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOManagement;
