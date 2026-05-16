/**
 * Admin AI Optimization Dashboard
 * Shows live conversion scores, segments, CTAs, and drop-off alerts.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Users, Zap, BarChart3, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';
import { useOptimizationLoop } from '@/hooks/useOptimizationLoop';
import { toast } from 'sonner';

function useSegmentDistribution() {
  return useQuery({
    queryKey: ['segment-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_segment_distribution' as any);
      if (error) throw error;
      return data as { segment_tag: string; user_count: number }[];
    },
    staleTime: 30_000,
  });
}

function useTopVariants() {
  return useQuery({
    queryKey: ['top-variants'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_variants' as any, { limit_count: 10 });
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

function useConversionOverview() {
  return useQuery({
    queryKey: ['conversion-overview'],
    queryFn: async () => {
      const { data: scores } = await supabase
        .from('conversion_scores' as any)
        .select('score, trend, risk_level')
        .gte('last_computed_at', new Date(Date.now() - 86400000).toISOString())
        .limit(500);

      const all = (scores || []) as any[];
      if (all.length === 0) return { avgScore: 0, rising: 0, declining: 0, highRisk: 0, total: 0 };

      return {
        avgScore: Math.round(all.reduce((s, r) => s + r.score, 0) / all.length),
        rising: all.filter(r => r.trend === 'rising').length,
        declining: all.filter(r => r.trend === 'declining').length,
        highRisk: all.filter(r => r.risk_level === 'high').length,
        total: all.length,
      };
    },
    staleTime: 30_000,
  });
}

function useOptimizationHistory() {
  return useQuery({
    queryKey: ['optimization-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('optimization_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return (data || []) as any[];
    },
    staleTime: 30_000,
  });
}

export default function AIOptimizationDashboard() {
  const segments = useSegmentDistribution();
  const topVariants = useTopVariants();
  const overview = useConversionOverview();
  const history = useOptimizationHistory();
  const optimization = useOptimizationLoop();

  const segmentColors: Record<string, string> = {
    high_intent: 'bg-green-500/20 text-green-400',
    hesitant: 'bg-yellow-500/20 text-yellow-400',
    price_sensitive: 'bg-orange-500/20 text-orange-400',
    investor_ready: 'bg-blue-500/20 text-blue-400',
    returning_visitor: 'bg-purple-500/20 text-purple-400',
    first_time: 'bg-muted text-muted-foreground',
    international: 'bg-cyan-500/20 text-cyan-400',
    local: 'bg-muted text-muted-foreground',
    fast_decision: 'bg-emerald-500/20 text-emerald-400',
    browser: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Optimization Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Self-optimizing conversion intelligence
          </p>
        </div>
        <Button
          onClick={() => optimization.mutate()}
          disabled={optimization.isPending}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${optimization.isPending ? 'animate-spin' : ''}`} />
          Run Optimization Cycle
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Conversion Score</p>
                <p className="text-3xl font-bold text-foreground mt-1">{overview.data?.avgScore ?? '—'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/40" />
            </div>
            <Progress value={overview.data?.avgScore || 0} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Users (24h)</p>
                <p className="text-3xl font-bold text-foreground mt-1">{overview.data?.total ?? '—'}</p>
              </div>
              <Users className="h-8 w-8 text-primary/40" />
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                ↑ {overview.data?.rising ?? 0} rising
              </Badge>
              <Badge variant="outline" className="text-xs text-red-400 border-red-500/30">
                ↓ {overview.data?.declining ?? 0} declining
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">High Risk Users</p>
                <p className="text-3xl font-bold text-foreground mt-1">{overview.data?.highRisk ?? '—'}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Users with score &lt;30 needing intervention</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active A/B Tests</p>
                <p className="text-3xl font-bold text-foreground mt-1">{topVariants.data?.length ?? '—'}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {topVariants.data?.filter((v: any) => v.is_winner).length ?? 0} winners promoted
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              User Segment Distribution (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segments.data && segments.data.length > 0 ? (
              <div className="space-y-3">
                {(segments.data as any[]).map((seg: any) => {
                  const total = (segments.data as any[]).reduce((s: number, r: any) => s + Number(r.user_count), 0);
                  const pct = total > 0 ? Math.round((Number(seg.user_count) / total) * 100) : 0;
                  return (
                    <div key={seg.segment_tag} className="flex items-center gap-3">
                      <Badge className={`text-xs min-w-[120px] justify-center ${segmentColors[seg.segment_tag] || 'bg-muted text-muted-foreground'}`}>
                        {seg.segment_tag}
                      </Badge>
                      <div className="flex-1">
                        <Progress value={pct} className="h-2" />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {seg.user_count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No segment data yet. Users will be tagged automatically.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Performing CTAs */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Top Performing Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topVariants.data && topVariants.data.length > 0 ? (
              <div className="space-y-2">
                {(topVariants.data as any[]).slice(0, 6).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{v.variant_text}</p>
                      <p className="text-xs text-muted-foreground">{v.test_name} / {v.variant_key}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{v.impressions} imp</p>
                        <p className="text-sm font-medium text-primary">
                          {(v.conversion_rate * 100).toFixed(1)}% CVR
                        </p>
                      </div>
                      {v.is_winner && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">Winner</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No variant data yet. Create A/B tests to start tracking.</p>
            )}
          </CardContent>
        </Card>

        {/* Optimization History */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Optimization Cycle History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.data && history.data.length > 0 ? (
              <div className="space-y-2">
                {(history.data as any[]).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {log.cycle_type.charAt(0).toUpperCase() + log.cycle_type.slice(1)} Cycle
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">{log.tests_evaluated} tests</span>
                      <span className="text-green-400">+{log.variants_promoted} promoted</span>
                      <span className="text-red-400">-{log.variants_disabled} disabled</span>
                      <Badge
                        variant="outline"
                        className={log.performance_delta >= 0 ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}
                      >
                        {log.performance_delta >= 0 ? '+' : ''}{log.performance_delta}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No optimization cycles run yet. Click "Run Optimization Cycle" to begin.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
