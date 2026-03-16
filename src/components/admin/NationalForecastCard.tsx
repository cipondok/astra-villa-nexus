import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useNationalForecast,
  type PriceForecast,
  type ClimatePhase,
} from "@/hooks/useNationalForecast";
import {
  TrendingUp,
  ArrowUpRight,
  Minus,
  TrendingDown,
  Rocket,
  Search,
  ShieldAlert,
  Globe,
  Loader2,
  ArrowUp,
  ArrowDown,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const forecastConfig: Record<PriceForecast, { icon: typeof TrendingUp; color: string; bg: string; border: string; label: string }> = {
  STRONG_GROWTH:   { icon: TrendingUp, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Strong Growth" },
  MODERATE_GROWTH: { icon: ArrowUpRight, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Moderate Growth" },
  STABLE:          { icon: Minus, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Stable" },
  DOWNSIDE_RISK:   { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Downside Risk" },
};

const climateConfig: Record<ClimatePhase, { icon: typeof Rocket; color: string; bg: string; border: string; label: string }> = {
  EXPANSION_CYCLE:       { icon: Rocket, color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "Expansion" },
  SELECTIVE_OPPORTUNITY: { icon: Search, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Selective" },
  RISK_CONTROL:          { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "Risk Control" },
};

function TrendArrow({ value }: { value: number }) {
  if (value > 3) return <ArrowUp className="h-3 w-3 text-chart-1" />;
  if (value < -3) return <ArrowDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function SignalBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">{label}</span>
        <span className="text-[9px] font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 60 ? "bg-chart-1" : pct >= 40 ? "bg-chart-4" : "bg-destructive")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const NationalForecastCard = React.memo(function NationalForecastCard() {
  const { data, isLoading } = useNationalForecast();

  if (isLoading || !data) {
    return (
      <Card className="rounded-2xl border-border/30 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const fc = forecastConfig[data.national_price_forecast];
  const cc = climateConfig[data.investment_climate_phase];
  const FcIcon = fc.icon;
  const CcIcon = cc.icon;

  return (
    <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
      <div className={cn("h-1 bg-gradient-to-r", fc.bg, "via-transparent", cc.bg)} />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Globe className="h-3.5 w-3.5" /> National Forecast
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 gap-1 font-bold", fc.color, fc.bg, fc.border)}>
              <FcIcon className="h-3 w-3" /> {fc.label}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] h-5 px-2 gap-1", cc.color, cc.bg, cc.border)}>
              <CcIcon className="h-3 w-3" /> {cc.label}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Composite */}
        <div className={cn("flex items-center justify-between p-2 rounded-lg border", fc.border, fc.bg)}>
          <div className="flex items-center gap-2">
            <span className={cn("text-lg font-bold", fc.color)}>{data.composite_score}</span>
            <span className="text-[9px] text-muted-foreground">National Index</span>
          </div>
          <span className="text-[9px] text-muted-foreground">12-month outlook</span>
        </div>

        {/* Signal bars */}
        <div className="grid grid-cols-2 gap-2">
          <SignalBar label="Growth" value={data.current_signals.growth} />
          <SignalBar label="Demand" value={data.current_signals.demand} />
          <SignalBar label="Liquidity" value={data.current_signals.liquidity} />
          <SignalBar label="Deal Prob" value={data.current_signals.deal_probability} />
        </div>

        {/* Trends */}
        <div className="flex items-center gap-3 flex-wrap">
          {([
            ['Growth', data.trends.growth_trend],
            ['Demand', data.trends.demand_trend],
            ['Liquidity', data.trends.liquidity_trend],
            ['Deal', data.trends.deal_trend],
          ] as [string, number][]).map(([label, val]) => (
            <div key={label} className="flex items-center gap-1">
              <TrendArrow value={val} />
              <span className="text-[9px] text-muted-foreground">{label}</span>
              <span className={cn("text-[9px] font-medium", val > 0 ? "text-chart-1" : val < 0 ? "text-destructive" : "text-muted-foreground")}>
                {val > 0 ? '+' : ''}{val}
              </span>
            </div>
          ))}
        </div>

        {/* Emerging Regions */}
        {data.emerging_growth_regions.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Emerging Growth Clusters
            </span>
            <div className="space-y-1">
              {data.emerging_growth_regions.slice(0, 4).map((r) => (
                <div key={r.city} className="flex items-center justify-between p-1.5 rounded border border-border/30 bg-muted/20">
                  <span className="text-[10px] font-medium">{r.city}</span>
                  <div className="flex items-center gap-2">
                    {r.demand_acceleration > 3 && (
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-chart-1 bg-chart-1/10 border-chart-1/30">
                        Demand +{r.demand_acceleration}
                      </Badge>
                    )}
                    {r.liquidity_improvement > 3 && (
                      <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-primary bg-primary/10 border-primary/30">
                        Liq +{r.liquidity_improvement}
                      </Badge>
                    )}
                    <span className="text-[9px] text-muted-foreground">G:{r.growth_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outlook */}
        <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/30 pt-2">
          {data.macro_outlook_summary}
        </p>
      </CardContent>
    </Card>
  );
});

export default NationalForecastCard;
