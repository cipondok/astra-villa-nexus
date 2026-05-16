import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  usePortfolioStrategy,
  type StrategySignal,
  type RebalanceAction,
  type PortfolioOutlook,
  type PortfolioHolding,
} from "@/hooks/usePortfolioStrategy";
import {
  Briefcase,
  TrendingUp,
  Shield,
  AlertTriangle,
  Target,
  Pause,
  LogOut,
  ChevronDown,
  ChevronUp,
  Loader2,
  PieChart,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const strategyConfig: Record<StrategySignal, { color: string; bg: string; border: string; label: string }> = {
  OPTIMAL:             { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Optimal" },
  STABLE:              { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Stable" },
  DIVERSIFY:           { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Diversify" },
  GROWTH_GAP:          { color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", label: "Growth Gap" },
  CRITICAL_REBALANCE:  { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Rebalance" },
  NO_PORTFOLIO:        { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/40", label: "No Portfolio" },
};

const actionConfig: Record<RebalanceAction, { icon: typeof Target; color: string; label: string }> = {
  ACQUIRE_GROWTH_ZONE:  { icon: Target, color: "text-chart-1", label: "Acquire Growth" },
  HOLD_STABLE_INCOME:   { icon: Pause, color: "text-chart-4", label: "Hold Income" },
  EXIT_WEAKENING_ASSET: { icon: LogOut, color: "text-destructive", label: "Exit Weak" },
  START_ACQUIRING:      { icon: Target, color: "text-primary", label: "Start Building" },
};

const outlookConfig: Record<PortfolioOutlook, { color: string; bg: string; border: string; label: string }> = {
  STRONG_WEALTH_GROWTH: { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Strong Growth" },
  BALANCED_STRATEGY:    { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Balanced" },
  RISK_EXPOSURE_RISING: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Risk Rising" },
  NOT_APPLICABLE:       { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/40", label: "N/A" },
};

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return String(price);
}

function HoldingRow({ h }: { h: PortfolioHolding }) {
  const growthColor = h.growth >= 55 ? "text-chart-1" : h.growth >= 35 ? "text-chart-4" : "text-destructive";
  return (
    <div className="flex items-center justify-between p-1.5 rounded border border-border/30 bg-muted/20">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-medium truncate block">{h.title}</span>
        <span className="text-[9px] text-muted-foreground">{h.city} · Rp {formatPrice(h.price)}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={cn("text-[9px] font-medium", growthColor)}>G:{h.growth}</span>
        <span className="text-[9px] text-muted-foreground">L:{h.liquidity}</span>
        <span className="text-[9px] text-muted-foreground">Y:{h.yield}%</span>
      </div>
    </div>
  );
}

const PortfolioStrategyCard = React.memo(function PortfolioStrategyCard() {
  const { data, isLoading } = usePortfolioStrategy();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || !data) {
    return (
      <Card className="rounded-2xl border-border/30 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const sc = strategyConfig[data.strategy_signal];
  const ac = actionConfig[data.recommended_rebalance_action];
  const oc = outlookConfig[data.portfolio_outlook];
  const ActionIcon = ac.icon;
  const m = data.metrics;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn("h-1 bg-gradient-to-r", sc.bg, "via-transparent", oc.bg)} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Briefcase className="h-3.5 w-3.5" /> Portfolio Strategy
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-bold", sc.color, sc.bg, sc.border)}>
              {sc.label}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2", oc.color, oc.bg, oc.border)}>
              {oc.label}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-2">
          {([
            ["Assets", String(m.total_assets)],
            ["Growth", String(m.avg_growth)],
            ["Liquidity", String(m.avg_liquidity)],
            ["Yield", `${m.avg_yield}%`],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} className="text-center">
              <span className="text-[9px] text-muted-foreground block">{label}</span>
              <span className="text-[11px] font-bold text-foreground">{val}</span>
            </div>
          ))}
        </div>

        {/* Benchmark comparison */}
        <div className={cn("flex items-center justify-between p-2 rounded-lg border", sc.border, sc.bg)}>
          <div className="flex items-center gap-2">
            <PieChart className={cn("h-3.5 w-3.5", sc.color)} />
            <div>
              <span className="text-[9px] text-muted-foreground block">Growth vs National</span>
              <span className={cn("text-[11px] font-bold", m.avg_growth >= m.national_growth_benchmark ? "text-chart-1" : "text-destructive")}>
                {m.avg_growth} <span className="text-[9px] text-muted-foreground font-normal">/ {m.national_growth_benchmark}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ActionIcon className={cn("h-3.5 w-3.5", ac.color)} />
            <span className={cn("text-[9px] font-semibold", ac.color)}>{ac.label}</span>
          </div>
        </div>

        {/* Risk flags */}
        {(m.concentration_risk || m.growth_imbalance) && (
          <div className="flex items-center gap-2 flex-wrap">
            {m.concentration_risk && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-1 text-destructive bg-destructive/10 border-destructive/30">
                <AlertTriangle className="h-2.5 w-2.5" /> {m.max_city_pct}% in {m.max_city}
              </Badge>
            )}
            {m.growth_imbalance && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-1 text-chart-3 bg-chart-3/10 border-chart-3/30">
                <TrendingUp className="h-2.5 w-2.5" /> Growth gap: {m.national_growth_benchmark - m.avg_growth} pts
              </Badge>
            )}
          </div>
        )}

        {/* Holdings */}
        {data.holdings.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Holdings</span>
              {data.holdings.length > 3 && (
                <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-muted/50 transition-colors">
                  {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                </button>
              )}
            </div>
            <div className="space-y-1">
              {(expanded ? data.holdings : data.holdings.slice(0, 3)).map((h) => (
                <HoldingRow key={h.id} h={h} />
              ))}
              {!expanded && data.holdings.length > 3 && (
                <button onClick={() => setExpanded(true)} className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-0.5">
                  +{data.holdings.length - 3} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Insight */}
        <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/30 pt-2">
          {data.diversification_insight}
        </p>
      </CardContent>
    </Card>
  );
});

export default PortfolioStrategyCard;
