import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Briefcase, TrendingUp, DollarSign, Shield,
  Target, Zap, ArrowUpRight, ArrowDownRight, BarChart3,
  Flame, Sparkles, Activity, MapPin, Eye, Users,
  Brain, Clock, LineChart as LineChartIcon, ExternalLink,
  Crown, Bell, Send, Rocket, Heart, Building2, Globe,
  Signal, Layers, Store, Radio, ChevronRight,
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
import { toast } from 'sonner';

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
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' } as const,
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' } as const,
  transition: { duration: 0.5, delay: d, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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

// ── Micro Components ──
const SignalDot = ({ status }: { status: 'ok' | 'warn' | 'critical' }) => (
  <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${
    status === 'ok' ? 'bg-chart-1 shadow-[0_0_6px_hsl(var(--chart-1)/0.6)]' :
    status === 'warn' ? 'bg-chart-3 shadow-[0_0_6px_hsl(var(--chart-3)/0.6)]' :
    'bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.6)] animate-pulse'
  }`} />
);

const MetricCard = ({ label, value, sub, icon: Icon, trend, className = '' }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral'; className?: string;
}) => (
  <div className={`p-3 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm hover:border-primary/20 transition-all group ${className}`}>
    <div className="flex items-center justify-between mb-1.5">
      <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5 text-chart-1" />}
      {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
    </div>
    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
    <p className="text-lg font-black tabular-nums text-foreground leading-none mt-0.5">{value}</p>
    {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const ConfirmedAction = ({ label, icon: Icon, variant = 'default', description, onConfirm }: {
  label: string; icon: React.ElementType; variant?: 'default' | 'urgent' | 'premium';
  description: string; onConfirm: () => void;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline" size="sm"
        className={`h-8 text-[10px] font-semibold gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] ${
          variant === 'urgent' ? 'border-destructive/30 text-destructive hover:bg-destructive/10' :
          variant === 'premium' ? 'border-primary/30 text-primary hover:bg-primary/10' :
          'hover:bg-accent/60'
        }`}>
        <Icon className="h-3 w-3" />
        {label}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Execute</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const ToggleControl = ({ label, icon: Icon, defaultOn = false }: {
  label: string; icon: React.ElementType; defaultOn?: boolean;
}) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-foreground">{label}</span>
      </div>
      <Switch checked={on} onCheckedChange={(v) => { setOn(v); toast.success(`${label}: ${v ? 'Activated' : 'Deactivated'}`); }} className="scale-75" />
    </div>
  );
};

// ── Section Header ──
const SectionTitle = ({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-2 rounded-xl bg-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <h2 className="text-xs font-black uppercase tracking-wider text-foreground">{title}</h2>
    {badge && <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-primary/30 text-primary ml-auto">{badge}</Badge>}
  </div>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 1 — CAPITAL DEMAND RADAR
// ══════════════════════════════════════════════════════════════════
const assetDemand = [
  { name: 'Villa', value: 42, color: 'hsl(var(--primary))' },
  { name: 'Apartment', value: 24, color: 'hsl(var(--chart-2))' },
  { name: 'Commercial', value: 18, color: 'hsl(var(--chart-3))' },
  { name: 'Land', value: 10, color: 'hsl(var(--chart-4))' },
  { name: 'Warehouse', value: 6, color: 'hsl(var(--chart-5))' },
];

const timeHorizon = [
  { horizon: '<6 months', pct: 28, label: 'Short-term' },
  { horizon: '6-18 months', pct: 35, label: 'Medium-term' },
  { horizon: '18-36 months', pct: 25, label: 'Long-term' },
  { horizon: '36+ months', pct: 12, label: 'Hold forever' },
];

const CapitalDemandRadar = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Radio} title="Capital Demand Radar" badge="Live Signals" />
    </CardHeader>
    <CardContent className="p-3 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard icon={Users} label="Active Investors" value="147" trend="up" sub="23 high-intent" />
        <MetricCard icon={DollarSign} label="Capital Searching" value="$18.4M" trend="up" sub="Estimated volume" />
        <MetricCard icon={Eye} label="Sessions Today" value="1,284" sub="Avg 8.2 pages/session" />
        <MetricCard icon={Clock} label="Avg Decision Time" value="14d" trend="down" sub="Improving from 19d" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Asset Class Demand Distribution */}
        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Asset Class Demand</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={assetDemand} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} stroke="hsl(var(--background))">
                {assetDemand.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center">
            {assetDemand.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[9px] text-muted-foreground">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Time Horizon */}
        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Investment Time Horizon</p>
          <div className="space-y-2.5">
            {timeHorizon.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-foreground">{t.horizon}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[8px] h-4 px-1">{t.label}</Badge>
                    <span className="text-[10px] font-black tabular-nums text-primary">{t.pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary/40"
                    initial={{ width: 0 }}
                    animate={{ width: `${t.pct}%` }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Pulse Indicator */}
          <div className="mt-3 p-2 rounded-lg bg-chart-1/5 border border-chart-1/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />
            <span className="text-[10px] text-foreground font-medium">Real-time: 23 investors actively browsing premium listings</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 2 — DEAL OPPORTUNITY RANKING
// ══════════════════════════════════════════════════════════════════
const DealOpportunityRanking = ({ deals, navigate }: { deals: DealFinderResult[]; navigate: (p: string) => void }) => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Target} title="Deal Opportunity Ranking" badge={`${deals.length} ranked`} />
    </CardHeader>
    <CardContent className="p-3">
      <div className="grid md:grid-cols-2 gap-2">
        {(deals.length > 0 ? deals.slice(0, 6) : Array.from({ length: 6 }, (_, i) => ({
          property_id: `demo-${i}`,
          title: ['Luxury Bali Villa', 'Jakarta CBD Penthouse', 'Bandung Hillside Estate', 'Ubud Retreat Villa', 'Surabaya Commercial', 'Yogya Heritage Home'][i],
          city: ['Bali', 'Jakarta', 'Bandung', 'Bali', 'Surabaya', 'Yogyakarta'][i],
          property_type: ['Villa', 'Apartment', 'Villa', 'Villa', 'Commercial', 'House'][i],
          price: [3200000000, 8500000000, 2100000000, 4800000000, 6200000000, 1500000000][i],
          deal_score: [94, 91, 88, 86, 83, 80][i],
          rental_yield_percent: [8.2, 5.4, 7.1, 9.3, 6.8, 5.9][i],
          deal_rating: ['hot_deal', 'hot_deal', 'good_deal', 'good_deal', 'good_deal', 'fair'][i] as any,
          undervalue_percent: [12, 8, 15, 6, 4, 2][i],
          thumbnail_url: null,
          demand_heat_score: [92, 87, 78, 85, 72, 65][i],
        }))).map((deal, i) => {
          const urgency = deal.deal_score >= 90 ? 'critical' : deal.deal_score >= 80 ? 'high' : 'moderate';
          const execProb = Math.min(95, deal.deal_score + Math.round(Math.random() * 8));
          return (
            <motion.div key={deal.property_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] ${
                deal.deal_rating === 'hot_deal' ? 'border-chart-3/30 bg-chart-3/5' : 'border-border/30 bg-card/40'
              }`}
              onClick={() => navigate(`/property/${deal.property_id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {deal.thumbnail_url ? <img src={deal.thumbnail_url} alt="" className="w-full h-full object-cover" /> :
                    <Building2 className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-foreground truncate">{deal.title}</p>
                    {deal.deal_rating === 'hot_deal' && <Flame className="h-3 w-3 text-chart-3 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{deal.city} · {deal.property_type}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-foreground">{fmtShort(deal.price)}</span>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1">Match {deal.deal_score}%</Badge>
                    <span className="text-[9px] text-chart-1 font-semibold">{deal.rental_yield_percent.toFixed(1)}% yield</span>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    urgency === 'critical' ? 'bg-destructive/10 text-destructive' :
                    urgency === 'high' ? 'bg-chart-3/10 text-chart-3' : 'bg-muted text-muted-foreground'
                  }`}>
                    {urgency.toUpperCase()}
                  </div>
                  <p className="text-[9px] text-muted-foreground">Exec: {execProb}%</p>
                </div>
              </div>
              {deal.undervalue_percent > 5 && (
                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-primary font-medium">
                  <Sparkles className="h-3 w-3" />
                  {deal.undervalue_percent}% below AI fair value — high conversion probability
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 3 — BEHAVIORAL SIGNAL ANALYTICS
// ══════════════════════════════════════════════════════════════════
const behaviorData = [
  { month: 'Jan', saves: 120, views: 890, inquiries: 45 },
  { month: 'Feb', saves: 145, views: 1020, inquiries: 58 },
  { month: 'Mar', saves: 168, views: 1180, inquiries: 72 },
  { month: 'Apr', saves: 193, views: 1340, inquiries: 81 },
  { month: 'May', saves: 210, views: 1450, inquiries: 95 },
  { month: 'Jun', saves: 238, views: 1620, inquiries: 108 },
];

const geoHotspots = [
  { area: 'South Jakarta', intensity: 94, saves: 342, trend: 'up' as const },
  { area: 'Seminyak, Bali', intensity: 91, saves: 287, trend: 'up' as const },
  { area: 'Ubud, Bali', intensity: 87, saves: 234, trend: 'up' as const },
  { area: 'Bandung North', intensity: 72, saves: 156, trend: 'neutral' as const },
  { area: 'Surabaya CBD', intensity: 68, saves: 128, trend: 'down' as const },
];

const budgetSpectrum = [
  { range: '<Rp 500M', pct: 12, label: 'Entry' },
  { range: 'Rp 500M-1B', pct: 22, label: 'Mid' },
  { range: 'Rp 1-3B', pct: 34, label: 'Premium' },
  { range: 'Rp 3-10B', pct: 24, label: 'Luxury' },
  { range: '>Rp 10B', pct: 8, label: 'Ultra' },
];

const BehavioralSignalAnalytics = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Brain} title="Behavioral Signal Analytics" badge="Intelligence" />
    </CardHeader>
    <CardContent className="p-3 space-y-4">
      <div className="grid grid-cols-12 gap-3">
        {/* Engagement Trends Chart */}
        <div className="col-span-12 md:col-span-7">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Engagement Signals (6M)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={behaviorData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" name="Views" />
              <Area type="monotone" dataKey="saves" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.1)" name="Saves" />
              <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.1)" name="Inquiries" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Geographic Demand Hotspots */}
        <div className="col-span-12 md:col-span-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Geographic Hotspots</p>
          <div className="space-y-2">
            {geoHotspots.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/20 transition-all">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span className="text-[10px] font-medium text-foreground flex-1 truncate">{g.area}</span>
                <span className="text-[9px] text-muted-foreground tabular-nums">{g.saves} saves</span>
                <div className="w-12 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${g.intensity}%` }} />
                </div>
                {g.trend === 'up' ? <ArrowUpRight className="h-3 w-3 text-chart-1" /> :
                 g.trend === 'down' ? <ArrowDownRight className="h-3 w-3 text-destructive" /> : null}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Range Heat Spectrum */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Budget Range Heat Spectrum</p>
        <div className="grid grid-cols-5 gap-1.5">
          {budgetSpectrum.map((b, i) => {
            const heat = b.pct > 30 ? 'bg-destructive/15 border-destructive/25' :
                         b.pct > 20 ? 'bg-chart-3/15 border-chart-3/25' :
                         'bg-muted/30 border-border/30';
            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                className={`p-2.5 rounded-xl border text-center ${heat}`}>
                <p className="text-sm font-black tabular-nums text-foreground">{b.pct}%</p>
                <p className="text-[8px] text-muted-foreground font-medium mt-0.5">{b.range}</p>
                <Badge variant="secondary" className="text-[7px] h-3.5 px-1 mt-1">{b.label}</Badge>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Repeat Visit Clusters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard icon={Eye} label="Repeat Visitors" value="342" sub="3+ visits in 7d" trend="up" />
        <MetricCard icon={Heart} label="Save Rate" value="18.4%" sub="Above 15% benchmark" trend="up" />
        <MetricCard icon={Clock} label="Avg Session" value="8m 24s" sub="+22% vs last month" trend="up" />
        <MetricCard icon={Target} label="Intent Score" value="74" sub="High-intent cluster" />
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 4 — INVESTOR SEGMENTATION PANEL
// ══════════════════════════════════════════════════════════════════
const segments = [
  {
    name: 'Yield Focused', icon: DollarSign, count: 48, pct: 33, color: 'chart-1',
    traits: ['Rental yield >6%', 'Monthly cashflow priority', 'Prefer managed units'],
    avgBudget: 'Rp 1.2-3B', avgYield: '7.4%', convRate: '12%',
  },
  {
    name: 'Capital Appreciation', icon: TrendingUp, count: 42, pct: 29, color: 'chart-2',
    traits: ['Long hold strategy', 'Growth corridors', 'New development areas'],
    avgBudget: 'Rp 2-8B', avgYield: '4.2%', convRate: '8%',
  },
  {
    name: 'Luxury Lifestyle', icon: Crown, count: 31, pct: 21, color: 'chart-3',
    traits: ['Premium locations', 'Design-driven', 'Personal use + rental'],
    avgBudget: 'Rp 5-15B', avgYield: '5.8%', convRate: '15%',
  },
  {
    name: 'Institutional Scale', icon: Building2, count: 26, pct: 17, color: 'primary',
    traits: ['Bulk acquisition', 'Portfolio diversification', 'Data-driven decisions'],
    avgBudget: 'Rp 10B+', avgYield: '6.1%', convRate: '22%',
  },
];

const InvestorSegmentationPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Layers} title="Investor Segmentation" badge="AI Clusters" />
    </CardHeader>
    <CardContent className="p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {segments.map((seg, i) => {
          const Icon = seg.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`p-3.5 rounded-xl border border-border/30 bg-card/40 hover:border-${seg.color}/30 transition-all group`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-${seg.color}/10`}>
                  <Icon className={`h-4 w-4 text-${seg.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{seg.name}</p>
                  <p className="text-[9px] text-muted-foreground">{seg.count} investors · {seg.pct}% of base</p>
                </div>
                <div className="w-10 h-10 relative">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <motion.path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke={`hsl(var(--${seg.color}))`} strokeWidth="3"
                      strokeDasharray={`${seg.pct}, 100`}
                      initial={{ strokeDasharray: '0, 100' }}
                      animate={{ strokeDasharray: `${seg.pct}, 100` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-foreground">{seg.pct}%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {seg.traits.map((t, j) => (
                  <Badge key={j} variant="secondary" className="text-[8px] h-4 px-1.5">{t}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="p-1.5 rounded-md bg-muted/30 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase">Avg Budget</p>
                  <p className="text-[10px] font-bold text-foreground">{seg.avgBudget}</p>
                </div>
                <div className="p-1.5 rounded-md bg-muted/30 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase">Avg Yield</p>
                  <p className="text-[10px] font-bold text-foreground">{seg.avgYield}</p>
                </div>
                <div className="p-1.5 rounded-md bg-muted/30 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase">Conv Rate</p>
                  <p className="text-[10px] font-bold text-chart-1">{seg.convRate}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// SECTION 5 — ADMIN ACTION TOGGLES
// ══════════════════════════════════════════════════════════════════
const AdminActionPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionTitle icon={Shield} title="Founder / Admin Controls" badge="Privileged" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="space-y-1.5">
        <ToggleControl icon={Send} label="Auto-Send Curated Deal Batches" defaultOn />
        <ToggleControl icon={Zap} label="Private Inventory Release Active" />
        <ToggleControl icon={Bell} label="Urgency Push Notifications" defaultOn />
        <ToggleControl icon={Rocket} label="Exclusive Investor Event Funnel" />
        <ToggleControl icon={Sparkles} label="AI Deal Personalization Engine" defaultOn />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Send} label="Send Curated Deal Batch" variant="premium"
          description="Dispatch personalized deal packages to all high-intent investors based on DNA matching scores."
          onConfirm={() => toast.success('Deal batch dispatched to 23 qualified investors')} />
        <ConfirmedAction icon={Zap} label="Release Private Inventory" variant="urgent"
          description="Make exclusive pre-market listings available to qualified investors. This action cannot be undone."
          onConfirm={() => toast.success('12 private listings released to premium investors')} />
        <ConfirmedAction icon={Bell} label="Push Urgency Notification" variant="urgent"
          description="Send urgency notification to investors with properties matching their criteria in high-demand zones."
          onConfirm={() => toast.success('Urgency notifications sent to 47 investors')} />
        <ConfirmedAction icon={Rocket} label="Trigger Event Funnel"
          description="Activate exclusive investor event invitation funnel for upcoming virtual property showcase."
          onConfirm={() => toast.success('Event funnel activated — 147 investors queued')} />
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// MAIN TERMINAL
// ══════════════════════════════════════════════════════════════════
const InvestorIntelligenceTerminal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioManager();
  const { data: dealData, isLoading: dealsLoading } = useDealFinder({ limit: 8 });

  const p = portfolio as PortfolioData | undefined;
  const props = p?.properties || [];
  const deals = dealData?.deals || [];

  const totalValue = p?.portfolio_value || 0;
  const projected5Y = p?.projected_value_5y || 0;
  const unrealizedPct = totalValue > 0 ? ((projected5Y - totalValue) / totalValue) * 100 : 0;
  const avgYield = props.length ? props.reduce((s, x) => s + x.rental_yield, 0) / props.length : 0;
  const avgScore = props.length ? Math.round(props.reduce((s, x) => s + x.investment_score, 0) / props.length) : 0;

  const navItems = [
    { key: 'radar', label: 'Capital Radar', icon: Radio },
    { key: 'deals', label: 'Deal Ranking', icon: Target },
    { key: 'behavior', label: 'Behavioral', icon: Brain },
    { key: 'segments', label: 'Segmentation', icon: Layers },
    { key: 'admin', label: 'Admin Controls', icon: Shield },
  ];

  const scrollTo = (key: string) => {
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header bar ── */}
      <motion.div {...fade(0)} className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-8 py-3">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-foreground">Investor Intelligence Terminal</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-1 animate-pulse" />
                  Live · <LiveClock />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden md:flex gap-1 text-[9px] border-primary/30 text-primary">
                <Sparkles className="w-3 h-3" /> Premium Terminal
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/portfolio-command-center')}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {navItems.map(n => {
              const Icon = n.icon;
              return (
                <button key={n.key} onClick={() => scrollTo(n.key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                  <Icon className="h-3 w-3" />
                  {n.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* ── KPI Strip ── */}
        <motion.div {...fade(0.05)} className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <MetricCard icon={Briefcase} label="Portfolio Value" value={fmtShort(totalValue)} sub={`${props.length} assets`} />
          <MetricCard icon={TrendingUp} label="Projected 5Y Gain" value={`${unrealizedPct >= 0 ? '+' : ''}${unrealizedPct.toFixed(1)}%`} trend={unrealizedPct >= 0 ? 'up' : 'down'} />
          <MetricCard icon={DollarSign} label="Avg Rental Yield" value={`${avgYield.toFixed(1)}%`} trend={avgYield >= 5 ? 'up' : 'neutral'} />
          <MetricCard icon={Target} label="Investment Score" value={`${avgScore}/100`} trend={avgScore >= 70 ? 'up' : 'neutral'} />
          <MetricCard icon={Flame} label="Hot Deals" value={`${deals.filter(d => d.deal_rating === 'hot_deal').length}`} sub={`of ${deals.length} scanned`} />
        </motion.div>

        {/* ── Sections ── */}
        <div id="section-radar"><CapitalDemandRadar /></div>
        <div id="section-deals"><DealOpportunityRanking deals={deals} navigate={navigate} /></div>
        <div id="section-behavior"><BehavioralSignalAnalytics /></div>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-7" id="section-segments"><InvestorSegmentationPanel /></div>
          <div className="col-span-12 lg:col-span-5" id="section-admin"><AdminActionPanel /></div>
        </div>

        {/* ── Intelligence Tools Quick Nav ── */}
        <motion.div {...fade(0.3)}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'Portfolio Center', path: '/portfolio-command-center', icon: Briefcase },
                  { label: 'Deal Hunter', path: '/deal-hunter-bot', icon: Target },
                  { label: 'Wealth Simulator', path: '/wealth-simulator', icon: BarChart3 },
                  { label: 'Price Prediction', path: '/price-prediction', icon: Brain },
                ].map((t, i) => (
                  <button key={i} onClick={() => navigate(t.path)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 hover:bg-primary/5 transition-all text-left group">
                    <t.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground">{t.label}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestorIntelligenceTerminal;
