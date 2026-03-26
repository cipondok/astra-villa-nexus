import React from 'react';
import { useInvestorAcquisitionSignals } from '@/hooks/useInvestorAcquisitionSignals';
import { useMarketDominanceStrategy } from '@/hooks/useMarketDominanceStrategy';
import { useGrowthTrajectory } from '@/hooks/useGrowthTrajectory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Globe, Users, Target, TrendingUp, Zap, MapPin,
  Loader2, ArrowUpRight, Activity, Crown, Rocket, Timer, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_COLORS = {
  cold: 'text-muted-foreground bg-muted/20 border-muted/30',
  warm: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  hot: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  qualified: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
} as const;

const LEVEL_COLORS = {
  emerging: 'text-muted-foreground',
  contender: 'text-amber-400',
  leader: 'text-blue-400',
  dominant: 'text-emerald-400',
} as const;

const HEALTH_BADGE = {
  strong: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: '● Strong' },
  moderate: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: '● Moderate' },
  weak: { color: 'text-red-400 bg-red-500/10 border-red-500/30', label: '● Weak' },
} as const;

const GlobalGrowthEngineDashboard: React.FC = () => {
  const { signals, isLoading: aLoad } = useInvestorAcquisitionSignals();
  const { strategy, isLoading: mLoad } = useMarketDominanceStrategy();
  const { trajectory, isLoading: gLoad } = useGrowthTrajectory();

  if (aLoad || mLoad || gLoad || !signals || !strategy || !trajectory) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Globe className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Computing global growth intelligence…</p>
        </div>
      </div>
    );
  }

  const { funnel } = signals;
  const funnelStyle = HEALTH_BADGE[funnel.funnelHealth];

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Global Growth Engine
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Investor Acquisition · Market Dominance · Ecosystem Strategy
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={cn('text-xs px-2.5 py-1', funnelStyle.color)}>{funnelStyle.label} Funnel</Badge>
          <Badge variant="outline" className="text-xs">{strategy.currentPhase}</Badge>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { label: 'Total Leads', value: String(funnel.totalLeads), icon: Users, color: 'text-blue-400' },
          { label: 'Hot Leads', value: String(funnel.hotLeads), icon: Zap, color: funnel.hotLeads > 0 ? 'text-orange-400' : 'text-muted-foreground' },
          { label: 'Qualified', value: String(funnel.qualifiedLeads), icon: Target, color: funnel.qualifiedLeads > 0 ? 'text-emerald-400' : 'text-muted-foreground' },
          { label: 'Conversion', value: `${funnel.conversionRate}%`, icon: TrendingUp, color: funnel.conversionRate >= 5 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Dominance', value: `${strategy.overallDominance}%`, icon: Crown, color: strategy.overallDominance >= 40 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Growth Score', value: String(trajectory.score), icon: Rocket, color: trajectory.score >= 40 ? 'text-emerald-400' : 'text-amber-400' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Investor Acquisition Funnel */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Investor Acquisition Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { stage: 'Awareness', count: funnel.totalLeads, pct: 100 },
              { stage: 'Warm Interest', count: funnel.warmLeads, pct: funnel.totalLeads > 0 ? (funnel.warmLeads / funnel.totalLeads) * 100 : 0 },
              { stage: 'Hot Engagement', count: funnel.hotLeads, pct: funnel.totalLeads > 0 ? (funnel.hotLeads / funnel.totalLeads) * 100 : 0 },
              { stage: 'Qualified', count: funnel.qualifiedLeads, pct: funnel.totalLeads > 0 ? (funnel.qualifiedLeads / funnel.totalLeads) * 100 : 0 },
            ].map(s => (
              <div key={s.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.stage}</span>
                  <span className="font-medium text-foreground">{s.count} ({Math.round(s.pct)}%)</span>
                </div>
                <Progress value={s.pct} className="h-2" />
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" /> Avg time to qualify: <span className="font-medium text-foreground">{funnel.avgTimeToQualifyDays}d</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Lead Opportunities */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Top Lead Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {signals.topOpportunities.map((lead, i) => (
              <div key={i} className={cn('p-2.5 rounded-lg border', TIER_COLORS[lead.tier])}>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[9px] capitalize">{lead.tier}</Badge>
                  <span className="text-xs font-bold">{lead.score}/100</span>
                </div>
                <div className="text-[11px] text-muted-foreground mb-1">
                  {lead.intentSignals.join(' · ')}
                </div>
                <div className="text-[10px] font-medium text-foreground flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-primary" /> {lead.recommendedAction}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Dominance Map */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Market Dominance Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {strategy.markets.map(m => (
              <div key={m.city} className="flex items-center gap-3 text-xs">
                <MapPin className={cn('h-3.5 w-3.5 shrink-0', LEVEL_COLORS[m.level])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-foreground">{m.city}, {m.country}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] capitalize">{m.level}</Badge>
                      <span className={cn('font-bold', LEVEL_COLORS[m.level])}>{m.dominanceScore}</span>
                    </div>
                  </div>
                  <Progress value={m.dominanceScore} className="h-1.5" />
                  <div className="flex gap-3 mt-0.5 text-[10px] text-muted-foreground">
                    <span>Supply: {m.supplyScore}</span>
                    <span>Demand: {m.demandScore}</span>
                    <span>Gap: {Math.round(m.competitiveGap)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expansion Sequence */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              Expansion Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strategy.expansionSequence.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                    i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground'
                  )}>{i + 1}</div>
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Sequences */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Automated Engagement Sequences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signals.engagementSequences.map((seq, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20 text-xs">
                  <div className="font-medium text-foreground mb-0.5">Trigger: {seq.trigger}</div>
                  <div className="text-muted-foreground">→ {seq.action}</div>
                  <Badge variant="outline" className="text-[9px] mt-1">{seq.timing}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ecosystem Evolution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Ecosystem Evolution Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                { stage: 'Stage 1: Marketplace', desc: 'Property discovery + investor matching', score: trajectory.score >= 20 ? 100 : trajectory.score * 5 },
                { stage: 'Stage 2: Intelligence Platform', desc: 'Data products + API partner layer', score: trajectory.score >= 40 ? 100 : Math.max((trajectory.score - 20) * 5, 0) },
                { stage: 'Stage 3: Financial Infrastructure', desc: 'Fractional ownership + institutional tooling', score: trajectory.score >= 60 ? 100 : Math.max((trajectory.score - 40) * 5, 0) },
                { stage: 'Stage 4: Ecosystem OS', desc: 'Multi-region platform + digital asset layer', score: trajectory.score >= 80 ? 100 : Math.max((trajectory.score - 60) * 5, 0) },
              ].map(s => (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <div>
                      <span className="font-medium text-foreground">{s.stage}</span>
                      <span className="text-muted-foreground ml-1.5">— {s.desc}</span>
                    </div>
                    <span className={cn('font-bold', s.score >= 100 ? 'text-emerald-400' : 'text-muted-foreground')}>{Math.round(s.score)}%</span>
                  </div>
                  <Progress value={s.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> Acquisition</div>
              <ul className="space-y-1.5">
                {funnel.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Crown className="h-3 w-3" /> Dominance</div>
              <ul className="space-y-1.5">
                {strategy.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Rocket className="h-3 w-3" /> Growth</div>
              <ul className="space-y-1.5">
                {trajectory.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ArrowUpRight className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalGrowthEngineDashboard;
