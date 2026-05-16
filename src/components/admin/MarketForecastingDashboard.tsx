import React, { useState } from 'react';
import { useMarketForecast, MarketForecast } from '@/hooks/useMarketForecast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, BarChart3, Shield, Activity, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const CITIES = [
  { id: 'jakarta', label: 'Jakarta' },
  { id: 'bali', label: 'Bali' },
  { id: 'surabaya', label: 'Surabaya' },
  { id: 'bandung', label: 'Bandung' },
  { id: 'medan', label: 'Medan' },
  { id: 'makassar', label: 'Makassar' },
  { id: 'yogyakarta', label: 'Yogyakarta' },
  { id: 'semarang', label: 'Semarang' },
];

const TIMEFRAMES = [
  { id: '3m', label: '3 Months' },
  { id: '6m', label: '6 Months' },
  { id: '12m', label: '12 Months' },
  { id: '24m', label: '24 Months' },
  { id: '36m', label: '36 Months' },
];

const trendIcon = (trend: string) => {
  if (trend === 'rising' || trend === 'improving') return <TrendingUp className="h-4 w-4 text-primary" />;
  if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const severityColor = (s: string) => {
  if (s === 'high') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'medium') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const phaseColor = (phase: string) => {
  switch (phase) {
    case 'expansion': return 'bg-primary/10 text-primary';
    case 'accumulation': return 'bg-accent text-accent-foreground';
    case 'distribution': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    case 'contraction': return 'bg-destructive/10 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function MarketForecastingDashboard() {
  const [city, setCity] = useState('jakarta');
  const [timeframe, setTimeframe] = useState('12m');
  const { forecast, isLoading, error, fetchForecast } = useMarketForecast();

  const handleGenerate = () => fetchForecast(city, timeframe);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">AI Market Forecasting</h2>
          <p className="text-sm text-muted-foreground mt-1">Predictive intelligence powered by Lovable AI</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={isLoading} size="sm">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Generate
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </CardContent>
        </Card>
      )}

      {!forecast && !isLoading && !error && (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Select a city and timeframe, then click <strong>Generate</strong> to create an AI forecast.</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Generating AI forecast for <strong>{CITIES.find(c => c.id === city)?.label}</strong>…</p>
          </CardContent>
        </Card>
      )}

      {forecast && !isLoading && <ForecastResults forecast={forecast} />}
    </div>
  );
}

function ForecastResults({ forecast }: { forecast: MarketForecast }) {
  return (
    <div className="space-y-4">
      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground text-base">{forecast.city}</span>
        <Badge variant="outline" className="text-[10px]">{forecast.timeframe}</Badge>
        <span className="ml-auto font-mono">{new Date(forecast.generated_at).toLocaleString()}</span>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Price Growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              {trendIcon(forecast.price_growth_forecast.current_trend)}
              Price Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-black tabular-nums text-foreground">
              {forecast.price_growth_forecast.next_year_pct > 0 ? '+' : ''}{forecast.price_growth_forecast.next_year_pct}%
            </div>
            <div className="text-xs text-muted-foreground">
              Next quarter: {forecast.price_growth_forecast.next_quarter_pct > 0 ? '+' : ''}{forecast.price_growth_forecast.next_quarter_pct}%
            </div>
            <div className="flex items-center gap-2">
              <Progress value={forecast.price_growth_forecast.confidence} className="h-1 flex-1" />
              <span className="text-[10px] tabular-nums text-muted-foreground">{forecast.price_growth_forecast.confidence}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Rental Yield */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              {trendIcon(forecast.rental_yield_projection.trend)}
              Rental Yield
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-black tabular-nums text-foreground">
              {forecast.rental_yield_projection.projected_pct}%
            </div>
            <div className="text-xs text-muted-foreground">
              Current: {forecast.rental_yield_projection.current_avg_pct}%
            </div>
            <div className="flex items-center gap-2">
              <Progress value={forecast.rental_yield_projection.confidence} className="h-1 flex-1" />
              <span className="text-[10px] tabular-nums text-muted-foreground">{forecast.rental_yield_projection.confidence}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Liquidity Cycle */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Liquidity Cycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge className={cn("text-xs font-bold capitalize", phaseColor(forecast.liquidity_cycle.current_phase))}>
              {forecast.liquidity_cycle.current_phase}
            </Badge>
            <div className="flex items-center gap-2">
              <Progress value={forecast.liquidity_cycle.phase_strength} className="h-1 flex-1" />
              <span className="text-[10px] tabular-nums text-muted-foreground">{forecast.liquidity_cycle.phase_strength}%</span>
            </div>
            <div className="text-xs text-muted-foreground">
              ~{forecast.liquidity_cycle.months_remaining}mo → {forecast.liquidity_cycle.next_phase}
            </div>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={cn(
              "text-2xl font-black tabular-nums",
              forecast.risk_score.overall > 65 ? "text-destructive" : forecast.risk_score.overall > 40 ? "text-amber-600" : "text-primary"
            )}>
              {forecast.risk_score.overall}/100
            </div>
            <div className="flex items-center gap-2">
              <Progress value={forecast.risk_score.overall} className="h-1 flex-1" />
            </div>
            <div className="text-xs text-muted-foreground">
              {forecast.risk_score.factors.length} risk factors
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors + Opportunity Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {forecast.risk_score.factors.map((f, i) => (
              <div key={i} className={cn("rounded-lg border px-3 py-2", severityColor(f.severity))}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{f.name}</span>
                  <Badge variant="outline" className="text-[9px] uppercase">{f.severity}</Badge>
                </div>
                <p className="text-[11px] mt-1 opacity-80">{f.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Opportunity Windows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {forecast.opportunity_windows.map((o, i) => (
              <div key={i} className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{o.type}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{o.confidence}% conf</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{o.description}</p>
                <p className="text-[10px] font-medium text-primary mt-1">Window: {o.window}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Key Drivers & Seasonal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Key Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {forecast.key_drivers.map((d, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Seasonal Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{forecast.seasonal_insight}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
