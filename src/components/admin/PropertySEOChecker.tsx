import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, RefreshCw, Zap, CheckCircle2, XCircle, AlertTriangle, 
  Loader2, Target, TrendingUp, Globe, BarChart3, FileText, 
  Image, Hash, Eye, Lightbulb, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import {
  usePropertySeoAnalyses,
  useSeoStats,
  useAnalyzeBatch,
  useAutoOptimize,
  useAnalyzeProperty,
  useApplySeo,
  type PropertySeoAnalysis,
} from '@/hooks/useSeoIntelligence';

const ScoreBadge = ({ score }: { score: number }) => {
  const variant = score >= 80 ? 'default' : score >= 60 ? 'secondary' : score >= 40 ? 'outline' : 'destructive';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor';
  return (
    <Badge variant={variant} className="text-[10px]">
      {score}/100 · {label}
    </Badge>
  );
};

const CheckItem = ({ passed, label, suggestion }: { passed: boolean; label: string; suggestion: string }) => (
  <div className="flex items-start gap-2 p-2 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors">
    {passed ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 shrink-0 mt-0.5" />
    ) : (
      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{suggestion}</p>
    </div>
  </div>
);

const PropertySEOChecker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProperty, setSelectedProperty] = useState<PropertySeoAnalysis | null>(null);

  const { data: stats, isLoading: statsLoading } = useSeoStats();
  const { data: allAnalyses = [], isLoading: analysesLoading } = usePropertySeoAnalyses({ limit: 100 });
  const { data: weakListings = [] } = usePropertySeoAnalyses({ limit: 20, filter: 'weak' });
  const { data: topListings = [] } = usePropertySeoAnalyses({ limit: 10, filter: 'excellent' });
  const analyzeBatch = useAnalyzeBatch();
  const autoOptimize = useAutoOptimize();
  const analyzeProperty = useAnalyzeProperty();
  const applySeo = useApplySeo();

  const filteredAnalyses = allAnalyses.filter(item =>
    !searchQuery || 
    item.seo_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.seo_keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getScoreBreakdown = (analysis: PropertySeoAnalysis) => {
    const checks = [
      { label: 'Title Optimization', passed: analysis.title_score >= 70, suggestion: analysis.title_score >= 70 ? 'Title is well-optimized' : 'Improve title with target keywords and proper length (50-60 chars)' },
      { label: 'Meta Description', passed: analysis.description_score >= 70, suggestion: analysis.description_score >= 70 ? 'Description is compelling' : 'Write a compelling description (120-160 chars) with keywords' },
      { label: 'Keyword Coverage', passed: analysis.keyword_score >= 70, suggestion: analysis.keyword_score >= 70 ? 'Good keyword coverage' : `Missing keywords: ${analysis.missing_keywords?.slice(0, 3).join(', ') || 'N/A'}` },
      { label: 'Hashtag Strategy', passed: analysis.hashtag_score >= 70, suggestion: analysis.hashtag_score >= 70 ? 'Hashtags are effective' : 'Add relevant hashtags for social discovery' },
      { label: 'Location SEO', passed: analysis.location_score >= 70, suggestion: analysis.location_score >= 70 ? 'Location signals are strong' : 'Include location-specific keywords (city, area, neighborhood)' },
    ];
    return checks;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Property SEO Checker
          </h2>
          <p className="text-xs text-muted-foreground">Analyze & optimize property listing SEO scores</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeBatch.mutate({ limit: 20, filter: 'unanalyzed' })}
            disabled={analyzeBatch.isPending}
          >
            {analyzeBatch.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
            Analyze Batch
          </Button>
          <Button
            size="sm"
            onClick={() => autoOptimize.mutate({ threshold: 50, limit: 10 })}
            disabled={autoOptimize.isPending}
          >
            {autoOptimize.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1.5" />}
            Auto-Optimize
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg Score', value: stats?.avgScore ?? 0, icon: BarChart3, color: 'text-primary' },
          { label: 'Analyzed', value: `${stats?.analyzedCount ?? 0}/${stats?.totalProperties ?? 0}`, icon: Target, color: 'text-chart-2' },
          { label: 'Excellent', value: stats?.excellent ?? 0, icon: CheckCircle2, color: 'text-chart-1' },
          { label: 'Good', value: stats?.good ?? 0, icon: TrendingUp, color: 'text-chart-4' },
          { label: 'Needs Work', value: (stats?.needsImprovement ?? 0) + (stats?.poor ?? 0), icon: AlertTriangle, color: 'text-destructive' },
        ].map(stat => (
          <Card key={stat.label} className="bg-card/60 border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold mt-1">{statsLoading ? '...' : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Distribution Bar */}
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
                  <div className="bg-chart-1 transition-all" style={{ width: `${(stats.excellent / stats.analyzedCount) * 100}%` }} title={`Excellent: ${stats.excellent}`} />
                  <div className="bg-primary transition-all" style={{ width: `${(stats.good / stats.analyzedCount) * 100}%` }} title={`Good: ${stats.good}`} />
                  <div className="bg-chart-4 transition-all" style={{ width: `${(stats.needsImprovement / stats.analyzedCount) * 100}%` }} title={`Needs Work: ${stats.needsImprovement}`} />
                  <div className="bg-destructive transition-all" style={{ width: `${(stats.poor / stats.analyzedCount) * 100}%` }} title={`Poor: ${stats.poor}`} />
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="bg-muted/40 border border-border/30">
          <TabsTrigger value="dashboard" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />All Properties</TabsTrigger>
          <TabsTrigger value="weak" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" />Weak ({weakListings.length})</TabsTrigger>
          <TabsTrigger value="top" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Top ({topListings.length})</TabsTrigger>
          {selectedProperty && <TabsTrigger value="detail" className="text-xs gap-1"><Eye className="h-3 w-3" />Detail</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          
          {analysesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAnalyses.length > 0 ? (
            <div className="space-y-2">
              {filteredAnalyses.map(item => (
                <Card 
                  key={item.id} 
                  className="bg-card/60 border-border/40 hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => { setSelectedProperty(item); setActiveTab('detail'); }}
                >
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                            onClick={(e) => { e.stopPropagation(); analyzeProperty.mutate(item.property_id); }}
                            disabled={analyzeProperty.isPending}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Re-analyze
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                            onClick={(e) => { e.stopPropagation(); applySeo.mutate(item.property_id); }}
                            disabled={applySeo.isPending}
                          >
                            <Zap className="h-3 w-3 mr-1" /> Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-8 text-center">
                <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No analyzed properties found</p>
                <Button size="sm" className="mt-3" onClick={() => analyzeBatch.mutate({ limit: 20, filter: 'unanalyzed' })}>
                  Start Analyzing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weak" className="space-y-2">
          {weakListings.length > 0 ? weakListings.map(item => (
            <Card 
              key={item.id}
              className="bg-card/60 border-border/40 border-l-2 border-l-destructive hover:border-primary/30 cursor-pointer transition-all"
              onClick={() => { setSelectedProperty(item); setActiveTab('detail'); }}
            >
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
          )) : (
            <Card className="bg-card/60"><CardContent className="p-8 text-center text-sm text-muted-foreground">No weak listings — great job! 🎉</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="top" className="space-y-2">
          {topListings.length > 0 ? topListings.map(item => (
            <Card 
              key={item.id}
              className="bg-card/60 border-border/40 border-l-2 border-l-chart-1 hover:border-primary/30 cursor-pointer transition-all"
              onClick={() => { setSelectedProperty(item); setActiveTab('detail'); }}
            >
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
          )) : (
            <Card className="bg-card/60"><CardContent className="p-8 text-center text-sm text-muted-foreground">No excellent listings yet. Run Auto-Optimize!</CardContent></Card>
          )}
        </TabsContent>

        {/* Detail View */}
        <TabsContent value="detail">
          {selectedProperty ? (
            <div className="space-y-3">
              <Card className="bg-card/60 border-border/40">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{selectedProperty.seo_title || 'Untitled Property'}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => analyzeProperty.mutate(selectedProperty.property_id)}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Re-analyze
                      </Button>
                      <Button size="sm" className="h-7 text-xs" onClick={() => applySeo.mutate(selectedProperty.property_id)}>
                        <Zap className="h-3 w-3 mr-1" /> Apply SEO
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[10px] line-clamp-2">{selectedProperty.seo_description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex items-center gap-3 mb-3">
                    <ScoreBadge score={selectedProperty.seo_score} />
                    <Badge variant="outline" className="text-[10px]">Difficulty: {selectedProperty.ranking_difficulty}</Badge>
                    <Badge variant="outline" className="text-[10px]">AI: {selectedProperty.ai_model_used}</Badge>
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {[
                      { label: 'Title', score: selectedProperty.title_score, icon: FileText },
                      { label: 'Description', score: selectedProperty.description_score, icon: FileText },
                      { label: 'Keywords', score: selectedProperty.keyword_score, icon: Hash },
                      { label: 'Hashtags', score: selectedProperty.hashtag_score, icon: Hash },
                      { label: 'Location', score: selectedProperty.location_score, icon: Globe },
                    ].map(sub => (
                      <div key={sub.label} className="text-center p-2 rounded-lg border border-border/50 bg-muted/20">
                        <sub.icon className="h-3 w-3 mx-auto text-muted-foreground mb-1" />
                        <p className="text-lg font-bold">{sub.score}</p>
                        <p className="text-[8px] text-muted-foreground">{sub.label}</p>
                        <Progress value={sub.score} className="h-1 mt-1" />
                      </div>
                    ))}
                  </div>

                  {/* Checklist */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium flex items-center gap-1"><Lightbulb className="h-3 w-3 text-chart-4" /> SEO Checklist</p>
                    {getScoreBreakdown(selectedProperty).map((check, i) => (
                      <CheckItem key={i} {...check} />
                    ))}
                  </div>

                  {/* Keywords & Hashtags */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Current Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedProperty.seo_keywords?.map(kw => (
                          <Badge key={kw} variant="secondary" className="text-[8px] px-1.5 py-0">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Suggested Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedProperty.suggested_keywords?.map(kw => (
                          <Badge key={kw} variant="outline" className="text-[8px] px-1.5 py-0 border-chart-1/30 text-chart-1">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card/60"><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a property to view details</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertySEOChecker;
