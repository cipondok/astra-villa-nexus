import React from 'react';
import { useSuperEngine } from '@/hooks/useSuperEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Zap, TrendingUp, TrendingDown, Minus, ShieldCheck, Home,
  BarChart3, AlertTriangle, MapPin, Building2, Percent,
  Users, Star, Tag, ArrowUpRight, Sparkles
} from 'lucide-react';

const formatRupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

const gradeColors: Record<string, string> = {
  'A+': 'text-chart-1', 'A': 'text-chart-1', 'B+': 'text-primary',
  'B': 'text-primary', 'C': 'text-chart-3', 'D': 'text-destructive',
};

const dealColors: Record<string, { color: string; label: string }> = {
  exceptional_deal: { color: 'text-chart-1', label: '🔥 Exceptional Deal' },
  strong_deal: { color: 'text-chart-1', label: '💎 Strong Deal' },
  good_deal: { color: 'text-primary', label: '✅ Good Deal' },
  fair: { color: 'text-muted-foreground', label: '➖ Fair Price' },
  slightly_overpriced: { color: 'text-chart-3', label: '⚠ Slightly Overpriced' },
  overpriced: { color: 'text-destructive', label: '🚫 Overpriced' },
};

const marketIcons: Record<string, { icon: typeof TrendingUp; color: string }> = {
  booming: { icon: TrendingUp, color: 'text-chart-1' },
  growing: { icon: TrendingUp, color: 'text-primary' },
  stable: { icon: Minus, color: 'text-chart-3' },
  declining: { icon: TrendingDown, color: 'text-destructive' },
};

interface Props {
  propertyId: string;
}

const SuperEnginePanel: React.FC<Props> = ({ propertyId }) => {
  const { data, isLoading, error } = useSuperEngine(propertyId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-4 border-destructive/30">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to run Super Engine analysis</p>
        </CardContent>
      </Card>
    );
  }

  const dc = dealColors[data.deal_rating.deal_rating] || dealColors.fair;
  const mc = marketIcons[data.market_trend.market_status] || marketIcons.stable;
  const MarketIcon = mc.icon;

  return (
    <div className="space-y-4 p-4">
      {/* Hero header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground">ASTRA Super Engine</h2>
          <p className="text-xs text-muted-foreground truncate">{data.title}</p>
        </div>
      </div>

      {/* Overall grade card */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Investment Grade</p>
              <p className={`text-4xl font-black ${gradeColors[data.investment_grade] || 'text-foreground'}`}>
                {data.investment_grade}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Overall Score</p>
              <p className="text-2xl font-bold text-foreground">{data.overall_score}</p>
              <p className="text-[10px] text-muted-foreground">/100</p>
            </div>
          </div>
          <Progress value={data.overall_score} className="h-2 mt-3" multiColor />
        </CardContent>
      </Card>

      {/* ═══ VALUATION ═══ */}
      <Card className="border-border/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">Estimated Value</p>
              <p className="text-lg font-bold text-foreground">{formatRupiah(data.valuation.estimated_value)}</p>
            </div>
            <Badge variant={data.valuation.price_position === 'undervalued' ? 'default' : data.valuation.price_position === 'overpriced' ? 'destructive' : 'secondary'}>
              {data.valuation.price_position === 'undervalued' ? '↑ Undervalued' : data.valuation.price_position === 'overpriced' ? '↓ Overpriced' : '= Fair'}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Listed</p>
              <p className="text-xs font-semibold text-foreground">{formatRupiah(data.valuation.listed_price)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Confidence</p>
              <p className="text-xs font-semibold text-foreground">{data.valuation.confidence}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Deviation</p>
              <p className={`text-xs font-semibold ${data.valuation.deviation_percent > 0 ? 'text-destructive' : 'text-chart-1'}`}>
                {data.valuation.deviation_percent > 0 ? '+' : ''}{data.valuation.deviation_percent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ RENTAL YIELD ═══ */}
      <Card className="border-border/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Home className="h-4 w-4 text-chart-1" /> Rental Yield
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Monthly Rent</p>
              <p className="text-sm font-bold text-foreground">{formatRupiah(data.rental_yield.monthly_rent_estimate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Gross Yield</p>
              <p className="text-sm font-bold text-foreground">{data.rental_yield.rental_yield_percent}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Net Yield</p>
              <p className="text-sm font-bold text-foreground">{data.rental_yield.net_yield_percent}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Occupancy</p>
              <p className="text-sm font-bold text-foreground">{data.rental_yield.occupancy_rate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[10px] capitalize">{data.rental_yield.yield_rating.replace('_', ' ')}</Badge>
            <span className="text-[10px] text-muted-foreground">{data.rental_yield.rent_source === 'market_comparables' ? `${data.rental_yield.comparables_count} comps` : 'AI estimated'}</span>
          </div>
        </CardContent>
      </Card>

      {/* ═══ DEAL + MARKET (side by side) ═══ */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Deal Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className={`text-sm font-bold ${dc.color}`}>{dc.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {data.deal_rating.deal_score_percent > 0 ? '+' : ''}{data.deal_rating.deal_score_percent}% vs FMV
            </p>
            {data.deal_rating.potential_savings > 0 && (
              <p className="text-[10px] text-chart-1 mt-0.5">Save {formatRupiah(data.deal_rating.potential_savings)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <MarketIcon className={`h-3.5 w-3.5 ${mc.color}`} /> Market
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className={`text-sm font-bold capitalize ${mc.color}`}>{data.market_trend.market_status}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Growth: {data.market_trend.price_growth_forecast > 0 ? '+' : ''}{data.market_trend.price_growth_forecast}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              Activity: {data.market_trend.buyer_activity_score}/100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ═══ RECOMMENDATIONS ═══ */}
      {data.recommendations.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Similar Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {data.recommendations.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                {r.thumbnail_url ? (
                  <img src={r.thumbnail_url} alt={r.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground">{r.city} · {r.bedrooms} bed</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-foreground">{formatRupiah(r.price)}</p>
                  <p className="text-[10px] text-muted-foreground">{r.similarity_score}% match</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Generated {new Date(data.generated_at).toLocaleString('id-ID')} · ASTRA AI Super Engine
      </p>
    </div>
  );
};

export default SuperEnginePanel;
