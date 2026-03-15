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
  useListingPerformanceOptimizer,
  type ListingOptimizationRec,
} from "@/hooks/useListingPerformanceOptimizer";
import {
  Sparkles,
  DollarSign,
  Search,
  Megaphone,
  PauseCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Zap,
  Target,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig = {
  PRICE_OPTIMIZATION: { icon: DollarSign, color: "text-chart-4", bg: "bg-chart-4/10", label: "Price" },
  SEO_VISIBILITY:     { icon: Search, color: "text-primary", bg: "bg-primary/10", label: "SEO" },
  MARKETING_BOOST:    { icon: Megaphone, color: "text-chart-1", bg: "bg-chart-1/10", label: "Marketing" },
  LISTING_PAUSE:      { icon: PauseCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Pause" },
} as const;

const priorityConfig = {
  "Immediate Action":     { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: Zap },
  "Strategic Improvement": { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", icon: Target },
  "Monitor Performance":   { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30", icon: Eye },
} as const;

function RecRow({ rec }: { rec: ListingOptimizationRec }) {
  const tCfg = typeConfig[rec.optimization_type];
  const pCfg = priorityConfig[rec.priority_level];
  const TypeIcon = tCfg.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-default",
            pCfg.border, pCfg.bg
          )}>
            <div className={cn("p-1 rounded-md shrink-0", tCfg.bg)}>
              <TypeIcon className={cn("h-3 w-3", tCfg.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-semibold truncate">{rec.title}</span>
                <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 shrink-0", pCfg.color, pCfg.bg, pCfg.border)}>
                  {tCfg.label}
                </Badge>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{rec.city}</p>
              <p className="text-[9px] text-foreground/80 leading-snug mt-0.5 line-clamp-2">
                {rec.recommended_action}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[240px] text-[10px] space-y-1.5">
          <p className="font-medium">Expected Impact:</p>
          <p>{rec.expected_impact}</p>
          <div className="flex gap-2 flex-wrap pt-1">
            {Object.entries(rec.metrics).map(([k, v]) => (
              <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-muted">
                {k.replace(/_/g, ' ')}: {v}
              </span>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const ListingPerformanceOptimizerCard = React.memo(function ListingPerformanceOptimizerCard() {
  const { data, isLoading } = useListingPerformanceOptimizer();
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

  const hasImmediate = data.immediate_count > 0;
  const hasRecs = data.total_recommendations > 0;
  const visibleRecs = expanded ? data.recommendations : data.recommendations.slice(0, 3);

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        hasImmediate
          ? "from-destructive/50 via-chart-4/30 to-destructive/50"
          : hasRecs
            ? "from-chart-4/40 via-primary/20 to-chart-4/40"
            : "from-chart-1/40 via-chart-1/20 to-chart-1/40"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> Listing Optimizer
          </span>
          <div className="flex items-center gap-1.5">
            {hasImmediate && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-destructive bg-destructive/10 border-destructive/30">
                <Zap className="h-3 w-3" />
                {data.immediate_count} Urgent
              </Badge>
            )}
            {data.strategic_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-4 bg-chart-4/10 border-chart-4/30">
                {data.strategic_count} Strategic
              </Badge>
            )}
            {data.total_recommendations > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-0.5 rounded hover:bg-muted/50 transition-colors"
              >
                {expanded
                  ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {hasRecs ? (
          <>
            {visibleRecs.map((rec, i) => (
              <RecRow key={`${rec.listing_id}-${rec.optimization_type}-${i}`} rec={rec} />
            ))}
            {!expanded && data.total_recommendations > 3 && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                +{data.total_recommendations - 3} more recommendations
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <CheckCircle2 className="h-4 w-4 text-chart-1 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">All listings performing within healthy thresholds</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ListingPerformanceOptimizerCard;
