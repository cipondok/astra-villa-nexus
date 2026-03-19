import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useSmartPricing, SmartPricingResult, PricingFactor } from '@/hooks/useSmartPricing';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, DollarSign,
  BarChart3, Clock, Zap, Target, AlertTriangle, CheckCircle2,
  XCircle, Loader2, Sparkles, ThermometerSun, ArrowUpRight, ArrowDownRight,
  Gauge, SlidersHorizontal, Star, Bell, Users, Activity, Eye,
  ChevronRight, Shield, Megaphone
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, ComposedChart
} from 'recharts';

const formatIDR = (v: number) => `IDR ${v.toLocaleString('id-ID')}`;
const fmt = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}jt`;
  return n.toLocaleString('id-ID');
};

const positionColors: Record<string, string> = {
  underpriced: 'text-chart-1 bg-chart-1/10 border-chart-1/30',
  fair: 'text-primary bg-primary/10 border-primary/30',
  slightly_overpriced: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30',
  overpriced: 'text-destructive bg-destructive/10 border-destructive/30',
};

const demandColors: Record<string, string> = {
  low: 'text-muted-foreground',
  moderate: 'text-yellow-600',
  high: 'text-chart-1',
  very_high: 'text-primary',
};

const trendIcons: Record<string, React.ReactNode> = {
  declining: <TrendingDown className="h-4 w-4 text-destructive" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
  rising: <TrendingUp className="h-4 w-4 text-chart-1" />,
  rapidly_rising: <TrendingUp className="h-4 w-4 text-primary" />,
};

const impactIcons: Record<string, React.ReactNode> = {
  negative: <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />,
  neutral: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
  positive: <ArrowUpRight className="h-3.5 w-3.5 text-chart-1" />,
};

// --- Simulation Engine ---
function simulatePriceImpact(
  result: SmartPricingResult,
  currentPrice: number,
  simulatedPrice: number
) {
  const fmv = result.fair_market_value;
  const ratio = simulatedPrice / fmv;

  // Competitiveness
  let competitiveness: 'PREMIUM_PRICED' | 'MARKET_ALIGNED' | 'UNDERVALUED_OPPORTUNITY';
  if (ratio > 1.1) competitiveness = 'PREMIUM_PRICED';
  else if (ratio >= 0.9) competitiveness = 'MARKET_ALIGNED';
  else competitiveness = 'UNDERVALUED_OPPORTUNITY';

  // Opportunity score: peaks at ~0.92 ratio (slight undervalue), drops for overpriced
  const baseScore = result.confidence_score;
  let opportunityScore: number;
  if (ratio <= 0.92) {
    opportunityScore = Math.min(98, baseScore + (0.92 - ratio) * 80);
  } else if (ratio <= 1.0) {
    opportunityScore = baseScore + (1.0 - ratio) * 30;
  } else {
    opportunityScore = Math.max(15, baseScore - (ratio - 1.0) * 150);
  }
  opportunityScore = Math.round(Math.max(10, Math.min(99, opportunityScore)));

  // Time to sell: base from result, adjusted by ratio
  const baseDays = result.estimated_days_on_market;
  let projectedDays: number;
  if (ratio <= 0.85) projectedDays = Math.max(7, Math.round(baseDays * 0.4));
  else if (ratio <= 0.95) projectedDays = Math.round(baseDays * 0.7);
  else if (ratio <= 1.05) projectedDays = baseDays;
  else if (ratio <= 1.15) projectedDays = Math.round(baseDays * 1.5);
  else projectedDays = Math.round(baseDays * 2.2);

  // Demand multiplier
  const demandMultiplier = ratio <= 0.95 ? 1.3 : ratio <= 1.05 ? 1.0 : 0.7;

  return {
    competitiveness,
    opportunityScore,
    projectedDays,
    demandMultiplier,
    priceVsFmv: ((ratio - 1) * 100),
  };
}

const AISmartPricingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { mutate, isPending, data: result } = useSmartPricing();

  const [form, setForm] = useState({
    title: '',
    location: '',
    property_type: 'villa',
    current_price: '',
    listing_type: 'sale',
    land_area_sqm: '',
    building_area_sqm: '',
    bedrooms: '',
    bathrooms: '',
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleAnalyze = () => {
    if (!form.location || !form.property_type || !form.current_price) {
      toast.error('Please fill location, property type, and current price');
      return;
    }
    mutate({
      title: form.title || undefined,
      location: form.location,
      property_type: form.property_type,
      current_price: Number(form.current_price),
      listing_type: form.listing_type,
      land_area_sqm: form.land_area_sqm ? Number(form.land_area_sqm) : undefined,
      building_area_sqm: form.building_area_sqm ? Number(form.building_area_sqm) : undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
    }, {
      onError: (e) => toast.error(e.message || 'Analysis failed'),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/user-dashboard">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Dynamic Pricing Engine</h1>
              <p className="text-sm text-muted-foreground">Optimize listing price for maximum sale speed & investment attractiveness</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <Card className="mb-8 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Property Details
            </CardTitle>
            <CardDescription>Enter property info for AI pricing analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" placeholder="e.g. Luxury Beachfront Villa" value={form.title} onChange={e => update('title', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" placeholder="e.g. Seminyak, Bali" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Property Type *</Label>
                <Select value={form.property_type} onValueChange={v => update('property_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['villa', 'house', 'apartment', 'land', 'commercial', 'townhouse'].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Current Price (IDR) *</Label>
                <Input id="price" type="number" placeholder="e.g. 5000000000" value={form.current_price} onChange={e => update('current_price', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Listing Type</Label>
                <Select value={form.listing_type} onValueChange={v => update('listing_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="land">Land Area (sqm)</Label>
                <Input id="land" type="number" placeholder="e.g. 500" value={form.land_area_sqm} onChange={e => update('land_area_sqm', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="building">Building Area (sqm)</Label>
                <Input id="building" type="number" placeholder="e.g. 350" value={form.building_area_sqm} onChange={e => update('building_area_sqm', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bed">Bedrooms</Label>
                <Input id="bed" type="number" placeholder="e.g. 4" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bath">Bathrooms</Label>
                <Input id="bath" type="number" placeholder="e.g. 3" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} />
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={isPending} className="mt-6 w-full sm:w-auto" size="lg">
              {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analyze Pricing</>}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && <PricingResults result={result} currentPrice={Number(form.current_price)} />}
      </div>
    </div>
  );
};

// ========== PRICE SIMULATION SLIDER ==========
const PriceSimulator: React.FC<{ result: SmartPricingResult; currentPrice: number }> = ({ result, currentPrice }) => {
  const fmv = result.fair_market_value;
  const minPrice = Math.round(fmv * 0.7);
  const maxPrice = Math.round(fmv * 1.4);
  const [simPrice, setSimPrice] = useState([currentPrice]);

  const sim = useMemo(
    () => simulatePriceImpact(result, currentPrice, simPrice[0]),
    [result, currentPrice, simPrice]
  );

  const competitivenessConfig = {
    PREMIUM_PRICED: { color: 'text-chart-3 bg-chart-3/10 border-chart-3/30', icon: Star, label: 'Premium Priced' },
    MARKET_ALIGNED: { color: 'text-chart-1 bg-chart-1/10 border-chart-1/30', icon: CheckCircle2, label: 'Market Aligned' },
    UNDERVALUED_OPPORTUNITY: { color: 'text-primary bg-primary/10 border-primary/30', icon: Zap, label: 'Undervalued Opportunity' },
  };

  // Generate curve data for the mini chart
  const curveData = useMemo(() => {
    const points = [];
    for (let r = 0.7; r <= 1.4; r += 0.02) {
      const p = Math.round(fmv * r);
      const s = simulatePriceImpact(result, currentPrice, p);
      points.push({
        price: p,
        label: fmt(p),
        score: s.opportunityScore,
        days: s.projectedDays,
      });
    }
    return points;
  }, [result, currentPrice, fmv]);

  const cfg = competitivenessConfig[sim.competitiveness];
  const CfgIcon = cfg.icon;

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="text-base flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Dynamic Price Simulator
        </CardTitle>
        <CardDescription>Slide to see how price changes affect sale metrics</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Simulated Price</span>
            <span className="text-lg font-bold text-foreground">{formatIDR(simPrice[0])}</span>
          </div>
          <Slider
            value={simPrice}
            onValueChange={setSimPrice}
            min={minPrice}
            max={maxPrice}
            step={Math.round(fmv * 0.005)}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{fmt(minPrice)} (−30%)</span>
            <span className="text-primary font-medium">FMV: {fmt(fmv)}</span>
            <span>{fmt(maxPrice)} (+40%)</span>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <Gauge className="h-4 w-4 mx-auto mb-1 text-chart-4" />
            <p className="text-xl font-bold text-foreground">{sim.opportunityScore}</p>
            <p className="text-[10px] text-muted-foreground">Opportunity Score</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-chart-2" />
            <p className="text-xl font-bold text-foreground">{sim.projectedDays}d</p>
            <p className="text-[10px] text-muted-foreground">Est. Time to Sell</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-1" />
            <p className="text-xl font-bold text-foreground">{sim.demandMultiplier.toFixed(1)}x</p>
            <p className="text-[10px] text-muted-foreground">Demand Multiplier</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-chart-3" />
            <p className={`text-xl font-bold ${sim.priceVsFmv > 0 ? 'text-chart-3' : sim.priceVsFmv < -5 ? 'text-chart-1' : 'text-foreground'}`}>
              {sim.priceVsFmv > 0 ? '+' : ''}{sim.priceVsFmv.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">vs FMV</p>
          </div>
        </div>

        {/* Competitiveness Badge */}
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${cfg.color}`}>
          <CfgIcon className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">{cfg.label}</p>
            <p className="text-xs opacity-80">
              {sim.competitiveness === 'PREMIUM_PRICED' && 'Harga di atas rata-rata pasar. Waktu jual lebih lama tapi margin lebih tinggi.'}
              {sim.competitiveness === 'MARKET_ALIGNED' && 'Harga sesuai pasar. Keseimbangan optimal antara kecepatan jual dan profit.'}
              {sim.competitiveness === 'UNDERVALUED_OPPORTUNITY' && 'Harga di bawah pasar. Penjualan cepat tapi potensi margin berkurang.'}
            </p>
          </div>
        </div>

        {/* Score vs Price Curve */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Opportunity Score vs Price Curve</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={curveData}>
              <defs>
                <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name: string) => [v, name === 'score' ? 'Opportunity Score' : 'Days to Sell']}
              />
              <ReferenceLine x={fmt(simPrice[0])} stroke="hsl(var(--primary))" strokeDasharray="4 4" strokeWidth={2} />
              <ReferenceLine x={fmt(fmv)} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" label={{ value: 'FMV', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#gScore)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const PricingResults: React.FC<{ result: SmartPricingResult; currentPrice: number }> = ({ result, currentPrice }) => {
  const diff = ((result.optimal_price - currentPrice) / currentPrice * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Fair Market Value" value={formatIDR(result.fair_market_value)} icon={<DollarSign className="h-4 w-4" />} />
        <MetricCard label="Optimal Price" value={formatIDR(result.optimal_price)} icon={<Target className="h-4 w-4" />}
          sub={<span className={diff > 0 ? 'text-chart-1' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs current
          </span>}
        />
        <MetricCard label="Quick Sale Price" value={formatIDR(result.quick_sale_price)} icon={<Zap className="h-4 w-4" />} />
        <MetricCard label="Premium Price" value={formatIDR(result.premium_price)} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      {/* ===== DYNAMIC PRICE SIMULATOR ===== */}
      <PriceSimulator result={result} currentPrice={currentPrice} />

      {/* Market Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Position</span>
              <Badge variant="outline" className={positionColors[result.price_positioning]}>
                {result.price_positioning.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-2">
                <Progress value={result.confidence_score} className="w-20 h-2" />
                <span className="text-sm font-medium">{result.confidence_score}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Price/sqm</span>
              <span className="text-sm font-medium">{formatIDR(result.price_per_sqm)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Demand</span>
              <span className={`text-sm font-semibold capitalize ${demandColors[result.demand_level]}`}>{result.demand_level.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Price Trend</span>
              <span className="flex items-center gap-1.5 text-sm font-medium capitalize">{trendIcons[result.price_trend]} {result.price_trend.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Seasonality</span>
              <span className="flex items-center gap-1.5 text-sm font-medium capitalize">
                <ThermometerSun className="h-3.5 w-3.5 text-muted-foreground" />
                {result.seasonality_impact.replace('_', ' ')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <span className="text-3xl font-bold text-foreground">{result.estimated_days_on_market}</span>
            <span className="text-sm text-muted-foreground">Est. days on market</span>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Recommendation
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>
        </CardContent>
      </Card>

      {/* Pricing Factors */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Pricing Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.pricing_factors.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="mt-0.5">{impactIcons[f.impact]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{f.factor}</span>
                    <span className="text-xs text-muted-foreground shrink-0">Weight: {f.weight}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategies */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pricing Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.strategies.map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-card space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground">{s.name}</h4>
                  <p className="text-lg font-bold text-primary">{formatIDR(s.price)}</p>
                  <p className="text-xs text-muted-foreground">{s.timeline}</p>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  {s.pros.map((p, j) => (
                    <div key={j} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-chart-1 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{p}</span>
                    </div>
                  ))}
                  {s.cons.map((c, j) => (
                    <div key={j} className="flex items-start gap-1.5 text-xs">
                      <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Summary */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" /> Market Context
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.market_summary}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; icon: React.ReactNode; sub?: React.ReactNode }> = ({ label, value, icon, sub }) => (
  <Card className="border-border/50">
    <CardContent className="pt-5 pb-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground truncate">{value}</p>
      {sub && <div className="text-xs mt-1">{sub}</div>}
    </CardContent>
  </Card>
);

export default AISmartPricingPage;
