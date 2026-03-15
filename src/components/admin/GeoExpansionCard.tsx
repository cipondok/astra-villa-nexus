import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGeoExpansionIntelligence, type ExpansionZone } from "@/hooks/useGeoExpansionIntelligence";
import {
  Map,
  MapPin,
  ArrowUpRight,
  AlertTriangle,
  Minus,
  Zap,
  Eye,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const priorityConfig = {
  IMMEDIATE:    { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", dot: "bg-chart-1", label: "Expand" },
  MONITOR:      { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", dot: "bg-chart-4", label: "Monitor" },
  LOW_PRIORITY: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30", dot: "bg-muted-foreground", label: "Low" },
} as const;

interface GeoExpansionCardProps {
  onNavigate?: () => void;
}

const GeoExpansionCard = React.memo(function GeoExpansionCard({ onNavigate }: GeoExpansionCardProps) {
  const { data: intel, isLoading } = useGeoExpansionIntelligence();

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

  const immediateCount = intel.expansion_zones.filter(z => z.expansion_priority === 'IMMEDIATE').length;
  const topZone = intel.expansion_zones[0];
  const topPriority = topZone ? priorityConfig[topZone.expansion_priority] : priorityConfig.LOW_PRIORITY;
  const topGap = intel.inventory_gaps[0];

  // Gradient reflects overall expansion opportunity
  const gradientColor = immediateCount >= 3 ? "from-chart-1/60 via-chart-1/30 to-chart-1/60"
    : immediateCount >= 1 ? "from-chart-4/60 via-chart-4/30 to-chart-4/60"
    : "from-muted-foreground/30 via-muted/20 to-muted-foreground/30";

  return (
    <Card
      className={cn(
        "rounded-2xl border-border/30 overflow-hidden cursor-pointer transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        "bg-card/80 backdrop-blur-sm"
      )}
      onClick={onNavigate}
    >
      <div className={cn("h-1 bg-gradient-to-r", gradientColor)} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Map className="h-3.5 w-3.5" /> Geo Expansion
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1",
              immediateCount >= 3 ? "text-chart-1 bg-chart-1/10 border-chart-1/30" :
              immediateCount >= 1 ? "text-chart-4 bg-chart-4/10 border-chart-4/30" :
              "text-muted-foreground bg-muted/10 border-border/30"
            )}
          >
            <Zap className="h-3 w-3" />
            {immediateCount} Hot Zone{immediateCount !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Top demand city */}
        <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              {intel.top_demand_city}
            </p>
            <p className="text-[9px] text-muted-foreground">
              Demand {intel.top_demand_score} · {intel.top_demand_volume} listings
            </p>
          </div>
        </div>

        {/* Inventory gap alert */}
        {topGap && topGap.gap_ratio > 2 && (
          <div className="flex items-center gap-2 p-2 rounded-lg border border-chart-4/30 bg-chart-4/5">
            <AlertTriangle className="h-3.5 w-3.5 text-chart-4 shrink-0" />
            <p className="text-[10px] text-foreground">
              <span className="font-semibold">{topGap.city}</span>: demand outpaces supply {topGap.gap_ratio}×
            </p>
          </div>
        )}

        {/* Expansion zone list */}
        <TooltipProvider delayDuration={150}>
          <div className="space-y-1">
            {intel.expansion_zones.slice(0, 4).map((zone) => {
              const config = priorityConfig[zone.expansion_priority];
              return (
                <Tooltip key={zone.city}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between py-1 cursor-default">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", config.dot)} />
                        <span className="text-[10px] text-foreground truncate">{zone.city}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-[10px] font-bold", config.color)}>
                          {zone.opportunity_score}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-[8px] h-4 px-1.5", config.color, config.bg, config.border)}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-[10px] max-w-[220px]">
                    <p>Demand: {zone.demand_score} · Growth: {zone.growth_score} · Hotspot: {zone.hotspot_score}</p>
                    <p>{zone.listing_volume} listings · {zone.market_growth_rate}% growth rate</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />
            {intel.expansion_zones.length} zones analyzed
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {intel.inventory_gaps.length} gaps
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

export default GeoExpansionCard;
