import React from 'react';
import { usePropertyValuation } from '@/hooks/usePropertyValuation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Minus, BarChart3, AlertTriangle,
  Building2, MapPin, Ruler, ShieldCheck
} from 'lucide-react';

const formatRupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

const positionConfig = {
  undervalued: { label: 'Undervalued', icon: TrendingUp, color: 'text-chart-1', bg: 'bg-chart-1/10', badgeVariant: 'default' as const },
  fair_price: { label: 'Fair Price', icon: Minus, color: 'text-primary', bg: 'bg-primary/10', badgeVariant: 'secondary' as const },
  overpriced: { label: 'Overpriced', icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', badgeVariant: 'destructive' as const },
};

interface Props {
  propertyId: string;
}

const PropertyValuationPanel: React.FC<Props> = ({ propertyId }) => {
  const { data, isLoading, error } = usePropertyValuation(propertyId);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-4 border-destructive/30">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to generate valuation</p>
        </CardContent>
      </Card>
    );
  }

  const pos = positionConfig[data.price_position] || positionConfig.fair_price;
  const PosIcon = pos.icon;
  const diff = data.estimated_value - data.listed_price;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">AI Valuation</h2>
          <p className="text-xs text-muted-foreground">{data.title}</p>
        </div>
      </div>

      {/* Main valuation card */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Estimated Value</p>
              <p className="text-2xl font-bold text-foreground">{formatRupiah(data.estimated_value)}</p>
            </div>
            <Badge variant={pos.badgeVariant} className="flex items-center gap-1">
              <PosIcon className="h-3 w-3" />
              {pos.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Listed Price</p>
              <p className="text-sm font-semibold text-foreground">{formatRupiah(data.listed_price)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Difference</p>
              <p className={`text-sm font-semibold ${diff > 0 ? 'text-chart-1' : diff < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {diff > 0 ? '+' : ''}{formatRupiah(diff)} ({data.deviation_percent > 0 ? '+' : ''}{data.deviation_percent}%)
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground">Avg Price/m²</p>
            <p className="text-sm font-semibold text-foreground">{formatRupiah(data.avg_price_per_sqm)}/m²</p>
          </div>
        </CardContent>
      </Card>

      {/* Confidence */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Confidence</span>
            </div>
            <span className="text-sm font-bold text-foreground">{data.confidence}%</span>
          </div>
          <Progress value={data.confidence} className="h-2" multiColor />
          <p className="text-[10px] text-muted-foreground mt-2">
            Based on {data.comparables_count} comparable properties
          </p>
        </CardContent>
      </Card>

      {/* Property info */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">City</span>
            </div>
            <p className="text-xs font-semibold text-foreground">{data.city || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Type</span>
            </div>
            <p className="text-xs font-semibold text-foreground capitalize">{data.property_type || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Building</span>
            </div>
            <p className="text-xs font-semibold text-foreground">{data.building_area} m²</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Land</span>
            </div>
            <p className="text-xs font-semibold text-foreground">{data.land_area} m²</p>
          </CardContent>
        </Card>
      </div>

      {/* Adjustment factors */}
      <Card className="border-border/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Adjustment Factors</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Demand Heat Score</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{data.demand_heat_score}/100</span>
              <Badge variant="outline" className="text-[10px]">×{data.demand_multiplier}</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Investment Score</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{data.investment_score}/100</span>
              <Badge variant="outline" className="text-[10px]">×{data.investment_multiplier}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparables */}
      {data.top_comparables.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Top Comparables ({data.comparables_count})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {data.top_comparables.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.area} m² · {c.city}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs font-semibold text-foreground">{formatRupiah(c.price)}</p>
                  <p className="text-[10px] text-muted-foreground">{formatRupiah(c.price_per_sqm)}/m²</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Generated {new Date(data.generated_at).toLocaleString('id-ID')} · ASTRA AI Valuation Model
      </p>
    </div>
  );
};

export default PropertyValuationPanel;
