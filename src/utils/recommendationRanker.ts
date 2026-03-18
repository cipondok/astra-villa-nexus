/**
 * Intelligent Recommendation Ranking Engine
 * 
 * Zero-latency client-side ranking that post-processes raw recommendations
 * using Investor DNA traits, watchlist signals, browsing behavior, and
 * opportunity scoring to deliver a personalized discovery feed.
 */

import type { InvestorDNA } from '@/hooks/useInvestorDNA';

// ─── Types ───

export interface RawRecommendation {
  property_id: string;
  title: string;
  city: string;
  price: number;
  property_type: string;
  image_url: string;
  match_score: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  opportunity_score?: number;
  demand_heat_score?: number;
  is_elite?: boolean;
}

export interface RankedRecommendation extends RawRecommendation {
  finalScore: number;
  rankSignals: RankSignal[];
  contextTag: string;
  boostApplied: string[];
  penaltyApplied: string[];
}

export interface RankSignal {
  factor: string;
  weight: number;
  rawScore: number;
  contribution: number;
  icon: 'dna' | 'watchlist' | 'location' | 'elite' | 'type' | 'budget' | 'trend' | 'penalty';
}

export interface RankingContext {
  investorDNA: InvestorDNA | null;
  watchlistPropertyIds: string[];
  watchlistCities: string[];
  watchlistTypes: string[];
  ignoredPropertyIds: string[];
  browsingHistory: BrowsingSignal[];
}

export interface BrowsingSignal {
  city: string;
  propertyType: string;
  viewCount: number;
  lastViewedAt: string;
}

// ─── Weights ───

const WEIGHTS = {
  DNA_MATCH: 0.30,
  BEHAVIOR_MATCH: 0.25,
  OPPORTUNITY_SCORE: 0.20,
  WATCHLIST_AFFINITY: 0.15,
  BASE_MATCH: 0.10,
} as const;

const BOOSTS = {
  ELITE_OPPORTUNITY: 12,
  WATCHLIST_CITY: 8,
  WATCHLIST_TYPE: 5,
  HIGH_DEMAND: 6,
  BUDGET_SWEET_SPOT: 7,
} as const;

const PENALTIES = {
  IGNORED_LISTING: -25,
  LOW_DNA_FIT: -8,
  STALE_TYPE: -4,
} as const;

// ─── Core Ranking Function ───

export function rankRecommendations(
  raw: RawRecommendation[],
  ctx: RankingContext
): RankedRecommendation[] {
  return raw
    .map(r => scoreRecommendation(r, ctx))
    .sort((a, b) => b.finalScore - a.finalScore);
}

function scoreRecommendation(
  rec: RawRecommendation,
  ctx: RankingContext
): RankedRecommendation {
  const signals: RankSignal[] = [];
  const boosts: string[] = [];
  const penalties: string[] = [];

  // 1. Base match score (from AI engine)
  const baseScore = rec.match_score || 50;
  signals.push({
    factor: 'AI Match',
    weight: WEIGHTS.BASE_MATCH,
    rawScore: baseScore,
    contribution: baseScore * WEIGHTS.BASE_MATCH,
    icon: 'trend',
  });

  // 2. Investor DNA alignment
  const dnaScore = computeDNAScore(rec, ctx.investorDNA);
  signals.push({
    factor: 'DNA Alignment',
    weight: WEIGHTS.DNA_MATCH,
    rawScore: dnaScore,
    contribution: dnaScore * WEIGHTS.DNA_MATCH,
    icon: 'dna',
  });

  // 3. Behavioral affinity (browsing frequency)
  const behaviorScore = computeBehaviorScore(rec, ctx.browsingHistory);
  signals.push({
    factor: 'Browsing Affinity',
    weight: WEIGHTS.BEHAVIOR_MATCH,
    rawScore: behaviorScore,
    contribution: behaviorScore * WEIGHTS.BEHAVIOR_MATCH,
    icon: 'location',
  });

  // 4. Opportunity score
  const oppScore = rec.opportunity_score || 50;
  signals.push({
    factor: 'Opportunity Score',
    weight: WEIGHTS.OPPORTUNITY_SCORE,
    rawScore: oppScore,
    contribution: oppScore * WEIGHTS.OPPORTUNITY_SCORE,
    icon: 'elite',
  });

  // 5. Watchlist affinity
  const watchlistScore = computeWatchlistAffinity(rec, ctx);
  signals.push({
    factor: 'Watchlist Affinity',
    weight: WEIGHTS.WATCHLIST_AFFINITY,
    rawScore: watchlistScore,
    contribution: watchlistScore * WEIGHTS.WATCHLIST_AFFINITY,
    icon: 'watchlist',
  });

  // Sum weighted score
  let finalScore = signals.reduce((sum, s) => sum + s.contribution, 0);

  // ── Boosts ──
  if (rec.is_elite || oppScore >= 85) {
    finalScore += BOOSTS.ELITE_OPPORTUNITY;
    boosts.push('Elite opportunity');
  }
  if (ctx.watchlistCities.some(c => c.toLowerCase() === rec.city?.toLowerCase())) {
    finalScore += BOOSTS.WATCHLIST_CITY;
    boosts.push('Watchlist city match');
  }
  if (ctx.watchlistTypes.some(t => t.toLowerCase() === rec.property_type?.toLowerCase())) {
    finalScore += BOOSTS.WATCHLIST_TYPE;
    boosts.push('Watchlist type match');
  }
  if ((rec.demand_heat_score ?? 0) >= 70) {
    finalScore += BOOSTS.HIGH_DEMAND;
    boosts.push('High demand zone');
  }
  if (ctx.investorDNA && isBudgetSweetSpot(rec.price, ctx.investorDNA)) {
    finalScore += BOOSTS.BUDGET_SWEET_SPOT;
    boosts.push('Budget sweet spot');
  }

  // ── Penalties ──
  if (ctx.ignoredPropertyIds.includes(rec.property_id)) {
    finalScore += PENALTIES.IGNORED_LISTING;
    penalties.push('Previously dismissed');
  }
  if (ctx.investorDNA && dnaScore < 30) {
    finalScore += PENALTIES.LOW_DNA_FIT;
    penalties.push('Low DNA fit');
  }

  // Clamp
  finalScore = Math.max(0, Math.min(100, finalScore));

  // Generate contextual explanation tag
  const contextTag = generateContextTag(rec, ctx, signals, boosts);

  return {
    ...rec,
    finalScore: Math.round(finalScore * 10) / 10,
    rankSignals: signals,
    contextTag,
    boostApplied: boosts,
    penaltyApplied: penalties,
  };
}

// ─── Sub-Scorers ───

function computeDNAScore(rec: RawRecommendation, dna: InvestorDNA | null): number {
  if (!dna) return 50; // Neutral when no DNA

  let score = 50;

  // Property type alignment
  if (dna.preferred_property_types?.some(t => t.toLowerCase() === rec.property_type?.toLowerCase())) {
    score += 20;
  }

  // City alignment
  if (dna.preferred_cities?.some(c => c.toLowerCase() === rec.city?.toLowerCase())) {
    score += 15;
  }

  // Budget range alignment
  if (rec.price >= (dna.budget_range_min || 0) && rec.price <= (dna.budget_range_max || Infinity)) {
    score += 10;
  }

  // Persona-specific boosts
  if (dna.investor_persona === 'luxury' && rec.price > 5_000_000_000) score += 5;
  if (dna.investor_persona === 'flipper' && (rec.opportunity_score ?? 0) >= 75) score += 8;
  if (dna.investor_persona === 'conservative' && (rec.demand_heat_score ?? 0) >= 60) score += 5;

  return Math.min(100, score);
}

function computeBehaviorScore(rec: RawRecommendation, history: BrowsingSignal[]): number {
  if (!history.length) return 50;

  let score = 40;

  // City browsing frequency
  const citySignals = history.filter(h => h.city?.toLowerCase() === rec.city?.toLowerCase());
  const cityViews = citySignals.reduce((sum, s) => sum + s.viewCount, 0);
  score += Math.min(30, cityViews * 3);

  // Property type browsing frequency
  const typeSignals = history.filter(h => h.propertyType?.toLowerCase() === rec.property_type?.toLowerCase());
  const typeViews = typeSignals.reduce((sum, s) => sum + s.viewCount, 0);
  score += Math.min(20, typeViews * 4);

  // Recency boost
  const recentSignals = history.filter(h => {
    const daysSince = (Date.now() - new Date(h.lastViewedAt).getTime()) / 86400000;
    return daysSince < 7;
  });
  if (recentSignals.length > 0) score += 10;

  return Math.min(100, score);
}

function computeWatchlistAffinity(rec: RawRecommendation, ctx: RankingContext): number {
  let score = 30;

  // Already in watchlist = very high affinity (but shouldn't be in feed typically)
  if (ctx.watchlistPropertyIds.includes(rec.property_id)) {
    return 95;
  }

  // Same city as watchlisted properties
  const cityMatch = ctx.watchlistCities.filter(c => c.toLowerCase() === rec.city?.toLowerCase()).length;
  score += Math.min(30, cityMatch * 10);

  // Same type as watchlisted properties
  const typeMatch = ctx.watchlistTypes.filter(t => t.toLowerCase() === rec.property_type?.toLowerCase()).length;
  score += Math.min(20, typeMatch * 8);

  return Math.min(100, score);
}

function isBudgetSweetSpot(price: number, dna: InvestorDNA): boolean {
  const min = dna.budget_range_min || 0;
  const max = dna.budget_range_max || Infinity;
  const midpoint = (min + max) / 2;
  const range = max - min;
  // Sweet spot = within 30% of midpoint
  return Math.abs(price - midpoint) < range * 0.3;
}

// ─── Context Tag Generator ───

function generateContextTag(
  rec: RawRecommendation,
  ctx: RankingContext,
  signals: RankSignal[],
  boosts: string[]
): string {
  // Priority-ordered context explanations
  if (boosts.includes('Elite opportunity')) {
    return `Elite opportunity in ${rec.city}`;
  }

  const dna = ctx.investorDNA;
  if (dna) {
    if (dna.preferred_property_types?.some(t => t.toLowerCase() === rec.property_type?.toLowerCase())) {
      return `Recommended based on your interest in ${rec.property_type.toLowerCase()}`;
    }
    if (dna.preferred_cities?.some(c => c.toLowerCase() === rec.city?.toLowerCase())) {
      return `Matches your ${rec.city} investment focus`;
    }
    if (dna.investor_persona === 'luxury' && rec.price > 5_000_000_000) {
      return `Premium asset aligned with your luxury profile`;
    }
    if (dna.investor_persona === 'flipper' && (rec.opportunity_score ?? 0) >= 75) {
      return `High-potential flip opportunity detected`;
    }
  }

  // Watchlist-based
  if (ctx.watchlistCities.some(c => c.toLowerCase() === rec.city?.toLowerCase())) {
    return `Similar to properties in your watchlist`;
  }

  // Browsing-based
  const cityBrowsing = ctx.browsingHistory.find(h => h.city?.toLowerCase() === rec.city?.toLowerCase());
  if (cityBrowsing && cityBrowsing.viewCount >= 3) {
    return `Based on your frequent ${rec.city} browsing`;
  }

  // Demand-based
  if ((rec.demand_heat_score ?? 0) >= 70) {
    return `Trending in high-demand ${rec.city} market`;
  }

  return `AI-matched to your investment profile`;
}

// ─── Behavior-Triggered Refresh Detection ───

export type RefreshTrigger = 'save' | 'inquiry' | 'offer' | 'watchlist_add' | 'search_filter' | 'dna_update';

const REFRESH_TRIGGERS: Record<RefreshTrigger, { debounceMs: number; priority: number }> = {
  save: { debounceMs: 2000, priority: 2 },
  inquiry: { debounceMs: 1000, priority: 3 },
  offer: { debounceMs: 500, priority: 5 },
  watchlist_add: { debounceMs: 3000, priority: 2 },
  search_filter: { debounceMs: 5000, priority: 1 },
  dna_update: { debounceMs: 0, priority: 5 },
};

export function shouldRefreshFeed(trigger: RefreshTrigger): { shouldRefresh: boolean; debounceMs: number } {
  const config = REFRESH_TRIGGERS[trigger];
  return {
    shouldRefresh: config.priority >= 2,
    debounceMs: config.debounceMs,
  };
}
