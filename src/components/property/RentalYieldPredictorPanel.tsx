import React from 'react';
import { useRentalYieldPredictor } from '@/hooks/useRentalYieldPredictor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Home, TrendingUp, Percent, Users, AlertTriangle,
  MapPin, Building2, BedDouble, Palmtree, BarChart3, Wallet
} from 'lucide-react';

const formatRupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

const yieldConfig = {
  excellent: { label: 'Excellent', color: 'text-chart-1', bg: 'bg-chart-1/10' },
  good: { label: 'Good', color: 'text-primary', bg: 'bg-primary/10' },
  average: { label: 'Average', color: 'text-chart-3', bg: 'bg-chart-3/10' },
  below_average: { label: 'Below Avg', color: 'text-destructive', bg: 'bg-destructive/10' },
};

interface Props {
  propertyId: string;
}

const RentalYieldPredictorPanel: React.FC<Props> = ({ propertyId }) => {
  const { data, isLoading, error } = useRentalYieldPredictor(propertyId);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-4 border-destructive/30">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to predict rental yield</p>
        </CardContent>
      </Card>
    );
  }

  const yc = yieldConfig[data.yield_rating] || yieldConfig.average;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Home className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Rental Yield Predictor</h2>
          <p className="text-xs text-muted-foreground truncate">{data.title}</p>
        </div>
      </div>

      {/* Main estimate */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Monthly Rent Estimate</p>
              <p className="text-2xl font-bold text-foreground">{formatRupiah(data.monthly_rent_estimate)}</p>
            </div>
            <Badge className={`${yc.bg} ${yc.color} border-0`}>
              {yc.label} Yield
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Annual Rent</p>
              <p className="text-sm font-semibold text-foreground">{formatRupiah(data.annual_rent)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Property Price</p>
              <p className="text-sm font-semibold text-foreground">{formatRupiah(data.property_price)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            Source: {data.rent_source === 'market_comparables' ? `${data.comparables_count} market comparables` : 'AI estimation'}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Gross Yield</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.rental_yield_percent}%</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-chart-1" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Occupancy</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.occupancy_rate}%</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-chart-1" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Effective Yield</span>
            </div>
            <p className="text-lg font-bold text-foreground">{data.effective_yield_percent}%</p>
            <p className="text-[10px] text-muted-foreground">{formatRupiah(data.effective_annual_rent)}/yr</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-chart-3" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Net Yield</span>
            </div>
            <p className="text-lg font-bold text-foreground">{data.net_yield_percent}%</p>
            <p className="text-[10px] text-muted-foreground">{formatRupiah(data.net_annual_rent)}/yr</p>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Occupancy Rate</span>
            <span className="text-sm font-bold text-foreground">{data.occupancy_rate}%</span>
          </div>
          <Progress value={data.occupancy_rate} className="h-2" />
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            {data.is_tourist_city && (
              <span className="flex items-center gap-1">
                <Palmtree className="h-3 w-3" /> Tourist area bonus
              </span>
            )}
            <span>Heat: {data.demand_heat_score}/100</span>
            <span>Inv: {data.investment_score}/100</span>
          </div>
        </CardContent>
      </Card>

      {/* Property details */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border/50">
          <CardContent className="p-2.5 text-center">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">City</p>
            <p className="text-xs font-semibold text-foreground truncate">{data.city || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-2.5 text-center">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Type</p>
            <p className="text-xs font-semibold text-foreground capitalize truncate">{data.property_type || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-2.5 text-center">
            <BedDouble className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Beds</p>
            <p className="text-xs font-semibold text-foreground">{data.bedrooms}</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparables */}
      {data.top_comparables.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Rental Comparables ({data.comparables_count})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {data.top_comparables.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.bedrooms} bed · {c.city}</p>
                </div>
                <p className="text-xs font-semibold text-foreground shrink-0 ml-2">{formatRupiah(c.monthly_rent)}/mo</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Generated {new Date(data.generated_at).toLocaleString('id-ID')} · ASTRA AI Rental Yield Predictor
      </p>
    </div>
  );
};

export default RentalYieldPredictorPanel;
