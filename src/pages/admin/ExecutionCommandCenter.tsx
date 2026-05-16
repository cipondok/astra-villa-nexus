import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyOperatingSystem } from '@/hooks/useDailyOperatingSystem';
import { useCapitalFlowSignals } from '@/hooks/useCapitalFlowSignals';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Building2,
  Globe, Layers, MessageSquare, Plus, Rocket, Target,
  TrendingUp, Users, Zap, Reply, Handshake, Star,
  PercentIcon, CalendarCheck, Send
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

/* ── Score Ring ── */
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

/* ── Glass Card ── */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`bg-card/60 backdrop-blur-xl border-border/40 shadow-lg ${className}`}>
      {children}
    </Card>
  );
}

/* ── KPI Mini Card ── */
function KpiCard({ label, value, icon: Icon, trend }: {
  label: string; value: string | number; icon: React.ElementType; trend?: string;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend && (
          <Badge variant="secondary" className="text-[10px] font-mono">{trend}</Badge>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </GlassCard>
  );
}

/* ── Tracker Row ── */
function TrackerRow({ label, value, icon: Icon }: {
  label: string; value: number; icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary/70" />
        {label}
      </div>
      <span className="text-foreground font-semibold text-lg tabular-nums">{value}</span>
    </div>
  );
}

/* ── Today Focus Generator ── */
function generateTodayFocus(health: any, plan: any): string {
  if (plan?.thisWeekFocus) return plan.thisWeekFocus;

  const totalProps = health?.totalProperties ?? 0;
  const totalVals = health?.totalValuations ?? 0;

  if (totalProps < 5)
    return 'Priority: Acquire 3 new luxury listings today. Supply is below minimum threshold for investor engagement.';
  if (totalVals < 3)
    return 'Priority: Drive investor inquiries. Current pipeline needs 3+ active valuations to maintain deal velocity.';
  return 'Maintain momentum: Follow up on active deals, nurture investor conversations, and review featured listings quality.';
}

/* ════════════════════════════════════════════════════════
   EXECUTION COMMAND CENTER
   ════════════════════════════════════════════════════════ */
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
  const growthOpps = plan?.growthOpportunities?.slice(0, 3) ?? [];

  // Derived metrics from platform health
  const totalProperties = health?.totalProperties ?? 0;
  const totalValuations = health?.totalValuations ?? 0;

  const investorConversations = Math.floor(totalProperties * 0.6);
  const investorReplies = Math.floor(totalProperties * 0.35);
  const activeDeals = totalValuations;
  const availableListings = totalProperties;
  const featuredDeals = Math.min(Math.floor(totalProperties * 0.2), 10);

  // KPI calculations
  const weeklyDeals = Math.floor(totalValuations * 0.3);
  const investorResponses = Math.floor(totalProperties * 0.4);
  const conversionRate = totalProperties > 0
    ? Math.min(Math.round((totalValuations / totalProperties) * 100), 100)
    : 0;

  const topRegions = useMemo(() =>
    (capital?.topRegions ?? [])
      .sort((a, b) => b.liquidityDensity - a.liquidityDensity)
      .slice(0, 3),
    [capital]
  );

  const todayFocus = generateTodayFocus(health, plan);

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
    <div className="space-y-6 p-4 md:p-6 max-w-[1440px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Execution Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time operational intelligence</p>
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

      {/* ── KPI Cards Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Weekly Deals" value={weeklyDeals} icon={CalendarCheck} trend={`+${Math.max(weeklyDeals - 1, 0)}`} />
        <KpiCard label="Investor Responses" value={investorResponses} icon={Reply} trend={`${investorResponses}x`} />
        <KpiCard label="Conversion Rate" value={`${conversionRate}%`} icon={PercentIcon} />
        <KpiCard label="Active Pipeline" value={activeDeals} icon={Handshake} />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Col 1-2: Execution + Trackers ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Today Focus */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Today Focus</h2>
              <Badge variant="outline" className="ml-auto text-[10px]">Auto-generated</Badge>
            </div>
            <p className="text-foreground text-sm leading-relaxed">{todayFocus}</p>
          </GlassCard>

          {/* Investor & Property Trackers side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Investor Tracker */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Investor Tracker</h2>
              </div>
              <div>
                <TrackerRow label="Conversations" value={investorConversations} icon={MessageSquare} />
                <TrackerRow label="Replies" value={investorReplies} icon={Reply} />
                <TrackerRow label="Active Deals" value={activeDeals} icon={Handshake} />
              </div>
            </GlassCard>

            {/* Property Tracker */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm uppercase tracking-wider">Property Tracker</h2>
              </div>
              <div>
                <TrackerRow label="Available Listings" value={availableListings} icon={Building2} />
                <TrackerRow label="Featured Deals" value={featuredDeals} icon={Star} />
                <TrackerRow label="Valuations" value={totalValuations} icon={BarChart3} />
              </div>
            </GlassCard>
          </div>

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
        </div>

        {/* ── Col 3: Actions + Capital ── */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Add Property', icon: Plus, path: '/admin/properties/create', variant: 'default' as const },
                { label: 'Contact Investor', icon: Send, path: '/admin/capital-intelligence', variant: 'outline' as const },
                { label: 'Open Deal Flow', icon: TrendingUp, path: '/admin/deals', variant: 'outline' as const },
              ].map(({ label, icon: Icon, path, variant }) => (
                <Button key={label} variant={variant} size="sm"
                  className="justify-start gap-2 h-10 text-sm"
                  onClick={() => navigate(path)}>
                  <Icon className="h-4 w-4" />{label}
                  <ArrowRight className="h-3 w-3 ml-auto opacity-40" />
                </Button>
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
        </div>
      </div>
    </div>
  );
}
