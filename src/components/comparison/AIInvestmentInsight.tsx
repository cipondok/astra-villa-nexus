import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown, Minus, Flame, Shield, ShieldAlert, ShieldCheck,
  Bookmark, BookmarkCheck, ArrowUpRight, ArrowDownRight, Trophy, Star, Zap,
} from 'lucide-react';
import { BaseProperty } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { useToggleWatchlist, useWatchlistPropertyIds } from '@/hooks/useInvestorWatchlist';
import Price from '@/components/ui/Price';

// ─── Scoring Engine ────────────────────────────────────────────────
const CITY_RATES: Record<string, number> = {
  bali: 10, seminyak: 12, canggu: 14, ubud: 9, jakarta: 6,
  bandung: 8, surabaya: 7, yogyakarta: 9, lombok: 12, default: 7,
};
const TYPE_YIELDS: Record<string, number> = {
  villa: 8.5, apartment: 6.2, house: 5.5, townhouse: 5.8, land: 0, commercial: 7.5, default: 6,
};

interface InvestmentProfile {
  opportunityScore: number;
  demandHeat: number;
  rentalYield: number;
  appreciation: number;
  roi5y: number;
  pricePerSqm: number | null;
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  riskLabel: string;
  eliteBadge: boolean;
  trendDirection: 'up' | 'stable' | 'down';
  forecastAppreciation5y: number;
  investmentGrade: string;
}

function computeProfile(p: BaseProperty): InvestmentProfile {
  const cityKey = Object.keys(CITY_RATES).find(k => p.city?.toLowerCase().includes(k) || p.location?.toLowerCase().includes(k)) || 'default';
  const appreciation = CITY_RATES[cityKey];
  const typeKey = p.property_type?.toLowerCase() || 'default';
  const rentalYield = TYPE_YIELDS[typeKey] || TYPE_YIELDS.default;
  const pricePerSqm = p.area_sqm && p.area_sqm > 0 ? p.price / p.area_sqm : null;

  // Hash-based pseudo-random for demo consistency
  const hash = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const demandHeat = 45 + (hash % 50); // 45-94
  const baseScore = Math.round(appreciation * 2.5 + rentalYield * 3 + demandHeat * 0.3 + (hash % 10));
  const opportunityScore = Math.min(100, Math.max(20, baseScore));
  const roi5y = Math.round((Math.pow(1 + appreciation / 100, 5) - 1) * 100 * 10) / 10 + rentalYield * 5;

  // Risk
  let riskLevel: InvestmentProfile['riskLevel'] = 'moderate';
  let riskLabel = 'Moderate Risk';
  if (opportunityScore >= 80 && demandHeat >= 70) { riskLevel = 'low'; riskLabel = 'Low Risk'; }
  else if (opportunityScore >= 60) { riskLevel = 'moderate'; riskLabel = 'Moderate Risk'; }
  else if (opportunityScore >= 40) { riskLevel = 'high'; riskLabel = 'High Risk'; }
  else { riskLevel = 'very_high'; riskLabel = 'Very High Risk'; }

  const trendDirection = appreciation >= 10 ? 'up' : appreciation >= 7 ? 'stable' : 'down';
  const forecastAppreciation5y = Math.round(appreciation * 5 * 10) / 10;
  const eliteBadge = opportunityScore >= 85;

  let investmentGrade = 'C';
  if (opportunityScore >= 85) investmentGrade = 'A+';
  else if (opportunityScore >= 75) investmentGrade = 'A';
  else if (opportunityScore >= 65) investmentGrade = 'B+';
  else if (opportunityScore >= 55) investmentGrade = 'B';
  else if (opportunityScore >= 45) investmentGrade = 'C+';

  return {
    opportunityScore, demandHeat, rentalYield, appreciation, roi5y, pricePerSqm,
    riskLevel, riskLabel, eliteBadge, trendDirection, forecastAppreciation5y, investmentGrade,
  };
}

// ─── Config ────────────────────────────────────────────────────────
const RISK_CONFIG = {
  low: { color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/20', icon: ShieldCheck },
  moderate: { color: 'text-chart-4', bg: 'bg-chart-4/10 border-chart-4/20', icon: Shield },
  high: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', icon: ShieldAlert },
  very_high: { color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30', icon: ShieldAlert },
};

const CHART_COLORS = ['hsl(45, 93%, 47%)', 'hsl(210, 100%, 56%)', 'hsl(340, 82%, 52%)', 'hsl(142, 71%, 45%)'];

const TrendArrow = ({ dir }: { dir: 'up' | 'stable' | 'down' }) => {
  if (dir === 'up') return <ArrowUpRight className="h-3.5 w-3.5 text-chart-2" />;
  if (dir === 'down') return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

// ─── AI Decision Insight ───────────────────────────────────────────
function generateInsight(profiles: { property: BaseProperty; profile: InvestmentProfile }[]): string {
  if (profiles.length < 2) return '';
  const sorted = [...profiles].sort((a, b) => b.profile.opportunityScore - a.profile.opportunityScore);
  const best = sorted[0];
  const second = sorted[1];

  const parts: string[] = [];

  // ROI comparison
  if (best.profile.roi5y > second.profile.roi5y * 1.15) {
    parts.push(`${best.property.title?.split(' ').slice(0, 3).join(' ')} offers ${Math.round(best.profile.roi5y - second.profile.roi5y)}% higher 5-year ROI potential`);
  }

  // Appreciation comparison
  const bestAppreciation = sorted.reduce((a, b) => a.profile.forecastAppreciation5y > b.profile.forecastAppreciation5y ? a : b);
  if (bestAppreciation !== best) {
    parts.push(`while ${bestAppreciation.property.title?.split(' ').slice(0, 3).join(' ')} shows stronger long-term appreciation forecast at ${bestAppreciation.profile.forecastAppreciation5y}%`);
  } else {
    parts.push(`with strongest appreciation forecast at ${best.profile.forecastAppreciation5y}%`);
  }

  // Risk insight
  const lowestRisk = sorted.reduce((a, b) => {
    const order = { low: 0, moderate: 1, high: 2, very_high: 3 };
    return order[a.profile.riskLevel] <= order[b.profile.riskLevel] ? a : b;
  });
  if (lowestRisk !== best) {
    parts.push(`${lowestRisk.property.title?.split(' ').slice(0, 3).join(' ')} carries the lowest investment risk (${lowestRisk.profile.riskLabel})`);
  }

  // Rental yield
  const bestYield = sorted.reduce((a, b) => a.profile.rentalYield > b.profile.rentalYield ? a : b);
  if (bestYield !== best) {
    parts.push(`For rental cashflow, ${bestYield.property.title?.split(' ').slice(0, 3).join(' ')} leads with ${bestYield.profile.rentalYield}% yield`);
  }

  return parts.join('. ') + '.';
}

// ─── Main Component ───────────────────────────────────────────────
interface AIInvestmentInsightProps {
  selectedProperties: BaseProperty[];
}

const AIInvestmentInsight = ({ selectedProperties }: AIInvestmentInsightProps) => {
  const { user } = useAuth();
  const toggleWatchlist = useToggleWatchlist();
  const { data: watchlistIds } = useWatchlistPropertyIds();

  const profiles = useMemo(() =>
    selectedProperties.map(p => ({ property: p, profile: computeProfile(p) })),
    [selectedProperties]
  );

  const insight = useMemo(() => generateInsight(profiles), [profiles]);

  // Best metric finders
  const bestOpportunity = Math.max(...profiles.map(p => p.profile.opportunityScore));
  const bestHeat = Math.max(...profiles.map(p => p.profile.demandHeat));
  const bestROI = Math.max(...profiles.map(p => p.profile.roi5y));
  const bestYield = Math.max(...profiles.map(p => p.profile.rentalYield));

  return (
    <div className="space-y-5">
      {/* AI Decision Insight */}
      {insight && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-chart-2 to-primary" />
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">AI Decision Insight</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Property Investment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.map(({ property, profile }, i) => {
          const risk = RISK_CONFIG[profile.riskLevel];
          const RiskIcon = risk.icon;
          const isInWatchlist = watchlistIds?.has(property.id);
          const isBestOpportunity = profile.opportunityScore === bestOpportunity && profiles.length > 1;

          return (
            <motion.div key={property.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={cn(
                'border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden transition-all relative',
                profile.eliteBadge && 'ring-2 ring-primary/30 shadow-lg shadow-primary/10',
                isBestOpportunity && 'ring-2 ring-chart-2/30'
              )}>
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[i % CHART_COLORS.length]}80)` }} />

                {/* Elite Badge */}
                {profile.eliteBadge && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/15 text-primary border-primary/25 text-[9px] gap-0.5 px-1.5 py-0">
                      <Star className="h-2.5 w-2.5" /> Elite
                    </Badge>
                  </div>
                )}

                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <h4 className="text-sm font-semibold line-clamp-1 flex-1">{property.title}</h4>
                  </div>

                  {/* Investment Grade */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-bold bg-primary/5 border-primary/20 text-primary">
                      Grade {profile.investmentGrade}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <TrendArrow dir={profile.trendDirection} />
                      <span className={cn('text-xs font-medium',
                        profile.trendDirection === 'up' ? 'text-chart-2' :
                        profile.trendDirection === 'down' ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {profile.forecastAppreciation5y}%
                      </span>
                    </div>
                  </div>

                  {/* Opportunity Score */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Opportunity Score</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={cn('text-2xl font-black', profile.opportunityScore === bestOpportunity ? 'text-chart-2' : 'text-foreground')}>
                        {profile.opportunityScore}
                      </span>
                      <span className="text-xs text-muted-foreground">/100</span>
                      {profile.opportunityScore === bestOpportunity && profiles.length > 1 && (
                        <Badge className="ml-1 text-[8px] px-1 py-0 bg-chart-2/15 text-chart-2 border-chart-2/25 gap-0.5">
                          <Trophy className="h-2 w-2" /> Best
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Demand Heat */}
                    <div className="p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Flame className={cn('h-3 w-3', profile.demandHeat >= 70 ? 'text-destructive' : profile.demandHeat >= 50 ? 'text-chart-4' : 'text-muted-foreground')} />
                        <p className="text-muted-foreground text-[9px]">Demand Heat</p>
                      </div>
                      <p className={cn('font-bold', profile.demandHeat === bestHeat && profiles.length > 1 ? 'text-chart-2' : '')}>
                        {profile.demandHeat}
                        {profile.demandHeat === bestHeat && profiles.length > 1 && <span className="text-[8px] ml-0.5 text-chart-2">★</span>}
                      </p>
                    </div>

                    {/* Rental Yield */}
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-[9px]">Rental Yield</p>
                      <p className={cn('font-bold', profile.rentalYield === bestYield && profiles.length > 1 ? 'text-chart-2' : '')}>
                        {profile.rentalYield}%
                        {profile.rentalYield === bestYield && profiles.length > 1 && <span className="text-[8px] ml-0.5 text-chart-2">★</span>}
                      </p>
                    </div>

                    {/* ROI 5Y */}
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-muted-foreground text-[9px]">ROI 5Y</p>
                      <div className="flex items-center gap-0.5">
                        <TrendArrow dir={profile.trendDirection} />
                        <span className={cn('font-bold', profile.roi5y === bestROI && profiles.length > 1 ? 'text-chart-2' : '')}>
                          {profile.roi5y.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Risk */}
                    <div className={cn('p-2 rounded-lg border', risk.bg)}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <RiskIcon className={cn('h-3 w-3', risk.color)} />
                        <p className="text-muted-foreground text-[9px]">Risk</p>
                      </div>
                      <p className={cn('font-bold text-[10px]', risk.color)}>{profile.riskLabel}</p>
                    </div>
                  </div>

                  {/* Price per sqm */}
                  {profile.pricePerSqm && (
                    <div className="text-center text-[10px] text-muted-foreground">
                      <Price amount={Math.round(profile.pricePerSqm)} short />/m²
                    </div>
                  )}

                  {/* Watchlist Button */}
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'w-full h-8 text-xs rounded-xl gap-1.5 border-border/50',
                        isInWatchlist && 'bg-primary/5 border-primary/20 text-primary'
                      )}
                      onClick={() => toggleWatchlist.mutate({
                        propertyId: property.id,
                        price: property.price,
                        score: profile.opportunityScore,
                      })}
                      disabled={toggleWatchlist.isPending}
                    >
                      {isInWatchlist ? (
                        <><BookmarkCheck className="h-3.5 w-3.5" /> In Watchlist</>
                      ) : (
                        <><Bookmark className="h-3.5 w-3.5" /> Add to Watchlist</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Summary Table */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Investment Metrics Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground sticky left-0 bg-card z-10 w-[160px]">Metric</th>
                  {profiles.map(({ property }, i) => (
                    <th key={property.id} className="px-4 py-2.5 text-center min-w-[150px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-xs font-semibold truncate max-w-[120px]">{property.title}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Opportunity Score', getValue: (p: InvestmentProfile) => p.opportunityScore, format: (v: number) => `${v}/100`, best: bestOpportunity },
                  { label: 'Demand Heat', getValue: (p: InvestmentProfile) => p.demandHeat, format: (v: number) => `${v}/100`, best: bestHeat },
                  { label: 'ROI Projection (5Y)', getValue: (p: InvestmentProfile) => p.roi5y, format: (v: number) => `${v.toFixed(1)}%`, best: bestROI },
                  { label: 'Rental Yield', getValue: (p: InvestmentProfile) => p.rentalYield, format: (v: number) => `${v}%`, best: bestYield },
                  { label: 'Appreciation Trend', getValue: (p: InvestmentProfile) => p.forecastAppreciation5y, format: (v: number) => `${v}%`, best: Math.max(...profiles.map(p => p.profile.forecastAppreciation5y)) },
                ].map(({ label, getValue, format, best }, idx) => (
                  <tr key={label} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="px-4 py-2 font-medium text-muted-foreground sticky left-0 bg-card z-10 text-xs">{label}</td>
                    {profiles.map(({ property, profile }) => {
                      const val = getValue(profile);
                      const isBest = val === best && profiles.length > 1;
                      return (
                        <td key={property.id} className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendArrow dir={profile.trendDirection} />
                            <span className={cn('font-bold text-xs', isBest ? 'text-chart-2' : '')}>
                              {format(val)}
                            </span>
                            {isBest && (
                              <Badge className="text-[7px] px-1 py-0 bg-chart-2/15 text-chart-2 border-chart-2/25">Best</Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Risk row */}
                <tr>
                  <td className="px-4 py-2 font-medium text-muted-foreground sticky left-0 bg-card z-10 text-xs">Risk Classification</td>
                  {profiles.map(({ property, profile }) => {
                    const risk = RISK_CONFIG[profile.riskLevel];
                    const RiskIcon = risk.icon;
                    return (
                      <td key={property.id} className="px-4 py-2 text-center">
                        <Badge variant="outline" className={cn('text-[10px] gap-0.5', risk.bg, risk.color)}>
                          <RiskIcon className="h-2.5 w-2.5" />
                          {profile.riskLabel}
                        </Badge>
                      </td>
                    );
                  })}
                </tr>
                {/* Grade row */}
                <tr className="bg-gradient-to-r from-primary/5 to-transparent border-t border-primary/15">
                  <td className="px-4 py-2.5 font-bold text-foreground sticky left-0 bg-card z-10 text-xs flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-primary" /> Investment Grade
                  </td>
                  {profiles.map(({ property, profile }) => (
                    <td key={property.id} className="px-4 py-2.5 text-center">
                      <span className={cn('text-lg font-black', profile.eliteBadge ? 'text-primary' : 'text-foreground')}>
                        {profile.investmentGrade}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInvestmentInsight;
