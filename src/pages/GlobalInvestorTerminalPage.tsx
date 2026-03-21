import { motion } from 'framer-motion';
import {
  RefreshCw, TrendingUp, MapPin, Zap, Target, BarChart3,
  ArrowRight, CheckCircle2, Flag, Clock, Shield, Layers,
  Crown, Gem, Activity, Eye, Package, Rocket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobalInvestorTerminal } from '@/hooks/useGlobalInvestorTerminal';
import { cn } from '@/lib/utils';

const HEAT_STYLE: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/25',
  hot: 'bg-chart-4/15 text-chart-4 border-chart-4/25',
  warm: 'bg-chart-1/15 text-chart-1 border-chart-1/25',
  cool: 'bg-muted text-muted-foreground border-muted',
};

const TIMING_STYLE: Record<string, { label: string; color: string }> = {
  buy_now: { label: 'BUY NOW', color: 'bg-chart-2/20 text-chart-2' },
  watch: { label: 'WATCH', color: 'bg-chart-4/20 text-chart-4' },
  wait: { label: 'WAIT', color: 'bg-muted text-muted-foreground' },
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-primary/20 text-primary',
  institutional: 'bg-chart-4/20 text-chart-4',
};

const PRIORITY_COLORS: Record<string, string> = {
  p0: 'bg-destructive/20 text-destructive',
  p1: 'bg-chart-4/20 text-chart-4',
  p2: 'bg-muted text-muted-foreground',
};

const PHASE_STYLE: Record<string, string> = {
  live: 'border-chart-2/30 bg-chart-2/5',
  building: 'border-primary/30 bg-primary/5',
  planned: 'border-chart-4/20',
  vision: 'border-muted',
};

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function GlobalInvestorTerminalPage() {
  const { data, isLoading, refetch } = useGlobalInvestorTerminal();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Global Investor Liquidity Terminal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time liquidity intelligence, opportunity discovery & portfolio optimization for global property investors</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.terminalStats.map((s, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <TrendingUp className={cn('w-3.5 h-3.5', s.trend === 'up' ? 'text-chart-2' : 'text-muted-foreground')} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="liquidity" className="space-y-5">
          <TabsList className="bg-muted/50 flex-wrap h-auto">
            <TabsTrigger value="liquidity">Liquidity Analytics</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunity Engine</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Tools</TabsTrigger>
            <TabsTrigger value="cities">City Comparisons</TabsTrigger>
            <TabsTrigger value="features">Feature Priority</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
            <TabsTrigger value="roadmap">Product Roadmap</TabsTrigger>
          </TabsList>

          {/* ═══ LIQUIDITY ANALYTICS ═══ */}
          <TabsContent value="liquidity">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  District-Level Demand Heatmap — Real-Time Liquidity Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.liquidityMetrics.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className={cn('p-3 rounded-lg border', HEAT_STYLE[m.heatTier])}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{m.district}</p>
                        <p className="text-[10px] text-muted-foreground">{m.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-[10px]', HEAT_STYLE[m.heatTier])}>{m.heatTier.toUpperCase()}</Badge>
                        <span className="text-lg font-bold text-foreground">{m.demandScore}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { l: 'Days on Market', v: `${m.avgDaysOnMarket}d` },
                        { l: 'Absorption', v: `${m.absorptionRate}%` },
                        { l: 'Price Trend', v: `+${m.priceTrend}%` },
                        { l: 'Listings', v: m.listings.toString() },
                        { l: 'Inquiries', v: m.inquiries.toString() },
                      ].map((s, si) => (
                        <div key={si} className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-foreground">{s.v}</p>
                          <p className="text-[9px] text-muted-foreground">{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ OPPORTUNITY ENGINE ═══ */}
          <TabsContent value="opportunities">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  AI-Curated High-Liquidity Deal Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.opportunities.map((o, i) => {
                  const ts = TIMING_STYLE[o.timingSignal];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="p-3.5 rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{o.title}</p>
                          <p className="text-[10px] text-muted-foreground">{o.city}</p>
                        </div>
                        <Badge className={cn('text-[10px] font-bold', ts.color)}>{ts.label}</Badge>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        <div className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-foreground">{fmt(o.price)}</p>
                          <p className="text-[9px] text-muted-foreground">Ask Price</p>
                        </div>
                        <div className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-chart-2">{fmt(o.aiValuation)}</p>
                          <p className="text-[9px] text-muted-foreground">AI Valuation</p>
                        </div>
                        <div className="text-center p-1.5 rounded bg-chart-2/10">
                          <p className="text-xs font-bold text-chart-2">+{o.undervaluationPct}%</p>
                          <p className="text-[9px] text-muted-foreground">Undervalued</p>
                        </div>
                        <div className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-foreground">{o.liquidityScore}</p>
                          <p className="text-[9px] text-muted-foreground">Liquidity</p>
                        </div>
                        <div className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-primary">{o.yieldEstimate.toFixed(1)}%</p>
                          <p className="text-[9px] text-muted-foreground">Est. Yield</p>
                        </div>
                        <div className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-foreground">{o.urgency}%</p>
                          <p className="text-[9px] text-muted-foreground">Urgency</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PORTFOLIO TOOLS ═══ */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Portfolio Optimization Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.portfolioInsights.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-3.5 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-foreground">{p.metric}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-[10px]',
                          p.status === 'above' ? 'bg-chart-2/20 text-chart-2' :
                          p.status === 'at' ? 'bg-chart-4/20 text-chart-4' : 'bg-destructive/20 text-destructive'
                        )}>{p.status === 'above' ? 'Above' : p.status === 'at' ? 'At' : 'Below'} benchmark</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <span className="text-xl font-bold text-foreground">{p.value}</span>
                        <span className="text-xs text-muted-foreground ml-1">{p.unit}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Benchmark: {p.benchmark} {p.unit}</div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-primary/5">
                      <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                      <span className="text-xs text-foreground">{p.recommendation}</span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CITY COMPARISONS ═══ */}
          <TabsContent value="cities">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  Global City Investment Comparison — APAC Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.cityComparisons.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          i < 3 ? 'bg-chart-2/20 text-chart-2' : 'bg-muted text-muted-foreground')}>
                          {c.compositeRank}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{c.city}</p>
                          <p className="text-[10px] text-muted-foreground">{c.country}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { l: 'Avg Yield', v: `${c.avgYield}%` },
                        { l: 'Price Growth', v: `+${c.priceGrowth}%` },
                        { l: 'Liquidity', v: c.liquidityIndex.toString() },
                        { l: 'Risk', v: c.riskScore.toString() },
                        { l: 'Dev Pipeline', v: c.developmentPipeline.toString() },
                      ].map((s, si) => (
                        <div key={si} className="text-center p-1.5 rounded bg-background/50">
                          <p className="text-xs font-bold text-foreground">{s.v}</p>
                          <p className="text-[9px] text-muted-foreground">{s.l}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ FEATURE PRIORITY ═══ */}
          <TabsContent value="features">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Product Feature Prioritization Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.featurePrioritization.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{f.feature}</span>
                        <Badge className={cn('text-[10px]', PRIORITY_COLORS[f.priority])}>{f.priority.toUpperCase()}</Badge>
                        <Badge className={cn('text-[10px]', TIER_COLORS[f.tier])}>{f.tier}</Badge>
                        <Badge variant="outline" className="text-[10px]">{f.module}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                    <Badge className={cn('text-[10px] shrink-0',
                      f.impact === 'high' ? 'bg-chart-2/20 text-chart-2' :
                      f.impact === 'medium' ? 'bg-chart-4/20 text-chart-4' : 'bg-muted text-muted-foreground'
                    )}>{f.impact}</Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ MONETIZATION ═══ */}
          <TabsContent value="monetization">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.monetizationTiers.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className={cn('border h-full', i === 1 ? 'border-primary/30 bg-primary/5' : 'border-border/50')}>
                    <CardContent className="py-5 px-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.targetUsers}</p>
                        </div>
                        <p className="text-xl font-bold text-primary">{t.price}</p>
                      </div>
                      <div className="space-y-1.5">
                        {t.features.map((f, fi) => (
                          <div key={fi} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-chart-2 shrink-0" />
                            <span className="text-xs text-foreground">{f}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Projected Users</span>
                          <span className="text-xs font-bold text-foreground">{t.projectedUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">ARR Contribution</span>
                          <span className="text-xs font-bold text-primary">{t.arrContribution}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ═══ PRODUCT ROADMAP ═══ */}
          <TabsContent value="roadmap" className="space-y-4">
            {data.productRoadmap.map((p, pi) => (
              <motion.div key={pi} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
                <Card className={cn('border', PHASE_STYLE[p.status])}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          p.status === 'live' ? 'bg-chart-2/20 text-chart-2' :
                          p.status === 'building' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                          {pi + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{p.phase}</p>
                          <p className="text-xs text-muted-foreground">{p.timeline} · Revenue: {p.revenue}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {p.features.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-2 p-2 rounded bg-muted/20">
                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                          <span className="text-xs text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
