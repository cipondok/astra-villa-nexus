import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Activity, TrendingUp, Globe, Shield, BarChart3,
  MapPin, Zap, ArrowUpRight,
} from 'lucide-react';
import {
  useNationalPropertyMarketIndex,
  type MomentumLevel,
  type InvestmentClimate,
} from '@/hooks/useNationalPropertyMarketIndex';
import type { CycleStage } from '@/hooks/useMarketCycleDetector';

// ── Color mappings using semantic tokens ──

const cycleStyles: Record<CycleStage, { color: string; bg: string; border: string; label: string; sublabel: string }> = {
  EXPANSION:  { color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/30', label: 'Expansion Phase', sublabel: 'Demand rising, prices moving up' },
  PEAK:       { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30', label: 'Peak Phase', sublabel: 'Near cycle high, watch for correction' },
  CORRECTION: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'Correction Phase', sublabel: 'Prices adjusting, demand softening' },
  RECOVERY:   { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: 'Recovery Phase', sublabel: 'Market stabilizing, value buying zone' },
};

const climateStyles: Record<InvestmentClimate, { color: string; bg: string; border: string }> = {
  STRONG_BUY_CYCLE:     { color: 'text-chart-1', bg: 'bg-chart-1/10', border: 'border-chart-1/30' },
  SELECTIVE_OPPORTUNITY: { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30' },
  RISK_CONTROL_PHASE:   { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
};

const momentumStyles: Record<MomentumLevel, { color: string; label: string }> = {
  HIGH:     { color: 'text-chart-1', label: 'High Momentum' },
  MODERATE: { color: 'text-chart-4', label: 'Moderate' },
  LOW:      { color: 'text-destructive', label: 'Low Momentum' },
};

// Geospatial heat color for regional leaders
function heatColor(score: number): string {
  if (score >= 76) return 'text-[#EF4444]';
  if (score >= 51) return 'text-[#FB923C]';
  if (score >= 26) return 'text-[#FACC15]';
  return 'text-[#93C5FD]';
}

function heatBg(score: number): string {
  if (score >= 76) return 'bg-[#EF4444]/10';
  if (score >= 51) return 'bg-[#FB923C]/10';
  if (score >= 26) return 'bg-[#FACC15]/10';
  return 'bg-[#93C5FD]/10';
}

const fadeCard = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

// ── Gauge SVG component ──
function MomentumGauge({ score, level }: { score: number; level: MomentumLevel }) {
  const ms = momentumStyles[level];
  const clampedScore = Math.max(0, Math.min(100, score));
  const angle = -90 + (clampedScore / 100) * 180; // -90 to +90
  const radius = 38;
  const cx = 50;
  const cy = 50;

  // Arc path for the gauge background
  const arcLength = Math.PI * radius; // 180 degrees
  const filledLength = (clampedScore / 100) * arcLength;

  return (
    <div className="relative w-32 h-20 mx-auto">
      <svg viewBox="0 0 100 60" className="w-full h-full">
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          strokeWidth="6"
          className="stroke-muted/20"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          strokeWidth="6"
          strokeDasharray={`${filledLength} ${arcLength}`}
          strokeLinecap="round"
          className={clampedScore >= 65 ? 'stroke-chart-1' : clampedScore >= 40 ? 'stroke-chart-4' : 'stroke-destructive'}
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.cos((angle * Math.PI) / 180) * (radius - 8)}
          y2={cy + Math.sin((angle * Math.PI) / 180) * (radius - 8)}
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-foreground"
        />
        <circle cx={cx} cy={cy} r="3" className="fill-foreground" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className={cn("text-lg font-bold", ms.color)}>{clampedScore}</span>
        <span className="text-[9px] text-muted-foreground ml-1">/100</span>
      </div>
    </div>
  );
}

export default function NationalPropertyMarketIndex() {
  const { data, isLoading } = useNationalPropertyMarketIndex();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (!data) return null;

  const { raw, cycle, momentum_level, climate } = data;
  const cs = cycleStyles[cycle.cycle_stage];
  const cls = climateStyles[climate.climate];
  const ms = momentumStyles[momentum_level];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">National Property Market Index</h2>
            <p className="text-[10px] text-muted-foreground">
              Aggregated from {raw.total_cities} cities · {raw.total_properties.toLocaleString()} active listings
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] h-5 px-2", cs.color, cs.bg, cs.border)}>
          {cs.label}
        </Badge>
      </div>

      {/* ── Row 1: Cycle + Momentum + Climate + Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Price Trend / Cycle Phase */}
        <motion.div {...fadeCard(0)}>
          <Card className={cn("h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all overflow-hidden")}>
            <div className={cn("h-1", cs.bg)} />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Activity className="h-3.5 w-3.5" /> Market Cycle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-lg", cs.bg)}>
                  <Activity className={cn("h-5 w-5", cs.color)} />
                </div>
                <div>
                  <p className={cn("text-sm font-bold", cs.color)}>{cs.label}</p>
                  <p className="text-[10px] text-muted-foreground">{cs.sublabel}</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Demand Index</span>
                  <span className="font-medium text-foreground">{raw.national_demand}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Price Index</span>
                  <span className="font-medium text-foreground">{raw.national_price_index}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Composite</span>
                  <span className={cn("font-semibold", cs.color)}>{cycle.composite_score}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Momentum Gauge */}
        <motion.div {...fadeCard(0.06)}>
          <Card className="h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all overflow-hidden">
            <div className={cn("h-1", momentum_level === 'HIGH' ? 'bg-chart-1/30' : momentum_level === 'MODERATE' ? 'bg-chart-4/30' : 'bg-destructive/30')} />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Zap className="h-3.5 w-3.5" /> Momentum
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <MomentumGauge score={raw.momentum_score} level={momentum_level} />
              <div className="text-center">
                <Badge variant="outline" className={cn("text-[10px] h-5 px-2", ms.color)}>
                  {ms.label}
                </Badge>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Growth Signal</span>
                  <span className="font-medium text-foreground">{raw.national_growth}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Liquidity Signal</span>
                  <span className="font-medium text-foreground">{raw.national_liquidity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Investment Climate Signal */}
        <motion.div {...fadeCard(0.12)}>
          <Card className={cn("h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all overflow-hidden")}>
            <div className={cn("h-1", cls.bg)} />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Shield className="h-3.5 w-3.5" /> Climate Signal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{climate.climate_emoji}</span>
                <div>
                  <p className={cn("text-sm font-bold", cls.color)}>{climate.climate_label}</p>
                  <p className="text-[10px] text-muted-foreground">National investment stance</p>
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Avg Investment Score</span>
                  <span className="font-medium text-foreground">{raw.national_investment_score}</span>
                </div>
                <Progress value={raw.national_investment_score} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. Regional Growth Leaders */}
        <motion.div {...fadeCard(0.18)}>
          <Card className="h-full bg-card/60 backdrop-blur-xl border-border/50 hover:shadow-md transition-all overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/30 via-chart-1/20 to-chart-4/20" />
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <BarChart3 className="h-3.5 w-3.5" /> Top Regions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              {raw.regional_leaders.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">No data</p>
              ) : (
                <div className="space-y-1.5">
                  {raw.regional_leaders.slice(0, 5).map((leader, i) => (
                    <div key={leader.city} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                      <MapPin className={cn("h-3 w-3 shrink-0", heatColor(leader.composite))} />
                      <span className="text-[10px] font-medium text-foreground flex-1 truncate">{leader.city}</span>
                      <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 shrink-0", heatColor(leader.composite), heatBg(leader.composite))}>
                        {leader.composite}
                      </Badge>
                      {leader.growth_rate > 0 && (
                        <span className="text-[9px] text-chart-1 flex items-center gap-0.5 shrink-0">
                          <ArrowUpRight className="h-2.5 w-2.5" />
                          {leader.growth_rate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Macro Insight Summary Bar ── */}
      <motion.div {...fadeCard(0.24)}>
        <Card className={cn("bg-card/40 backdrop-blur-xl border-border/30 overflow-hidden", cls.border)}>
          <CardContent className="p-3 flex items-start gap-3">
            <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", cls.bg)}>
              <TrendingUp className={cn("h-4 w-4", cls.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                {climate.climate_emoji} Macro Insight — {climate.climate_label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {climate.macro_summary}
              </p>
              <p className="text-[10px] text-muted-foreground italic">
                {cycle.cycle_insight}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
