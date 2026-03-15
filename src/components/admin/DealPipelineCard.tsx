import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDealPipelineIntelligence } from "@/hooks/useDealPipelineIntelligence";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Handshake,
  PieChart,
  Wallet,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

const growthConfig = {
  STRONG:   { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", icon: Rocket, label: "Strong Growth" },
  STABLE:   { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", icon: Minus, label: "Stable Growth" },
  SLOWDOWN: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: TrendingDown, label: "Slowdown Risk" },
} as const;

/** Tiny inline sparkline for revenue trend */
function RevenueSparkline({ data }: { data: { d: string; revenue: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-end gap-[3px] h-8">
        {data.map((d, i) => (
          <Tooltip key={d.d}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-3 rounded-t-sm transition-all cursor-default",
                  i === data.length - 1 ? "bg-primary" : "bg-primary/40"
                )}
                style={{ height: `${Math.max((d.revenue / max) * 100, 8)}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">
              {d.d}: {formatCurrency(d.revenue)}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

interface DealPipelineCardProps {
  onNavigate?: () => void;
}

const DealPipelineCard = React.memo(function DealPipelineCard({ onNavigate }: DealPipelineCardProps) {
  const { data: intel, isLoading } = useDealPipelineIntelligence();

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

  const growth = growthConfig[intel.growth_signal];
  const GrowthIcon = growth.icon;

  const conversionColor =
    intel.conversion_rate >= 30 ? "text-chart-1" :
    intel.conversion_rate >= 15 ? "text-chart-4" :
    "text-destructive";

  return (
    <Card
      className={cn(
        "rounded-2xl border-border/30 overflow-hidden cursor-pointer transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        "bg-card/80 backdrop-blur-sm"
      )}
      onClick={onNavigate}
    >
      {/* Gradient top border — reflects growth signal */}
      <div className={cn(
        "h-1 bg-gradient-to-r",
        intel.growth_signal === "STRONG" && "from-chart-1/60 via-chart-1/30 to-chart-1/60",
        intel.growth_signal === "STABLE" && "from-chart-4/60 via-chart-4/30 to-chart-4/60",
        intel.growth_signal === "SLOWDOWN" && "from-destructive/60 via-destructive/30 to-destructive/60",
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Handshake className="h-3.5 w-3.5" /> Deal Pipeline
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1", growth.color, growth.bg, growth.border)}
          >
            <GrowthIcon className="h-3 w-3" />
            {growth.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Pipeline count + sparkline row */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">In Pipeline</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{intel.pipeline_count}</p>
            <p className="text-[9px] text-muted-foreground">
              {intel.closed_30d} closed · {intel.active_30d} total (30d)
            </p>
          </div>
          <div className="shrink-0">
            <RevenueSparkline data={intel.sparkline_data} />
          </div>
        </div>

        {/* 2-column metrics */}
        <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-2 gap-2">
            {/* Conversion Rate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <PieChart className={cn("h-4 w-4 shrink-0", conversionColor)} />
                  <div>
                    <p className={cn("text-sm font-bold", conversionColor)}>
                      {intel.conversion_rate}%
                    </p>
                    <p className="text-[9px] text-muted-foreground">Conversion</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[180px]">
                {intel.closed_30d} deals closed out of {intel.active_30d} total transactions (30d)
              </TooltipContent>
            </Tooltip>

            {/* Revenue 30d */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <DollarSign className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(intel.revenue_30d)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Revenue 30d</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[200px]">
                Previous 30d: {formatCurrency(intel.revenue_prev_30d)} · Growth ratio: {intel.growth_ratio}x
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Pipeline revenue estimate */}
        <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
          <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-foreground">
              Est. pipeline value: <span className="font-bold">{formatCurrency(intel.pipeline_revenue)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default DealPipelineCard;
