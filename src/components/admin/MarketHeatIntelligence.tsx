import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageHeader } from './shared/AdminPageHeader';
import {
  Flame, TrendingUp, TrendingDown, MapPin, Eye, Bookmark, Loader2,
  Snowflake, Target, Zap, RefreshCw, BarChart3, Activity, Clock,
  ChevronDown, ChevronUp, AlertTriangle, Rocket, Minus, MessageSquare,
} from 'lucide-react';
import {
  useMarketHeatZones, useComputeHeatClusters,
  ZONE_STATUS_CONFIG, getHeatColor,
  type MarketHeatZone,
} from '@/hooks/useMarketHeatZones';
import { cn } from '@/lib/utils';

const formatPrice = (price: number) => {
  if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(1)}B`;
  if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)}M`;
  return `Rp ${price.toLocaleString()}`;
};

function TrendIcon({ direction }: { direction: string }) {
  if (direction === 'rising') return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (direction === 'declining') return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function ZoneCard({ zone, rank }: { zone: MarketHeatZone; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const status = ZONE_STATUS_CONFIG[zone.zone_status] || ZONE_STATUS_CONFIG.stable;
  const heatColor = getHeatColor(zone.heat_score);
  const totalTrend = zone.hot_count + zone.stable_count + zone.cooling_count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.02 }}
    >
      <Card className="bg-card border-border/50 hover:border-primary/30 transition-all duration-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg"
                  style={{ backgroundColor: heatColor.color }}
                >
                  {zone.heat_score}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {zone.city}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {zone.state} · {zone.property_count.toLocaleString()} properties · {zone.active_listings.toLocaleString()} active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-[10px]', status.color)}>
                  {status.icon} {status.label}
                </Badge>
                <TrendIcon direction={zone.trend_direction} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Opp. Score', value: zone.avg_opportunity_score },
                { label: 'Deal Score', value: zone.avg_deal_score },
                { label: 'Demand', value: zone.avg_demand_score },
                { label: 'Opp. Density', value: `${zone.opportunity_density}%` },
              ].map(m => (
                <div key={m.label} className="text-center p-2 rounded-lg bg-muted/20">
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <p className={cn(
                    'text-base font-bold font-mono',
                    typeof m.value === 'number' && m.value >= 65 ? 'text-emerald-500' :
                    typeof m.value === 'number' && m.value >= 40 ? 'text-foreground' :
                    'text-muted-foreground'
                  )}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {totalTrend > 0 && (
              <div className="mb-3">
                <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
                  {zone.hot_count > 0 && <div className="bg-orange-500 transition-all" style={{ width: `${(zone.hot_count / totalTrend) * 100}%` }} />}
                  {zone.stable_count > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(zone.stable_count / totalTrend) * 100}%` }} />}
                  {zone.cooling_count > 0 && <div className="bg-blue-400 transition-all" style={{ width: `${(zone.cooling_count / totalTrend) * 100}%` }} />}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Flame className="h-2.5 w-2.5 text-orange-500" />{zone.hot_count}</span>
                  <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5 text-emerald-500" />{zone.stable_count}</span>
                  <span className="flex items-center gap-0.5"><Snowflake className="h-2.5 w-2.5 text-blue-400" />{zone.cooling_count}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/20 pt-2">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.round(zone.avg_days_on_market)}d DOM</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{zone.total_views.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" />{zone.total_saves.toLocaleString()}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{zone.total_inquiries.toLocaleString()}</span>
              <span>Avg: {formatPrice(zone.avg_price)}</span>
            </div>
          </div>

          <div className="border-t border-border/20">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <BarChart3 className="h-3 w-3" />
              Forecast & Signals
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/20 bg-muted/10"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      'text-[10px] font-mono',
                      zone.heat_trend_3m === 'Rising' ? 'text-emerald-500 border-emerald-500/30' :
                      zone.heat_trend_3m === 'Declining' ? 'text-destructive border-destructive/30' :
                      'text-muted-foreground border-border/40'
                    )}>
                      3M Forecast: {zone.heat_trend_3m}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{zone.trend_confidence}% confidence</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 rounded bg-muted/20">
                      <p className="text-[10px] text-muted-foreground">Min Price</p>
                      <p className="font-mono font-medium text-foreground">{formatPrice(zone.min_price)}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/20">
                      <p className="text-[10px] text-muted-foreground">Median</p>
                      <p className="font-mono font-medium text-foreground">{formatPrice(zone.median_price)}</p>
                    </div>
                    <div className="text-center p-2 rounded bg-muted/20">
                      <p className="text-[10px] text-muted-foreground">Max Price</p>
                      <p className="font-mono font-medium text-foreground">{formatPrice(zone.max_price)}</p>
                    </div>
                  </div>

                  {zone.emerging_signals && zone.emerging_signals.length > 0 && (
                    <div>
                      <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Rocket className="h-3 w-3" /> Emerging Signals
                      </p>
                      {zone.emerging_signals.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          {s}
                        </p>
                      ))}
                    </div>
                  )}

                  {zone.cooling_risk_signals && zone.cooling_risk_signals.length > 0 && (
                    <div>
                      <p className="text-[10px] text-destructive font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Cooling Risk Signals
                      </p>
                      {zone.cooling_risk_signals.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                          {s}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1 border-t border-border/20">
                    <span>New 30d: {zone.new_listings_30d}</span>
                    {zone.avg_price_per_sqm > 0 && <span>Avg PSM: {formatPrice(zone.avg_price_per_sqm)}/m²</span>}
                    {zone.computed_at && <span className="ml-auto">Updated: {new Date(zone.computed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const MarketHeatIntelligence = () => {
  const { data: zones = [], isLoading, refetch } = useMarketHeatZones(2);
  const computeClusters = useComputeHeatClusters();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return zones;
    return zones.filter(z => z.zone_status === statusFilter);
  }, [zones, statusFilter]);

  const summary = useMemo(() => {
    const hotspots = zones.filter(z => z.zone_status === 'hotspot' || z.zone_status === 'surging').length;
    const growing = zones.filter(z => z.zone_status === 'growing').length;
    const cooling = zones.filter(z => z.zone_status === 'cooling' || z.zone_status === 'cooling_risk').length;
    const avgHeat = zones.length ? Math.round(zones.reduce((s, z) => s + z.heat_score, 0) / zones.length) : 0;
    const totalProps = zones.reduce((s, z) => s + z.property_count, 0);
    return { hotspots, growing, cooling, avgHeat, totalProps, total: zones.length };
  }, [zones]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Market Heat Intelligence"
        description="AI geo-cluster engine — heat scoring, demand forecasts, emerging zones, and cooling risk detection"
        icon={Flame}
        badge={summary.total > 0 ? { text: `${summary.total} Zones`, variant: 'default' } : undefined}
      />

      <Card className="bg-card border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => computeClusters.mutate(2)}
              disabled={computeClusters.isPending}
              className="gap-2"
              size="sm"
            >
              {computeClusters.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Compute Heat Clusters
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            {computeClusters.data && (
              <span className="text-xs text-emerald-500">
                ✓ {computeClusters.data.clusters_computed} clusters in {Math.round(computeClusters.data.duration_ms)}ms
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Zones', value: summary.total, icon: MapPin, color: 'text-foreground' },
          { label: 'Hotspots', value: summary.hotspots, icon: Flame, color: 'text-orange-500' },
          { label: 'Growing', value: summary.growing, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Cooling', value: summary.cooling, icon: Snowflake, color: 'text-blue-400' },
          { label: 'Avg Heat', value: summary.avgHeat, icon: Activity, color: summary.avgHeat >= 60 ? 'text-orange-500' : 'text-foreground' },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border/40">
            <CardContent className="p-3 text-center">
              <s.icon className={cn('h-4 w-4 mx-auto mb-1', s.color)} />
              <p className={cn('text-xl font-bold font-mono', s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <Target className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Zone Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            <SelectItem value="hotspot">🔥 Hotspot</SelectItem>
            <SelectItem value="surging">🚀 Surging</SelectItem>
            <SelectItem value="growing">📈 Growing</SelectItem>
            <SelectItem value="stable">⚖️ Stable</SelectItem>
            <SelectItem value="cooling">❄️ Cooling</SelectItem>
            <SelectItem value="cooling_risk">⚠️ Cooling Risk</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} zone{filtered.length !== 1 ? 's' : ''} · {summary.totalProps.toLocaleString()} properties
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading heat clusters...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {zones.length === 0 ? 'No heat clusters computed yet' : 'No zones match filter'}
          </p>
          {zones.length === 0 && (
            <p className="text-xs mt-1">Click "Compute Heat Clusters" to generate geo-intelligence data</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((zone, i) => (
            <ZoneCard key={`${zone.city}-${zone.state}`} zone={zone} rank={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketHeatIntelligence;
