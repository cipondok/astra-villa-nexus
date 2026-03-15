import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAgentPerformanceIntelligence } from "@/hooks/useAgentPerformanceIntelligence";
import {
  UserCheck,
  Clock,
  Users,
  Scale,
  Trophy,
  ShieldCheck,
  Shield,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const engagementConfig = {
  HIGHLY_ACTIVE:      { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Highly Active" },
  MODERATELY_ACTIVE:  { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Moderately Active" },
  LOW_ACTIVITY_RISK:  { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Low Activity Risk" },
  NO_DATA:            { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30", label: "No Data" },
} as const;

const distributionConfig = {
  BALANCED:       { color: "text-chart-1", icon: Scale, label: "Balanced" },
  MODERATE_SKEW:  { color: "text-chart-4", icon: Scale, label: "Moderate Skew" },
  HIGHLY_SKEWED:  { color: "text-destructive", icon: Scale, label: "Highly Skewed" },
} as const;

interface AgentPerformanceCardProps {
  onNavigate?: () => void;
}

const AgentPerformanceCard = React.memo(function AgentPerformanceCard({ onNavigate }: AgentPerformanceCardProps) {
  const { data: intel, isLoading } = useAgentPerformanceIntelligence();

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

  const engagement = engagementConfig[intel.engagement_level];
  const distribution = distributionConfig[intel.distribution_status];
  const DistIcon = distribution.icon;

  const responseColor =
    intel.avg_response_hrs <= 2 ? "text-chart-1" :
    intel.avg_response_hrs <= 8 ? "text-chart-4" :
    "text-destructive";

  const closeRateColor =
    intel.top_close_rate >= 30 ? "text-chart-1" :
    intel.top_close_rate >= 15 ? "text-chart-4" :
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
      {/* Gradient top border — reflects engagement level */}
      <div className={cn(
        "h-1 bg-gradient-to-r",
        intel.engagement_level === "HIGHLY_ACTIVE" && "from-chart-1/60 via-chart-1/30 to-chart-1/60",
        intel.engagement_level === "MODERATELY_ACTIVE" && "from-chart-4/60 via-chart-4/30 to-chart-4/60",
        intel.engagement_level === "LOW_ACTIVITY_RISK" && "from-destructive/60 via-destructive/30 to-destructive/60",
        intel.engagement_level === "NO_DATA" && "from-primary/40 via-accent/30 to-primary/40",
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <UserCheck className="h-3.5 w-3.5" /> Agent Performance
          </span>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 px-2 gap-1", engagement.color, engagement.bg, engagement.border)}
          >
            <Activity className="h-3 w-3" />
            {engagement.label}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2.5">
        {/* Top agent highlight */}
        <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
          <Trophy className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{intel.top_agent_name}</p>
            <p className="text-[9px] text-muted-foreground">
              {intel.top_agent_sales} sales · {intel.top_close_rate}% close rate
            </p>
          </div>
        </div>

        {/* 2×2 metric grid */}
        <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-2 gap-2">
            {/* Avg Response Time */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <Clock className={cn("h-4 w-4 shrink-0", responseColor)} />
                  <div>
                    <p className={cn("text-sm font-bold", responseColor)}>
                      {intel.avg_response_hrs}h
                    </p>
                    <p className="text-[9px] text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[180px]">
                Average lead response time across all agents (30 days). ≤2h = great, ≤8h = ok, &gt;8h = risk
              </TooltipContent>
            </Tooltip>

            {/* Lead Distribution */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <DistIcon className={cn("h-4 w-4 shrink-0", distribution.color)} />
                  <div>
                    <p className={cn("text-xs font-bold", distribution.color)}>
                      {distribution.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Lead Dist.</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[200px]">
                Coefficient of variation: {intel.distribution_coeff} — measures how evenly leads are distributed across agents
              </TooltipContent>
            </Tooltip>

            {/* Highly Active */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-chart-1" />
                  <div>
                    <p className="text-sm font-bold text-chart-1">{intel.highly_active}</p>
                    <p className="text-[9px] text-muted-foreground">Active</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">
                Agents with ≥20 inquiries and ≥80% response rate
              </TooltipContent>
            </Tooltip>

            {/* At-Risk */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-muted/30 cursor-default">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-bold text-destructive">{intel.low_activity_risk}</p>
                    <p className="text-[9px] text-muted-foreground">At Risk</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">
                Agents with &lt;5 inquiries or &lt;50% response rate
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {intel.total_agents} agents tracked
          </span>
          <span className="text-[9px] text-muted-foreground">
            {intel.moderate_active} moderate
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

export default AgentPerformanceCard;
