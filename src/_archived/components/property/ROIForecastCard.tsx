import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Loader2,
  BarChart3, ShieldCheck, ShieldAlert, Shield, DollarSign
} from 'lucide-react';
import { useROIForecast } from '@/hooks/useROIForecast';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import { cn } from '@/lib/utils';

interface ROIForecastCardProps {
  propertyId: string;
  currentPrice: number;
}

export function ROIForecastCard({ propertyId, currentPrice }: ROIForecastCardProps) {
  const { forecast, isLoadingStored, isCalculating, calculate } = useROIForecast(propertyId);
  const formatPrice = getCurrencyFormatterShort();

  const riskConfig = {
    low: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ShieldCheck, label: 'Low Risk' },
    medium: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Shield, label: 'Medium Risk' },
    high: { color: 'text-red-500', bg: 'bg-red-500/10', icon: ShieldAlert, label: 'High Risk' },
  };

  if (isLoadingStored) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-pulse">
        <CardHeader className="pb-3"><div className="h-5 bg-muted rounded w-40" /></CardHeader>
        <CardContent><div className="h-32 bg-muted rounded" /></CardContent>
      </Card>
    );
  }

  if (!forecast) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            AI ROI Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get AI-powered investment return predictions based on comparable market data.
          </p>
          <Button onClick={() => calculate()} disabled={isCalculating} className="w-full">
            {isCalculating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
            {isCalculating ? 'Analyzing...' : 'Calculate ROI Forecast'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const risk = riskConfig[forecast.market_risk] || riskConfig.medium;
  const RiskIcon = risk.icon;
  const proj5y = forecast.forecast_data?.projections?.[4];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          AI ROI Forecast
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => calculate()} disabled={isCalculating}>
          {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Expected ROI */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Expected ROI</p>
            <p className={cn("text-xl font-bold", forecast.expected_roi >= 8 ? "text-emerald-500" : forecast.expected_roi >= 5 ? "text-primary" : "text-amber-500")}>
              {forecast.expected_roi}%
            </p>
            <p className="text-[10px] text-muted-foreground">per year</p>
          </div>

          {/* Rental Yield */}
          <div className="rounded-lg bg-accent/30 border border-border/50 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Rental Yield</p>
            <p className="text-xl font-bold text-foreground">{forecast.rental_yield}%</p>
            <p className="text-[10px] text-muted-foreground">annual</p>
          </div>

          {/* Price Growth */}
          <div className="rounded-lg bg-accent/30 border border-border/50 p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Price Growth</p>
            <div className="flex items-center justify-center gap-1">
              {forecast.price_growth_forecast > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : forecast.price_growth_forecast < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <p className="text-xl font-bold">{forecast.price_growth_forecast}%</p>
            </div>
            <p className="text-[10px] text-muted-foreground">forecast/yr</p>
          </div>

          {/* Market Risk */}
          <div className={cn("rounded-lg border p-3 text-center", risk.bg, "border-border/50")}>
            <p className="text-xs text-muted-foreground mb-1">Market Risk</p>
            <div className="flex items-center justify-center gap-1">
              <RiskIcon className={cn("h-4 w-4", risk.color)} />
              <p className={cn("text-sm font-semibold", risk.color)}>{risk.label}</p>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{forecast.confidence_score}%</span>
          </div>
          <Progress value={forecast.confidence_score} className="h-2" />
          <p className="text-[10px] text-muted-foreground text-right">
            Based on {forecast.comparable_count} comparable properties
          </p>
        </div>

        {/* 5-Year Projection */}
        {proj5y && (
          <div className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/20 border border-primary/10 p-3 space-y-2">
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              5-Year Investment Projection
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">Property Value</p>
                <p className="text-sm font-bold text-foreground">{formatPrice(proj5y.predicted_value)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Rental Income</p>
                <p className="text-sm font-bold text-emerald-500">{formatPrice(proj5y.cumulative_rental)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Total ROI</p>
                <p className="text-sm font-bold text-primary">{proj5y.roi_percent}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Rating badge */}
        <div className="flex justify-center">
          <Badge variant={forecast.expected_roi >= 10 ? "default" : forecast.expected_roi >= 7 ? "secondary" : "outline"}
            className="text-xs">
            {forecast.expected_roi >= 10 ? '🔥 Excellent Investment' : forecast.expected_roi >= 7 ? '✅ Good Investment' : forecast.expected_roi >= 4 ? '📊 Moderate' : '⚠️ Low Return'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
