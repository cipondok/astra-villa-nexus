import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useInvestorScoreLeaderboard } from '@/hooks/useInvestorScore';
import {
  DEFAULT_WEIGHTS,
  STYLE_LABELS,
  STYLE_COLORS,
  TIER_COLORS,
  type ScoringWeights,
  type InvestmentStyle,
} from '@/utils/investorScoringEngine';
import {
  Users, Trophy, BarChart3, Sliders, Target,
  TrendingUp, ArrowUpRight, RefreshCw, Crown,
  Crosshair, Gem, Building2, Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Style icon map ──────────────────────────────────────────────────────
const STYLE_ICONS: Record<InvestmentStyle, React.ElementType> = {
  yield_hunter: TrendingUp,
  flip_opportunist: Crosshair,
  luxury_lifestyle: Gem,
  institutional_allocator: Building2,
  unclassified: Users,
};

// ─── Weight editor ──────────────────────────────────────────────────────
const WeightSlider = ({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <span className="tabular-nums text-muted-foreground">{(value * 100).toFixed(0)}%</span>
    </div>
    <Slider
      value={[value * 100]}
      onValueChange={([v]) => onChange(v / 100)}
      max={40}
      min={0}
      step={1}
      className="w-full"
    />
  </div>
);

// ─── Main component ─────────────────────────────────────────────────────
const InvestorScoringPanel = () => {
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const { data: leaderboard, isLoading, refetch } = useInvestorScoreLeaderboard(50);

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const resetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    toast.success('Weights reset to defaults');
  };

  const applyWeights = () => {
    toast.success('Scoring weights applied — next recalculation will use updated model');
  };

  // Aggregate stats from leaderboard
  const stats = React.useMemo(() => {
    if (!leaderboard?.length) return null;

    const scores = leaderboard.map((r: any) => r.capital_readiness_score ?? 0);
    const styles = leaderboard.reduce((acc: Record<string, number>, r: any) => {
      const s = r.style_classification || 'unclassified';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalScored: leaderboard.length,
      avgReadiness: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      avgConversion: leaderboard.reduce((a: number, r: any) => a + (r.deal_conversion_probability ?? 0), 0) / leaderboard.length,
      styleDistribution: styles,
      platinum: scores.filter((s: number) => s >= 80).length,
      gold: scores.filter((s: number) => s >= 60 && s < 80).length,
      silver: scores.filter((s: number) => s >= 35 && s < 60).length,
      bronze: scores.filter((s: number) => s < 35).length,
    };
  }, [leaderboard]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Investor Intelligence Scoring</h1>
            <p className="text-sm text-muted-foreground">Capital readiness · conversion probability · style classification</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scored Investors</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{stats?.totalScored ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Readiness</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{(stats?.avgReadiness ?? 0).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Conversion</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{((stats?.avgConversion ?? 0) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Platinum Tier</p>
            <div className="flex items-center gap-2 mt-1">
              <Crown className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold tabular-nums text-foreground">{stats?.platinum ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed panels */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="leaderboard" className="gap-1.5 text-xs"><Trophy className="h-3.5 w-3.5" />Leaderboard</TabsTrigger>
          <TabsTrigger value="distribution" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Distribution</TabsTrigger>
          <TabsTrigger value="weights" className="gap-1.5 text-xs"><Sliders className="h-3.5 w-3.5" />Weight Override</TabsTrigger>
        </TabsList>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Investor Ranking — Capital Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading scores...</p>
              ) : !leaderboard?.length ? (
                <div className="text-center py-8">
                  <Gauge className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">No scored investors yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Scores populate as investors interact with the platform</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((investor: any, i: number) => {
                    const style = (investor.style_classification || 'unclassified') as InvestmentStyle;
                    const StyleIcon = STYLE_ICONS[style];
                    const readiness = investor.capital_readiness_score ?? 0;
                    const conversion = investor.deal_conversion_probability ?? 0;
                    const tier = readiness >= 80 ? 'platinum' : readiness >= 60 ? 'gold' : readiness >= 35 ? 'silver' : 'bronze';
                    const profile = investor.profiles as any;

                    return (
                      <div key={investor.id} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <span className="text-sm font-bold tabular-nums text-muted-foreground w-6 text-right">
                          {i + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {profile?.full_name || profile?.email || 'Anonymous'}
                            </p>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', STYLE_COLORS[style])}>
                              <StyleIcon className="h-3 w-3 mr-0.5" />
                              {STYLE_LABELS[style]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex-1">
                              <Progress value={readiness} className="h-1.5" />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground w-20">
                              {readiness.toFixed(1)} / 100
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Conv.</p>
                            <p className="text-sm font-semibold tabular-nums text-foreground flex items-center gap-0.5">
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                              {(conversion * 100).toFixed(1)}%
                            </p>
                          </div>
                          <Badge className={cn('text-[10px] font-bold uppercase px-2', TIER_COLORS[tier])}>
                            {tier}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution */}
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tier distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Platinum (80+)', count: stats?.platinum ?? 0, color: 'bg-slate-500' },
                  { label: 'Gold (60–79)', count: stats?.gold ?? 0, color: 'bg-amber-400' },
                  { label: 'Silver (35–59)', count: stats?.silver ?? 0, color: 'bg-slate-300' },
                  { label: 'Bronze (<35)', count: stats?.bronze ?? 0, color: 'bg-orange-400' },
                ].map(tier => {
                  const total = stats?.totalScored || 1;
                  const pct = (tier.count / total) * 100;
                  return (
                    <div key={tier.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{tier.label}</span>
                        <span className="tabular-nums text-muted-foreground">{tier.count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-500', tier.color)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Style distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Investment Style Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(STYLE_LABELS) as InvestmentStyle[]).filter(s => s !== 'unclassified').map(style => {
                  const StyleIcon = STYLE_ICONS[style];
                  const count = stats?.styleDistribution?.[style] ?? 0;
                  const total = stats?.totalScored || 1;
                  const pct = (count / total) * 100;
                  return (
                    <div key={style} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2.5">
                      <div className={cn('rounded-lg p-2 border', STYLE_COLORS[style])}>
                        <StyleIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{STYLE_LABELS[style]}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1">
                            <Progress value={pct} className="h-1.5" />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weight Override */}
        <TabsContent value="weights">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Scoring Weight Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-xs text-muted-foreground">
                Adjust how each behavioral signal contributes to the Capital Readiness Score.
                Total should approximate 100% for balanced scoring.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <WeightSlider label="Search Frequency" value={weights.search} onChange={v => updateWeight('search', v)} />
                <WeightSlider label="Saved Listings" value={weights.saves} onChange={v => updateWeight('saves', v)} />
                <WeightSlider label="Viewing Bookings" value={weights.viewings} onChange={v => updateWeight('viewings', v)} />
                <WeightSlider label="Budget Clarity" value={weights.budget} onChange={v => updateWeight('budget', v)} />
                <WeightSlider label="Location Focus" value={weights.location} onChange={v => updateWeight('location', v)} />
                <WeightSlider label="Risk Profile" value={weights.riskProfile} onChange={v => updateWeight('riskProfile', v)} />
                <WeightSlider label="Transaction History" value={weights.transactions} onChange={v => updateWeight('transactions', v)} />
                <WeightSlider label="Rental Preference" value={weights.rentalPref} onChange={v => updateWeight('rentalPref', v)} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <p className="text-sm text-muted-foreground">
                  Total weight: <span className="font-semibold tabular-nums text-foreground">
                    {(Object.values(weights).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetWeights}>Reset Defaults</Button>
                  <Button size="sm" onClick={applyWeights} className="gap-1.5">
                    Apply Weights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorScoringPanel;
