import React from 'react';
import { useDecisionSignals } from '@/hooks/useDecisionSignals';
import { useDealMomentumAnalytics } from '@/hooks/useDealMomentumAnalytics';
import { useSystemHealthReport } from '@/hooks/useSystemHealthMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Brain, Shield, TrendingUp, Zap, Target, AlertTriangle,
  Loader2, CheckCircle, ArrowUpRight, Activity, DollarSign,
  Gauge, Timer, Users, Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const VERDICT_STYLES = {
  accelerate: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: '🚀 Accelerate', desc: 'All systems clear for aggressive growth' },
  proceed: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: '▶ Proceed', desc: 'Balanced execution recommended' },
  caution: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: '⚠ Caution', desc: 'Monitor stability before expanding' },
  freeze: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: '🛑 Freeze', desc: 'Halt new features — stabilize first' },
} as const;

const SIGNAL_ICON = {
  intent: Users,
  urgency: Timer,
  negotiation: Brain,
  follow_up: ArrowUpRight,
  closing: CheckCircle,
} as const;

const StrategicIntelligenceDashboard: React.FC = () => {
  const { decisions, isLoading: dLoad } = useDecisionSignals();
  const { momentum, signals: dealSignals, isLoading: mLoad } = useDealMomentumAnalytics();
  const { report, isLoading: hLoad } = useSystemHealthReport();

  const loading = dLoad || mLoad || hLoad;

  if (loading || !decisions || !momentum || !report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Brain className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Analyzing strategic signals…</p>
        </div>
      </div>
    );
  }

  const verdict = VERDICT_STYLES[decisions.overallVerdict];
  const balanceLabel = decisions.performanceVsGrowthBalance > 0.3 ? 'Growth Focus'
    : decisions.performanceVsGrowthBalance < -0.3 ? 'Stability Focus' : 'Balanced';
  const balancePct = Math.round((decisions.performanceVsGrowthBalance + 1) * 50);

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Strategic Intelligence Hub
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Decision Engine · Deal Acceleration · Brand Positioning
          </p>
        </div>
        <Badge className={cn('text-xs px-3 py-1.5 font-semibold', verdict.bg, verdict.border, verdict.color)}>
          {verdict.label}
        </Badge>
      </div>

      {/* Verdict Banner */}
      <div className={cn('p-4 rounded-lg border', verdict.bg, verdict.border)}>
        <div className="flex items-center gap-3">
          <Shield className={cn('h-5 w-5', verdict.color)} />
          <div>
            <div className={cn('text-sm font-bold', verdict.color)}>{verdict.label}</div>
            <div className="text-xs text-muted-foreground">{verdict.desc}</div>
          </div>
        </div>
      </div>

      {/* Feature Freeze Alert */}
      {decisions.featureFreezeRecommended && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Feature Freeze Active</AlertTitle>
          <AlertDescription className="text-xs">
            Platform health below threshold — all new development should halt until stability is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {[
          { label: 'Active Deals', value: String(momentum.totalActiveDeals), icon: Activity, color: momentum.totalActiveDeals > 0 ? 'text-emerald-400' : 'text-muted-foreground' },
          { label: 'Conversion', value: `${momentum.conversionRate}%`, icon: Target, color: momentum.conversionRate >= 15 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Avg Close', value: `${momentum.avgDaysToClose}d`, icon: Timer, color: momentum.avgDaysToClose <= 30 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Buyer Intent', value: String(momentum.buyerIntentScore), icon: Users, color: momentum.buyerIntentScore >= 50 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Urgency', value: String(momentum.urgencyIndex), icon: Zap, color: momentum.urgencyIndex >= 50 ? 'text-emerald-400' : 'text-muted-foreground' },
          { label: 'Balance', value: balanceLabel, icon: Gauge, color: 'text-primary', sub: `${balancePct}% growth` },
        ].map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <k.icon className={cn('h-3 w-3', k.color)} />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
              </div>
              <div className={cn('text-sm font-bold', k.color)}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance vs Growth Balance Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-blue-400" /> Stability</span>
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5 text-emerald-400" /> Growth</span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${balancePct}%` }} />
            <div className="absolute inset-y-0 rounded-full border-2 border-foreground/50 w-1" style={{ left: `${balancePct}%`, transform: 'translateX(-50%)' }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1.5 text-center">{balanceLabel} — Health: {report.overallScore}/100</div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Decision Signals */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Decision Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {decisions.signals.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0',
                    s.type === 'positive' ? 'bg-emerald-400' : s.type === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                  )} />
                  <span className="text-muted-foreground">{s.signal}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant={decisions.investorReadiness ? 'default' : 'outline'} className="text-[10px]">
                {decisions.investorReadiness ? '✓' : '✗'} Investor Ready
              </Badge>
              <Badge variant={decisions.growthAccelerationSafe ? 'default' : 'outline'} className="text-[10px]">
                {decisions.growthAccelerationSafe ? '✓' : '✗'} Growth Safe
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Deal Acceleration Signals */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Deal Flow Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {dealSignals.map((s, i) => {
                const SIcon = SIGNAL_ICON[s.type] || Activity;
                return (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <SIcon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0',
                      s.priority === 'high' ? 'text-primary' : s.priority === 'medium' ? 'text-amber-400' : 'text-muted-foreground'
                    )} />
                    <div>
                      <span className="text-muted-foreground">{s.message}</span>
                      <Badge variant="outline" className="text-[9px] ml-1.5">{s.priority}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {decisions.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" /> {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Deal Acceleration Recommendations */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Deal Acceleration Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {momentum.accelerationRecommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" /> {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Brand Positioning Framework */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Brand Technology Positioning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { angle: 'Immersive-First Architecture', narrative: 'Three.js digital twins create a viewing experience no competitor can replicate at this fidelity.', audience: 'Investors & Developers' },
              { angle: 'AI-Accelerated Execution', narrative: 'AI-assisted development delivers features 10x faster with automated quality governance.', audience: 'Strategic Partners' },
              { angle: 'Performance-First Design', narrative: `Health index ${report.overallScore}/100 with real-time monitoring ensures institutional-grade reliability.`, audience: 'Institutional Investors' },
              { angle: 'Modular Global Architecture', narrative: 'Domain-isolated services enable rapid regional expansion without system-wide risk.', audience: 'Global Expansion Partners' },
              { angle: 'Transaction Intelligence', narrative: `${momentum.conversionRate}% conversion rate powered by AI deal scoring and negotiation assistance.`, audience: 'Luxury Developers' },
              { angle: 'Data Intelligence Moat', narrative: 'Every transaction deepens market intelligence — creating compounding competitive advantage.', audience: 'Long-term Investors' },
            ].map(p => (
              <div key={p.angle} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="text-xs font-semibold text-foreground mb-1">{p.angle}</div>
                <div className="text-[11px] text-muted-foreground mb-2">{p.narrative}</div>
                <Badge variant="outline" className="text-[9px]">{p.audience}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategicIntelligenceDashboard;
