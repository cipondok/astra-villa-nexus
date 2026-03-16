import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageHeader } from './shared/AdminPageHeader';
import { Flame, TrendingUp, MapPin, Building, Eye, Bookmark, BarChart3, Loader2, Snowflake, Target } from 'lucide-react';
import { useMarketHeatZones, ZONE_STATUS_CONFIG, type MarketHeatZone } from '@/hooks/useMarketHeatZones';
import { cn } from '@/lib/utils';

const formatPrice = (price: number) => {
  if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(1)}B`;
  if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
};

const heatColor = (score: number) => {
  if (score >= 76) return 'bg-red-500';
  if (score >= 51) return 'bg-orange-500';
  if (score >= 26) return 'bg-yellow-500';
  return 'bg-blue-400';
};

const heatTextColor = (score: number) => {
  if (score >= 76) return 'text-red-500';
  if (score >= 51) return 'text-orange-500';
  if (score >= 26) return 'text-yellow-500';
  return 'text-blue-400';
};

function ZoneCard({ zone, rank }: { zone: MarketHeatZone; rank: number }) {
  const status = ZONE_STATUS_CONFIG[zone.zone_status] || ZONE_STATUS_CONFIG.stable;
  const totalTrend = zone.hot_count + zone.stable_count + zone.cooling_count;

  return (
    <Card className="bg-card border-border/50 hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm text-white', heatColor(zone.heat_score))}>
              {zone.heat_score}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {zone.city}
              </h3>
              <p className="text-[11px] text-muted-foreground">{zone.state} · {zone.property_count} properties</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-[10px]', status.color)}>
            {status.icon} {status.label}
          </Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Avg Opp. Score</p>
            <p className={cn('text-lg font-bold font-mono', heatTextColor(zone.avg_opportunity_score))}>{zone.avg_opportunity_score}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Avg Deal Score</p>
            <p className={cn('text-lg font-bold font-mono', heatTextColor(zone.avg_deal_score))}>{zone.avg_deal_score}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Avg Demand</p>
            <p className={cn('text-lg font-bold font-mono', heatTextColor(zone.avg_demand_score))}>{zone.avg_demand_score}</p>
          </div>
        </div>

        {/* Demand Trend Distribution */}
        {totalTrend > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-semibold">Demand Distribution</p>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
              {zone.hot_count > 0 && (
                <div className="bg-orange-500 transition-all" style={{ width: `${(zone.hot_count / totalTrend) * 100}%` }} />
              )}
              {zone.stable_count > 0 && (
                <div className="bg-emerald-500 transition-all" style={{ width: `${(zone.stable_count / totalTrend) * 100}%` }} />
              )}
              {zone.cooling_count > 0 && (
                <div className="bg-blue-400 transition-all" style={{ width: `${(zone.cooling_count / totalTrend) * 100}%` }} />
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><Flame className="h-2.5 w-2.5 text-orange-500" />{zone.hot_count} hot</span>
              <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5 text-emerald-500" />{zone.stable_count} stable</span>
              <span className="flex items-center gap-0.5"><Snowflake className="h-2.5 w-2.5 text-blue-400" />{zone.cooling_count} cooling</span>
            </div>
          </div>
        )}

        {/* Price & Activity */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/20 pt-2">
          <span>Avg: {formatPrice(zone.avg_price)}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{zone.total_views.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" />{zone.total_saves.toLocaleString()}</span>
          {zone.avg_price_per_sqm > 0 && <span>Rp {(zone.avg_price_per_sqm / 1e6).toFixed(1)}M/m²</span>}
        </div>
      </CardContent>
    </Card>
  );
}

const MarketHeatIntelligence = () => {
  const { data: zones = [], isLoading } = useMarketHeatZones(2);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return zones;
    return zones.filter(z => z.zone_status === statusFilter);
  }, [zones, statusFilter]);

  const surgingCount = zones.filter(z => z.zone_status === 'surging').length;
  const emergingCount = zones.filter(z => z.zone_status === 'emerging').length;
  const avgHeat = zones.length ? Math.round(zones.reduce((s, z) => s + z.heat_score, 0) / zones.length) : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Market Heat Intelligence"
        description="AI-powered geo-cluster analysis identifying surging investment zones"
        icon={Flame}
        badge={{ text: `${zones.length} Zones`, variant: 'default' }}
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{zones.length}</p>
            <p className="text-[10px] text-muted-foreground">Active Zones</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-orange-500">{surgingCount}</p>
            <p className="text-[10px] text-muted-foreground">Surging Zones</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-500">{emergingCount}</p>
            <p className="text-[10px] text-muted-foreground">Emerging</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3 text-center">
            <p className={cn('text-lg font-bold', heatTextColor(avgHeat))}>{avgHeat}</p>
            <p className="text-[10px] text-muted-foreground">Avg Heat Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <Target className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Zone Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            <SelectItem value="surging">🔥 Surging</SelectItem>
            <SelectItem value="emerging">📈 Emerging</SelectItem>
            <SelectItem value="stable">⚖️ Stable</SelectItem>
            <SelectItem value="cooling">❄️ Cooling</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} zone{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Zone Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Analyzing market zones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No zones match filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((zone, i) => (
            <ZoneCard key={`${zone.city}-${zone.state}`} zone={zone} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketHeatIntelligence;
