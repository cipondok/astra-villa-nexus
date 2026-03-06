import React, { useState } from 'react';
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
import { useSmartPricing, SmartPricingResult, PricingFactor } from '@/hooks/useSmartPricing';
import { toast } from 'sonner';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, DollarSign,
  BarChart3, Clock, Zap, Target, AlertTriangle, CheckCircle2,
  XCircle, Loader2, Sparkles, ThermometerSun, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const formatIDR = (v: number) => `IDR ${v.toLocaleString('id-ID')}`;

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
              <h1 className="text-2xl font-bold text-foreground">AI Smart Pricing Engine</h1>
              <p className="text-sm text-muted-foreground">Dynamic pricing recommendations powered by market intelligence</p>
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
