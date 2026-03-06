import React from 'react';
import { useKnowledgeNetwork } from '@/hooks/useKnowledgeNetwork';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Network, TrendingUp, MapPin, Building2, Users, Eye,
  Heart, AlertTriangle, Flame, BarChart3, Globe, Database
} from 'lucide-react';

const formatRupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

const ratingColors: Record<string, { color: string; label: string }> = {
  strong_buy: { color: 'text-chart-1', label: '🟢 Strong Buy' },
  buy: { color: 'text-primary', label: '🔵 Buy' },
  hold: { color: 'text-chart-3', label: '🟡 Hold' },
};

const demandColors: Record<string, string> = {
  very_hot: 'text-destructive',
  hot: 'text-chart-3',
  warm: 'text-primary',
};

const KnowledgeNetworkPanel: React.FC = () => {
  const { data, isLoading, error } = useKnowledgeNetwork();

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-4 border-destructive/30">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to load Knowledge Network</p>
        </CardContent>
      </Card>
    );
  }

  const maxTrend = Math.max(...data.trending_cities.map(c => c.trend_score), 1);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Network className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Knowledge Network</h2>
          <p className="text-xs text-muted-foreground">Graph-based real estate intelligence</p>
        </div>
      </div>

      {/* Graph stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="border-border/50">
          <CardContent className="p-2.5 text-center">
            <Database className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{data.graph_stats.total_edges.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Graph Edges</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-2.5 text-center">
            <Building2 className="h-3.5 w-3.5 text-chart-1 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{data.graph_stats.total_properties}</p>
            <p className="text-[9px] text-muted-foreground">Properties</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-2.5 text-center">
            <Users className="h-3.5 w-3.5 text-chart-3 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{data.graph_stats.active_users_30d}</p>
            <p className="text-[9px] text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-2.5 text-center">
            <Globe className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{data.graph_stats.unique_cities}</p>
            <p className="text-[9px] text-muted-foreground">Cities</p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Cities */}
      <Card className="border-border/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-chart-1" /> Trending Cities
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {data.trending_cities.map((city, i) => (
            <div key={city.city} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-sm font-semibold text-foreground truncate">{city.city}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px]">{city.property_count} listings</Badge>
                  <span className="text-xs font-bold text-primary">{city.trend_score}</span>
                </div>
              </div>
              <Progress value={(city.trend_score / maxTrend) * 100} className="h-1.5" />
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Inv: {city.avg_investment_score}</span>
                <span>Heat: {city.avg_demand_heat}</span>
                <span>{city.interaction_count} interactions</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Investor Hotspots */}
      {data.investor_hotspots.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-destructive" /> Investor Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {data.investor_hotspots.map((h) => {
              const rc = ratingColors[h.investment_rating] || ratingColors.hold;
              return (
                <div key={h.city} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{h.city}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium ${rc.color}`}>{rc.label}</span>
                      <span className={`text-[10px] ${demandColors[h.demand_level] || 'text-muted-foreground'} capitalize`}>
                        {h.demand_level.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-foreground">Inv: <span className="font-bold">{h.avg_investment_score}</span></p>
                    <p className="text-xs text-foreground">Heat: <span className="font-bold">{h.avg_demand_heat}</span></p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Popular Property Types */}
      <Card className="border-border/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Popular Property Types
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {data.popular_property_types.map((t) => (
            <div key={t.type} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground capitalize">{t.type}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Eye className="h-2.5 w-2.5" /> {t.view_count} views</span>
                  <span className="flex items-center gap-1"><Heart className="h-2.5 w-2.5" /> {t.save_count} saves</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground">{t.listing_count} listings</p>
                <p className="text-[10px] text-muted-foreground">{formatRupiah(t.avg_price)} avg</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center">
        {data.graph_stats.edges_updated} edges synced · Generated {new Date(data.generated_at).toLocaleString('id-ID')} · ASTRA Knowledge Network
      </p>
    </div>
  );
};

export default KnowledgeNetworkPanel;
