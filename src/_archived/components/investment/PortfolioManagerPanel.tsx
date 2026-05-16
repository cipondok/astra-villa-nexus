import React from 'react';
import { usePortfolioManager, PortfolioProperty } from '@/hooks/usePortfolioManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, TrendingUp, ShieldCheck, ShieldAlert, Shield,
  AlertTriangle, MapPin, Home, ArrowUpRight, ArrowDownRight,
  Building2, Star, Wallet
} from 'lucide-react';

const formatRupiah = (v: number) =>
  `Rp ${v.toLocaleString('id-ID')}`;

const riskConfig = {
  low: { icon: ShieldCheck, label: 'Low Risk', color: 'text-chart-1', bg: 'bg-chart-1/10', progressColor: 'bg-chart-1' },
  medium: { icon: Shield, label: 'Medium Risk', color: 'text-chart-3', bg: 'bg-chart-3/10', progressColor: 'bg-chart-3' },
  high: { icon: ShieldAlert, label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/10', progressColor: 'bg-destructive' },
  unknown: { icon: Shield, label: 'No Data', color: 'text-muted-foreground', bg: 'bg-muted/10', progressColor: 'bg-muted' },
};

const PropertyCard: React.FC<{ property: PortfolioProperty }> = ({ property }) => {
  const riskLevel = property.risk_factor > 60 ? 'high' : property.risk_factor > 35 ? 'medium' : 'low';
  const rc = riskConfig[riskLevel];

  return (
    <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
      <div className="flex gap-3 p-3">
        {property.thumbnail_url ? (
          <img src={property.thumbnail_url} alt={property.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-foreground truncate">{property.title}</h4>
            {property.is_owned && (
              <Badge variant="secondary" className="text-[10px] shrink-0">Owned</Badge>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{property.city || property.location || 'N/A'}</span>
          </div>
          <p className="text-sm font-bold text-primary mt-1">{formatRupiah(property.price)}</p>
        </div>
      </div>
      <div className="px-3 pb-3 grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">Inv. Score</p>
          <p className="text-xs font-bold text-foreground">{property.investment_score}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Yield</p>
          <p className="text-xs font-bold text-foreground">{property.rental_yield}%</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">ROI 5Y</p>
          <p className="text-xs font-bold text-chart-1">{property.roi_5y}%</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Growth</p>
          <p className="text-xs font-bold text-foreground">{property.annual_growth_rate}%</p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className={`flex items-center gap-1 ${rc.color}`}>
            <rc.icon className="h-3 w-3" /> Risk {property.risk_factor}/100
          </span>
          <span className="text-muted-foreground">5Y → {formatRupiah(property.projected_value_5y)}</span>
        </div>
        <Progress value={100 - property.risk_factor} className="h-1" />
      </div>
    </Card>
  );
};

const PortfolioManagerPanel: React.FC = () => {
  const { data, isLoading, error } = usePortfolioManager();

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4 border-destructive/30">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to load portfolio data</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.total_properties === 0) {
    return (
      <Card className="m-4">
        <CardContent className="pt-6 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No properties in your portfolio yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Own or save properties to start tracking.</p>
        </CardContent>
      </Card>
    );
  }

  const rc = riskConfig[data.risk_level];
  const RiskIcon = rc.icon;
  const growth5y = data.portfolio_value > 0
    ? Math.round(((data.projected_value_5y - data.portfolio_value) / data.portfolio_value) * 100)
    : 0;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Portfolio Manager</h2>
          <p className="text-xs text-muted-foreground">{data.total_properties} properties · ASTRA AI Analysis</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Portfolio Value</span>
            </div>
            <p className="text-base font-bold text-foreground">{formatRupiah(data.portfolio_value)}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-chart-1" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Projected 5Y</span>
            </div>
            <p className="text-base font-bold text-foreground">{formatRupiah(data.projected_value_5y)}</p>
            <span className="text-[10px] text-chart-1">+{growth5y}%</span>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-chart-1" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg ROI (5Y)</span>
            </div>
            <p className="text-base font-bold text-chart-1">{data.average_roi}%</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <RiskIcon className={`h-4 w-4 ${rc.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Risk Level</span>
            </div>
            <p className={`text-base font-bold capitalize ${rc.color}`}>{data.risk_level}</p>
            <span className="text-[10px] text-muted-foreground">Score: {data.avg_investment_score}</span>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(data.geo_concentration || data.type_concentration) && (
        <Card className="border-chart-3/30 bg-chart-3/5">
          <CardContent className="p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
            <div className="text-xs text-foreground">
              {data.geo_concentration && <p>⚠ Geographic concentration — all properties in {data.unique_cities[0] || 'one city'}.</p>}
              {data.type_concentration && <p>⚠ Asset concentration — all properties are {data.unique_types[0] || 'same type'}.</p>}
              <p className="text-muted-foreground mt-1">Consider diversifying to reduce risk.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top / Weakest */}
      {(data.top_performer || data.weakest_performer) && (
        <div className="grid grid-cols-2 gap-3">
          {data.top_performer && (
            <Card className="border-chart-1/30 bg-chart-1/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3.5 w-3.5 text-chart-1" />
                  <span className="text-[10px] text-chart-1 font-medium">Top Performer</span>
                </div>
                <p className="text-xs font-semibold text-foreground truncate">{data.top_performer.title}</p>
                <p className="text-xs text-chart-1 font-bold">{data.top_performer.roi_5y}% ROI</p>
              </CardContent>
            </Card>
          )}
          {data.weakest_performer && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-[10px] text-destructive font-medium">Needs Attention</span>
                </div>
                <p className="text-xs font-semibold text-foreground truncate">{data.weakest_performer.title}</p>
                <p className="text-xs text-destructive font-bold">{data.weakest_performer.roi_5y}% ROI</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Diversification */}
      <Card className="border-border/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Diversification</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Cities ({data.unique_cities.length})</p>
            <div className="flex flex-wrap gap-1">
              {data.unique_cities.map(c => (
                <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Types ({data.unique_types.length})</p>
            <div className="flex flex-wrap gap-1">
              {data.unique_types.map(t => (
                <Badge key={t} variant="outline" className="text-[10px] capitalize">{t}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Properties ({data.properties.length})</h3>
        <div className="space-y-3">
          {data.properties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Generated {new Date(data.generated_at).toLocaleString('id-ID')} · ASTRA AI Portfolio Manager
      </p>
    </div>
  );
};

export default PortfolioManagerPanel;
