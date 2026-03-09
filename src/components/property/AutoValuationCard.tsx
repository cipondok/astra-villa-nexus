import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, BarChart3
} from 'lucide-react';
import { useCalculatePropertyValue } from '@/hooks/useCalculatePropertyValue';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import { cn } from '@/lib/utils';

interface AutoValuationCardProps {
  propertyId: string;
  currentPrice: number;
}

export function AutoValuationCard({ propertyId, currentPrice }: AutoValuationCardProps) {
  const { calculate, isCalculating, result, latestValuation, isLoadingLatest } = useCalculatePropertyValue(propertyId);
  const formatPrice = getCurrencyFormatterShort();

  // Use live result or stored valuation
  const valuation = result || (latestValuation ? {
    estimated_value: latestValuation.estimated_value,
    confidence_score: latestValuation.confidence_score ?? 0,
    market_trend: (latestValuation.market_trend as 'rising' | 'stable' | 'declining') || 'stable',
    comparables_count: Array.isArray(latestValuation.comparable_properties) ? (latestValuation.comparable_properties as any[]).length : 0,
    price_range_low: latestValuation.price_range_low ?? 0,
    price_range_high: latestValuation.price_range_high ?? 0,
  } : null);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3.5 w-3.5" />;
      case 'declining': return <TrendingDown className="h-3.5 w-3.5" />;
      default: return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getTrendStyle = (trend: string) => {
    switch (trend) {
      case 'rising': return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'declining': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const priceDiff = valuation && currentPrice > 0
    ? ((valuation.estimated_value - currentPrice) / currentPrice * 100).toFixed(1)
    : null;

  return (
    <Card className="border border-primary/15 bg-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            AI Market Valuation
          </CardTitle>
          {valuation && (
            <Badge variant="outline" className={cn("text-[10px] gap-1 border", getTrendStyle(valuation.market_trend))}>
              {getTrendIcon(valuation.market_trend)}
              {valuation.market_trend === 'rising' ? 'Rising' : valuation.market_trend === 'declining' ? 'Declining' : 'Stable'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {isLoadingLatest ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : valuation ? (
          <>
            {/* Estimated Value */}
            <div className="text-center py-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-0.5">Estimated Market Value</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {formatPrice(valuation.estimated_value)}
              </p>
              {valuation.price_range_low > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Range: {formatPrice(valuation.price_range_low)} – {formatPrice(valuation.price_range_high)}
                </p>
              )}
            </div>

            {/* Price Comparison */}
            {priceDiff && (
              <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg text-xs">
                <span className="text-muted-foreground">vs. Listed Price</span>
                <span className={cn(
                  "font-semibold",
                  Number(priceDiff) > 0 ? "text-chart-1" : Number(priceDiff) < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {Number(priceDiff) > 0 ? '+' : ''}{priceDiff}%
                </span>
              </div>
            )}

            {/* Confidence & Comparables */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{valuation.confidence_score}%</span>
                </div>
                <Progress value={valuation.confidence_score} className="h-1.5" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{valuation.comparables_count} comparables</span>
              </div>
            </div>

            {/* Top comparables (from live result only) */}
            {result?.comparable_properties && result.comparable_properties.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Top Comparables</p>
                {result.comparable_properties.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex justify-between text-[10px] p-1.5 bg-muted/30 rounded">
                    <span className="truncate flex-1">{c.title}</span>
                    <span className="font-medium ml-2">{formatPrice(c.price)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recalculate */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => calculate(propertyId)}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Recalculate Valuation
            </Button>
          </>
        ) : (
          /* No valuation yet */
          <div className="text-center space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Get an instant AI-powered market valuation based on comparable listings.
            </p>
            <Button
              onClick={() => calculate(propertyId)}
              disabled={isCalculating}
              className="w-full"
              size="sm"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-3.5 w-3.5 mr-1.5" />
                  Calculate Valuation
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AutoValuationCard;
