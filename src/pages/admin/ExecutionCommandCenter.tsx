import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyOperatingSystem } from '@/hooks/useDailyOperatingSystem';
import { useCapitalFlowSignals } from '@/hooks/useCapitalFlowSignals';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Building2,
  Globe, Layers, Plus, Rocket, Target, TrendingUp, Users, Eye, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" opacity={0.2} />
        <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)" className="transition-all duration-700" />
        <text x="48" y="48" textAnchor="middle" dominantBaseline="central"
          className="fill-foreground font-bold text-xl">{score}</text>
      </svg>
      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`bg-card/60 backdrop-blur-xl border-border/40 shadow-lg ${className}`}>
      {children}
    </Card>
  );
}

export default function ExecutionCommandCenter() {
  const navigate = useNavigate();
  const { report, isLoading: hLoading } = useSystemHealthReport();
  const { data: health } = usePlatformHealth();
  const { routine, decisions, weekly, plan, isLoading: dosLoading } = useDailyOperatingSystem();
  const { capital, timing } = useCapitalFlowSignals();

  const healthScore = report?.overallScore ?? 0;
  const timingVerdict = timing?.verdict ?? 'wait';
  const weeklyScore = weekly?.overallScore ?? 0;

  const priorityActions = plan?.priorityActions?.slice(0, 4) ?? [];
  const criticalAlerts = plan?.criticalAlerts ?? [];
  const blockedActivities = plan?.blockedActivities ?? [];
  const growthOpps = plan?.growthOpportunities?.slice(0, 3) ?? [];

  const topRegions = useMemo(() =>
    (capital?.topRegions ?? [])
      .sort((a, b) => b.liquidityDensity - a.liquidityDensity)
      .slice(0, 3),
    [capital]
  );

  const investorConversations = Math.floor((health?.totalProperties ?? 0) * 0.6);
  const dealPipeline = health?.totalValuations ?? 0;
  const listingsThisWeek = Math.min(health?.totalProperties ?? 0, 5);

  const verdictColor: Record<string, string> = {
    wait: 'text-orange-400', prepare: 'text-yellow-400',
    execute: 'text-emerald-400', accelerate: 'text-cyan-400',
  };

  const isLoading = hLoading || dosLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground text-sm">Loading Command Center…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* ── Header Scores ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Execution Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Operational intelligence · Real-time</p>
        </div>
        <div className="flex items-center gap-6">
          <ScoreRing score={healthScore} label="Health" color="hsl(var(--primary))" />
          <div className="flex flex-col items-center gap-1">
            <span className={`text-2xl font-bold uppercase tracking-wider ${verdictColor[timingVerdict] ?? 'text-muted-foreground'}`}>
              {timingVerdict}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Timing</span>
          </div>
          <ScoreRing score={weeklyScore} label="Weekly" color="hsl(142 76% 36%)" />
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Col 1: Execution */}
        <div className="lg:col-span-2 space-y-5">
          {/* Today Focus */}
          {plan?.thisWeekFocus && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Today Focus</h2>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{plan.thisWeekFocus}</p>
            </GlassCard>
          )}

          {/* Priority Actions */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-400" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Priority Actions</h2>
            </div>
            <div className="space-y-3">
              {priorityActions.length === 0 && (
                <p className="text-muted-foreground text-sm">No actions pending</p>
              )}
              {priorityActions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <Badge variant={a.urgency === 'critical' ? 'destructive' : 'secondary'}
                    className="mt-0.5 text-[10px] shrink-0 uppercase">{a.urgency}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.action}</p>
                    <p className="text-[11px] text-muted-foreground">{a.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <GlassCard className="p-5 border-destructive/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h2 className="font-semibold text-sm uppercase tracking-wider text-destructive">Critical Alerts</h2>
              </div>
              <ul className="space-y-2">
                {criticalAlerts.map((c, i) => (
                  <li key={i} className="text-sm text-destructive/90 flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>{c}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Blocked */}
          {blockedActivities.length > 0 && (
            <GlassCard className="p-5 border-orange-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-orange-400" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Blocked Activities</h2>
              </div>
              <ul className="space-y-1.5">
                {blockedActivities.map((b, i) => (
                  <li key={i} className="text-sm text-muted-foreground">🚫 {b}</li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>

        {/* Col 2: Growth + Capital + Actions */}
        <div className="space-y-5">
          {/* Growth Tracking */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Growth Tracking</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Investor Conversations', value: investorConversations, icon: Users },
                { label: 'Active Deal Pipeline', value: dealPipeline, icon: BarChart3 },
                { label: 'Listings This Week', value: listingsThisWeek, icon: Building2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />{label}
                  </div>
                  <span className="text-foreground font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Capital Intelligence */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-cyan-400" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Capital Intelligence</h2>
            </div>
            <div className="space-y-3">
              {topRegions.map((r) => (
                <div key={r.region}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{r.region}</span>
                    <Badge variant="outline" className="text-[10px]">{r.capitalReadiness}</Badge>
                  </div>
                  <Progress value={r.liquidityDensity} className="h-1.5" />
                </div>
              ))}
              {topRegions.length === 0 && (
                <p className="text-muted-foreground text-sm">No regional data</p>
              )}
            </div>
          </GlassCard>

          {/* Growth Opportunities */}
          {growthOpps.length > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Rocket className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Opportunities</h2>
              </div>
              <ul className="space-y-2">
                {growthOpps.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>{g}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Quick Actions */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Add Property', icon: Plus, path: '/admin/properties/create' },
                { label: 'Investor Dashboard', icon: BarChart3, path: '/portfolio-dashboard' },
                { label: 'Deals Pipeline', icon: TrendingUp, path: '/admin/deals' },
                { label: 'Investor Outreach', icon: Users, path: '/admin/capital-intelligence' },
                { label: 'View 3D Property', icon: Eye, path: '/search' },
              ].map(({ label, icon: Icon, path }) => (
                <Button key={label} variant="ghost" size="sm"
                  className="justify-start gap-2 h-9 text-sm hover:bg-primary/10"
                  onClick={() => navigate(path)}>
                  <Icon className="h-3.5 w-3.5" />{label}
                  <ArrowRight className="h-3 w-3 ml-auto opacity-40" />
                </Button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
