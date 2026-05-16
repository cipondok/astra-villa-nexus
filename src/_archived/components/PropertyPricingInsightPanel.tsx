import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Target,
  Shield, BarChart3, Loader2, ArrowUpRight, ArrowDownRight,
  Activity, Zap,
} from 'lucide-react';
import { usePropertyPricePrediction, type PricePredictionIntelligence } from '@/hooks/usePropertyPricePrediction';
import { cn } from '@/lib/utils';

const formatIDR = (v: number) => `Rp ${(v / 1_000_000_000).toFixed(2)}B`;
const formatIDRShort = (v: number) =>
  v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(1)}B`
    : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M`
    : v.toLocaleString();

const POSITION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  deeply_undervalued: { label: 'Deeply Undervalued', color: 'text-chart-1', bg: 'bg-chart-1/10' },
  undervalued: { label: 'Undervalued', color: 'text-primary', bg: 'bg-primary/10' },
  fair: { label: 'Fair Price', color: 'text-foreground', bg: 'bg-muted/20' },
  overpriced: { label: 'Overpriced', color: 'text-chart-4', bg: 'bg-chart-4/10' },
  bubble_risk: { label: 'Bubble Risk', color: 'text-destructive', bg: 'bg-destructive/10' },
};

const TREND_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  strong_growth: { label: 'Strong Growth', icon: ArrowUpRight, color: 'text-chart-1' },
  moderate_growth: { label: 'Moderate Growth', icon: TrendingUp, color: 'text-primary' },
  stable: { label: 'Stable', icon: Minus, color: 'text-chart-4' },
  decline_risk: { label: 'Decline Risk', icon: ArrowDownRight, color: 'text-destructive' },
};

interface Props {
  propertyId: string | undefined;
}

const PropertyPricingInsightPanel = ({ propertyId }: Props) => {
  const { data, isLoading, error } = usePropertyPricePrediction(propertyId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="ml-3 text-sm text-muted-foreground">Analyzing pricing intelligence…</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Price prediction data is unavailable for this property.
        </CardContent>
      </Card>
    );
  }

  const pos = POSITION_MAP[data.price_position] || POSITION_MAP.fair;
  const trend = TREND_MAP[data.trend_direction] || TREND_MAP.stable;
  const TrendIcon = trend.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* Valuation Overview */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-primary" />
            AI Price Intelligence
            <Badge variant="outline" className="ml-auto text-xs font-mono">
              {data.confidence_score}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* FMV vs Listed */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Listed Price</p>
              <p className="text-lg font-bold font-mono text-foreground">{formatIDR(data.listed_price)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fair Market Value</p>
              <p className="text-lg font-bold font-mono text-primary">{formatIDR(data.estimated_fmv)}</p>
            </div>
          </div>

          {/* Position badge */}
          <div className={cn('flex items-center justify-between px-3 py-2 rounded-lg', pos.bg)}>
            <span className={cn('text-sm font-semibold', pos.color)}>{pos.label}</span>
            <span className="text-xs font-mono text-muted-foreground">
              {data.deviation_pct > 0 ? '+' : ''}{data.deviation_pct}% from FMV
            </span>
          </div>

          {/* Suggested price range */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Suggested Listing Range</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Quick Sale', value: data.suggested_price_range.quick_sale, color: 'text-chart-1' },
                { label: 'Optimal', value: data.suggested_price_range.optimal, color: 'text-primary' },
                { label: 'Premium', value: data.suggested_price_range.premium, color: 'text-chart-4' },
              ].map(tier => (
                <div key={tier.label} className="text-center p-2 rounded-lg bg-muted/15 border border-border/20">
                  <p className={cn('text-sm font-bold font-mono', tier.color)}>
                    {formatIDRShort(tier.value)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{tier.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Value Projections */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendIcon className={cn('h-5 w-5', trend.color)} />
            Value Forecast
            <Badge variant="outline" className={cn('ml-auto text-xs', trend.color)}>
              {trend.label} · {data.annual_growth_rate_pct > 0 ? '+' : ''}{data.annual_growth_rate_pct}%/yr
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.projections
              .filter(p => [6, 12, 24, 36].includes(p.months))
              .map(proj => (
                <div key={proj.months} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-muted/10">
                  <span className="text-muted-foreground">{proj.months}mo</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatIDRShort(proj.projected_value)}
                  </span>
                  <span className={cn('text-xs font-mono',
                    proj.appreciation_pct >= 0 ? 'text-chart-1' : 'text-destructive'
                  )}>
                    {proj.appreciation_pct > 0 ? '+' : ''}{proj.appreciation_pct}%
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Elasticity */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Price Elasticity
            <Badge variant="outline" className="ml-auto text-xs capitalize">
              {data.price_elasticity.sensitivity_rating} sensitivity
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: '-10%', score: data.price_elasticity.price_minus_10 },
              { label: '-5%', score: data.price_elasticity.price_minus_5 },
              { label: 'Current', score: data.price_elasticity.current_price },
              { label: '+5%', score: data.price_elasticity.price_plus_5 },
              { label: '+10%', score: data.price_elasticity.price_plus_10 },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-14 text-right font-mono">{row.label}</span>
                <Progress
                  value={row.score}
                  className="flex-1 h-2"
                />
                <span className="text-xs font-mono w-8 text-right text-foreground">{row.score}</span>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground mt-1">
              Sell probability score at each price level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Negotiation Intelligence */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-primary" />
            Negotiation Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Flexibility Score</span>
            <div className="flex items-center gap-2">
              <Progress value={data.negotiation_flexibility.score} className="w-24 h-2" />
              <span className="font-mono text-sm font-semibold text-foreground">
                {data.negotiation_flexibility.score}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Buyer Power</span>
            <Badge variant="outline" className="capitalize">
              {data.negotiation_flexibility.buyer_power}
            </Badge>
          </div>
          {data.negotiation_flexibility.suggested_discount_pct > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Possible Discount</span>
              <span className="font-mono text-chart-1">
                ~{data.negotiation_flexibility.suggested_discount_pct}%
              </span>
            </div>
          )}
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Recommended Offer Range</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold text-chart-1">
                {formatIDRShort(data.negotiation_flexibility.recommended_offer_range.low)}
              </span>
              <span className="text-xs text-muted-foreground">—</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {formatIDRShort(data.negotiation_flexibility.recommended_offer_range.high)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparables & Meta */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparable Analysis
            <Badge variant="outline" className="ml-auto text-xs">
              {data.comparables_used} properties
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.top_comparables.map(comp => (
              <div key={comp.id} className="flex items-center justify-between text-sm px-2 py-1.5 rounded bg-muted/10">
                <span className="text-muted-foreground truncate max-w-[55%]">{comp.title}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-foreground">{formatIDRShort(comp.price)}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {comp.price_per_sqm.toLocaleString()}/m²
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span>Avg PSM: Rp {data.avg_price_per_sqm.toLocaleString()}/m²</span>
            <span>Demand ×{data.demand_multiplier}</span>
            <span>Investment ×{data.investment_multiplier}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PropertyPricingInsightPanel;
