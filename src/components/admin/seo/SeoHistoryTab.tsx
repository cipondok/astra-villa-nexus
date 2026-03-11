import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, History, TrendingUp, Zap, BarChart3, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '@/lib/utils';

function useSeoActionHistory(limit = 100) {
  return useQuery({
    queryKey: ['seo-ai-actions', limit],
    queryFn: async () => {
      const { data, error } = await (supabase.from('seo_ai_actions') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        property_id: string;
        action_type: string;
        old_score: number;
        new_score: number;
        old_title: string | null;
        new_title: string | null;
        threshold_used: number | null;
        ai_model: string | null;
        triggered_by: string;
        metadata: Record<string, unknown> | null;
        created_at: string;
      }>;
    },
    staleTime: 60 * 1000,
  });
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--destructive))', 'hsl(var(--primary))'];

const SeoHistoryTab = () => {
  const { data: actions = [], isLoading } = useSeoActionHistory(200);

  // Compute chart data
  const { dailyData, actionTypeData, scoreImprovementData, summaryStats } = useMemo(() => {
    // Daily aggregation
    const dailyMap: Record<string, { date: string; analyzed: number; optimized: number; applied: number; avgImprovement: number; improvements: number[] }> = {};
    
    actions.forEach(a => {
      if (a.action_type === 'scheduler_run') return;
      const date = new Date(a.created_at).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { date, analyzed: 0, optimized: 0, applied: 0, avgImprovement: 0, improvements: [] };
      }
      if (a.action_type === 'analyze') dailyMap[date].analyzed++;
      if (a.action_type === 'auto_optimize') dailyMap[date].optimized++;
      if (a.action_type === 'apply_seo') dailyMap[date].applied++;
      if (a.new_score > a.old_score) {
        dailyMap[date].improvements.push(a.new_score - a.old_score);
      }
    });

    const dailyData = Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(d => ({
        ...d,
        avgImprovement: d.improvements.length > 0 ? Math.round(d.improvements.reduce((s, v) => s + v, 0) / d.improvements.length) : 0,
      }));

    // Action type breakdown
    const typeCount: Record<string, number> = {};
    actions.forEach(a => {
      if (a.action_type === 'scheduler_run') return;
      typeCount[a.action_type] = (typeCount[a.action_type] || 0) + 1;
    });
    const actionTypeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

    // Score improvement distribution
    const improvements = actions.filter(a => a.action_type !== 'scheduler_run' && a.new_score > a.old_score);
    const buckets = { '1-10': 0, '11-20': 0, '21-30': 0, '31-50': 0, '50+': 0 };
    improvements.forEach(a => {
      const diff = a.new_score - a.old_score;
      if (diff <= 10) buckets['1-10']++;
      else if (diff <= 20) buckets['11-20']++;
      else if (diff <= 30) buckets['21-30']++;
      else if (diff <= 50) buckets['31-50']++;
      else buckets['50+']++;
    });
    const scoreImprovementData = Object.entries(buckets).map(([range, count]) => ({ range, count }));

    // Summary
    const totalActions = actions.filter(a => a.action_type !== 'scheduler_run').length;
    const totalOptimized = actions.filter(a => a.action_type === 'auto_optimize').length;
    const avgImprovement = improvements.length > 0
      ? Math.round(improvements.reduce((s, a) => s + (a.new_score - a.old_score), 0) / improvements.length)
      : 0;
    const schedulerRuns = actions.filter(a => a.action_type === 'scheduler_run').length;

    return {
      dailyData,
      actionTypeData,
      scoreImprovementData,
      summaryStats: { totalActions, totalOptimized, avgImprovement, schedulerRuns, totalImprovements: improvements.length },
    };
  }, [actions]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No SEO actions recorded yet. Run an analysis or optimization to see history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Total Actions', value: summaryStats.totalActions, icon: BarChart3, color: 'text-primary' },
          { label: 'Optimized', value: summaryStats.totalOptimized, icon: Zap, color: 'text-chart-1' },
          { label: 'Improved', value: summaryStats.totalImprovements, icon: TrendingUp, color: 'text-chart-2' },
          { label: 'Avg Improvement', value: `+${summaryStats.avgImprovement}`, icon: TrendingUp, color: 'text-chart-4' },
          { label: 'Scheduler Runs', value: summaryStats.schedulerRuns, icon: Calendar, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-2.5 text-center">
              <s.icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
              <p className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
              <p className="text-[8px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Daily Activity Chart */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Daily SEO Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="analyzed" name="Analyzed" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="optimized" name="Optimized" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="applied" name="Applied" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[10px] text-muted-foreground text-center py-8">No daily data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Score Improvement Trend */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
              Average Score Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="avgImprovement" name="Avg Improvement" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[10px] text-muted-foreground text-center py-8">No improvement data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Action Type Breakdown */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-chart-4" />
              Action Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {actionTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={actionTypeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={{ strokeWidth: 1 }}>
                    {actionTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[10px] text-muted-foreground text-center py-8">No action data</p>
            )}
          </CardContent>
        </Card>

        {/* Score Improvement Distribution */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-chart-2" />
              Score Improvement Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreImprovementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" name="Properties" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions Log */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-primary" />
            Recent AI Actions
          </CardTitle>
          <CardDescription className="text-[10px]">Last 50 AI-powered SEO actions</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {actions.slice(0, 50).map(a => {
              const isScheduler = a.action_type === 'scheduler_run';
              const improvement = a.new_score - a.old_score;
              const typeLabel = a.action_type === 'auto_optimize' ? '⚡ Auto-Optimize' : a.action_type === 'analyze' ? '🔍 Analyze' : a.action_type === 'apply_seo' ? '✅ Apply' : a.action_type === 'scheduler_run' ? '⏰ Scheduler' : a.action_type;
              const time = new Date(a.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

              return (
                <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/20 transition-colors border border-transparent hover:border-border/30">
                  <span className="text-[10px] w-28 shrink-0 text-muted-foreground">{time}</span>
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 shrink-0">{typeLabel}</Badge>
                  {!isScheduler && (
                    <>
                      <span className="text-[10px] text-muted-foreground shrink-0">{a.old_score} →</span>
                      <span className={cn("text-[10px] font-bold shrink-0", improvement > 0 ? "text-chart-1" : improvement < 0 ? "text-destructive" : "text-muted-foreground")}>
                        {a.new_score} {improvement > 0 ? `(+${improvement})` : improvement < 0 ? `(${improvement})` : ''}
                      </span>
                    </>
                  )}
                  <span className="text-[9px] text-muted-foreground truncate flex-1">{a.new_title || (isScheduler ? JSON.stringify(a.metadata || {}).slice(0, 80) : a.property_id.slice(0, 8))}</span>
                  <Badge variant="secondary" className="text-[7px] px-1 py-0 shrink-0">{a.triggered_by}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoHistoryTab;
