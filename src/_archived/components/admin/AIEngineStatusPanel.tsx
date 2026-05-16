import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Zap, Target, TrendingUp, Flame, Brain, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, Clock, PlayCircle,
  Loader2, Activity, Terminal, BarChart3
} from 'lucide-react';

interface EngineData {
  name: string;
  workerName: string;
  jobType: string;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
  description: string;
}

const ENGINES: EngineData[] = [
  {
    name: 'Opportunity Scoring',
    workerName: 'opportunity-scorer',
    jobType: 'investment_analysis',
    icon: Target,
    color: 'text-chart-2',
    bgGlow: 'from-chart-2/10 to-chart-2/5',
    description: 'Scores properties for investment attractiveness (0–100)',
  },
  {
    name: 'Deal Hunter',
    workerName: 'deal-hunter',
    jobType: 'deal_hunter_scan',
    icon: Zap,
    color: 'text-chart-3',
    bgGlow: 'from-chart-3/10 to-chart-3/5',
    description: 'Scans for undervalued deals and alert generation',
  },
  {
    name: 'Price Prediction',
    workerName: 'price-predictor',
    jobType: 'price_prediction',
    icon: TrendingUp,
    color: 'text-chart-1',
    bgGlow: 'from-chart-1/10 to-chart-1/5',
    description: 'Recalculates fair market values and forecasts',
  },
  {
    name: 'Market Heat Clustering',
    workerName: 'market-heat',
    jobType: 'market_heat',
    icon: Flame,
    color: 'text-destructive',
    bgGlow: 'from-destructive/10 to-destructive/5',
    description: 'Clusters geographic zones by investment heat',
  },
];

function useEngineStatus() {
  return useQuery({
    queryKey: ['ai-engine-status'],
    queryFn: async () => {
      const [workerRunsRes, activeJobsRes, recentJobsRes, propertiesCountRes] = await Promise.allSettled([
        supabase
          .from('intelligence_worker_runs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(50),
        supabase
          .from('ai_jobs')
          .select('*')
          .in('status', ['running', 'pending'])
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('ai_jobs')
          .select('job_type, status, progress, completed_at, started_at, created_at, result_summary')
          .in('status', ['completed', 'failed'])
          .order('completed_at', { ascending: false })
          .limit(100),
        supabase
          .from('properties')
          .select('opportunity_score, ai_estimated_price, market_heat_score', { count: 'exact' })
          .not('opportunity_score', 'is', null)
          .limit(1),
      ]);

      const workerRuns = workerRunsRes.status === 'fulfilled' ? workerRunsRes.value.data || [] : [];
      const activeJobs = activeJobsRes.status === 'fulfilled' ? activeJobsRes.value.data || [] : [];
      const recentJobs = recentJobsRes.status === 'fulfilled' ? recentJobsRes.value.data || [] : [];
      const scoredCount = propertiesCountRes.status === 'fulfilled' ? propertiesCountRes.value.count || 0 : 0;

      // Build engine status for each engine
      const engineStats = ENGINES.map(engine => {
        // Latest worker run
        const runs = workerRuns.filter((r: any) =>
          r.worker_name?.toLowerCase().includes(engine.workerName) ||
          r.worker_name?.toLowerCase().includes(engine.jobType.replace('_', '-'))
        );
        const lastRun = runs[0];

        // Active jobs
        const active = activeJobs.filter((j: any) =>
          j.job_type === engine.jobType ||
          j.job_type?.includes(engine.workerName.replace('-', '_'))
        );

        // Recent completed/failed
        const recent = recentJobs.filter((j: any) =>
          j.job_type === engine.jobType ||
          j.job_type?.includes(engine.workerName.replace('-', '_'))
        );
        const completedRecent = recent.filter((j: any) => j.status === 'completed');
        const failedRecent = recent.filter((j: any) => j.status === 'failed');

        // Determine status
        let status: 'operational' | 'running' | 'warning' | 'error' | 'idle' = 'idle';
        if (active.length > 0) status = 'running';
        else if (failedRecent.length > 0 && failedRecent.length > completedRecent.length) status = 'error';
        else if (completedRecent.length > 0) status = 'operational';
        else if (lastRun?.status === 'error') status = 'warning';

        // Calculate throughput (jobs completed in last 24h)
        const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
        const throughput24h = completedRecent.filter((j: any) =>
          j.completed_at && j.completed_at >= oneDayAgo
        ).length;

        // Avg duration
        const withDuration = completedRecent.filter((j: any) => j.started_at && j.completed_at);
        const avgDuration = withDuration.length > 0
          ? Math.round(withDuration.reduce((sum: number, j: any) =>
              sum + (new Date(j.completed_at).getTime() - new Date(j.started_at).getTime()), 0
            ) / withDuration.length / 1000)
          : 0;

        return {
          ...engine,
          status,
          lastRun,
          activeCount: active.length,
          completedCount: completedRecent.length,
          failedCount: failedRecent.length,
          throughput24h,
          avgDurationSec: avgDuration,
          currentProgress: active[0]?.progress || 0,
          rowsAffected: lastRun?.rows_affected || 0,
        };
      });

      return { engineStats, scoredCount };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Terminal-style Engine Card ──
function EngineCard({ engine, onTrigger, triggering }: {
  engine: ReturnType<typeof useEngineStatus>['data'] extends { engineStats: (infer T)[] } ? T : never;
  onTrigger: () => void;
  triggering: boolean;
}) {
  const Icon = engine.icon;

  const statusConfig = {
    operational: { label: 'OPERATIONAL', color: 'text-chart-1', bg: 'bg-chart-1', dot: 'bg-chart-1' },
    running: { label: 'RUNNING', color: 'text-chart-2', bg: 'bg-chart-2', dot: 'bg-chart-2 animate-pulse' },
    warning: { label: 'WARNING', color: 'text-chart-3', bg: 'bg-chart-3', dot: 'bg-chart-3' },
    error: { label: 'ERROR', color: 'text-destructive', bg: 'bg-destructive', dot: 'bg-destructive animate-pulse' },
    idle: { label: 'IDLE', color: 'text-muted-foreground', bg: 'bg-muted-foreground', dot: 'bg-muted-foreground' },
  };
  const cfg = statusConfig[engine.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={cn(
        'border-border/40 overflow-hidden transition-all hover:border-border/60',
        engine.status === 'running' && 'border-chart-2/30 shadow-md shadow-chart-2/5',
        engine.status === 'error' && 'border-destructive/30 shadow-md shadow-destructive/5',
      )}>
        <CardContent className="p-0">
          {/* Terminal header bar */}
          <div className={cn('px-4 py-2 flex items-center justify-between bg-gradient-to-r', engine.bgGlow)}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive/60" />
                <div className="w-2 h-2 rounded-full bg-chart-3/60" />
                <div className="w-2 h-2 rounded-full bg-chart-1/60" />
              </div>
              <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                {engine.workerName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
              <span className={cn('text-[9px] font-mono font-bold uppercase tracking-wider', cfg.color)}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg bg-muted/30')}>
                <Icon className={cn('h-5 w-5', engine.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">{engine.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{engine.description}</p>
              </div>
            </div>

            {/* Progress bar if running */}
            {engine.status === 'running' && engine.currentProgress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground">PROGRESS</span>
                  <span className="text-[10px] font-mono font-bold text-foreground">{engine.currentProgress}%</span>
                </div>
                <Progress value={engine.currentProgress} className="h-1.5" />
              </div>
            )}

            {/* Terminal-style metrics */}
            <div className="bg-muted/20 rounded-lg p-3 font-mono text-[10px] space-y-1.5 border border-border/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">throughput_24h</span>
                <span className="font-bold text-foreground">{engine.throughput24h} jobs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">avg_duration</span>
                <span className="font-bold text-foreground">{engine.avgDurationSec}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">completed</span>
                <span className="font-bold text-chart-1">{engine.completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">failed</span>
                <span className={cn('font-bold', engine.failedCount > 0 ? 'text-destructive' : 'text-foreground')}>
                  {engine.failedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">rows_affected</span>
                <span className="font-bold text-foreground">{engine.rowsAffected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">last_run</span>
                <span className="font-bold text-foreground">
                  {engine.lastRun?.started_at
                    ? formatDistanceToNow(new Date(engine.lastRun.started_at), { addSuffix: true })
                    : 'never'}
                </span>
              </div>
            </div>

            {/* Action */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-[10px] h-8 font-mono uppercase tracking-wider border-border/40 hover:border-primary/40 hover:bg-primary/5"
              onClick={onTrigger}
              disabled={triggering || engine.status === 'running'}
            >
              {triggering ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : engine.status === 'running' ? (
                <Activity className="h-3 w-3 animate-pulse" />
              ) : (
                <PlayCircle className="h-3 w-3" />
              )}
              {triggering ? 'Queuing...' : engine.status === 'running' ? 'In Progress' : 'Trigger Run'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Panel ──
const AIEngineStatusPanel = () => {
  const { data, isLoading, refetch } = useEngineStatus();
  const [triggeringMap, setTriggeringMap] = useState<Record<string, boolean>>({});

  const handleTrigger = async (engine: EngineData) => {
    setTriggeringMap(p => ({ ...p, [engine.jobType]: true }));
    try {
      const { error } = await supabase.from('ai_jobs').insert({
        job_type: engine.jobType,
        status: 'pending',
        payload: { triggered_by: 'admin', source: 'engine_status_panel' },
      });
      if (error) throw error;
      toast.success(`${engine.name} job queued successfully`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to trigger ${engine.name}: ${err.message}`);
    } finally {
      setTriggeringMap(p => ({ ...p, [engine.jobType]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-72 rounded-xl bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  const engines = data?.engineStats || [];
  const operational = engines.filter(e => e.status === 'operational' || e.status === 'running').length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">AI Engine Status</h3>
            <p className="text-[10px] text-muted-foreground">
              {operational}/{engines.length} engines operational · {data?.scoredCount || 0} properties scored
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-8">
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
      </div>

      {/* Status indicators strip */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        {engines.map(e => {
          const cfg = {
            operational: { icon: CheckCircle2, color: 'text-chart-1 bg-chart-1/10 border-chart-1/20' },
            running: { icon: Activity, color: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
            warning: { icon: AlertTriangle, color: 'text-chart-3 bg-chart-3/10 border-chart-3/20' },
            error: { icon: XCircle, color: 'text-destructive bg-destructive/10 border-destructive/20' },
            idle: { icon: Clock, color: 'text-muted-foreground bg-muted/30 border-border/30' },
          }[e.status];
          const StatusIcon = cfg.icon;
          return (
            <Badge key={e.jobType} variant="outline" className={cn('text-[9px] gap-1 shrink-0 border', cfg.color)}>
              <StatusIcon className="h-2.5 w-2.5" /> {e.name}
            </Badge>
          );
        })}
      </div>

      {/* Engine cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engines.map((engine) => (
          <EngineCard
            key={engine.jobType}
            engine={engine}
            onTrigger={() => handleTrigger(engine)}
            triggering={!!triggeringMap[engine.jobType]}
          />
        ))}
      </div>
    </div>
  );
};

export default AIEngineStatusPanel;
