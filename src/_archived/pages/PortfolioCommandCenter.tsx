import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Briefcase, TrendingUp, TrendingDown, DollarSign, Shield, Home,
  Target, Zap, ArrowUpRight, ArrowDownRight, BarChart3, Flame,
  ChevronDown, ChevronUp, AlertTriangle, Sparkles, Activity,
  MapPin, Eye, SortAsc, Brain, PieChart as PieIcon, Clock, Minus,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioManager, type PortfolioData, type PortfolioProperty } from '@/hooks/usePortfolioManager';
import { usePortfolioStrategy } from '@/hooks/usePortfolioStrategy';
import {
  computePortfolioValueTrend,
  computeRentalYieldSignal,
  computeCapitalGrowthMomentum,
  computeSellHoldAdvisory,
  computeNextOpportunityHint,
} from '@/hooks/useInvestorSuperInsights';
import { analyzePortfolioPerformance } from '@/hooks/usePortfolioPerformance';

// ── Formatters ──
const fmtIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const fmtShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

const PIE_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
];

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

// ── Risk Classification ──
function classifyRisk(prop: PortfolioProperty): { level: 'Low' | 'Medium' | 'High'; score: number } {
  const riskScore = Math.round(
    (prop.risk_factor || 0) * 0.4 +
    (100 - (prop.demand_heat_score || 50)) * 0.3 +
    (100 - (prop.investment_score || 50)) * 0.3
  );
  const level = riskScore <= 35 ? 'Low' : riskScore <= 60 ? 'Medium' : 'High';
  return { level, score: riskScore };
}

const riskColors = {
  Low: 'text-chart-1 bg-chart-1/10 border-chart-1/30',
  Medium: 'text-chart-4 bg-chart-4/10 border-chart-4/30',
  High: 'text-destructive bg-destructive/10 border-destructive/30',
};

// ── AI Insight Generator ──
function generateInsight(prop: PortfolioProperty): string {
  const risk = classifyRisk(prop);
  if (prop.investment_score >= 75 && prop.demand_heat_score >= 65) {
    return `Aset ini diproyeksikan outperform pasar lokal berkat demand score ${prop.demand_heat_score}/100 dan pertumbuhan ${prop.annual_growth_rate?.toFixed(1)}%/tahun. Strategi hold jangka panjang sangat direkomendasikan.`;
  }
  if (risk.level === 'High') {
    return `Aset menunjukkan rising risk dengan demand heat ${prop.demand_heat_score}/100 dan risk factor ${prop.risk_factor}. Evaluasi exit strategy atau optimasi pricing untuk mengurangi exposure.`;
  }
  if (prop.rental_yield >= 6) {
    return `Yield sewa ${prop.rental_yield?.toFixed(1)}% berada di atas rata-rata pasar. Pertimbangkan optimasi harga sewa untuk memaksimalkan passive income. Demand ${prop.demand_heat_score >= 60 ? 'kuat' : 'moderat'} mendukung stabilitas occupancy.`;
  }
  return `Aset dalam kondisi stabil dengan ROI 5Y sebesar ${prop.roi_5y?.toFixed(1)}%. Pertumbuhan ${prop.annual_growth_rate?.toFixed(1)}%/tahun memberikan apresiasi moderat. Pantau trend demand untuk timing optimal.`;
}

// ── Sort options ──
type SortKey = 'roi' | 'appreciation' | 'risk' | 'score';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'score', label: 'Opportunity Score' },
  { value: 'roi', label: 'Highest ROI' },
  { value: 'appreciation', label: 'Appreciation Forecast' },
  { value: 'risk', label: 'Highest Risk' },
];

// ── Property Card ──
function PropertyCard({ prop, onClick }: { prop: PortfolioProperty; onClick: () => void }) {
  const [showInsight, setShowInsight] = useState(false);
  const risk = classifyRisk(prop);
  const demandLabel = prop.demand_heat_score >= 70 ? 'Hot' : prop.demand_heat_score >= 45 ? 'Stable' : 'Cooling';
  const demandColor = prop.demand_heat_score >= 70 ? 'text-destructive' : prop.demand_heat_score >= 45 ? 'text-chart-1' : 'text-chart-4';

  return (
    <motion.div {...fadeIn(0)}>
      <Card className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 cursor-pointer" onClick={onClick}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{prop.title}</h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {prop.city}{prop.state ? `, ${prop.state}` : ''}
                  {prop.property_type && <> · <span className="capitalize">{prop.property_type}</span></>}
                </p>
              </div>
              <Badge variant="outline" className={cn('text-[10px] shrink-0', riskColors[risk.level])}>
                {risk.level} Risk
              </Badge>
            </div>

            {/* Score + Metrics Grid */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {/* Opportunity Score Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="18" fill="none" strokeWidth="4" className="stroke-muted/20" />
                    <circle
                      cx="24" cy="24" r="18" fill="none" strokeWidth="4"
                      strokeDasharray={`${(prop.investment_score / 100) * 113} 113`}
                      strokeLinecap="round"
                      className={prop.investment_score >= 70 ? 'stroke-chart-1' : prop.investment_score >= 45 ? 'stroke-primary' : 'stroke-chart-4'}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{prop.investment_score}</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Score</p>
              </div>

              {[
                { label: 'Market Value', value: fmtShort(prop.price) },
                { label: 'Rental Yield', value: `${prop.rental_yield?.toFixed(1)}%` },
                { label: 'Growth', value: `${prop.annual_growth_rate > 0 ? '+' : ''}${prop.annual_growth_rate?.toFixed(1)}%` },
                { label: 'ROI 5Y', value: `${prop.roi_5y > 0 ? '+' : ''}${prop.roi_5y?.toFixed(1)}%` },
              ].map(m => (
                <div key={m.label} className="text-center p-1.5 rounded-lg bg-muted/15">
                  <p className="text-xs font-bold font-mono text-foreground">{m.value}</p>
                  <p className="text-[9px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Demand + Appreciation Row */}
            <div className="flex items-center justify-between text-[11px] border-t border-border/20 pt-2">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Flame className="h-3 w-3" /> Demand: <span className={cn('font-medium', demandColor)}>{demandLabel} ({prop.demand_heat_score})</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> 5Y: <span className="font-medium text-foreground">{fmtShort(prop.projected_value_5y)}</span>
              </span>
            </div>
          </div>

          {/* AI Insight Toggle */}
          <div className="border-t border-border/20">
            <button
              onClick={(e) => { e.stopPropagation(); setShowInsight(!showInsight); }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Brain className="h-3 w-3" /> AI Strategic Insight
              {showInsight ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <AnimatePresence>
            {showInsight && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/20 bg-primary/5"
              >
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{generateInsight(prop)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Allocation Chart ──
function AllocationChart({ data, title, icon: Icon }: { data: { name: string; value: number }[]; title: string; icon: React.ElementType }) {
  if (data.length === 0) return null;
  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
          <Icon className="h-3.5 w-3.5" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30} strokeWidth={2} stroke="hsl(var(--background))">
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip
              formatter={(v: number) => [fmtIDR(v), 'Value']}
              contentStyle={{ backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              {d.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──
const PortfolioCommandCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: portfolio, isLoading } = usePortfolioManager();
  const { data: strategy } = usePortfolioStrategy();
  const [sortBy, setSortBy] = useState<SortKey>('score');

  const p = portfolio as PortfolioData | undefined;
  const props = p?.properties || [];

  // ── Computed intelligence ──
  const valueTrend = useMemo(() => p ? computePortfolioValueTrend(p) : null, [p]);
  const yieldSignal = useMemo(() => computeRentalYieldSignal(props), [props]);
  const growthMomentum = useMemo(() => computeCapitalGrowthMomentum(props), [props]);

  // ── Unrealized gain/loss ──
  const totalInvested = p?.portfolio_value || 0;
  const projected5Y = p?.projected_value_5y || 0;
  const unrealizedGain = projected5Y - totalInvested;
  const unrealizedPct = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

  // ── Confidence score ──
  const confidenceScore = useMemo(() => {
    if (!props.length) return 0;
    const avgScore = props.reduce((s, p) => s + (p.investment_score || 0), 0) / props.length;
    const diversification = !p?.geo_concentration && !p?.type_concentration ? 15 : 0;
    return Math.min(99, Math.round(avgScore * 0.7 + diversification + (props.length >= 3 ? 10 : 0)));
  }, [props, p]);

  // ── Risk distribution ──
  const riskDistribution = useMemo(() => {
    const dist = { Low: 0, Medium: 0, High: 0 };
    props.forEach(prop => { dist[classifyRisk(prop).level]++; });
    return Object.entries(dist).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [props]);

  // ── Allocation by city ──
  const cityAllocation = useMemo(() => {
    const map: Record<string, number> = {};
    props.forEach(prop => { map[prop.city || 'Unknown'] = (map[prop.city || 'Unknown'] || 0) + prop.price; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [props]);

  // ── Allocation by type ──
  const typeAllocation = useMemo(() => {
    const map: Record<string, number> = {};
    props.forEach(prop => { map[prop.property_type || 'Other'] = (map[prop.property_type || 'Other'] || 0) + prop.price; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [props]);

  // ── Sorted properties ──
  const sortedProps = useMemo(() => {
    return [...props].sort((a, b) => {
      switch (sortBy) {
        case 'roi': return (b.roi_5y || 0) - (a.roi_5y || 0);
        case 'appreciation': return (b.projected_value_5y || 0) - (a.projected_value_5y || 0);
        case 'risk': return classifyRisk(b).score - classifyRisk(a).score;
        default: return (b.investment_score || 0) - (a.investment_score || 0);
      }
    });
  }, [props, sortBy]);

  // ── Portfolio forecast ──
  const forecast6m = totalInvested > 0 ? totalInvested * (1 + (p?.average_roi || 0) / 100 / 10) : 0; // ~6mo extrapolation
  const forecast12m = totalInvested > 0 ? totalInvested * (1 + (p?.average_roi || 0) / 100 / 5) : 0;
  const volatility = p?.avg_investment_score ? (p.avg_investment_score >= 65 ? 'Low' : p.avg_investment_score >= 45 ? 'Moderate' : 'High') : 'Unknown';

  // ── AI Recommendations ──
  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (p?.geo_concentration) recs.push('Pertimbangkan diversifikasi geografis — portfolio terlalu terkonsentrasi di satu kota. Ekspansi ke high-growth zones baru dapat mengurangi risiko.');
    if (p?.type_concentration) recs.push('Diversifikasi tipe properti disarankan untuk mengurangi exposure risiko pada satu segmen pasar.');
    if (yieldSignal.signal === 'WEAK_YIELD') recs.push('Rata-rata yield sewa di bawah benchmark. Evaluasi strategi pricing sewa atau pertimbangkan renovasi untuk meningkatkan return.');
    if (growthMomentum.momentum === 'STALLING') recs.push('Momentum pertumbuhan melambat. Pertimbangkan realokasi ke emerging micro-markets dengan growth trajectory lebih kuat.');
    if (props.length < 3) recs.push('Portfolio masih terlalu kecil untuk diversifikasi optimal. Target minimal 3-5 properti untuk risk management yang lebih baik.');
    if (recs.length === 0) recs.push('Portfolio dalam kondisi solid. Pertahankan strategi saat ini dan pantau market heat signals untuk timing akuisisi selanjutnya.');
    return recs;
  }, [p, yieldSignal, growthMomentum, props]);

  // ── Strategy signal styling ──
  const strategySignalConfig: Record<string, { color: string; label: string }> = {
    OPTIMAL: { color: 'text-chart-1', label: 'Optimal' },
    STABLE: { color: 'text-primary', label: 'Stable' },
    DIVERSIFY: { color: 'text-chart-4', label: 'Diversify' },
    GROWTH_GAP: { color: 'text-chart-4', label: 'Growth Gap' },
    CRITICAL_REBALANCE: { color: 'text-destructive', label: 'Rebalance Needed' },
    NO_PORTFOLIO: { color: 'text-muted-foreground', label: 'No Portfolio' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ═══ Header ═══ */}
        <motion.div {...fadeIn(0)} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 backdrop-blur-sm shadow-lg shadow-primary/5">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Portfolio Command Center</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered portfolio intelligence & strategic advisory
                {strategy && (
                  <Badge variant="outline" className={cn("ml-2 text-[10px]", strategySignalConfig[strategy.strategy_signal]?.color)}>
                    {strategySignalConfig[strategy.strategy_signal]?.label || strategy.strategy_signal}
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/investor-dashboard')} className="gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" /> Investor Hub
            </Button>
            <Button size="sm" onClick={() => navigate('/deal-finder')} className="gap-1.5 text-xs">
              <Target className="h-3.5 w-3.5" /> Find Deals
            </Button>
          </div>
        </motion.div>

        {/* ═══ KPI Strip ═══ */}
        <motion.div {...fadeIn(0.05)}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: 'Portfolio Value', value: fmtShort(totalInvested),
                icon: DollarSign, sub: `${p?.total_properties || 0} properties`,
                accent: 'text-primary',
              },
              {
                label: 'Unrealized Gain/Loss',
                value: `${unrealizedGain >= 0 ? '+' : ''}${fmtShort(unrealizedGain)}`,
                icon: unrealizedGain >= 0 ? ArrowUpRight : ArrowDownRight,
                sub: `${unrealizedPct >= 0 ? '+' : ''}${unrealizedPct.toFixed(1)}%`,
                accent: unrealizedGain >= 0 ? 'text-chart-1' : 'text-destructive',
              },
              {
                label: 'Projected ROI',
                value: `${(p?.average_roi || 0).toFixed(1)}%`,
                icon: TrendingUp, sub: '5-year blended',
                accent: (p?.average_roi || 0) > 0 ? 'text-chart-1' : 'text-destructive',
              },
              {
                label: 'Avg Opp. Score',
                value: `${p?.avg_investment_score || 0}`,
                icon: Target, sub: '/100',
                accent: (p?.avg_investment_score || 0) >= 65 ? 'text-chart-1' : 'text-foreground',
              },
              {
                label: 'Confidence',
                value: `${confidenceScore}%`,
                icon: Activity, sub: valueTrend ? `${valueTrend.trend_emoji} ${valueTrend.trend}` : '—',
                accent: confidenceScore >= 65 ? 'text-chart-1' : confidenceScore >= 40 ? 'text-chart-4' : 'text-destructive',
              },
            ].map((kpi, i) => (
              <Card key={i} className="group bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                      <kpi.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider">{kpi.label}</span>
                  </div>
                  <p className={cn("text-2xl font-black tracking-tight", kpi.accent)}>{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ═══ Forecast + Recommendations Row ═══ */}
        <motion.div {...fadeIn(0.1)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Forecast Intelligence */}
            <Card className="bg-card/60 backdrop-blur-xl border-border/50 lg:col-span-1">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" /> Portfolio Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/20 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">6 Month</p>
                    <p className="text-lg font-bold font-mono text-foreground">{fmtShort(forecast6m)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">12 Month</p>
                    <p className="text-lg font-bold font-mono text-foreground">{fmtShort(forecast12m)}</p>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence Level</span>
                    <span className={cn("font-semibold", confidenceScore >= 60 ? 'text-chart-1' : 'text-chart-4')}>{confidenceScore}%</span>
                  </div>
                  <Progress value={confidenceScore} className="h-1.5" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Volatility Outlook</span>
                    <Badge variant="outline" className={cn("text-[10px]",
                      volatility === 'Low' ? 'text-chart-1 border-chart-1/30' :
                      volatility === 'Moderate' ? 'text-chart-4 border-chart-4/30' :
                      'text-destructive border-destructive/30'
                    )}>
                      {volatility}
                    </Badge>
                  </div>

                  {valueTrend && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Growth Trend</span>
                      <span className="font-medium text-foreground">{valueTrend.trend_emoji} {valueTrend.annualized_rate}%/yr</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation Engine */}
            <Card className="bg-card/60 backdrop-blur-xl border-border/50 lg:col-span-2">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <Brain className="h-4 w-4 text-primary" /> AI Recommendation Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2.5">
                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/15 border border-border/20"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec}</p>
                    </motion.div>
                  ))}

                  {strategy?.diversification_insight && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{strategy.diversification_insight}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ═══ Allocation Charts ═══ */}
        <motion.div {...fadeIn(0.15)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AllocationChart data={cityAllocation} title="By City" icon={MapPin} />
            <AllocationChart data={typeAllocation} title="By Property Type" icon={Home} />
            <AllocationChart data={riskDistribution} title="Risk Distribution" icon={Shield} />
          </div>
        </motion.div>

        {/* ═══ Property Performance Breakdown ═══ */}
        <motion.div {...fadeIn(0.2)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Property Performance</h2>
                <p className="text-[10px] text-muted-foreground">{sortedProps.length} assets tracked</p>
              </div>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SortAsc className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {sortedProps.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
              <CardContent className="py-16 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No properties in portfolio yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add properties to start tracking portfolio performance</p>
                <Button size="sm" className="mt-4 gap-1.5" onClick={() => navigate('/deal-finder')}>
                  <Target className="h-3.5 w-3.5" /> Discover Deals
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedProps.map(prop => (
                <PropertyCard key={prop.id} prop={prop} onClick={() => navigate(`/property/${prop.id}`)} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══ Smart Alert Zone ═══ */}
        <motion.div {...fadeIn(0.25)}>
          <Card className="bg-card/60 backdrop-blur-xl border-border/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-4 w-4 text-chart-4" /> Smart Alert Triggers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Score Drop Alert',
                    desc: 'Triggers when any asset opportunity score drops >10 points',
                    active: props.some(p => (p.investment_score || 0) < 40),
                    icon: TrendingDown,
                  },
                  {
                    label: 'Market Heat Shift',
                    desc: 'Monitors weakening demand clusters in your portfolio zones',
                    active: props.some(p => (p.demand_heat_score || 0) < 30),
                    icon: Flame,
                  },
                  {
                    label: 'Elite Match Alert',
                    desc: 'Notifies when new 85+ score listings match your investment DNA',
                    active: true,
                    icon: Sparkles,
                  },
                  {
                    label: 'Risk Escalation',
                    desc: 'Alerts when any asset risk classification increases',
                    active: props.some(p => classifyRisk(p).level === 'High'),
                    icon: Shield,
                  },
                ].map((alert, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border transition-all",
                    alert.active ? "bg-chart-4/5 border-chart-4/20" : "bg-muted/10 border-border/20"
                  )}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <alert.icon className={cn("h-3.5 w-3.5", alert.active ? "text-chart-4" : "text-muted-foreground")} />
                      <span className="text-xs font-semibold text-foreground">{alert.label}</span>
                      <div className={cn("w-2 h-2 rounded-full ml-auto", alert.active ? "bg-chart-4 animate-pulse" : "bg-muted-foreground/30")} />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{alert.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioCommandCenter;
