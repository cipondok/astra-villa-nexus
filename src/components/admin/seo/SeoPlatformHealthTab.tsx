import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, BarChart3, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, MapPin, Lightbulb, Target, Sparkles, Flame
} from 'lucide-react';
import { useSeoHealthInsights, type SeoPlatformHealthResponse } from '@/hooks/useSeoHealthInsights';
import { cn } from '@/lib/utils';

const SeoPlatformHealthTab = () => {
  const healthInsights = useSeoHealthInsights();
  const result = healthInsights.data as SeoPlatformHealthResponse | undefined;

  return (
    <div className="space-y-4">
      {/* Trigger */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Platform SEO Health Analysis
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Aggregate all SEO audit data and generate strategic platform-level insights using AI.
              </p>
            </div>
            <Button
              onClick={() => healthInsights.mutate(200)}
              disabled={healthInsights.isPending}
              size="sm"
            >
              {healthInsights.isPending ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Analyzing...</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Generate Insights</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {healthInsights.isError && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-3">
            <p className="text-xs text-destructive flex items-center gap-2">
              <XCircle className="h-3.5 w-3.5" />
              {(healthInsights.error as Error)?.message || 'Failed to generate health insights'}
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className={cn(
                  "text-2xl font-bold tabular-nums",
                  result.health.average_seo_score >= 70 ? "text-chart-1" :
                  result.health.average_seo_score >= 50 ? "text-chart-4" : "text-destructive"
                )}>
                  {result.health.average_seo_score}
                </p>
                <p className="text-[9px] text-muted-foreground">Avg SEO Score</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Target className="h-4 w-4 mx-auto mb-1 text-chart-2" />
                <p className="text-2xl font-bold tabular-nums text-foreground">{result.raw_stats.total_analyzed}</p>
                <p className="text-[9px] text-muted-foreground">Total Analyzed</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-chart-1" />
                <p className="text-2xl font-bold tabular-nums text-chart-1">{result.health.high_rank_listings}</p>
                <p className="text-[9px] text-muted-foreground">HIGH Rank Potential</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <XCircle className="h-4 w-4 mx-auto mb-1 text-destructive" />
                <p className="text-2xl font-bold tabular-nums text-destructive">{result.health.low_rank_listings}</p>
                <p className="text-[9px] text-muted-foreground">LOW Rank Potential</p>
              </CardContent>
            </Card>
          </div>

          {/* Score Dimensions */}
          {result.raw_stats.score_dimensions && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Score Dimension Averages
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2.5">
                  {Object.entries(result.raw_stats.score_dimensions).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground capitalize">{key.replace('avg_', '').replace('_score', '').replace('_', ' ')}</span>
                        <span className={cn(
                          "text-xs font-semibold",
                          value >= 70 ? "text-chart-1" : value >= 50 ? "text-chart-4" : "text-destructive"
                        )}>{value}/100</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priority Focus */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Flame className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary">Priority Focus</p>
                  <p className="text-xs text-foreground mt-1">{result.health.priority_focus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimension Insights */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-chart-4" />
                Dimension Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{result.health.dimension_insights}</p>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-chart-4" />
                Common SEO Weaknesses
              </CardTitle>
              <CardDescription className="text-[10px]">Most frequent issues found across the platform</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {result.health.common_issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-border/50 bg-muted/30">
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{issue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Locations */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-chart-1" />
                High Opportunity Locations
              </CardTitle>
              <CardDescription className="text-[10px]">Locations with the most SEO improvement potential</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {result.health.seo_opportunity_locations.map((loc, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />{loc}
                  </Badge>
                ))}
              </div>
              {/* Location stats from raw data */}
              {result.raw_stats.locations && Object.keys(result.raw_stats.locations).length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground">Location Score Breakdown</p>
                  {Object.entries(result.raw_stats.locations)
                    .sort(([, a], [, b]) => a.avgScore - b.avgScore)
                    .slice(0, 10)
                    .map(([loc, stats]) => (
                      <div key={loc} className="flex items-center justify-between text-[10px] px-2 py-1 rounded border border-border/30 bg-muted/20">
                        <span className="text-foreground font-medium truncate max-w-[200px]">{loc}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{stats.total} listings</span>
                          <span className={cn(
                            "font-semibold",
                            stats.avgScore >= 70 ? "text-chart-1" : stats.avgScore >= 50 ? "text-chart-4" : "text-destructive"
                          )}>
                            {stats.avgScore} avg
                          </span>
                          {stats.weak > 0 && (
                            <span className="text-destructive">{stats.weak} weak</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Recommended Platform Actions
              </CardTitle>
              <CardDescription className="text-[10px]">Strategic actions to improve overall SEO performance</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {result.health.recommended_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!result && !healthInsights.isPending && !healthInsights.isError && (
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click "Generate Insights" to analyze your platform's SEO health</p>
            <p className="text-xs text-muted-foreground mt-1">This will aggregate all SEO data and generate AI-powered strategic recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoPlatformHealthTab;
