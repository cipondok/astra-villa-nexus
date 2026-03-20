import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase, TrendingUp, TrendingDown, DollarSign, Shield,
  Target, Zap, ArrowUpRight, ArrowDownRight, BarChart3,
  Flame, AlertTriangle, Sparkles, Activity, MapPin, Eye,
  Brain, Clock, LineChart as LineChartIcon, RefreshCw, ExternalLink,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioManager, type PortfolioData, type PortfolioProperty } from '@/hooks/usePortfolioManager';
import { useDealFinder, type DealFinderResult } from '@/hooks/useDealFinder';

// ── Formatters ──
const fmtIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const fmtShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

const PIE_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
];

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.5, delay: d, ease: [0.16, 1, 0.3, 1] },
});

// ── Risk classification ──
function classifyRisk(prop: PortfolioProperty): { level: 'Low' | 'Medium' | 'High'; score: number } {
  const s = Math.round(
    (prop.risk_factor || 0) * 0.4 +
    (100 - (prop.demand_heat_score || 50)) * 0.3 +
    (100 - (prop.investment_score || 50)) * 0.3
  );
  return { level: s <= 35 ? 'Low' : s <= 60 ? 'Medium' : 'High', score: s };
}

// ── Strategy classification ──
function deriveStrategy(props: PortfolioProperty[]) {
  if (!props.length) return [];
  const strategies: { label: string; description: string; urgency: 'high' | 'medium' | 'low' }[] = [];

  const highRisk = props.filter(p => classifyRisk(p).level === 'High');
  if (highRisk.length > 0) {
    strategies.push({ label: 'Rebalance high-risk holdings', description: `${highRisk.length} asset(s) with elevated risk exposure — consider partial exit or hedge`, urgency: 'high' });
  }

  const cities = [...new Set(props.map(p => p.city))];
  if (cities.length <= 1 && props.length >= 2) {
    strategies.push({ label: 'Geographic diversification needed', description: 'Portfolio concentrated in a single city — explore expansion markets', urgency: 'medium' });
  }

  const lowYield = props.filter(p => p.rental_yield < 4);
  if (lowYield.length > 0) {
    strategies.push({ label: 'Optimize rental yield', description: `${lowYield.length} asset(s) yielding below 4% — evaluate renovation or repositioning`, urgency: 'medium' });
  }

  const highPerformers = props.filter(p => p.roi_5y > 40);
  if (highPerformers.length > 0) {
    strategies.push({ label: 'Lock-in gains on outperformers', description: `${highPerformers.length} asset(s) with 40%+ projected ROI — consider exit timing`, urgency: 'low' });
  }

  if (strategies.length === 0) {
    strategies.push({ label: 'Portfolio is well-balanced', description: 'Continue monitoring — no immediate action required', urgency: 'low' });
  }

  return strategies;
}

// ── Live clock ──
function LiveClock() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <span className="font-mono text-xs text-muted-foreground tabular-nums">
      {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// ── Stat card ──
function StatCard({ label, value, sub, icon: Icon, trend }: { label: string; value: string; sub?: string; icon: React.ElementType; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
          {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-destructive" />}
        </div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold mt-0.5 tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Main Terminal ──
const InvestorIntelligenceTerminal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioManager();
  const { data: dealData, isLoading: dealsLoading } = useDealFinder({ limit: 8 });

  const p = portfolio as PortfolioData | undefined;
  const props = p?.properties || [];
  const deals = dealData?.deals || [];

  // Computed
  const totalValue = p?.portfolio_value || 0;
  const projected5Y = p?.projected_value_5y || 0;
  const unrealizedGain = projected5Y - totalValue;
  const unrealizedPct = totalValue > 0 ? (unrealizedGain / totalValue) * 100 : 0;
  const avgYield = props.length ? props.reduce((s, x) => s + x.rental_yield, 0) / props.length : 0;
  const avgScore = props.length ? Math.round(props.reduce((s, x) => s + x.investment_score, 0) / props.length) : 0;

  const cityAllocation = useMemo(() => {
    const m: Record<string, number> = {};
    props.forEach(x => { m[x.city || 'Unknown'] = (m[x.city || 'Unknown'] || 0) + x.price; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [props]);

  const riskDist = useMemo(() => {
    const d = { Low: 0, Medium: 0, High: 0 };
    props.forEach(x => { d[classifyRisk(x).level]++; });
    return Object.entries(d).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [props]);

  const strategies = useMemo(() => deriveStrategy(props), [props]);

  // Simulated market data for charts
  const marketTrend = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      liquidity: 52 + Math.round(Math.sin(i * 0.5) * 12 + i * 2.3),
      absorption: 3.2 + Math.round((Math.cos(i * 0.4) * 1.5 + i * 0.18) * 10) / 10,
      demand: 60 + Math.round(Math.sin(i * 0.7 + 1) * 15 + i * 1.8),
    })),
  []);

  const isLoading = portfolioLoading || dealsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header bar ── */}
      <motion.div {...fade(0)} className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md px-4 md:px-8 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Investor Intelligence Terminal</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live · <LiveClock />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden md:flex gap-1 text-xs">
              <Sparkles className="w-3 h-3" /> Premium Terminal
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/portfolio-command-center')}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* ── KPI Strip ── */}
        <motion.div {...fade(0.05)} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Portfolio Value" value={fmtShort(totalValue)} icon={Briefcase} sub={`${props.length} assets`} />
          <StatCard label="Unrealized Gain" value={`${unrealizedPct >= 0 ? '+' : ''}${unrealizedPct.toFixed(1)}%`} icon={TrendingUp} trend={unrealizedPct >= 0 ? 'up' : 'down'} sub={fmtShort(Math.abs(unrealizedGain))} />
          <StatCard label="Avg Rental Yield" value={`${avgYield.toFixed(1)}%`} icon={DollarSign} trend={avgYield >= 5 ? 'up' : 'neutral'} />
          <StatCard label="Investment Score" value={`${avgScore}/100`} icon={Target} trend={avgScore >= 70 ? 'up' : 'neutral'} />
          <StatCard label="Hot Deals Found" value={`${deals.filter(d => d.deal_rating === 'hot_deal').length}`} icon={Flame} sub={`of ${deals.length} scanned`} />
        </motion.div>

        <Tabs defaultValue="portfolio" className="space-y-4">
          <motion.div {...fade(0.1)}>
            <TabsList className="grid grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
              <TabsTrigger value="deals" className="text-xs">Deal Feed</TabsTrigger>
              <TabsTrigger value="market" className="text-xs">Market Intel</TabsTrigger>
              <TabsTrigger value="strategy" className="text-xs">Strategy</TabsTrigger>
            </TabsList>
          </motion.div>

          {/* ══════════════ PORTFOLIO ══════════════ */}
          <TabsContent value="portfolio">
            <motion.div {...fade(0.12)} className="grid md:grid-cols-3 gap-6">
              {/* Allocation pie */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Capital Allocation by City</CardTitle></CardHeader>
                <CardContent>
                  {cityAllocation.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={cityAllocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="hsl(var(--background))">
                          {cityAllocation.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmtShort(v)} contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No portfolio data</div>
                  )}
                  <div className="space-y-1 mt-2">
                    {cityAllocation.slice(0, 4).map((c, i) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span>{c.name}</span>
                        </div>
                        <span className="font-medium">{fmtShort(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk radar */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Distribution</CardTitle></CardHeader>
                <CardContent>
                  {riskDist.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={riskDist}>
                          <PolarGrid className="stroke-border" />
                          <PolarAngleAxis dataKey="name" className="text-xs" />
                          <PolarRadiusAxis tick={false} />
                          <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        {riskDist.map(r => (
                          <Badge key={r.name} variant="secondary" className="text-xs">
                            {r.name}: {r.value}
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No holdings</div>
                  )}
                </CardContent>
              </Card>

              {/* Asset table */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Top Holdings</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {props.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      <p>No assets tracked yet</p>
                      <Button variant="link" size="sm" className="mt-2" onClick={() => navigate('/properties')}>Browse Properties</Button>
                    </div>
                  ) : (
                    props.slice(0, 5).map(prop => {
                      const risk = classifyRisk(prop);
                      return (
                        <div key={prop.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => navigate(`/property/${prop.id}`)}>
                          <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
                            {prop.thumbnail_url ? <img src={prop.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Briefcase className="w-4 h-4 text-muted-foreground" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{prop.title}</p>
                            <p className="text-[10px] text-muted-foreground">{prop.city} · {fmtShort(prop.price)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">{prop.investment_score}</p>
                            <Badge variant="secondary" className={cn('text-[9px]', risk.level === 'Low' ? 'text-emerald-600' : risk.level === 'High' ? 'text-destructive' : '')}>{risk.level}</Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════ DEAL FEED ══════════════ */}
          <TabsContent value="deals">
            <motion.div {...fade(0.12)} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{deals.length} AI-ranked opportunities</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/deal-finder')} className="text-xs gap-1">
                  <ExternalLink className="w-3 h-3" /> Full Deal Finder
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {deals.slice(0, 6).map((deal, i) => {
                  const ratingStyle = deal.deal_rating === 'hot_deal'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : deal.deal_rating === 'good_deal'
                    ? 'border-emerald-500/20'
                    : '';
                  return (
                    <motion.div key={deal.property_id} {...fade(0.1 + i * 0.04)}>
                      <Card className={cn('cursor-pointer hover:shadow-md transition-shadow', ratingStyle)} onClick={() => navigate(`/property/${deal.property_id}`)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                              {deal.thumbnail_url ? <img src={deal.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Target className="w-5 h-5 text-muted-foreground" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold truncate">{deal.title}</p>
                                {deal.deal_rating === 'hot_deal' && <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{deal.city} · {deal.property_type}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className="font-semibold">{fmtShort(deal.price)}</span>
                                <Badge variant="secondary" className="text-[10px]">Score {deal.deal_score}</Badge>
                                <span className="text-emerald-600">Yield {deal.rental_yield_percent.toFixed(1)}%</span>
                                {deal.undervalue_percent > 5 && (
                                  <span className="text-primary font-medium">-{deal.undervalue_percent.toFixed(0)}% under</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              {deals.length === 0 && !dealsLoading && (
                <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No deals found — adjust filters or check back later</CardContent></Card>
              )}
            </motion.div>
          </TabsContent>

          {/* ══════════════ MARKET INTELLIGENCE ══════════════ */}
          <TabsContent value="market">
            <motion.div {...fade(0.12)} className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><LineChartIcon className="w-4 h-4" /> Liquidity & Demand Index (12M)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={marketTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Legend />
                      <Area type="monotone" dataKey="liquidity" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" name="Liquidity Index" />
                      <Area type="monotone" dataKey="demand" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.12)" name="Demand Score" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Absorption Rate by Month</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={marketTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="absorption" fill="hsl(var(--chart-2))" name="Absorption %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Market signals */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Market Signal Indicators</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Jakarta Liquidity', value: 78, trend: 'up' as const, desc: 'Strong buyer momentum' },
                      { label: 'Bali Rental Demand', value: 92, trend: 'up' as const, desc: 'Peak tourist season' },
                      { label: 'Surabaya Absorption', value: 54, trend: 'neutral' as const, desc: 'Steady market pace' },
                      { label: 'Bandung Growth Rate', value: 45, trend: 'down' as const, desc: 'Cooling after Q3 spike' },
                    ].map((sig, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">{sig.label}</p>
                          {sig.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : sig.trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5 text-destructive" /> : <Activity className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                        <Progress value={sig.value} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground">{sig.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════ STRATEGY ══════════════ */}
          <TabsContent value="strategy">
            <motion.div {...fade(0.12)} className="grid md:grid-cols-2 gap-6">
              {/* Recommendations */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4" /> AI Strategy Recommendations</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {strategies.map((s, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border-l-2" style={{ borderLeftColor: s.urgency === 'high' ? 'hsl(var(--destructive))' : s.urgency === 'medium' ? 'hsl(var(--chart-4))' : 'hsl(var(--chart-2))' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{s.label}</p>
                        <Badge variant={s.urgency === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">{s.urgency}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Intelligence Tools</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Portfolio Command Center', path: '/portfolio-command-center', icon: Briefcase, desc: 'Full portfolio analytics & ROI tracking' },
                    { label: 'Deal Hunter Bot', path: '/deal-hunter-bot', icon: Target, desc: 'Autonomous below-market scanning' },
                    { label: 'Investment Simulator', path: '/wealth-simulator', icon: BarChart3, desc: 'Multi-year scenario modeling' },
                    { label: 'Market Heat Explorer', path: '/location-intelligence', icon: MapPin, desc: 'Spatial demand heatmaps' },
                    { label: 'Price Prediction Engine', path: '/price-prediction', icon: Brain, desc: 'AI fair market value forecasting' },
                    { label: 'Rental Yield Optimizer', path: '/rental-yield-optimizer', icon: DollarSign, desc: 'Maximize rental income potential' },
                  ].map((tool, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/40 cursor-pointer transition-colors active:scale-[0.98]"
                      onClick={() => navigate(tool.path)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <tool.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{tool.label}</p>
                        <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Rollout roadmap */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Premium Feature Rollout</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { phase: 'Phase 1', label: 'Portfolio + Deals', status: 'Live', pct: 100 },
                      { phase: 'Phase 2', label: 'Market Signals + Alerts', status: 'Beta', pct: 75 },
                      { phase: 'Phase 3', label: 'Strategy Automation', status: 'Building', pct: 35 },
                      { phase: 'Phase 4', label: 'Institutional API', status: 'Planned', pct: 10 },
                    ].map((p, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <Badge variant="outline" className="text-[10px]">{p.phase}</Badge>
                        <p className="text-sm font-medium">{p.label}</p>
                        <Progress value={p.pct} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground">{p.status} · {p.pct}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvestorIntelligenceTerminal;
