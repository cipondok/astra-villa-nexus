import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMarketAnomalyDetector, type MarketAnomaly } from "@/hooks/useMarketAnomalyDetector";
import {
  ShieldAlert,
  TrendingDown,
  Warehouse,
  Flame,
  Snowflake,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const anomalyConfig = {
  DEMAND_SHOCK:     { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", label: "Demand Shock" },
  OVERSUPPLY_ZONE:  { icon: Warehouse, color: "text-chart-3", bg: "bg-chart-3/10", label: "Oversupply" },
  PRICE_OVERHEATING:{ icon: Flame, color: "text-chart-4", bg: "bg-chart-4/10", label: "Overheating" },
  LIQUIDITY_FREEZE: { icon: Snowflake, color: "text-chart-2", bg: "bg-chart-2/10", label: "Liquidity Freeze" },
} as const;

const severityConfig = {
  ALERT:  { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  WATCH:  { color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30" },
  NORMAL: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30" },
} as const;

function AnomalyRow({ anomaly }: { anomaly: MarketAnomaly }) {
  const cfg = anomalyConfig[anomaly.anomaly_type];
  const sev = severityConfig[anomaly.severity];
  const Icon = cfg.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-default",
            sev.border, sev.bg
          )}>
            <Icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", cfg.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold truncate">{anomaly.affected_area}</span>
                <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", sev.color, sev.bg, sev.border)}>
                  {anomaly.severity}
                </Badge>
              </div>
              <p className="text-[9px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                {cfg.label} — {anomaly.insight_summary.slice(anomaly.affected_area.length + 1)}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[220px] text-[10px]">
          <p className="font-medium mb-1">Recommended Action:</p>
          <p>{anomaly.recommended_admin_action}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const MarketAnomalyCard = React.memo(function MarketAnomalyCard() {
  const { data, isLoading } = useMarketAnomalyDetector();
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

  const hasAlerts = data.alert_count > 0;
  const hasAnomalies = data.total_detected > 0;
  const topAnomalies = expanded ? data.anomalies : data.anomalies.slice(0, 3);

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        hasAlerts
          ? "from-destructive/50 via-destructive/25 to-destructive/50"
          : hasAnomalies
            ? "from-chart-3/50 via-chart-3/25 to-chart-3/50"
            : "from-chart-1/40 via-chart-1/20 to-chart-1/40"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <ShieldAlert className="h-3.5 w-3.5" /> Risk Anomalies
          </span>
          <div className="flex items-center gap-1.5">
            {hasAlerts && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-destructive bg-destructive/10 border-destructive/30 animate-pulse">
                {data.alert_count} Alert{data.alert_count > 1 ? "s" : ""}
              </Badge>
            )}
            {data.watch_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-3 bg-chart-3/10 border-chart-3/30">
                {data.watch_count} Watch
              </Badge>
            )}
            {data.total_detected > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-0.5 rounded hover:bg-muted/50 transition-colors"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {hasAnomalies ? (
          <>
            {topAnomalies.map((a, i) => (
              <AnomalyRow key={`${a.anomaly_type}-${a.affected_area}-${i}`} anomaly={a} />
            ))}
            {!expanded && data.total_detected > 3 && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                +{data.total_detected - 3} more anomalies
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <CheckCircle2 className="h-4 w-4 text-chart-1 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">No market anomalies detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default MarketAnomalyCard;
