import { useParams, useNavigate } from 'react-router-dom';
import { useInvestmentReport } from '@/hooks/useInvestmentReport';
import { useInvestmentScoreV2 } from '@/hooks/useInvestmentScoreV2';
import { useROIForecast } from '@/hooks/useROIForecast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Shield, AlertTriangle,
  BarChart3, Target, Zap, DollarSign, Home, Building, MapPin,
  Activity, Eye, Scale, Droplets, RefreshCw, Sparkles, FileText,
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
  low: { label: 'Low Risk', color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/30', icon: Shield },
  medium: { label: 'Medium Risk', color: 'text-chart-4', bg: 'bg-chart-4/10 border-chart-4/30', icon: AlertTriangle },
  high: { label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: AlertTriangle },
};

const TREND_CONFIG = {
  undervalued: { label: 'Undervalued', color: 'text-chart-2', icon: TrendingDown },
  fair_value: { label: 'Fair Value', color: 'text-primary', icon: Minus },
  premium: { label: 'Premium', color: 'text-chart-4', icon: TrendingUp },
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
        <div
          className={cn('h-full rounded-full transition-all duration-700', pct >= 70 ? 'bg-chart-2' : pct >= 40 ? 'bg-chart-4' : 'bg-destructive')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Mini Projection Chart ───────────────────────────────────────────────────

function MiniProjectionChart({ projections }: { projections: { year: number; roi_percent: number }[] }) {
  if (!projections?.length) return null;
  const maxROI = Math.max(...projections.map(p => Math.abs(p.roi_percent)), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {projections.map((p) => (
        <div key={p.year} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className={cn('w-full rounded-t transition-all', p.roi_percent >= 0 ? 'bg-chart-2/70' : 'bg-destructive/70')}
            style={{ height: `${Math.max(4, (Math.abs(p.roi_percent) / maxROI) * 48)}px` }}
          />
          <span className="text-[8px] text-muted-foreground">Yr{p.year}</span>
        </div>
      ))}
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
    <Card className="bg-card/80 border-border/50">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" /> Buy vs Rent (5 Year)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
            <p className="text-[10px] font-medium text-primary uppercase">Buy</p>
            <p className="text-xs text-muted-foreground">DP (20%): <span className="text-foreground font-medium">{fmtIDR(dp)}</span></p>
            <p className="text-xs text-muted-foreground">Monthly: <span className="text-foreground font-medium">{fmtIDR(monthlyMortgage)}</span></p>
            <p className="text-xs text-muted-foreground">5yr Total: <span className="text-foreground font-semibold">{fmtIDR(totalBuyCost5yr)}</span></p>
          </div>
          <div className="rounded-lg bg-chart-4/5 border border-chart-4/20 p-3 space-y-1">
            <p className="text-[10px] font-medium text-chart-4 uppercase">Rent</p>
            <p className="text-xs text-muted-foreground">Monthly: <span className="text-foreground font-medium">{fmtIDR(monthlyRent)}</span></p>
            <p className="text-xs text-muted-foreground">5yr Total: <span className="text-foreground font-semibold">{fmtIDR(totalRentCost5yr)}</span></p>
            <p className="text-xs text-muted-foreground">Net: <span className={cn('font-semibold', netPosition > 0 ? 'text-chart-2' : 'text-destructive')}>{netPosition > 0 ? '+' : ''}{fmtIDR(Math.abs(netPosition))}</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function InvestmentReportPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const { data: report, isLoading: loadingReport } = useInvestmentReport(propertyId);
  const { data: scoreV2, isLoading: loadingScore } = useInvestmentScoreV2(propertyId);
  const { forecast, isLoadingStored: loadingForecast, isCalculating, calculate } = useROIForecast(propertyId || '');

  const isLoading = loadingReport || loadingScore || loadingForecast;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48" /><Skeleton className="h-48" />
          <Skeleton className="h-48" /><Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!report && !scoreV2) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl text-center space-y-4">
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Hero Header */}
      <div className="rounded-xl bg-card/80 backdrop-blur border border-border/50 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[9px]"><MapPin className="h-3 w-3 mr-0.5" />{city}</Badge>
              <Badge variant="secondary" className="text-[9px]"><Building className="h-3 w-3 mr-0.5" />{propertyType}</Badge>
            </div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-lg font-semibold text-primary">{formatPrice(price)}</p>
          </div>
          <div className="flex items-center gap-3">
            {grade && (
              <div className={cn('rounded-xl border px-4 py-2 text-center', GRADE_COLORS[grade[0]] || GRADE_COLORS['C'])}>
                <p className="text-2xl font-black">{grade}</p>
                <p className="text-[9px] font-medium uppercase">Grade</p>
              </div>
            )}
            <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-2 text-center">
              <p className="text-2xl font-black text-primary">{investmentScore}</p>
              <p className="text-[9px] font-medium text-muted-foreground uppercase">Score</p>
            </div>
          </div>
        </div>
        {recommendation && (
          <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{recommendation}</span>
            </p>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* ROI Projection */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-2" /> ROI Projection
              </h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => calculate()} disabled={isCalculating}>
                <RefreshCw className={cn('h-3 w-3', isCalculating && 'animate-spin')} />
                {isCalculating ? 'Calculating...' : 'Recalculate'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Expected ROI</p>
                <p className={cn('text-lg font-bold', (forecast?.expected_roi ?? 0) >= 0 ? 'text-chart-2' : 'text-destructive')}>
                  {(forecast?.expected_roi ?? 0).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Growth Forecast</p>
                <p className="text-lg font-bold text-foreground flex items-center gap-1">
                  {growthRate >= 0 ? <TrendingUp className="h-4 w-4 text-chart-2" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                  {growthRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <MiniProjectionChart projections={projections} />
          </CardContent>
        </Card>

        {/* Rental Yield */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-chart-2" /> Rental Yield
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Gross Yield</p>
                <p className="text-lg font-bold text-chart-2">{rentalYield.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Cap Rate</p>
                <p className="text-lg font-bold text-foreground">{capRate.toFixed(2)}%</p>
              </div>
            </div>
            {monthlyRent > 0 && (
              <div className="rounded-lg bg-muted/20 p-2.5 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly Rent</span><span className="font-medium text-foreground">{fmtIDR(monthlyRent)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Annual Income</span><span className="font-medium text-foreground">{fmtIDR(annualRent)}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Appreciation & Market */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Price & Market
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Growth Rate</span>
                <span className={cn('font-semibold flex items-center gap-1', growthRate >= 0 ? 'text-chart-2' : 'text-destructive')}>
                  {growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {growthRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">vs Market Avg</span>
                <span className={cn('font-semibold', priceVsMarket < 0 ? 'text-chart-2' : priceVsMarket > 10 ? 'text-chart-4' : 'text-foreground')}>
                  {priceVsMarket > 0 ? '+' : ''}{priceVsMarket}%
                </span>
              </div>
              {trendCfg && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Market Trend</span>
                  <span className={cn('font-semibold flex items-center gap-1', trendCfg.color)}>
                    <TrendIcon className="h-3 w-3" /> {trendCfg.label}
                  </span>
                </div>
              )}
              {confidence > 0 && (
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium text-foreground">{(confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={confidence * 100} className="h-1.5" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Classification */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Risk Classification
            </h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn('text-xs px-3 py-1', riskCfg.bg, riskCfg.color)}>
                <RiskIcon className="h-3.5 w-3.5 mr-1" /> {riskCfg.label}
              </Badge>
              {forecast?.comparable_count != null && (
                <span className="text-[10px] text-muted-foreground">{forecast.comparable_count} comparables used</span>
              )}
            </div>
            <div className="rounded-lg bg-muted/20 p-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supply/Demand Ratio</span>
                <span className="font-medium text-foreground">{supplyDemandRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Similar Active Listings</span>
                <span className="font-medium text-foreground">{similarListings}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Score Breakdown */}
      {breakdown && (
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Opportunity Score Breakdown
            </h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
              <ScoreBar label="Location Demand" score={breakdown.location_demand.score} max={breakdown.location_demand.max} icon={Eye} />
              <ScoreBar label="Price Fairness" score={breakdown.price_fairness.score} max={breakdown.price_fairness.max} icon={Scale} />
              <ScoreBar label="Rental Yield" score={breakdown.rental_yield.score} max={breakdown.rental_yield.max} icon={DollarSign} />
              <ScoreBar label="Market Growth" score={breakdown.market_growth.score} max={breakdown.market_growth.max} icon={TrendingUp} />
              <ScoreBar label="Liquidity" score={breakdown.liquidity.score} max={breakdown.liquidity.max} icon={Droplets} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buy vs Rent */}
      {price > 0 && monthlyRent > 0 && (
        <BuyVsRentCard price={price} monthlyRent={monthlyRent} />
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate('/investment-report')}>
          Analyze Another Property
        </Button>
      </div>
    </div>
  );
}
