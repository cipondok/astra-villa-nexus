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
  useBuyerListingMatch,
  type BuyerListingMatch,
  type MatchConfidence,
  type EngagementAction,
  type MismatchRisk,
} from "@/hooks/useBuyerListingMatch";
import {
  Handshake,
  Eye,
  HeartHandshake,
  Repeat2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const confConfig: Record<MatchConfidence, { color: string; bg: string; border: string; label: string }> = {
  STRONG_MATCH:   { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Strong" },
  MODERATE_MATCH: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Moderate" },
  LOW_MATCH:      { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/40", label: "Low" },
};

const actionConfig: Record<EngagementAction, { icon: typeof Eye; color: string; label: string }> = {
  IMMEDIATE_VIEWING:   { icon: Eye, color: "text-chart-1", label: "Schedule Viewing" },
  FOLLOWUP_NURTURING:  { icon: HeartHandshake, color: "text-primary", label: "Nurture" },
  ALTERNATIVE_LISTING: { icon: Repeat2, color: "text-muted-foreground", label: "Suggest Alt" },
};

const riskLabels: Record<MismatchRisk, string> = {
  BUDGET_MISMATCH: "Budget",
  LOCATION_CONFLICT: "Location",
  TYPE_MISMATCH: "Type",
};

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return String(price);
}

function MatchRow({ match }: { match: BuyerListingMatch }) {
  const cc = confConfig[match.match_confidence];
  const ac = actionConfig[match.engagement_recommendation];
  const ActionIcon = ac.icon;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-default", cc.border, cc.bg)}>
            {/* Buyer side */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Users className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-[10px] font-medium truncate">{match.buyer_name}</span>
              {match.buyer_intent_score >= 60 && (
                <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-chart-1 bg-chart-1/10 border-chart-1/30 shrink-0">
                  Hot
                </Badge>
              )}
            </div>

            {/* Arrow + score */}
            <div className="flex items-center gap-1 shrink-0">
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 font-bold", cc.color, cc.bg, cc.border)}>
                {match.match_score}
              </Badge>
            </div>

            {/* Listing side */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-[10px] truncate">{match.listing_title}</span>
            </div>

            {/* Risks */}
            {match.mismatch_risks.length > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                {match.mismatch_risks.map((r) => (
                  <span key={r} className="text-[8px] text-destructive font-medium">{riskLabels[r]}</span>
                ))}
              </div>
            )}

            {/* Action */}
            <div className="flex items-center gap-1 shrink-0">
              <ActionIcon className={cn("h-3 w-3", ac.color)} />
              <span className={cn("text-[9px] font-medium", ac.color)}>{ac.label}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[240px] text-[10px] space-y-1">
          <p className="font-medium">{match.listing_city} · Rp {formatPrice(match.listing_price)}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Budget: {match.metrics.budget_fit}%</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Location: {match.metrics.location_fit}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Type: {match.metrics.type_fit}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Deal: {match.metrics.deal_score}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const BuyerListingMatchCard = React.memo(function BuyerListingMatchCard() {
  const { data, isLoading } = useBuyerListingMatch(10);
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

  const visible = expanded ? data.matches : data.matches.slice(0, 4);

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn(
        "h-1 bg-gradient-to-r",
        data.strong_count > 0
          ? "from-chart-1/40 via-primary/25 to-chart-4/20"
          : "from-primary/30 via-chart-4/20 to-muted/20"
      )} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Handshake className="h-3.5 w-3.5" /> Buyer–Listing Matchmaking
          </span>
          <div className="flex items-center gap-1.5">
            {data.strong_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-chart-1 bg-chart-1/10 border-chart-1/30">
                {data.strong_count} Strong
              </Badge>
            )}
            {data.moderate_count > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-2 text-primary bg-primary/10 border-primary/30">
                {data.moderate_count} Mod
              </Badge>
            )}
            {data.total > 4 && (
              <button onClick={() => setExpanded(!expanded)} className="p-0.5 rounded hover:bg-muted/50 transition-colors">
                {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {data.total > 0 ? (
          <>
            {visible.map((m, i) => (
              <MatchRow key={`${m.buyer_id}-${m.listing_id}-${i}`} match={m} />
            ))}
            {!expanded && data.total > 4 && (
              <button onClick={() => setExpanded(true)} className="w-full text-center text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1">
                +{data.total - 4} more matches
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <Handshake className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">No buyer–listing matches available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default BuyerListingMatchCard;
