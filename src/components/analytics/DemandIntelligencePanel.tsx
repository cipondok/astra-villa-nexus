import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Price from '@/components/ui/Price';
import { useDemandIntelligence, CityHotspot } from '@/hooks/useDemandIntelligence';
import {
  Globe, Flame, TrendingUp, MapPin, Users,
  Heart, BarChart3, Building2, Zap, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const classConfig: Record<string, { label: string; color: string; icon: typeof Flame }> = {
  very_hot: { label: 'Very Hot', color: 'text-destructive bg-destructive/10 border-destructive/30', icon: Flame },
  hot: { label: 'Hot', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', icon: Zap },
  growing: { label: 'Growing', color: 'text-chart-1 bg-chart-1/10 border-chart-1/30', icon: TrendingUp },
  stable: { label: 'Stable', color: 'text-primary bg-primary/10 border-primary/30', icon: Activity },
};

const ratingColor = (rating: string) => {
  if (rating === 'Strong Buy') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (rating === 'Buy') return 'bg-chart-1/10 text-chart-1 border-chart-1/30';
  if (rating === 'Hold') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  return 'bg-muted text-muted-foreground border-border/30';
};

function HotspotCard({ hotspot, index }: { hotspot: CityHotspot; index: number }) {
  const cls = classConfig[hotspot.market_class] || classConfig.stable;
  const Icon = cls.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className={cn(
        'border-border/40 hover:border-primary/20 transition-all',
        hotspot.market_class === 'very_hot' && 'border-destructive/20 bg-destructive/[0.01]'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cls.color.split(' ').slice(1).join(' '))}>
                <Icon className={cn('h-4 w-4', cls.color.split(' ')[0])} />
              </div>
              <div>
                <h4 className="text-sm font-bold">{hotspot.city}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className={cn('text-[9px] border', cls.color)}>{cls.label}</Badge>
                  <Badge className={cn('text-[9px] border', ratingColor(hotspot.investment_rating))}>{hotspot.investment_rating}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{hotspot.composite_score}</p>
              <p className="text-[9px] text-muted-foreground">Score</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-1.5 rounded-lg bg-muted/20 border border-border/20">
              <TrendingUp className="h-3 w-3 mx-auto mb-0.5 text-emerald-500" />
              <p className="text-xs font-bold">{hotspot.growth_rate}%</p>
              <p className="text-[8px] text-muted-foreground">Growth</p>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-muted/20 border border-border/20">
              <Users className="h-3 w-3 mx-auto mb-0.5 text-primary" />
              <p className="text-xs font-bold">{hotspot.buyer_activity_score}</p>
              <p className="text-[8px] text-muted-foreground">Activity</p>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-muted/20 border border-border/20">
              <Heart className="h-3 w-3 mx-auto mb-0.5 text-destructive" />
              <p className="text-xs font-bold">{hotspot.investor_interest_score}</p>
              <p className="text-[8px] text-muted-foreground">Interest</p>
            </div>
          </div>

          {/* Score Bars */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground w-14">Activity</span>
              <Progress value={hotspot.buyer_activity_score} className="h-1.5 flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground w-14">Interest</span>
              <Progress value={hotspot.investor_interest_score} className="h-1.5 flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground w-14">Heat</span>
              <Progress value={hotspot.median_heat_score} className="h-1.5 flex-1" />
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{hotspot.active_listings} active</span>
              <span className="flex items-center gap-0.5"><Zap className="h-2.5 w-2.5" />+{hotspot.new_listings_30d} new</span>
              <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{hotspot.unique_buyers_30d} buyers</span>
            </div>
            <span className="text-[9px] font-semibold text-primary">
              Avg <Price amount={hotspot.avg_price} short />
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const DemandIntelligencePanel: React.FC = () => {
  const { data, isLoading } = useDemandIntelligence();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Globe className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Global Property Demand Intelligence</h3>
          <p className="text-[10px] text-muted-foreground">
            {data.total_properties_analyzed} properties · {data.total_cities} markets analyzed
          </p>
        </div>
      </div>

      {/* Market Classification Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Very Hot', value: data.summary.very_hot, cls: classConfig.very_hot },
          { label: 'Hot', value: data.summary.hot, cls: classConfig.hot },
          { label: 'Growing', value: data.summary.growing, cls: classConfig.growing },
          { label: 'Stable', value: data.summary.stable, cls: classConfig.stable },
        ].map((item) => {
          const Icon = item.cls.icon;
          return (
            <Card key={item.label} className="bg-card/60 border-border/40">
              <CardContent className="p-3 flex items-center gap-2">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', item.cls.color.split(' ').slice(1).join(' '))}>
                  <Icon className={cn('h-3.5 w-3.5', item.cls.color.split(' ')[0])} />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none">{item.value}</p>
                  <p className="text-[9px] text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hotspot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.hotspots.map((hotspot, i) => (
          <HotspotCard key={hotspot.city} hotspot={hotspot} index={i} />
        ))}
      </div>
    </div>
  );
};

export default DemandIntelligencePanel;
