import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLeadIntelligence } from "@/hooks/useLeadIntelligence";
import {
  Flame,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const momentumConfig = {
  STRONG: { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", icon: TrendingUp, label: "Strong Demand" },
  STABLE: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", icon: Minus, label: "Stable Demand" },
  WEAK:   { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: TrendingDown, label: "Weak Demand" },
} as const;

const riskConfig = {
  LOW:    { color: "text-chart-1", icon: ShieldCheck, label: "Low Risk" },
  MEDIUM: { color: "text-chart-4", icon: Shield, label: "Medium Risk" },
  HIGH:   { color: "text-destructive", icon: ShieldAlert, label: "High Risk" },
} as const;

interface LeadIntelligenceCardProps {
  onNavigate?: () => void;
}

const LeadIntelligenceCard = React.memo(function LeadIntelligenceCard({ onNavigate }: LeadIntelligenceCardProps) {
  const { data: intel, isLoading } = useLeadIntelligence();

  if (isLoading || !intel) {
    return (
      <Card className="rounded-2xl border-border/30 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted animate-pulse rounded" />
            <div className="h-8 w-full bg-muted animate-pulse rounded" />
            <div className="h-2 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const momentum = momentumConfig[intel.demand_momentum];
  const risk = riskConfig[intel.response_risk];
  const MomentumIcon = momentum.icon;
  const RiskIcon = risk.icon;

  const intentColor =
    intel.avg_intent_score >= 60 ? "text-chart-1" :
    intel.avg_intent_score >= 30 ? "text-chart-4" :
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
      {/* Gradient top border — reflects demand momentum */}
      <div className={cn(
        "h-1 bg-gradient-to-r",
        intel.demand_momentum === "STRONG" && "from-chart-1/60 via-chart-1/30 to-chart-1/60",
        intel.demand_momentum === "STABLE" && "from-chart-4/60 via-chart-4/30 to-chart-4/60",
        intel.demand_momentum === "WEAK" && "from-destructive/60 via-destructive/30 to-destructive/60",
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Target className="h-3.5 w-3.5" /> Lead Intelligence
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1", momentum.color, momentum.bg, momentum.border)}
          >
            <MomentumIcon className="h-3 w-3" />
            {momentum.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* 2×2 metric grid */}
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-2 gap-2">
            {/* Hot Leads */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <Flame className="h-4 w-4 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{intel.hot_leads}</p>
                    <p className="text-[9px] text-muted-foreground">Hot Leads</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[180px]">
                High-intent buyers active in the last 30 days
              </TooltipContent>
            </Tooltip>

            {/* Avg Intent Score */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <Target className={cn("h-4 w-4 shrink-0", intentColor)} />
                  <div>
                    <p className={cn("text-sm font-bold", intentColor)}>
                      {intel.avg_intent_score.toFixed(0)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Avg Intent</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[180px]">
                Composite score from views, saves, and inquiries (0–100)
              </TooltipContent>
            </Tooltip>

            {/* Response Risk */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <RiskIcon className={cn("h-4 w-4 shrink-0", risk.color)} />
                  <div>
                    <p className={cn("text-sm font-bold", risk.color)}>{risk.label.split(" ")[0]}</p>
                    <p className="text-[9px] text-muted-foreground">Response Risk</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[180px]">
                Avg response: {intel.avg_response_hrs}h — ≤2h Low, ≤8h Medium, &gt;8h High
              </TooltipContent>
            </Tooltip>

            {/* Demand Trend */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <MomentumIcon className={cn("h-4 w-4 shrink-0", momentum.color)} />
                  <div>
                    <p className="text-sm font-bold text-foreground">{intel.leads_7d}</p>
                    <p className="text-[9px] text-muted-foreground">Leads (7d)</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[180px]">
                {intel.leads_7d} this week vs {intel.leads_prev_7d} last week
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Avg response: {intel.avg_response_hrs}h
          </span>
          <span className="text-[9px] text-muted-foreground">
            {intel.total_active_leads.toLocaleString()} active leads
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

export default LeadIntelligenceCard;
