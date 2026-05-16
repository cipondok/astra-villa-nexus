import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledgeGraphInsights, useBuildKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import {
  Network, TrendingUp, Building2, MapPin, Gem,
  RefreshCw, Hammer, BarChart3, Eye, Heart, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const KnowledgeGraphPanel: React.FC = () => {
  const { data, isLoading } = useKnowledgeGraphInsights();
  const buildGraph = useBuildKnowledgeGraph();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  const maxCityScore = data?.trending_cities?.[0]?.score || 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Network className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">ASTRA Knowledge Graph</h3>
            <p className="text-[10px] text-muted-foreground">
              {data?.graph_stats.total_edges || 0} edges · {data?.graph_stats.entity_types?.length || 0} entity types
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => buildGraph.mutate()}
          disabled={buildGraph.isPending}
        >
          {buildGraph.isPending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Hammer className="h-3 w-3" />
          )}
          Rebuild Graph
        </Button>
      </div>

      {/* Trending Cities */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Trending Cities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(!data?.trending_cities || data.trending_cities.length === 0) ? (
              <p className="text-xs text-muted-foreground text-center py-4">No city data — rebuild graph first</p>
            ) : (
              <div className="space-y-2">
                {data.trending_cities.slice(0, 6).map((city, i) => (
                  <div key={city.city} className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-xs font-semibold capitalize flex-shrink-0 w-24 truncate">{city.city}</span>
                    <div className="flex-1">
                      <Progress value={(city.score / maxCityScore) * 100} className="h-1.5" />
                    </div>
                    <Badge variant="outline" className="text-[9px] flex-shrink-0">
                      {city.property_count} props
                    </Badge>
                    <span className="text-[10px] font-mono text-primary w-8 text-right">{city.score}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Popular Property Types */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border/40 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-chart-1" />
                Popular Property Types
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {(!data?.popular_property_types || data.popular_property_types.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-4">No data</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.popular_property_types.map(pt => (
                    <Badge key={pt.type} variant="outline" className="text-[10px] capitalize gap-1">
                      {pt.type}
                      <span className="text-primary font-bold">{pt.count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Amenities */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/40 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Gem className="h-3.5 w-3.5 text-amber-500" />
                Top Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {(!data?.top_amenities || data.top_amenities.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-4">No data</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.top_amenities.map(a => (
                    <Badge key={a.amenity} className="text-[10px] capitalize bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                      {a.amenity}
                      <span className="font-bold">{a.count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Investor Interest Areas */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
              Investor Interest Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(!data?.investor_interest_areas || data.investor_interest_areas.length === 0) ? (
              <p className="text-xs text-muted-foreground text-center py-4">No activity data — rebuild graph first</p>
            ) : (
              <div className="space-y-2">
                {data.investor_interest_areas.map((area) => (
                  <div key={area.city} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-xs font-semibold capitalize w-24 truncate">{area.city}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Eye className="h-2.5 w-2.5" /> {area.views}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Heart className="h-2.5 w-2.5" /> {area.saves}
                    </div>
                    <div className="ml-auto">
                      <Badge className={cn(
                        'text-[9px]',
                        area.interest_ratio >= 50
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : area.interest_ratio >= 25
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {area.interest_ratio}% intent
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Developers */}
      {data?.top_developers && data.top_developers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Top Developers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {data.top_developers.map(d => (
                  <Badge key={d.developer} variant="outline" className="text-[10px] capitalize gap-1">
                    {d.developer}
                    <span className="text-primary font-bold">{d.count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default KnowledgeGraphPanel;
