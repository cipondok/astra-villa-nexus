import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMarketIntelligence } from "@/hooks/useMarketIntelligence";
import {
  Globe,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Zap,
  Snowflake,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const heatConfig = {
  HOT:    { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: Flame, label: "Hot Market" },
  ACTIVE: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", icon: Zap, label: "Active Market" },
  SLOW:   { color: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2/30", icon: Snowflake, label: "Slow Market" },
} as const;

const liquidityConfig = {
  IMPROVING: { color: "text-chart-1", icon: TrendingUp, label: "Improving" },
  STABLE:    { color: "text-chart-4", icon: Minus, label: "Stable" },
  WEAKENING: { color: "text-destructive", icon: TrendingDown, label: "Weakening" },
} as const;

/** Tiny inline bar chart for top cities */
function MiniSparkline({ data }: { data: { name: string; score: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.score), 1);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-end gap-[3px] h-8">
        {data.map((d, i) => (
          <Tooltip key={d.name}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-3 rounded-t-sm transition-all cursor-default",
                  i === 0 ? "bg-primary" : "bg-primary/40"
                )}
                style={{ height: `${Math.max((d.score / max) * 100, 8)}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">
              {d.name}: {d.score}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

interface MarketIntelligenceCardProps {
  onNavigate?: () => void;
}

const MarketIntelligenceCard = React.memo(function MarketIntelligenceCard({ onNavigate }: MarketIntelligenceCardProps) {
  const { data: intel, isLoading } = useMarketIntelligence();

  if (isLoading || !intel) {
    return (
      <Card className="rounded-2xl border-border/30 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
            <div className="h-2 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const heat = heatConfig[intel.market_heat];
  const liquidity = liquidityConfig[intel.liquidity_trend];
  const HeatIcon = heat.icon;
  const LiquidityIcon = liquidity.icon;

  return (
    <Card
      className={cn(
        "rounded-2xl border-border/30 overflow-hidden cursor-pointer transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        "bg-card/80 backdrop-blur-sm"
      )}
      onClick={onNavigate}
    >
      {/* Gradient top border — reflects market heat */}
      <div className={cn(
        "h-1 bg-gradient-to-r",
        intel.market_heat === "HOT" && "from-destructive/60 via-destructive/30 to-destructive/60",
        intel.market_heat === "ACTIVE" && "from-chart-4/60 via-chart-4/30 to-chart-4/60",
        intel.market_heat === "SLOW" && "from-chart-2/60 via-chart-2/30 to-chart-2/60",
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Globe className="h-3.5 w-3.5" /> Market Intel
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1", heat.color, heat.bg, heat.border)}
          >
            <HeatIcon className="h-3 w-3" />
            {heat.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Top area + sparkline row */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Top Area</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-sm font-bold text-foreground truncate">{intel.top_area}</p>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              Growth {intel.top_area_score} · {intel.top_area_count} listings
            </p>
          </div>
          <div className="shrink-0">
            <MiniSparkline data={intel.sparkline_data} />
          </div>
        </div>

        {/* 2-column metrics */}
        <div className="grid grid-cols-2 gap-2">
          {/* Liquidity Trend */}
          <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30">
            <LiquidityIcon className={cn("h-4 w-4 shrink-0", liquidity.color)} />
            <div>
              <p className={cn("text-xs font-bold", liquidity.color)}>{liquidity.label}</p>
              <p className="text-[9px] text-muted-foreground">Liquidity</p>
            </div>
          </div>

          {/* Hotspot Score */}
          <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30">
            <BarChart3 className={cn("h-4 w-4 shrink-0", heat.color)} />
            <div>
              <p className="text-xs font-bold text-foreground">{intel.avg_hotspot_score}</p>
              <p className="text-[9px] text-muted-foreground">Avg Hotspot</p>
            </div>
          </div>
        </div>

        {/* Growth opportunity hint */}
        <div className="flex items-start gap-1.5 p-2 rounded-lg border border-primary/20 bg-primary/5">
          <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-foreground leading-snug">{intel.growth_hint}</p>
        </div>
      </CardContent>
    </Card>
  );
});

export default MarketIntelligenceCard;
