import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Clock, Target, BarChart3, DollarSign, Zap, Shield } from 'lucide-react';
import { useSellerIntelligence } from '@/hooks/useSellerIntelligence';
import { useSecureProperties } from '@/hooks/useSecureProperties';

const formatPrice = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const SellerIntelligencePage = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const { data: properties, isLoading: propsLoading } = useSecureProperties();
  const { data, isLoading, error } = useSellerIntelligence(selectedPropertyId || undefined);

  const demandColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'high': return 'bg-chart-1/15 text-chart-1 border-chart-1/30';
      case 'moderate': return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
      default: return 'bg-destructive/15 text-destructive border-destructive/30';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Seller Intelligence</h1>
        <p className="text-muted-foreground mt-1">AI-powered pricing recommendations to sell faster and smarter.</p>
      </div>

      {/* Property Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Select Property</label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder={propsLoading ? 'Loading...' : 'Choose a property'} />
                </SelectTrigger>
                <SelectContent>
                  {(properties || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.title} — {p.city || p.location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Analyzing market data...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-center text-destructive">
            {(error as Error).message}
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Recommended Price</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatPrice(data.recommended_price)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Predicted Days to Sell</span>
                </div>
                <p className="text-xl font-bold text-foreground">{data.predicted_days_to_sell} days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Demand Level</span>
                </div>
                <Badge variant="outline" className={demandColor(data.demand_level)}>
                  {data.demand_level.replace('_', ' ')}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Confidence</span>
                </div>
                <p className="text-xl font-bold text-foreground">{data.confidence}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Price Range & Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Price Positioning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: 'Your Listing Price', value: data.listing_price, color: 'bg-muted' },
                    { label: 'Recommended Price', value: data.recommended_price, color: 'bg-primary' },
                    { label: 'Market Range (Low)', value: data.market_price_range.low, color: 'bg-chart-1' },
                    { label: 'Market Range (High)', value: data.market_price_range.high, color: 'bg-chart-2' },
                  ].map((item) => {
                    const maxVal = Math.max(data.market_price_range.high, data.listing_price, data.recommended_price);
                    const pct = (item.value / maxVal) * 100;
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-foreground">{formatPrice(item.value)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/50">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t">
                  <Badge variant="outline" className="capitalize">{data.price_competitiveness}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Market Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Your Price/m²', value: formatPrice(data.price_per_sqm) },
                    { label: 'Market Median/m²', value: formatPrice(data.market_median_price_per_sqm) },
                    { label: 'Competition Level', value: data.competition_level },
                    { label: 'Comparables Found', value: data.comparables_count.toString() },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      <span className="text-sm font-semibold text-foreground capitalize">{m.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {data.insights && data.insights.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SellerIntelligencePage;
