import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import { useInvestmentReport } from '@/hooks/useInvestmentReport';
import { useInvestmentScoreV2 } from '@/hooks/useInvestmentScoreV2';
import { useROIForecast } from '@/hooks/useROIForecast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Shield, AlertTriangle,
  BarChart3, Target, Zap, DollarSign, Building, MapPin,
  Activity, Eye, Scale, Droplets, RefreshCw, Sparkles, FileText,
  Download, Printer, ChevronRight, Gauge, CircleDollarSign,
  LineChart as LineChartIcon, PieChart as PieChartIcon,
  ThermometerSun, ArrowUpRight, ArrowDownRight, Clock, Star,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtIDR(v: number) {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  B: 'bg-primary/15 text-primary border-primary/30',
  C: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  D: 'bg-destructive/15 text-destructive border-destructive/30',
};

const RISK_CONFIG = {
  low: { label: 'Low Risk', color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/30', icon: Shield, barColor: 'hsl(var(--chart-2))' },
  medium: { label: 'Medium Risk', color: 'text-chart-4', bg: 'bg-chart-4/10 border-chart-4/30', icon: AlertTriangle, barColor: 'hsl(var(--chart-4))' },
  high: { label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: AlertTriangle, barColor: 'hsl(var(--destructive))' },
};

const TREND_CONFIG = {
  undervalued: { label: 'Undervalued', color: 'text-chart-2', icon: TrendingDown },
  fair_value: { label: 'Fair Value', color: 'text-primary', icon: Minus },
  premium: { label: 'Premium', color: 'text-chart-4', icon: TrendingUp },
};

const SCENARIO_MULTIPLIERS = {
  bull: { label: 'Bull', growth: 1.5, yield: 1.2, color: 'hsl(var(--chart-2))', desc: 'Strong market, high demand' },
  base: { label: 'Base', growth: 1.0, yield: 1.0, color: 'hsl(var(--primary))', desc: 'Expected market conditions' },
  bear: { label: 'Bear', growth: 0.4, yield: 0.7, color: 'hsl(var(--destructive))', desc: 'Weak market, reduced demand' },
};

// ─── Score Bar Component ─────────────────────────────────────────────────────

function ScoreBar({ label, score, max, icon: Icon }: { label: string; score: number; max: number; icon: React.ElementType }) {
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="font-semibold text-foreground">{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', pct >= 70 ? 'bg-chart-2' : pct >= 40 ? 'bg-chart-4' : 'bg-destructive')}
        />
      </div>
    </div>
  );
}

// ─── ROI Trend Chart ─────────────────────────────────────────────────────────

function ROITrendChart({ projections }: { projections: { year: number; roi_percent: number; predicted_value: number; cumulative_rental: number; total_return: number }[] }) {
  if (!projections?.length) return <p className="text-xs text-muted-foreground text-center py-8">No projection data available</p>;

  const chartData = projections.map(p => ({
    name: `Year ${p.year}`,
    roi: Number(p.roi_percent.toFixed(1)),
    value: p.predicted_value,
    rental: p.cumulative_rental,
    total: p.total_return,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'hsl(var(--popover-foreground))',
          }}
          formatter={(value: number, name: string) => {
            if (name === 'roi') return [`${value}%`, 'ROI'];
            return [fmtIDR(value), name === 'value' ? 'Property Value' : name === 'rental' ? 'Cum. Rental' : 'Total Return'];
          }}
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Area type="monotone" dataKey="roi" stroke="hsl(var(--chart-2))" fill="url(#roiGrad)" name="ROI %" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Scenario Comparison Chart ───────────────────────────────────────────────

function ScenarioComparisonChart({ projections, growthRate, rentalYield }: {
  projections: { year: number; predicted_value: number; roi_percent: number }[];
  growthRate: number; rentalYield: number;
}) {
  if (!projections?.length) return null;

  const scenarioData = projections.map(p => {
    const baseROI = p.roi_percent;
    return {
      name: `Yr ${p.year}`,
      bull: Number((baseROI * SCENARIO_MULTIPLIERS.bull.growth + (rentalYield * SCENARIO_MULTIPLIERS.bull.yield * p.year)).toFixed(1)),
      base: Number(baseROI.toFixed(1)),
      bear: Number((baseROI * SCENARIO_MULTIPLIERS.bear.growth + (rentalYield * SCENARIO_MULTIPLIERS.bear.yield * p.year * 0.5)).toFixed(1)),
    };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-[10px]">
        {Object.entries(SCENARIO_MULTIPLIERS).map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}: {s.desc}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={scenarioData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '11px',
              color: 'hsl(var(--popover-foreground))',
            }}
            formatter={(value: number, name: string) => [`${value}%`, `${name.charAt(0).toUpperCase() + name.slice(1)} Scenario`]}
          />
          <Bar dataKey="bull" fill={SCENARIO_MULTIPLIERS.bull.color} radius={[3, 3, 0, 0]} name="Bull" />
          <Bar dataKey="base" fill={SCENARIO_MULTIPLIERS.base.color} radius={[3, 3, 0, 0]} name="Base" />
          <Bar dataKey="bear" fill={SCENARIO_MULTIPLIERS.bear.color} radius={[3, 3, 0, 0]} name="Bear" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Radar Score Chart ───────────────────────────────────────────────────────

function OpportunityRadarChart({ breakdown }: { breakdown: any }) {
  if (!breakdown) return null;
  const data = [
    { dimension: 'Demand', value: breakdown.location_demand?.score || 0, max: breakdown.location_demand?.max || 25 },
    { dimension: 'Fairness', value: breakdown.price_fairness?.score || 0, max: breakdown.price_fairness?.max || 25 },
    { dimension: 'Yield', value: breakdown.rental_yield?.score || 0, max: breakdown.rental_yield?.max || 20 },
    { dimension: 'Growth', value: breakdown.market_growth?.score || 0, max: breakdown.market_growth?.max || 15 },
    { dimension: 'Liquidity', value: breakdown.liquidity?.score || 0, max: breakdown.liquidity?.max || 15 },
  ].map(d => ({ ...d, pct: Math.round((d.value / d.max) * 100) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="Score" dataKey="pct" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Liquidity Gauge ─────────────────────────────────────────────────────────

function LiquidityGauge({ ratio, listings }: { ratio: number; listings: number }) {
  const score = Math.min(100, Math.max(0, ratio > 1 ? Math.min(100, ratio * 40) : ratio * 60));
  const level = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low';
  const levelColor = score >= 70 ? 'text-chart-2' : score >= 40 ? 'text-chart-4' : 'text-destructive';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Liquidity Score</p>
          <p className="text-[10px] text-muted-foreground">Market absorption & demand signal</p>
        </div>
        <Badge variant="outline" className={cn('text-xs', levelColor)}>{level}</Badge>
      </div>
      <div className="relative w-full h-3 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full', score >= 70 ? 'bg-chart-2' : score >= 40 ? 'bg-chart-4' : 'bg-destructive')}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-muted/20 text-center">
          <p className="text-muted-foreground">Score</p>
          <p className="font-bold text-foreground">{score.toFixed(0)}/100</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 text-center">
          <p className="text-muted-foreground">Supply/Demand</p>
          <p className="font-bold text-foreground">{ratio.toFixed(2)}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 text-center">
          <p className="text-muted-foreground">Comparables</p>
          <p className="font-bold text-foreground">{listings}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Buy vs Rent Card ────────────────────────────────────────────────────────

function BuyVsRentCard({ price, monthlyRent }: { price: number; monthlyRent: number }) {
  const rate = 8.5 / 100 / 12;
  const months = 20 * 12;
  const dp = price * 0.2;
  const loanAmt = price - dp;
  const monthlyMortgage = loanAmt * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  const totalBuyCost5yr = dp + monthlyMortgage * 60;
  const totalRentCost5yr = monthlyRent * 60;
  const netPosition = totalRentCost5yr - totalBuyCost5yr;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Buy Scenario</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Down Payment (20%)</span><span className="font-medium text-foreground">{fmtIDR(dp)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Monthly Mortgage</span><span className="font-medium text-foreground">{fmtIDR(monthlyMortgage)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">5-Year Total</span><span className="font-bold text-foreground">{fmtIDR(totalBuyCost5yr)}</span></div>
        </div>
      </div>
      <div className="rounded-xl bg-chart-4/5 border border-chart-4/20 p-4 space-y-2">
        <p className="text-[10px] font-semibold text-chart-4 uppercase tracking-wider">Rent Scenario</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Monthly Rent</span><span className="font-medium text-foreground">{fmtIDR(monthlyRent)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">5-Year Total</span><span className="font-bold text-foreground">{fmtIDR(totalRentCost5yr)}</span></div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Net Position</span>
            <span className={cn('font-bold', netPosition > 0 ? 'text-chart-2' : 'text-destructive')}>
              {netPosition > 0 ? '+' : ''}{fmtIDR(Math.abs(netPosition))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function useExportPDF() {
  const [exporting, setExporting] = useState(false);

  const exportPDF = useCallback(async (elementId: string, filename: string) => {
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Report element not found');

      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      } as any).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportPDF, exporting };
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function InvestmentReportPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { exportPDF, exporting } = useExportPDF();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: report, isLoading: loadingReport } = useInvestmentReport(propertyId);
  const { data: scoreV2, isLoading: loadingScore } = useInvestmentScoreV2(propertyId);
  const { forecast, isLoadingStored: loadingForecast, isCalculating, calculate } = useROIForecast(propertyId || '');

  const isLoading = loadingReport || loadingScore || loadingForecast;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-56" /><Skeleton className="h-56" />
          <Skeleton className="h-56" /><Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  if (!report && !scoreV2) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl text-center space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-semibold text-foreground">Property Not Found</h2>
        <p className="text-sm text-muted-foreground">Unable to generate investment report for this property.</p>
        <Button variant="outline" onClick={() => navigate('/investment-report')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Reports
        </Button>
      </div>
    );
  }

  const title = scoreV2?.title || report?.title || 'Property';
  const city = scoreV2?.city || report?.city || '';
  const price = scoreV2?.price || report?.price || 0;
  const propertyType = scoreV2?.property_type || report?.property_type || '';
  const grade = scoreV2?.grade || '';
  const recommendation = scoreV2?.recommendation || '';
  const investmentScore = scoreV2?.investment_score ?? report?.investment_score ?? 0;
  const breakdown = scoreV2?.breakdown;

  const risk = forecast?.market_risk || 'medium';
  const riskCfg = RISK_CONFIG[risk];
  const RiskIcon = riskCfg.icon;
  const confidence = forecast?.confidence_score ?? 0;

  const rentalYield = forecast?.rental_yield ?? report?.estimated_rental_yield ?? 0;
  const monthlyRent = breakdown?.rental_yield?.monthly_rent ?? 0;
  const annualRent = breakdown?.rental_yield?.annual_rent ?? (monthlyRent * 12);
  const capRate = report?.estimated_cap_rate ?? 0;

  const growthRate = breakdown?.market_growth?.growth_rate_percent ?? forecast?.price_growth_forecast ?? 0;
  const priceVsMarket = report?.price_vs_market ?? 0;
  const marketTrend = report?.market_trend;
  const trendCfg = marketTrend ? TREND_CONFIG[marketTrend] : null;
  const TrendIcon = trendCfg?.icon || Minus;

  const supplyDemandRatio = breakdown?.liquidity?.supply_demand_ratio ?? 0;
  const similarListings = breakdown?.liquidity?.similar_active_listings ?? report?.similar_properties_count ?? 0;

  const projections = forecast?.forecast_data?.projections || [];
  const expectedROI = forecast?.expected_roi ?? 0;
  const reportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => exportPDF('investment-report-content', `ASTRA-Report-${title.slice(0, 30)}`)} disabled={exporting}>
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div id="investment-report-content" className="space-y-6">
        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-border/50">
            <div className="bg-gradient-to-br from-primary/8 via-primary/3 to-transparent p-6">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                <Star className="h-3 w-3 text-primary" />
                <span>ASTRA Villa Investment Performance Report</span>
                <span className="mx-1">•</span>
                <span>{reportDate}</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[9px]"><MapPin className="h-3 w-3 mr-0.5" />{city}</Badge>
                    <Badge variant="secondary" className="text-[9px]"><Building className="h-3 w-3 mr-0.5" />{propertyType}</Badge>
                  </div>
                  <h1 className="text-xl font-bold text-foreground">{title}</h1>
                  <p className="text-2xl font-bold text-primary">{formatPrice(price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {grade && (
                    <div className={cn('rounded-xl border px-5 py-3 text-center', GRADE_COLORS[grade[0]] || GRADE_COLORS['C'])}>
                      <p className="text-3xl font-black">{grade}</p>
                      <p className="text-[9px] font-medium uppercase">Grade</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-border/50 bg-muted/20 px-5 py-3 text-center">
                    <p className="text-3xl font-black text-primary">{investmentScore}</p>
                    <p className="text-[9px] font-medium text-muted-foreground uppercase">Score</p>
                  </div>
                </div>
              </div>
              {recommendation && (
                <div className="mt-4 rounded-lg bg-background/60 backdrop-blur border border-primary/20 p-3">
                  <p className="text-xs flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{recommendation}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Quick KPIs */}
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Expected ROI', value: `${expectedROI.toFixed(1)}%`, icon: TrendingUp, positive: expectedROI >= 0 },
                  { label: 'Rental Yield', value: `${rentalYield.toFixed(2)}%`, icon: CircleDollarSign, positive: rentalYield > 4 },
                  { label: 'Growth Rate', value: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`, icon: Activity, positive: growthRate >= 0 },
                  { label: 'Cap Rate', value: `${capRate.toFixed(2)}%`, icon: Target, positive: capRate > 5 },
                  { label: 'Risk Level', value: riskCfg.label.replace(' Risk', ''), icon: Shield, positive: risk === 'low' },
                ].map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'p-3 rounded-lg border text-center',
                      kpi.positive ? 'bg-chart-2/5 border-chart-2/20' : 'bg-muted/20 border-border/30'
                    )}
                  >
                    <kpi.icon className={cn('h-4 w-4 mx-auto mb-1', kpi.positive ? 'text-chart-2' : 'text-muted-foreground')} />
                    <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                    <p className={cn('text-sm font-bold', kpi.positive ? 'text-chart-2' : 'text-foreground')}>{kpi.value}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Projected Returns
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-xs gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Risk Insights
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="text-xs gap-1.5">
              <LineChartIcon className="h-3.5 w-3.5" /> Scenarios
            </TabsTrigger>
          </TabsList>

          {/* ─── Projected Returns Tab ─── */}
          <TabsContent value="overview" className="mt-5 space-y-4">
            <div className="grid lg:grid-cols-5 gap-4">
              {/* Capital Appreciation Chart */}
              <Card className="lg:col-span-3 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-chart-2" /> Capital Appreciation Forecast
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Projected ROI over investment horizon</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => calculate()} disabled={isCalculating}>
                      <RefreshCw className={cn('h-3 w-3', isCalculating && 'animate-spin')} />
                      {isCalculating ? 'Calculating...' : 'Refresh'}
                    </Button>
                  </div>
                  <ROITrendChart projections={projections} />
                </CardContent>
              </Card>

              {/* Rental Yield Panel */}
              <Card className="lg:col-span-2 border-border/50">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-chart-2" /> Rental Yield Estimate
                  </h3>

                  <div className="text-center py-3">
                    <motion.p
                      key={rentalYield}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="text-4xl font-black text-primary"
                    >
                      {rentalYield.toFixed(2)}%
                    </motion.p>
                    <p className="text-[10px] text-muted-foreground">Gross Rental Yield p.a.</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    {monthlyRent > 0 && (
                      <>
                        <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                          <span className="text-muted-foreground">Monthly Rent</span>
                          <span className="font-semibold text-foreground">{fmtIDR(monthlyRent)}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                          <span className="text-muted-foreground">Annual Income</span>
                          <span className="font-semibold text-foreground">{fmtIDR(annualRent)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                      <span className="text-muted-foreground">Cap Rate</span>
                      <span className="font-semibold text-foreground">{capRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                      <span className="text-muted-foreground">vs Market Avg</span>
                      <span className={cn('font-semibold', priceVsMarket < 0 ? 'text-chart-2' : priceVsMarket > 10 ? 'text-chart-4' : 'text-foreground')}>
                        {priceVsMarket > 0 ? '+' : ''}{priceVsMarket}%
                      </span>
                    </div>
                  </div>

                  {/* Market Trend */}
                  {trendCfg && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                      <span className="text-xs text-muted-foreground">Market Position</span>
                      <span className={cn('text-xs font-semibold flex items-center gap-1', trendCfg.color)}>
                        <TrendIcon className="h-3.5 w-3.5" /> {trendCfg.label}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Buy vs Rent */}
            {price > 0 && monthlyRent > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Scale className="h-4 w-4 text-primary" /> Buy vs Rent Analysis (5 Year)
                  </h3>
                  <BuyVsRentCard price={price} monthlyRent={monthlyRent} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── Risk Insights Tab ─── */}
          <TabsContent value="risk" className="mt-5 space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Liquidity Score */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <LiquidityGauge ratio={supplyDemandRatio} listings={similarListings} />
                </CardContent>
              </Card>

              {/* Risk Classification */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> Risk Classification
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn('text-sm px-4 py-1.5', riskCfg.bg, riskCfg.color)}>
                      <RiskIcon className="h-4 w-4 mr-1.5" /> {riskCfg.label}
                    </Badge>
                    {forecast?.comparable_count != null && (
                      <span className="text-[10px] text-muted-foreground">{forecast.comparable_count} comparables analyzed</span>
                    )}
                  </div>
                  {confidence > 0 && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Analysis Confidence</span>
                        <span className="font-bold text-foreground">{(confidence * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={confidence * 100} className="h-2" />
                    </div>
                  )}

                  {/* Market Stability Signals */}
                  <Separator className="my-2" />
                  <p className="text-xs font-medium text-foreground">Market Demand Stability</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Price Volatility', value: priceVsMarket, signal: Math.abs(priceVsMarket) < 10 ? 'Stable' : 'Volatile' },
                      { label: 'Supply Pressure', value: supplyDemandRatio, signal: supplyDemandRatio > 0.8 ? 'Healthy' : 'Oversupplied' },
                      { label: 'Growth Momentum', value: growthRate, signal: growthRate > 3 ? 'Strong' : growthRate > 0 ? 'Moderate' : 'Weak' },
                    ].map(sig => (
                      <div key={sig.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/15">
                        <span className="text-muted-foreground">{sig.label}</span>
                        <Badge variant="outline" className={cn(
                          'text-[9px]',
                          sig.signal === 'Stable' || sig.signal === 'Healthy' || sig.signal === 'Strong'
                            ? 'text-chart-2 border-chart-2/30'
                            : sig.signal === 'Moderate'
                            ? 'text-chart-4 border-chart-4/30'
                            : 'text-destructive border-destructive/30'
                        )}>
                          {sig.signal}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opportunity Breakdown */}
            {breakdown && (
              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" /> Opportunity Score Breakdown
                    </h3>
                    <div className="space-y-3">
                      <ScoreBar label="Location Demand" score={breakdown.location_demand.score} max={breakdown.location_demand.max} icon={Eye} />
                      <ScoreBar label="Price Fairness" score={breakdown.price_fairness.score} max={breakdown.price_fairness.max} icon={Scale} />
                      <ScoreBar label="Rental Yield" score={breakdown.rental_yield.score} max={breakdown.rental_yield.max} icon={DollarSign} />
                      <ScoreBar label="Market Growth" score={breakdown.market_growth.score} max={breakdown.market_growth.max} icon={TrendingUp} />
                      <ScoreBar label="Liquidity" score={breakdown.liquidity.score} max={breakdown.liquidity.max} icon={Droplets} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <PieChartIcon className="h-4 w-4 text-primary" /> Score Radar
                    </h3>
                    <OpportunityRadarChart breakdown={breakdown} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ─── Scenarios Tab ─── */}
          <TabsContent value="scenarios" className="mt-5 space-y-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
                  <LineChartIcon className="h-4 w-4 text-primary" /> Scenario Comparison
                </h3>
                <p className="text-[10px] text-muted-foreground mb-4">
                  Projected ROI under Bull, Base, and Bear market conditions
                </p>
                <ScenarioComparisonChart projections={projections} growthRate={growthRate} rentalYield={rentalYield} />
              </CardContent>
            </Card>

            {/* Scenario Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.entries(SCENARIO_MULTIPLIERS).map(([key, s]) => {
                const lastProj = projections[projections.length - 1];
                const baseROI = lastProj?.roi_percent ?? 0;
                const years = lastProj?.year ?? 5;
                const scenarioROI = key === 'bull'
                  ? baseROI * s.growth + rentalYield * s.yield * years
                  : key === 'bear'
                  ? baseROI * s.growth + rentalYield * s.yield * years * 0.5
                  : baseROI;

                return (
                  <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-border/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                          {key === 'bull' ? <ArrowUpRight className="h-4 w-4" style={{ color: s.color }} /> :
                           key === 'bear' ? <ArrowDownRight className="h-4 w-4" style={{ color: s.color }} /> :
                           <Minus className="h-4 w-4" style={{ color: s.color }} />}
                        </div>
                        <p className="text-xs font-semibold text-foreground">{s.label} Case</p>
                        <p className="text-2xl font-black mt-1" style={{ color: s.color }}>
                          {scenarioROI.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
                        <p className="text-[9px] text-muted-foreground mt-2">{years}-year projected ROI</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Investment Timeline */}
            {projections.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" /> Year-by-Year Projection
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/30">
                          <th className="text-left py-2 text-muted-foreground font-medium">Year</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Property Value</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Cum. Rental</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">Total Return</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projections.map(p => (
                          <tr key={p.year} className="border-b border-border/10 hover:bg-muted/10">
                            <td className="py-2 font-medium text-foreground">Year {p.year}</td>
                            <td className="py-2 text-right text-foreground">{fmtIDR(p.predicted_value)}</td>
                            <td className="py-2 text-right text-foreground">{fmtIDR(p.cumulative_rental)}</td>
                            <td className="py-2 text-right text-foreground">{fmtIDR(p.total_return)}</td>
                            <td className={cn('py-2 text-right font-bold', p.roi_percent >= 0 ? 'text-chart-2' : 'text-destructive')}>
                              {p.roi_percent.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Footer */}
        <div className="text-center text-[9px] text-muted-foreground pt-4 border-t border-border/30 space-y-1">
          <p>Generated by ASTRA Villa Investment Intelligence Engine • {reportDate}</p>
          <p>*Projections are estimates based on historical data and market models. Actual results may vary.</p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-center gap-3 pt-2 print:hidden">
        <Button variant="outline" onClick={() => navigate('/investment-report')}>
          Analyze Another Property
        </Button>
        <Button variant="outline" onClick={() => navigate('/portfolio-roi-tracker')}>
          Portfolio Tracker
        </Button>
      </div>
    </div>
  );
}
