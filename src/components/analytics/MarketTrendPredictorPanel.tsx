import React, { useState } from 'react';
import { useMarketTrendPredictor } from '@/hooks/useMarketTrendPredictor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Search, Building2,
  Users, BarChart3, AlertTriangle, MapPin, Package, Activity
} from 'lucide-react';

const formatRupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

const statusConfig = {
  booming: { label: 'Booming', color: 'text-chart-1', bg: 'bg-chart-1/10', icon: TrendingUp },
  growing: { label: 'Growing', color: 'text-primary', bg: 'bg-primary/10', icon: TrendingUp },
  stable: { label: 'Stable', color: 'text-chart-3', bg: 'bg-chart-3/10', icon: Minus },
  declining: { label: 'Declining', color: 'text-destructive', bg: 'bg-destructive/10', icon: TrendingDown },
  insufficient_data: { label: 'No Data', color: 'text-muted-foreground', bg: 'bg-muted/10', icon: Minus },
};

const trendIcon = (trend: string) => {
  if (trend === 'increasing') return <TrendingUp className="h-3 w-3 text-chart-1" />;
  if (trend === 'decreasing') return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const MarketTrendPredictorPanel: React.FC = () => {
  const [cityInput, setCityInput] = useState('');
  const [activeCity, setActiveCity] = useState<string | undefined>();
  const { data, isLoading, error } = useMarketTrendPredictor(activeCity);

  const handleSearch = () => {
    if (cityInput.trim()) setActiveCity(cityInput.trim());
  };

  const sc = data ? (statusConfig[data.market_status] || statusConfig.stable) : statusConfig.stable;
  const StatusIcon = sc.icon;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Market Trend Predictor</h2>
          <p className="text-xs text-muted-foreground">12-month forecast · ASTRA AI</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter city name (e.g. Bali, Jakarta)"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={!cityInput.trim() || isLoading} size="sm">
          <Search className="h-4 w-4 mr-1" /> Analyze
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-48" />
        </div>
      )}

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">Failed to analyze market trends</p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <>
          {data.market_status === 'insufficient_data' ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{data.message || 'No data available for this city'}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Market status hero */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{data.city} Market</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusIcon className={`h-5 w-5 ${sc.color}`} />
                        <span className={`text-xl font-bold capitalize ${sc.color}`}>{sc.label}</span>
                      </div>
                    </div>
                    <Badge className={`${sc.bg} ${sc.color} border-0 text-sm`}>
                      {data.total_properties} listings
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Median Price</p>
                      <p className="text-sm font-semibold text-foreground">{formatRupiah(data.median_price)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Price Growth</p>
                      <p className={`text-sm font-semibold ${data.price_growth_forecast > 0 ? 'text-chart-1' : data.price_growth_forecast < 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {data.price_growth_forecast > 0 ? '+' : ''}{data.price_growth_forecast}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Buyer Activity</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{data.buyer_activity_score}/100</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {trendIcon(data.buyer_activity_trend)}
                      <span className="text-[10px] text-muted-foreground capitalize">{data.buyer_activity_trend}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-chart-1" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Investor Interest</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{data.investor_interest_score}/100</p>
                    <p className="text-[10px] text-muted-foreground">Demand: {data.demand_growth_forecast > 0 ? '+' : ''}{data.demand_growth_forecast}%</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-chart-3" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Supply Trend</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {trendIcon(data.supply_trend)}
                      <span className="text-sm font-bold text-foreground capitalize">{data.supply_trend}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{data.recent_listings_30d} new (30d)</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Scores</span>
                    </div>
                    <p className="text-xs text-foreground">Inv: <span className="font-bold">{data.avg_investment_score}</span></p>
                    <p className="text-xs text-foreground">Heat: <span className="font-bold">{data.avg_demand_heat}</span></p>
                  </CardContent>
                </Card>
              </div>

              {/* 12-month forecast chart */}
              <Card className="border-border/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">12-Month Forecast</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="rounded-lg bg-card border border-border/50 p-2" style={{ background: 'hsl(var(--card) / 0.8)' }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={data.monthly_forecasts} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(v) => `M${v}`}
                          axisLine={{ stroke: 'hsl(var(--border) / 0.3)' }}
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                          labelFormatter={(v) => `Month ${v}`}
                        />
                        <Line type="monotone" dataKey="price_index" name="Price Index" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))' }} />
                        <Line type="monotone" dataKey="demand_index" name="Demand Index" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(142, 71%, 45%)' }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 rounded-full bg-primary" />
                        <span className="text-[9px] text-muted-foreground">Price Index</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
                        <span className="text-[9px] text-muted-foreground">Demand Index</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property type distribution */}
              <Card className="border-border/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">Property Types</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.property_type_distribution).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs capitalize">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <p className="text-[10px] text-muted-foreground text-center">
                Generated {new Date(data.generated_at).toLocaleString('id-ID')} · ASTRA AI Market Trend Predictor
              </p>
            </>
          )}
        </>
      )}

      {!activeCity && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Enter a city to analyze market trends</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketTrendPredictorPanel;
