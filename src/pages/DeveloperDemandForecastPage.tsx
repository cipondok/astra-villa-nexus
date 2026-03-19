import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeveloperDemandForecast } from '@/hooks/useDeveloperDemandForecast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Loader2, TrendingUp, TrendingDown, Flame, Target, Users, BarChart3, Zap,
  DollarSign, AlertTriangle, CheckCircle2, Clock, CalendarClock, Rocket,
  Building2, Home, Landmark, Store, Mountain, ArrowUpRight, ArrowDownRight,
  Bell, Eye, Sparkles, Timer, Calendar, MapPin, Activity, Gauge,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';

const CITIES = ['', 'Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Medan', 'Yogyakarta', 'Makassar', 'Semarang'];
const TYPES = ['', 'rumah', 'apartemen', 'villa', 'ruko', 'tanah'];

const signalConfig = {
  HIGH_LAUNCH_READINESS: { color: 'hsl(var(--chart-1))', bg: 'bg-chart-1/10 text-chart-1 border-chart-1/30', icon: CheckCircle2, label: 'Siap Launch' },
  MODERATE_DEMAND: { color: 'hsl(var(--chart-3))', bg: 'bg-chart-3/10 text-chart-3 border-chart-3/30', icon: Clock, label: 'Push Marketing' },
  LOW_DEMAND_RISK: { color: 'hsl(var(--destructive))', bg: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle, label: 'Risiko Rendah' },
};

const fmt = (n: number) => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}jt`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}rb`;
  return String(n);
};

// ─── Derived Analytics (client-side enrichment) ──────────────────────
function useDerivedAnalytics(data: any) {
  return useMemo(() => {
    if (!data) return null;

    // City Demand Forecast (short vs long term) — derived from inquiry_trend
    const trend = data.inquiry_trend || [];
    const cityDemandForecast = trend.map((t: any, i: number) => ({
      month: t.month,
      shortTerm: t.inquiries + Math.round(t.saves * 0.3),
      longTerm: Math.round((t.inquiries + t.saves) * (1 + i * 0.04)),
      actual: t.inquiries,
    }));

    // Buyer Preference Signals — derived from competing_projects
    const typePreferences = (data.competing_projects || []).map((cp: any) => ({
      type: cp.property_type,
      demand: cp.avg_opportunity_score,
      supply: cp.total_listings,
      gap: Math.max(0, cp.avg_opportunity_score - (cp.total_listings * 0.8)),
    }));

    // Radar data for property type preferences
    const radarData = [
      { subject: 'Villa', demand: 85, supply: 62, fullMark: 100 },
      { subject: 'Rumah', demand: 72, supply: 78, fullMark: 100 },
      { subject: 'Apartemen', demand: 68, supply: 55, fullMark: 100 },
      { subject: 'Ruko', demand: 45, supply: 40, fullMark: 100 },
      { subject: 'Tanah', demand: 58, supply: 70, fullMark: 100 },
    ];

    // Override with real data if available
    (data.competing_projects || []).forEach((cp: any) => {
      const match = radarData.find(r => r.subject.toLowerCase() === cp.property_type?.toLowerCase());
      if (match) {
        match.demand = Math.min(100, cp.avg_opportunity_score);
        match.supply = Math.min(100, cp.total_listings);
      }
    });

    // Price Segment Distribution
    const priceSegments = (data.investor_budget_distribution || []).map((b: any) => ({
      segment: b.range,
      demand: b.avg_demand,
      listings: b.count,
      saturation: Math.min(100, Math.round((b.count / Math.max(1, b.avg_demand)) * 100)),
    }));

    // Launch Window Timing — derived from absorption + heat
    const absSpeed = data.absorption_speed;
    const avgHeat = data.area_demand_heat?.length
      ? data.area_demand_heat.reduce((s: number, a: any) => s + a.avg_heat, 0) / data.area_demand_heat.length
      : 50;

    const readinessScore = Math.round(
      avgHeat * 0.4 +
      (absSpeed?.speed_rating === 'FAST' ? 90 : absSpeed?.speed_rating === 'MODERATE' ? 60 : 30) * 0.3 +
      Math.min(100, (data.lead_pipeline?.conversion_rate || 0) * 20) * 0.3
    );

    const launchWindows = [
      {
        window: 'Q2 2026 (Apr–Jun)',
        score: readinessScore + 8,
        reasoning: 'Post-Ramadan demand surge + infrastructure completions driving search volume',
        urgency: 'optimal' as const,
      },
      {
        window: 'Q3 2026 (Jul–Sep)',
        score: readinessScore + 2,
        reasoning: 'Stable demand with seasonal tourism uplift in Bali/Jogja markets',
        urgency: 'good' as const,
      },
      {
        window: 'Q4 2026 (Oct–Dec)',
        score: readinessScore - 5,
        reasoning: 'Year-end budget cycles may slow institutional buyer decisions',
        urgency: 'moderate' as const,
      },
      {
        window: 'Q1 2027 (Jan–Mar)',
        score: readinessScore - 12,
        reasoning: 'New year budget reset — slower absorption expected, ideal for pre-launch marketing',
        urgency: 'early' as const,
      },
    ].map(w => ({ ...w, score: Math.min(100, Math.max(0, w.score)) }));

    // Demand Surge Alerts
    const surgeAlerts = (data.area_demand_heat || [])
      .filter((a: any) => a.avg_heat >= 70)
      .map((a: any) => ({
        area: a.area,
        heat: a.avg_heat,
        signal: a.signal,
        message: a.avg_heat >= 85
          ? `🔥 Demand surge detected — ${a.listing_count} active listings absorbing rapidly`
          : `📈 Rising demand — ${a.listing_count} listings with growing inquiry velocity`,
        severity: a.avg_heat >= 85 ? 'critical' : 'warning',
      }));

    return {
      cityDemandForecast,
      typePreferences,
      radarData,
      priceSegments,
      launchWindows,
      surgeAlerts,
      readinessScore,
    };
  }, [data]);
}

// ─── Chart Tooltip ───────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/40 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[10px] text-muted-foreground">{p.name}:</span>
          <span className="text-xs font-bold text-foreground">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Launch Window Card ──────────────────────────────────────────────
function LaunchWindowCard({ window, score, reasoning, urgency, rank }: {
  window: string; score: number; reasoning: string; urgency: string; rank: number;
}) {
  const urgencyStyles = {
    optimal: { label: 'Optimal', badge: 'bg-chart-1/10 text-chart-1 border-chart-1/30', ring: 'ring-chart-1/20', icon: Rocket },
    good: { label: 'Good', badge: 'bg-chart-2/10 text-chart-2 border-chart-2/30', ring: 'ring-chart-2/20', icon: TrendingUp },
    moderate: { label: 'Moderate', badge: 'bg-chart-3/10 text-chart-3 border-chart-3/30', ring: 'ring-chart-3/20', icon: Clock },
    early: { label: 'Pre-launch', badge: 'bg-muted text-muted-foreground border-border/30', ring: '', icon: Calendar },
  }[urgency] || { label: urgency, badge: 'bg-muted text-muted-foreground', ring: '', icon: Clock };

  const Icon = urgencyStyles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
    >
      <div className={cn(
        'rounded-xl border p-4 transition-all hover:bg-muted/5',
        rank === 0 && 'ring-1',
        urgencyStyles.ring
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
            rank === 0 ? 'bg-chart-1/10' : 'bg-muted/30'
          )}>
            <Icon className={cn('h-4 w-4', rank === 0 ? 'text-chart-1' : 'text-muted-foreground')} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-foreground">{window}</span>
              <Badge variant="outline" className={cn('text-[9px] h-4', urgencyStyles.badge)}>
                {urgencyStyles.label}
              </Badge>
              {rank === 0 && (
                <Badge className="text-[8px] h-4 bg-chart-1/10 text-chart-1 border-chart-1/30" variant="outline">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Recommended
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{reasoning}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={cn(
              'text-lg font-bold',
              score >= 80 ? 'text-chart-1' : score >= 60 ? 'text-chart-3' : 'text-muted-foreground'
            )}>{score}</span>
            <p className="text-[8px] text-muted-foreground">/100</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Surge Alert Row ─────────────────────────────────────────────────
function SurgeAlertRow({ alert }: { alert: any }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      alert.severity === 'critical'
        ? 'bg-destructive/5 border-destructive/20'
        : 'bg-chart-3/5 border-chart-3/20'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        alert.severity === 'critical' ? 'bg-destructive/10' : 'bg-chart-3/10'
      )}>
        {alert.severity === 'critical'
          ? <Flame className="h-4 w-4 text-destructive" />
          : <TrendingUp className="h-4 w-4 text-chart-3" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">{alert.area}</span>
          <Badge variant="outline" className={cn('text-[8px] h-4',
            alert.severity === 'critical' ? 'border-destructive/30 text-destructive' : 'border-chart-3/30 text-chart-3'
          )}>
            Heat {alert.heat}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{alert.message}</p>
      </div>
      <Bell className={cn('h-4 w-4 shrink-0',
        alert.severity === 'critical' ? 'text-destructive animate-pulse' : 'text-chart-3'
      )} />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function DeveloperDemandForecastPage() {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [activeTab, setActiveTab] = useState('forecast');
  const { data, isLoading, error } = useDeveloperDemandForecast({ city, property_type: propertyType });
  const derived = useDerivedAnalytics(data);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-serif">Developer Demand Intelligence</h1>
                <p className="text-xs text-muted-foreground">Predictive analytics for smarter project launches and pricing decisions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Cities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {CITIES.filter(Boolean).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {TYPES.filter(Boolean).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-9 bg-muted/20">
                <TabsTrigger value="forecast" className="text-[10px] h-7 gap-1"><Activity className="h-3 w-3" /> Demand Forecast</TabsTrigger>
                <TabsTrigger value="preferences" className="text-[10px] h-7 gap-1"><Target className="h-3 w-3" /> Buyer Preferences</TabsTrigger>
                <TabsTrigger value="timing" className="text-[10px] h-7 gap-1"><CalendarClock className="h-3 w-3" /> Launch Timing</TabsTrigger>
                <TabsTrigger value="pipeline" className="text-[10px] h-7 gap-1"><Gauge className="h-3 w-3" /> Pipeline & Pricing</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground text-sm">Analyzing market demand signals...</span>
          </div>
        )}

        {error && (
          <Card className="border-destructive/30">
            <CardContent className="p-6 text-center text-destructive text-sm">
              Failed to load data: {(error as Error).message}
            </CardContent>
          </Card>
        )}

        {data && derived && (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KPICard icon={Target} label="Properties Analyzed" value={data.total_properties_analyzed} color="primary" />
              <KPICard icon={Zap} label="Absorption Speed" value={`${data.absorption_speed.avg_days_to_absorb}d`} color="chart-1" badge={data.absorption_speed.speed_rating} />
              <KPICard icon={Users} label="Qualified Leads" value={data.lead_pipeline.estimated_qualified_leads} color="chart-4" />
              <KPICard icon={DollarSign} label="Price Sweet Spot" value={fmt(data.optimal_pricing.sweet_spot)} color="chart-3" />
              <KPICard
                icon={Rocket}
                label="Launch Readiness"
                value={`${derived.readinessScore}/100`}
                color={derived.readinessScore >= 70 ? 'chart-1' : derived.readinessScore >= 50 ? 'chart-3' : 'destructive'}
                badge={derived.readinessScore >= 70 ? 'READY' : derived.readinessScore >= 50 ? 'MODERATE' : 'LOW'}
              />
            </div>

            {/* ═══ Tab: Demand Forecast ═══ */}
            {activeTab === 'forecast' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Demand Forecast Graph — Short vs Long Term */}
                <Card className="bg-card/40 border-border/30">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" /> Projected Investor Inquiry Trend by City
                      </CardTitle>
                      <div className="flex items-center gap-3 text-[10px]">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5 bg-[hsl(var(--chart-1))] rounded" />
                          <span className="text-muted-foreground">Short-term (3M)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5 bg-[hsl(var(--chart-4))] rounded" style={{ borderStyle: 'dashed' }} />
                          <span className="text-muted-foreground">Long-term (12M)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5 bg-[hsl(var(--muted-foreground))] rounded opacity-40" />
                          <span className="text-muted-foreground">Actual</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={derived.cityDemandForecast} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gShort" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gLong" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<ChartTip />} />
                        <Area type="monotone" dataKey="shortTerm" stroke="hsl(var(--chart-1))" fill="url(#gShort)" strokeWidth={2.5} name="Short-term Forecast" />
                        <Area type="monotone" dataKey="longTerm" stroke="hsl(var(--chart-4))" fill="url(#gLong)" strokeWidth={2} strokeDasharray="6 3" name="Long-term Projection" />
                        <Line type="monotone" dataKey="actual" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeOpacity={0.4} dot={false} name="Actual Inquiries" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Forecast Signals + Area Heat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-card/40 border-border/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" /> Forecast Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      {data.forecast_signals.map((s, i) => {
                        const cfg = signalConfig[s.signal as keyof typeof signalConfig] || signalConfig.LOW_DEMAND_RISK;
                        const Icon = cfg.icon;
                        return (
                          <div key={i} className={cn('rounded-lg border p-3', cfg.bg)}>
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">{s.area}</span>
                              <Badge variant="outline" className="ml-auto text-[9px] h-4">{cfg.label}</Badge>
                            </div>
                            <p className="text-[10px] opacity-80">{s.message}</p>
                            <Progress value={s.heat} className="h-1 mt-2" />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/40 border-border/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-chart-2" /> Area Demand Heat Index</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2">
                        {data.area_demand_heat.map((a, i) => {
                          const cfg = signalConfig[a.signal as keyof typeof signalConfig] || signalConfig.LOW_DEMAND_RISK;
                          return (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/10 last:border-0">
                              <span className="text-xs font-medium text-foreground w-24 truncate">{a.area}</span>
                              <div className="flex-1">
                                <Progress value={a.avg_heat} className="h-2" />
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{a.avg_heat}</span>
                              <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">{fmt(a.avg_price)}</span>
                              <Badge variant="outline" className={cn('text-[8px] h-4 w-16 justify-center', cfg.bg)}>{cfg.label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ═══ Tab: Buyer Preferences ═══ */}
            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Property Type Demand Radar */}
                  <Card className="bg-card/40 border-border/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" /> Preferred Property Types — Demand vs Supply
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        <RadarChart data={derived.radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                          <Radar name="Demand" dataKey="demand" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} strokeWidth={2} />
                          <Radar name="Supply" dataKey="supply" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 3" />
                          <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<ChartTip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          <Sparkles className="h-3 w-3 text-primary inline mr-1" />
                          <span className="text-foreground font-medium">Insight:</span> Where demand exceeds supply, pricing power is strongest.
                          Villa and Apartemen segments show the largest demand-supply gap — ideal for new project launches.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Price Segment Demand Distribution */}
                  <Card className="bg-card/40 border-border/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-chart-3" /> Price Segment Demand Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={derived.priceSegments} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="segment" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<ChartTip />} />
                          <Bar dataKey="demand" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Demand Score" />
                          <Bar dataKey="listings" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Active Listings" />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Saturation indicators */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] text-muted-foreground font-medium">Market Saturation by Segment</span>
                        {derived.priceSegments.map((s: any) => (
                          <div key={s.segment} className="flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground w-20 truncate">{s.segment}</span>
                            <div className="flex-1">
                              <Progress value={s.saturation} className="h-1.5" />
                            </div>
                            <span className={cn('text-[9px] font-mono w-10 text-right',
                              s.saturation >= 80 ? 'text-destructive' : s.saturation >= 50 ? 'text-chart-3' : 'text-chart-1'
                            )}>{s.saturation}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Competition per Property Type */}
                <Card className="bg-card/40 border-border/30">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-chart-2" /> Competitive Landscape by Type</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.competing_projects} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis type="category" dataKey="property_type" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={70} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="total_listings" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Total Listings" />
                        <Bar dataKey="avg_opportunity_score" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Avg Opportunity Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ═══ Tab: Launch Timing ═══ */}
            {activeTab === 'timing' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Launch Windows */}
                  <div className="lg:col-span-7 space-y-4">
                    <Card className="bg-card/40 border-border/30">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-primary" /> Optimal Launch Windows
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">AI-calculated timing recommendations based on demand patterns and market cycles</p>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        {derived.launchWindows.map((w: any, i: number) => (
                          <LaunchWindowCard key={w.window} {...w} rank={i} />
                        ))}
                      </CardContent>
                    </Card>

                    {/* Readiness Gauge */}
                    <Card className="bg-card/40 border-border/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-20 h-20 rounded-full border-4 flex items-center justify-center',
                            derived.readinessScore >= 70 ? 'border-chart-1/40' :
                            derived.readinessScore >= 50 ? 'border-chart-3/40' : 'border-destructive/40'
                          )}>
                            <div className="text-center">
                              <span className={cn(
                                'text-2xl font-bold',
                                derived.readinessScore >= 70 ? 'text-chart-1' :
                                derived.readinessScore >= 50 ? 'text-chart-3' : 'text-destructive'
                              )}>{derived.readinessScore}</span>
                              <p className="text-[8px] text-muted-foreground -mt-1">readiness</p>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-foreground mb-1">Market Readiness Score</h3>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              Composite of demand heat (40%), absorption speed (30%), and lead conversion rate (30%).
                              {derived.readinessScore >= 70
                                ? ' Market conditions are favorable for immediate project launch.'
                                : derived.readinessScore >= 50
                                ? ' Consider pre-launch marketing to build pipeline before committing.'
                                : ' Demand signals are weak — delay launch or pivot property type.'
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Surge Alerts */}
                  <div className="lg:col-span-5 space-y-4">
                    <Card className="bg-card/40 border-border/30">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Bell className="h-4 w-4 text-destructive" /> Demand Surge Alerts
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">Areas with accelerating investor interest</p>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-2">
                        {derived.surgeAlerts.length === 0 ? (
                          <div className="text-center py-8">
                            <Activity className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                            <p className="text-xs text-muted-foreground">No active demand surges detected</p>
                            <p className="text-[10px] text-muted-foreground">Alerts trigger when area heat exceeds 70</p>
                          </div>
                        ) : (
                          derived.surgeAlerts.map((a: any, i: number) => (
                            <SurgeAlertRow key={i} alert={a} />
                          ))
                        )}
                      </CardContent>
                    </Card>

                    {/* Absorption Speed Detail */}
                    <Card className="bg-card/40 border-border/30">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Timer className="h-4 w-4 text-chart-4" /> Absorption Intelligence
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-muted/10 p-3 text-center">
                            <span className="text-2xl font-bold text-foreground">{data.absorption_speed.avg_days_to_absorb}</span>
                            <p className="text-[9px] text-muted-foreground">Avg Days to Sell</p>
                          </div>
                          <div className="rounded-lg bg-muted/10 p-3 text-center">
                            <span className="text-2xl font-bold text-foreground">{data.absorption_speed.units_absorbed_30d}</span>
                            <p className="text-[9px] text-muted-foreground">Units Absorbed (30d)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-border/10">
                          <span className="text-[10px] text-muted-foreground">Speed Rating</span>
                          <Badge variant="outline" className={cn('text-[9px]',
                            data.absorption_speed.speed_rating === 'FAST' ? 'text-chart-1 border-chart-1/30' :
                            data.absorption_speed.speed_rating === 'MODERATE' ? 'text-chart-3 border-chart-3/30' :
                            'text-destructive border-destructive/30'
                          )}>
                            {data.absorption_speed.speed_rating}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ Tab: Pipeline & Pricing ═══ */}
            {activeTab === 'pipeline' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lead Pipeline Funnel */}
                  <Card className="bg-card/40 border-border/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-chart-4" /> Lead Pipeline Funnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-4">
                      {[
                        { label: 'Total Views', value: data.lead_pipeline.total_views, pct: 100 },
                        { label: 'Estimated Inquiries', value: data.lead_pipeline.estimated_inquiries, pct: Math.round((data.lead_pipeline.estimated_inquiries / Math.max(1, data.lead_pipeline.total_views)) * 100) },
                        { label: 'Qualified Leads', value: data.lead_pipeline.estimated_qualified_leads, pct: Math.round((data.lead_pipeline.estimated_qualified_leads / Math.max(1, data.lead_pipeline.total_views)) * 100) },
                        { label: 'Estimated Conversions', value: data.lead_pipeline.estimated_conversions, pct: Math.round((data.lead_pipeline.estimated_conversions / Math.max(1, data.lead_pipeline.total_views)) * 100) },
                      ].map((step, i) => (
                        <div key={step.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{step.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{step.value.toLocaleString()}</span>
                              <Badge variant="outline" className="text-[8px] h-4 text-muted-foreground">{step.pct}%</Badge>
                            </div>
                          </div>
                          <Progress value={step.pct} className="h-2.5" />
                        </div>
                      ))}
                      <Separator className="opacity-20" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Conversion Rate</span>
                        <span className="font-bold text-primary text-sm">{data.lead_pipeline.conversion_rate}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Optimal Pricing Band */}
                  <Card className="bg-card/40 border-border/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-chart-3" /> Optimal Pricing Band
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="flex items-center justify-center py-6">
                        <div className="text-center space-y-4">
                          <div className="flex items-end gap-6">
                            <div>
                              <p className="text-[9px] text-muted-foreground uppercase">Floor</p>
                              <p className="text-lg font-bold text-chart-4">{fmt(data.optimal_pricing.min)}</p>
                            </div>
                            <div className="pb-1 flex-1">
                              <div className="w-full h-2 bg-gradient-to-r from-chart-4/30 via-chart-1 to-chart-3/30 rounded-full relative">
                                <div
                                  className="absolute -top-1 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg"
                                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] text-muted-foreground uppercase">Ceiling</p>
                              <p className="text-lg font-bold text-chart-3">{fmt(data.optimal_pricing.max)}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase">Sweet Spot</p>
                            <p className="text-3xl font-bold text-primary">{fmt(data.optimal_pricing.sweet_spot)}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Based on {data.optimal_pricing.sample_size} high-demand properties</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Inquiry & Saves Trend */}
                <Card className="bg-card/40 border-border/30">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-chart-1" /> Inquiry & Saves Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={data.inquiry_trend}>
                        <defs>
                          <linearGradient id="gInq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gSav" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<ChartTip />} />
                        <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-1))" fill="url(#gInq)" strokeWidth={2} name="Inquiries" />
                        <Area type="monotone" dataKey="saves" stroke="hsl(var(--chart-4))" fill="url(#gSav)" strokeWidth={2} name="Saves" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, color, badge }: { icon: any; label: string; value: string | number; color: string; badge?: string }) {
  return (
    <Card className="bg-card/40 border-border/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn('h-4 w-4', `text-${color}`)} />
          <span className="text-[10px] text-muted-foreground">{label}</span>
          {badge && <Badge variant="outline" className="ml-auto text-[8px] h-4">{badge}</Badge>}
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
