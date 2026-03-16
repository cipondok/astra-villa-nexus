import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useCapitalFlowIntelligence,
  type CapitalFlowSignal,
  type FlowStrength,
  type RegionCapitalFlow,
} from "@/hooks/useCapitalFlowIntelligence";
import {
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Minus,
  Loader2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const signalConfig: Record<CapitalFlowSignal, { icon: typeof ArrowUpRight; color: string; bg: string; border: string; label: string }> = {
  CAPITAL_INFLOW:   { icon: ArrowUpRight, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Inflow" },
  CAPITAL_OUTFLOW:  { icon: ArrowDownRight, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Outflow" },
  SPECULATIVE_HEAT: { icon: Flame, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", label: "Speculative" },
  STABLE:           { icon: Minus, color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/40", label: "Stable" },
};

const strengthConfig: Record<FlowStrength, { color: string; bg: string; border: string; label: string }> = {
  STRONG_INFLOW:     { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Strong Inflow" },
  MODERATE_ROTATION: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Moderate" },
  CAPITAL_EXIT_RISK: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Exit Risk" },
};

function RegionRow({ r }: { r: RegionCapitalFlow }) {
  const sc = signalConfig[r.capital_flow_signal];
  const st = strengthConfig[r.flow_strength];
  const Icon = sc.icon;
  const m = r.metrics;

  return (
    <div className="p-2 rounded-lg border border-border/30 bg-muted/10 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-3.5 w-3.5", sc.color)} />
          <span className="text-[11px] font-semibold text-foreground">{r.region}</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", sc.color, sc.bg, sc.border)}>
            {sc.label}
          </Badge>
          <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", st.color, st.bg, st.border)}>
            {st.label}
          </Badge>
        </div>
      </div>
      {/* Mini metrics */}
      <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
        <span>Vel: <span className={cn("font-medium", m.velocity_trend > 0 ? "text-chart-1" : m.velocity_trend < 0 ? "text-destructive" : "text-muted-foreground")}>{m.velocity_trend > 0 ? "+" : ""}{m.velocity_trend}</span></span>
        <span>Deal: <span className={cn("font-medium", m.deal_trend > 0 ? "text-chart-1" : m.deal_trend < 0 ? "text-destructive" : "text-muted-foreground")}>{m.deal_trend > 0 ? "+" : ""}{m.deal_trend}</span></span>
        <span>Liq: <span className={cn("font-medium", m.liquidity_trend > 0 ? "text-chart-1" : m.liquidity_trend < -5 ? "text-destructive" : "text-muted-foreground")}>{m.liquidity_trend > 0 ? "+" : ""}{m.liquidity_trend}</span></span>
        <span>G.Acc: <span className={cn("font-medium", m.growth_acceleration > 10 ? "text-chart-3" : m.growth_acceleration > 0 ? "text-chart-1" : "text-muted-foreground")}>{m.growth_acceleration > 0 ? "+" : ""}{m.growth_acceleration}</span></span>
        {m.speculative_risk && <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-chart-3 bg-chart-3/10 border-chart-3/30">🔥 Spec</Badge>}
      </div>
      <p className="text-[9px] text-muted-foreground leading-relaxed">{r.strategic_market_note}</p>
    </div>
  );
}

const CapitalFlowCard = React.memo(function CapitalFlowCard() {
  const { data, isLoading } = useCapitalFlowIntelligence();
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

  const activeRegions = data.regions.filter((r) => r.capital_flow_signal !== "STABLE");
  const displayRegions = expanded ? data.regions : activeRegions.length > 0 ? activeRegions.slice(0, 4) : data.regions.slice(0, 3);
  const hasMore = data.regions.length > displayRegions.length;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className="h-1 bg-gradient-to-r from-chart-1/40 via-chart-3/30 to-destructive/30" />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Landmark className="h-3.5 w-3.5" /> Capital Flow Intelligence
          </span>
          <div className="flex items-center gap-1.5">
            {data.inflow_count > 0 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-chart-1 bg-chart-1/10 border-chart-1/30">
                <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />{data.inflow_count} Inflow
              </Badge>
            )}
            {data.outflow_count > 0 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-destructive bg-destructive/10 border-destructive/30">
                <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />{data.outflow_count} Outflow
              </Badge>
            )}
            {data.speculative_count > 0 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-chart-3 bg-chart-3/10 border-chart-3/30">
                <Flame className="h-2.5 w-2.5 mr-0.5" />{data.speculative_count} Spec
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[9px] text-muted-foreground block">Regions</span>
            <span className="text-sm font-bold text-foreground">{data.total_regions}</span>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground block">Net Flow</span>
            <span className={cn("text-sm font-bold", data.inflow_count > data.outflow_count ? "text-chart-1" : data.outflow_count > data.inflow_count ? "text-destructive" : "text-muted-foreground")}>
              {data.inflow_count > data.outflow_count ? "+" : ""}{data.inflow_count - data.outflow_count}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground block">Active Signals</span>
            <span className="text-sm font-bold text-foreground">{activeRegions.length}</span>
          </div>
        </div>

        {/* Region list */}
        <div className="space-y-1.5">
          {displayRegions.map((r) => (
            <RegionRow key={r.region} r={r} />
          ))}
        </div>

        {(hasMore || expanded) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> +{data.regions.length - displayRegions.length} more regions</>}
          </button>
        )}
      </CardContent>
    </Card>
  );
});

export default CapitalFlowCard;
