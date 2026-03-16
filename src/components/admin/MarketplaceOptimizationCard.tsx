import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useMarketplaceOptimization,
  type CycleSignal,
  type PrimaryAction,
  type PerformanceTrend,
  type NextFocus,
  type ListingOptimization,
} from "@/hooks/useMarketplaceOptimization";
import {
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Search,
  Users,
  Eye,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cycleConfig: Record<CycleSignal, { color: string; bg: string; border: string; label: string; icon: typeof CheckCircle2 }> = {
  OPTIMIZATION_IMPROVING: { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Improving", icon: CheckCircle2 },
  STABLE_CONDITION:       { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Stable", icon: Activity },
  INTERVENTION_REQUIRED:  { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Intervene", icon: AlertTriangle },
};

const actionConfig: Record<PrimaryAction, { icon: typeof DollarSign; color: string; label: string }> = {
  PRICING_ADJUSTMENT:     { icon: DollarSign, color: "text-chart-3", label: "Price" },
  SEO_OPTIMIZATION:       { icon: Search, color: "text-primary", label: "SEO" },
  BUYER_MATCH_ESCALATION: { icon: Users, color: "text-chart-1", label: "Match" },
  MONITOR:                { icon: Eye, color: "text-muted-foreground", label: "Monitor" },
};

const trendIcon: Record<PerformanceTrend, typeof TrendingUp> = {
  IMPROVING: TrendingUp,
  STABLE: Minus,
  DECLINING: TrendingDown,
};

const trendColor: Record<PerformanceTrend, string> = {
  IMPROVING: "text-chart-1",
  STABLE: "text-muted-foreground",
  DECLINING: "text-destructive",
};

const focusLabels: Record<NextFocus, string> = {
  DUAL_PRICE_SEO: "Price + SEO",
  CONVERSION_PUSH: "Conversion",
  VISIBILITY_BOOST: "Visibility",
  MOMENTUM_MAINTAIN: "Maintain",
  STANDARD_MONITOR: "Monitor",
};

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  return `${(price / 1_000).toFixed(0)}K`;
}

function ListingRow({ l }: { l: ListingOptimization }) {
  const ac = actionConfig[l.primary_action_triggered];
  const TrendIcon = trendIcon[l.performance_trend];
  const ActionIcon = ac.icon;
  const m = l.metrics;

  return (
    <div className="p-2 rounded-lg border border-border/30 bg-muted/10 space-y-1">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-medium text-foreground truncate block">{l.title}</span>
          <span className="text-[9px] text-muted-foreground">{l.city} · Rp {formatPrice(l.price)}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <TrendIcon className={cn("h-3 w-3", trendColor[l.performance_trend])} />
          <Badge variant="outline" className={cn("text-[8px] h-3.5 px-1 gap-0.5", ac.color)}>
            <ActionIcon className="h-2 w-2" />{ac.label}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-[9px] text-muted-foreground">
        <span>Deal: <span className={cn("font-medium", m.deal_trend > 0 ? "text-chart-1" : m.deal_trend < -3 ? "text-destructive" : "text-muted-foreground")}>{m.deal_score}</span>
          <span className={cn("ml-0.5", m.deal_trend > 0 ? "text-chart-1" : m.deal_trend < 0 ? "text-destructive" : "")}>
            {m.deal_trend > 0 ? `+${m.deal_trend}` : m.deal_trend !== 0 ? m.deal_trend : ""}
          </span>
        </span>
        <span>SEO: <span className={cn("font-medium", m.seo_score < 35 ? "text-destructive" : "text-muted-foreground")}>{m.seo_score}</span></span>
        <span>Dem: <span className="font-medium">{m.demand}</span></span>
        <span>Liq: <span className="font-medium">{m.liquidity}</span></span>
        <span className="text-[8px] text-muted-foreground/70">→ {focusLabels[l.next_cycle_focus]}</span>
      </div>
    </div>
  );
}

type FilterTab = 'all' | 'intervention' | 'improving';

const MarketplaceOptimizationCard = React.memo(function MarketplaceOptimizationCard() {
  const { data, isLoading } = useMarketplaceOptimization();
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('intervention');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'intervention') return data.listings.filter((l) => l.optimization_cycle_signal === 'INTERVENTION_REQUIRED');
    if (filter === 'improving') return data.listings.filter((l) => l.optimization_cycle_signal === 'OPTIMIZATION_IMPROVING');
    return data.listings;
  }, [data, filter]);

  if (isLoading || !data) {
    return (
      <Card className="rounded-2xl border-border/30 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const s = data.summary;
  const healthColor = s.health_ratio >= 70 ? "text-chart-1" : s.health_ratio >= 45 ? "text-chart-4" : "text-destructive";
  const displayList = expanded ? filtered : filtered.slice(0, 5);
  const hasMore = filtered.length > displayList.length;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn("h-1 bg-gradient-to-r", s.health_ratio >= 70 ? "from-chart-1/40 to-chart-4/30" : s.health_ratio >= 45 ? "from-chart-4/40 to-chart-3/30" : "from-destructive/40 to-chart-3/30")} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <RefreshCcw className="h-3.5 w-3.5" /> Optimization Loop
          </span>
          <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-bold", healthColor)}>
            Health: {s.health_ratio}%
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Summary grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <span className="text-[9px] text-muted-foreground block">Processed</span>
            <span className="text-sm font-bold text-foreground">{data.total_processed}</span>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground block">Improving</span>
            <span className="text-sm font-bold text-chart-1">{s.improving}</span>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground block">Stable</span>
            <span className="text-sm font-bold text-chart-4">{s.stable}</span>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground block">Intervene</span>
            <span className="text-sm font-bold text-destructive">{s.intervention}</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {([
            ['intervention', 'Needs Action', s.intervention] as const,
            ['improving', 'Improving', s.improving] as const,
            ['all', 'All', data.total_processed] as const,
          ]).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setExpanded(false); }}
              className={cn(
                "text-[9px] px-2 py-1 rounded-md transition-colors border",
                filter === key
                  ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                  : "bg-muted/20 text-muted-foreground border-border/30 hover:bg-muted/40"
              )}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Listings */}
        <div className="space-y-1.5">
          {displayList.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-2">No listings in this category.</p>
          )}
          {displayList.map((l) => (
            <ListingRow key={l.listing_id} l={l} />
          ))}
        </div>

        {(hasMore || expanded) && filtered.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> +{filtered.length - displayList.length} more</>}
          </button>
        )}
      </CardContent>
    </Card>
  );
});

export default MarketplaceOptimizationCard;
