import React, { useState, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { usePortfolioROITracker, useSellSimulation, type PropertyROIAnalytics, type SellSimulation } from '@/hooks/usePortfolioROITracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
  BarChart, Bar, Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase, Shield,
  ChevronDown, ChevronUp, BarChart3, PieChartIcon, Target,
  Calculator, ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle,
  Home, MapPin, Activity, Zap,
} from 'lucide-react';

const PIE_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(210, 70%, 55%)',
];

const RISK_COLORS: Record<string, string> = {
  conservative: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  moderate: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  aggressive: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  speculative: 'bg-red-500/15 text-red-600 border-red-500/30',
};

const TREND_ICONS: Record<string, React.ReactNode> = {
  rising: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />,
  stable: <Activity className="h-3.5 w-3.5 text-blue-500" />,
  declining: <TrendingDown className="h-3.5 w-3.5 text-red-500" />,
};

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

// ── KPI Card ──
function KPICard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/50 bg-card/80 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">{icon}<span className="text-xs font-medium">{label}</span></div>
          <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Sell Simulation Dialog ──
function SellSimDialog({ property }: { property: PropertyROIAnalytics }) {
  const [sellPrice, setSellPrice] = useState(String(property.current_value));
  const sim = useSellSimulation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1"><Calculator className="h-3 w-3" /> Simulate Sell</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="text-base">Sell Scenario — {property.title}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sell Price (IDR)</label>
            <Input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <Button className="w-full" onClick={() => sim.mutate({ property_id: property.id, sell_price: Number(sellPrice) })} disabled={sim.isPending}>
            {sim.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
            Calculate Net Profit
          </Button>
          {sim.data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 rounded-lg border border-border/50 p-4 bg-accent/20">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Gross Profit</span><span className={sim.data.gross_profit >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{formatIDR(sim.data.gross_profit)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">PPh Tax (2.5%)</span><span>-{formatIDR(sim.data.tax_pph)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Notary Fee</span><span>-{formatIDR(sim.data.notary_fee)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Agent Commission</span><span>-{formatIDR(sim.data.agent_commission)}</span></div>
              <hr className="border-border/50" />
              <div className="flex justify-between text-sm font-semibold"><span>Net Profit</span><span className={sim.data.net_profit >= 0 ? 'text-emerald-600' : 'text-red-500'}>{formatIDR(sim.data.net_profit)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Net ROI</span><span className="font-medium">{sim.data.net_roi_pct}%</span></div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Property Panel ──
function PropertyPanel({ prop, index }: { prop: PropertyROIAnalytics; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="border-border/50 bg-card/80 overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardContent className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {prop.thumbnail_url ? (
                    <img src={prop.thumbnail_url} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Home className="h-5 w-5 text-primary" /></div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{prop.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />{prop.city || 'N/A'} • {prop.property_type}
                      {prop.is_owned && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Owned</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">{formatShort(prop.current_value)}</p>
                    <p className={`text-xs font-medium flex items-center gap-0.5 justify-end ${prop.capital_gain_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {prop.capital_gain_pct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {prop.capital_gain_pct >= 0 ? '+' : ''}{prop.capital_gain_pct}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">{TREND_ICONS[prop.opportunity_trend]}</div>
                  <Badge className={`text-[10px] border ${RISK_COLORS[prop.risk_class]}`}>{prop.risk_class}</Badge>
                  {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 border-t border-border/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Purchase Price</p>
                  <p className="text-sm font-semibold text-foreground">{formatShort(prop.purchase_price)}</p>
                </div>
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Capital Gain</p>
                  <p className={`text-sm font-semibold ${prop.capital_gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatIDR(prop.capital_gain)}</p>
                </div>
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Rental Yield</p>
                  <p className="text-sm font-semibold text-foreground">{prop.rental_yield_pct}%</p>
                </div>
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">5Y ROI</p>
                  <p className="text-sm font-semibold text-primary">{prop.roi_5y_pct}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Monthly Rent Est.</p>
                  <p className="text-sm font-semibold text-foreground">{formatShort(prop.monthly_rent_estimate)}</p>
                </div>
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Appreciation</p>
                  <p className="text-sm font-semibold text-foreground">{prop.appreciation_forecast}%/yr</p>
                </div>
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Opportunity Score</p>
                  <p className="text-sm font-semibold text-foreground">{prop.opportunity_score}/100</p>
                </div>
                <div className="rounded-lg bg-accent/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Risk Score</p>
                  <p className="text-sm font-semibold text-foreground">{prop.risk_score}/100</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <SellSimDialog property={prop} />
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}

// ── Main Page ──
export default function PortfolioROITrackerPage() {
  const { data, isLoading, error } = usePortfolioROITracker();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  const ov = data?.overview;
  const props = data?.properties || [];
  const alloc = data?.allocations;
  const timeline = data?.growth_timeline || [];

  if (!ov || props.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-1">No Properties in Portfolio</h2>
        <p className="text-sm text-muted-foreground">Add properties to your watchlist to start tracking ROI and performance analytics.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Portfolio ROI Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Professional investment performance analytics</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard icon={<DollarSign className="h-4 w-4" />} label="Portfolio Value" value={formatShort(ov.total_portfolio_value)} sub={`${ov.total_properties} properties`} accent />
        <KPICard icon={<Briefcase className="h-4 w-4" />} label="Invested Capital" value={formatShort(ov.total_invested_capital)} sub={`${ov.owned_properties} owned`} />
        <KPICard icon={ov.unrealized_gain_loss >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />} label="Unrealized G/L" value={`${ov.unrealized_pct >= 0 ? '+' : ''}${ov.unrealized_pct}%`} sub={formatIDR(ov.unrealized_gain_loss)} />
        <KPICard icon={<Target className="h-4 w-4" />} label="Projected Annual ROI" value={`${ov.projected_annual_roi}%`} sub={`Avg yield: ${ov.avg_rental_yield}%`} />
        <KPICard icon={<Shield className="h-4 w-4" />} label="Avg 5Y ROI" value={`${ov.avg_5y_roi}%`} sub={`Mkt avg: ${ov.market_avg_growth}%`} />
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="growth" className="text-xs gap-1"><Activity className="h-3 w-3" /> Growth</TabsTrigger>
          <TabsTrigger value="city" className="text-xs gap-1"><MapPin className="h-3 w-3" /> City</TabsTrigger>
          <TabsTrigger value="type" className="text-xs gap-1"><PieChartIcon className="h-3 w-3" /> Type</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs gap-1"><Shield className="h-3 w-3" /> Risk</TabsTrigger>
        </TabsList>

        {/* Growth Timeline */}
        <TabsContent value="growth">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Portfolio Growth vs Market Benchmark (24M)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timeline} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `M${v}`} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => formatShort(v)} width={50} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: number, name: string) => [formatIDR(v), name === 'portfolio_value' ? 'Your Portfolio' : 'Market Avg']}
                    labelFormatter={(v) => `Month ${v}`}
                  />
                  <Line type="monotone" dataKey="portfolio_value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="market_benchmark" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                  <Legend formatter={(v) => v === 'portfolio_value' ? 'Your Portfolio' : 'Market Benchmark'} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* City Allocation */}
        <TabsContent value="city">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Allocation by City</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={alloc?.by_city || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" stroke="hsl(var(--background))" strokeWidth={2}>
                    {(alloc?.by_city || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend formatter={(v) => v} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Type Allocation */}
        <TabsContent value="type">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Allocation by Property Type</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={alloc?.by_type || []} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => formatShort(v)} />
                  <RechartsTooltip formatter={(v: number) => formatIDR(v)} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(alloc?.by_type || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Distribution */}
        <TabsContent value="risk">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Exposure Distribution</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={alloc?.risk_distribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" nameKey="name" stroke="hsl(var(--background))" strokeWidth={2}>
                    {(alloc?.risk_distribution || []).map((entry, i) => {
                      const colorMap: Record<string, string> = { conservative: 'hsl(142, 71%, 45%)', moderate: 'hsl(217, 71%, 53%)', aggressive: 'hsl(38, 92%, 50%)', speculative: 'hsl(0, 84%, 60%)' };
                      return <Cell key={i} fill={colorMap[entry.name] || PIE_COLORS[i]} />;
                    })}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => `${v} properties`} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ROI Comparison vs Market */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> ROI Performance vs Market Average</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={props.slice(0, 10).map(p => ({ name: p.title?.substring(0, 15) || 'N/A', yours: p.roi_5y_pct, market: ov.market_avg_growth * 5 }))} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
              <RechartsTooltip formatter={(v: number) => `${v}%`} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
              <Bar dataKey="yours" name="Your ROI" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="market" name="Market Avg" fill="hsl(var(--muted-foreground) / 0.4)" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Opportunity Upgrade Signals */}
      {(() => {
        const signals = props
          .filter(p => p.opportunity_score >= 70 || p.opportunity_trend === 'rising')
          .sort((a, b) => b.opportunity_score - a.opportunity_score)
          .slice(0, 5);

        if (signals.length === 0) return null;

        return (
          <Card className="border-border/50 bg-card/80 overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-chart-2 via-primary to-chart-4" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-2" /> Opportunity Upgrade Signals
                <Badge variant="secondary" className="text-[9px] ml-1">{signals.length} active</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Properties showing improved scores or rising market momentum</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {signals.map((s, i) => {
                const isElite = s.opportunity_score >= 85;
                const isRising = s.opportunity_trend === 'rising';
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                      isElite
                        ? 'border-chart-2/30 bg-chart-2/[0.04]'
                        : 'border-border/50 bg-accent/10 hover:bg-accent/20',
                    )}
                  >
                    {s.thumbnail_url ? (
                      <img src={s.thumbnail_url} alt="" className="h-9 w-9 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Home className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-foreground truncate">{s.title}</p>
                        {isElite && (
                          <Badge className="text-[7px] px-1 py-0 h-3.5 bg-chart-2/15 text-chart-2 border border-chart-2/30">
                            ELITE
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {s.city} · Score {s.opportunity_score}/100
                        {isRising && ' · Trend ↑ Rising'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">{s.opportunity_score}</p>
                        <p className="text-[9px] text-muted-foreground">score</p>
                      </div>
                      {isRising && <ArrowUpRight className="h-4 w-4 text-chart-2" />}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        );
      })()}

      {/* Property Panels */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" /> Property-Level Analytics
        </h2>
        <div className="space-y-2">
          {props.map((p, i) => <PropertyPanel key={p.id} prop={p} index={i} />)}
        </div>
      </div>
    </div>
  );
}
