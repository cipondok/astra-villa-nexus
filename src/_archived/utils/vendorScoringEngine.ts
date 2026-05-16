/**
 * Vendor Marketplace Intelligence Engine
 * 
 * Zero-latency client-side scoring for:
 * - Vendor Performance Score (dynamic composite)
 * - Demand Routing Priority
 * - Category Supply Gap Detection
 * - Premium Slot Dominance Ranking
 * - Revenue Opportunity Forecast
 */

// ─── Types ───────────────────────────────────────────────────────────────

export interface VendorProfile {
  id: string;
  vendor_id: string | null;
  business_name: string;
  business_type: string;
  business_city: string | null;
  rating: number | null;
  deal_conversion_rate: number | null;
  avg_response_minutes: number | null;
  total_deals_closed: number | null;
  total_leads_received: number | null;
  total_reviews: number | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  tarif_harian_min: number | null;
  tarif_harian_max: number | null;
}

export interface VendorLeadStats {
  totalLeads: number;
  convertedLeads: number;
  avgResponseMinutes: number;
  pendingLeads: number;
  lostLeads: number;
}

export interface VendorScoreResult {
  performanceScore: number;
  demandAlignmentScore: number;
  routingPriority: number;
  revenueOpportunity: number;
  slaStatus: 'excellent' | 'good' | 'warning' | 'critical';
  tier: 'diamond' | 'gold' | 'silver' | 'starter';
  signals: VendorSignal[];
}

export interface VendorSignal {
  factor: string;
  score: number;
  weight: number;
  status: 'strong' | 'moderate' | 'weak';
}

export interface CategorySupplyGap {
  category: string;
  demandSignal: number;
  activeVendors: number;
  gap: 'critical' | 'shortage' | 'balanced' | 'oversupply';
  gapScore: number;
}

export interface SLAThresholds {
  responseTimeMinutes: number;
  minConversionRate: number;
  minRating: number;
  maxPendingLeads: number;
}

// ─── Default SLA thresholds ──────────────────────────────────────────────

export const DEFAULT_SLA: SLAThresholds = {
  responseTimeMinutes: 120, // 2 hours
  minConversionRate: 0.15,
  minRating: 3.5,
  maxPendingLeads: 25,
};

// ─── Scoring Weights (match edge function) ───────────────────────────────

export const PERF_WEIGHTS = {
  rating: 0.30,
  conversion: 0.25,
  responseTime: 0.25,
  reviews: 0.20,
};

export const ROUTING_WEIGHTS = {
  performance: 0.30,
  demandAlignment: 0.25,
  proximity: 0.20,
  capacity: 0.15,
  price: 0.10,
};

// ─── Helpers ─────────────────────────────────────────────────────────────

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const dimReturn = (val: number, half: number) => val <= 0 ? 0 : clamp((val / (val + half)) * 100);

// ─── Performance Score ───────────────────────────────────────────────────

export function computeVendorPerformance(vendor: VendorProfile, leadStats?: VendorLeadStats): {
  score: number;
  signals: VendorSignal[];
} {
  const signals: VendorSignal[] = [];

  // Rating (0-5 → 0-100)
  const ratingScore = clamp((vendor.rating ?? 0) * 20);
  signals.push({
    factor: 'Client Rating',
    score: ratingScore,
    weight: PERF_WEIGHTS.rating,
    status: ratingScore >= 80 ? 'strong' : ratingScore >= 50 ? 'moderate' : 'weak',
  });

  // Conversion rate
  const convScore = clamp((vendor.deal_conversion_rate ?? 0) * 100);
  signals.push({
    factor: 'Deal Conversion',
    score: convScore,
    weight: PERF_WEIGHTS.conversion,
    status: convScore >= 25 ? 'strong' : convScore >= 10 ? 'moderate' : 'weak',
  });

  // Response time (lower = better)
  const responseMinutes = vendor.avg_response_minutes ?? 999;
  const responseScore = responseMinutes <= 30 ? 100
    : responseMinutes <= 60 ? 85
    : responseMinutes <= 120 ? 65
    : responseMinutes <= 240 ? 40
    : 15;
  signals.push({
    factor: 'Response Speed',
    score: responseScore,
    weight: PERF_WEIGHTS.responseTime,
    status: responseScore >= 80 ? 'strong' : responseScore >= 50 ? 'moderate' : 'weak',
  });

  // Review volume (social proof)
  const reviewScore = dimReturn(vendor.total_reviews ?? 0, 15);
  signals.push({
    factor: 'Review Volume',
    score: reviewScore,
    weight: PERF_WEIGHTS.reviews,
    status: reviewScore >= 60 ? 'strong' : reviewScore >= 30 ? 'moderate' : 'weak',
  });

  const score = clamp(
    ratingScore * PERF_WEIGHTS.rating +
    convScore * PERF_WEIGHTS.conversion +
    responseScore * PERF_WEIGHTS.responseTime +
    reviewScore * PERF_WEIGHTS.reviews
  );

  return { score, signals };
}

// ─── SLA Status ──────────────────────────────────────────────────────────

export function evaluateSLA(
  vendor: VendorProfile,
  leadStats: VendorLeadStats,
  thresholds: SLAThresholds = DEFAULT_SLA,
): 'excellent' | 'good' | 'warning' | 'critical' {
  let violations = 0;

  if ((vendor.avg_response_minutes ?? 999) > thresholds.responseTimeMinutes) violations++;
  if ((vendor.deal_conversion_rate ?? 0) < thresholds.minConversionRate) violations++;
  if ((vendor.rating ?? 0) < thresholds.minRating) violations++;
  if (leadStats.pendingLeads > thresholds.maxPendingLeads) violations++;

  if (violations === 0) return 'excellent';
  if (violations === 1) return 'good';
  if (violations === 2) return 'warning';
  return 'critical';
}

// ─── Routing Priority ────────────────────────────────────────────────────

export function computeRoutingPriority(
  performanceScore: number,
  demandAlignment: number,
  capacityFree: number, // 0-100, how much capacity vendor has
  priceCompetitiveness: number, // 0-100
): number {
  return clamp(
    performanceScore * ROUTING_WEIGHTS.performance +
    demandAlignment * ROUTING_WEIGHTS.demandAlignment +
    50 * ROUTING_WEIGHTS.proximity + // Default proximity when not calculated
    capacityFree * ROUTING_WEIGHTS.capacity +
    priceCompetitiveness * ROUTING_WEIGHTS.price
  );
}

// ─── Revenue Opportunity ─────────────────────────────────────────────────

export function estimateRevenueOpportunity(
  vendor: VendorProfile,
  avgDealValue: number = 5_000_000, // Rp 5M default service deal
): number {
  const monthlyLeadCapacity = 20;
  const convRate = vendor.deal_conversion_rate ?? 0.1;
  const expectedDeals = monthlyLeadCapacity * convRate;
  const platformMargin = 0.12; // 12% marketplace margin
  return Math.round(expectedDeals * avgDealValue * platformMargin);
}

// ─── Tier Classification ─────────────────────────────────────────────────

export function classifyVendorTier(performanceScore: number, isVerified: boolean): 'diamond' | 'gold' | 'silver' | 'starter' {
  if (!isVerified) return 'starter';
  if (performanceScore >= 80) return 'diamond';
  if (performanceScore >= 55) return 'gold';
  if (performanceScore >= 30) return 'silver';
  return 'starter';
}

// ─── Category Supply Gap ─────────────────────────────────────────────────

export function detectSupplyGaps(
  categories: { name: string; vendorCount: number; demandSignal: number }[],
): CategorySupplyGap[] {
  return categories.map(cat => {
    const ratio = cat.vendorCount / Math.max(cat.demandSignal, 1);
    let gap: CategorySupplyGap['gap'];
    let gapScore: number;

    if (ratio < 0.3) { gap = 'critical'; gapScore = 95; }
    else if (ratio < 0.7) { gap = 'shortage'; gapScore = 70; }
    else if (ratio < 1.5) { gap = 'balanced'; gapScore = 40; }
    else { gap = 'oversupply'; gapScore = 15; }

    return {
      category: cat.name,
      demandSignal: cat.demandSignal,
      activeVendors: cat.vendorCount,
      gap,
      gapScore,
    };
  }).sort((a, b) => b.gapScore - a.gapScore);
}

// ─── Master Scorer ───────────────────────────────────────────────────────

export function computeVendorScore(
  vendor: VendorProfile,
  leadStats: VendorLeadStats,
  slaThresholds?: SLAThresholds,
): VendorScoreResult {
  const { score: performanceScore, signals } = computeVendorPerformance(vendor, leadStats);

  const demandAlignmentScore = 50; // Enriched from market data at query time
  const capacityFree = clamp(100 - (leadStats.pendingLeads / 25) * 100);
  const priceCompetitiveness = 60; // Default — enriched from comparison data

  const routingPriority = computeRoutingPriority(performanceScore, demandAlignmentScore, capacityFree, priceCompetitiveness);
  const revenueOpportunity = estimateRevenueOpportunity(vendor);
  const slaStatus = evaluateSLA(vendor, leadStats, slaThresholds);
  const tier = classifyVendorTier(performanceScore, vendor.is_verified ?? false);

  return {
    performanceScore: Math.round(performanceScore * 10) / 10,
    demandAlignmentScore,
    routingPriority: Math.round(routingPriority * 10) / 10,
    revenueOpportunity,
    slaStatus,
    tier,
    signals,
  };
}

// ─── Display helpers ─────────────────────────────────────────────────────

export const SLA_COLORS: Record<string, string> = {
  excellent: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  good: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  warning: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  critical: 'text-red-600 bg-red-500/10 border-red-500/20',
};

export const TIER_LABELS: Record<string, string> = {
  diamond: 'Diamond',
  gold: 'Gold',
  silver: 'Silver',
  starter: 'Starter',
};

export const TIER_COLORS: Record<string, string> = {
  diamond: 'text-cyan-100 bg-gradient-to-r from-cyan-600 to-blue-500',
  gold: 'text-amber-900 bg-gradient-to-r from-amber-400 to-yellow-300',
  silver: 'text-slate-700 bg-gradient-to-r from-slate-300 to-slate-200',
  starter: 'text-stone-700 bg-gradient-to-r from-stone-300 to-stone-200',
};

export const GAP_COLORS: Record<string, string> = {
  critical: 'text-red-600 bg-red-500/10 border-red-500/30',
  shortage: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  balanced: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  oversupply: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
};
