/**
 * Agent Performance & Gamification Engine
 *
 * Performance Score (0-100):
 *   response_speed      × 0.20
 *   viewing_conversion   × 0.25
 *   deals_closed         × 0.25
 *   customer_satisfaction × 0.20
 *   listing_quality      × 0.10
 */

export type AgentTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type BadgeId = 'speed_demon' | 'closer' | 'crowd_favorite' | 'listing_pro' | 'streak_7' | 'streak_30' | 'first_deal' | 'ten_deals' | 'fifty_deals' | 'perfect_rating';

export interface AgentMetricsInput {
  avg_response_minutes: number;
  viewings_booked: number;
  viewings_from_leads: number;
  deals_closed_period: number;
  deals_target: number;
  avg_rating: number; // 1-5
  total_reviews: number;
  listings_optimized: number;
  total_listings: number;
  active_streak_days: number;
  career_deals: number;
}

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface AgentScoreOutput {
  performance_score: number;
  tier: AgentTier;
  rank_percentile: number; // simulated
  badges: BadgeDefinition[];
  bonus_eligible: boolean;
  bonus_reason: string | null;
  signal_breakdown: {
    response_speed: number;
    viewing_conversion: number;
    deals_closed: number;
    customer_satisfaction: number;
    listing_quality: number;
  };
  tips: string[];
}

/* ── Signal scorers (0-100, higher = better) ── */

export function scoreResponseSpeed(avgMinutes: number): number {
  if (avgMinutes <= 5) return 100;
  if (avgMinutes <= 15) return 85;
  if (avgMinutes <= 30) return 70;
  if (avgMinutes <= 60) return 50;
  if (avgMinutes <= 120) return 30;
  return Math.max(5, 30 - (avgMinutes - 120) / 10);
}

export function scoreViewingConversion(booked: number, leads: number): number {
  if (leads === 0) return 50;
  const rate = (booked / leads) * 100;
  if (rate >= 60) return 100;
  if (rate >= 45) return 80;
  if (rate >= 30) return 60;
  if (rate >= 15) return 40;
  return Math.max(5, Math.round(rate * 2.5));
}

export function scoreDealsClosed(closed: number, target: number): number {
  if (target <= 0) return 50;
  const ratio = closed / target;
  if (ratio >= 1.5) return 100;
  if (ratio >= 1) return 85;
  if (ratio >= 0.75) return 65;
  if (ratio >= 0.5) return 45;
  return Math.max(5, Math.round(ratio * 80));
}

export function scoreCustomerSatisfaction(avg: number, reviews: number): number {
  if (reviews === 0) return 40;
  const volumeBonus = Math.min(10, reviews);
  const base = Math.round(((avg - 1) / 4) * 85);
  return Math.min(100, base + volumeBonus);
}

export function scoreListingQuality(optimized: number, total: number): number {
  if (total === 0) return 50;
  const rate = (optimized / total) * 100;
  return Math.min(100, Math.round(rate));
}

/* ── Tier classifier ── */

export function classifyTier(score: number): AgentTier {
  if (score >= 90) return 'DIAMOND';
  if (score >= 75) return 'PLATINUM';
  if (score >= 60) return 'GOLD';
  if (score >= 40) return 'SILVER';
  return 'BRONZE';
}

/* ── Badge evaluator ── */

function evaluateBadges(input: AgentMetricsInput, breakdown: AgentScoreOutput['signal_breakdown']): BadgeDefinition[] {
  const badges: BadgeDefinition[] = [
    { id: 'speed_demon', name: 'Speed Demon', description: 'Rata-rata respons di bawah 10 menit', icon: '⚡', earned: input.avg_response_minutes <= 10 },
    { id: 'closer', name: 'Deal Closer', description: 'Melampaui target closing bulanan', icon: '🎯', earned: input.deals_target > 0 && input.deals_closed_period >= input.deals_target },
    { id: 'crowd_favorite', name: 'Crowd Favorite', description: 'Rating rata-rata ≥ 4.5 dengan 10+ review', icon: '⭐', earned: input.avg_rating >= 4.5 && input.total_reviews >= 10 },
    { id: 'listing_pro', name: 'Listing Pro', description: 'Optimasi 80%+ listing aktif', icon: '📋', earned: input.total_listings > 0 && (input.listings_optimized / input.total_listings) >= 0.8 },
    { id: 'streak_7', name: '7-Day Streak', description: 'Aktif 7 hari berturut-turut', icon: '🔥', earned: input.active_streak_days >= 7 },
    { id: 'streak_30', name: '30-Day Streak', description: 'Aktif 30 hari berturut-turut', icon: '💎', earned: input.active_streak_days >= 30 },
    { id: 'first_deal', name: 'First Blood', description: 'Deal pertama berhasil ditutup', icon: '🏆', earned: input.career_deals >= 1 },
    { id: 'ten_deals', name: 'Ten Timer', description: '10 deal karir selesai', icon: '🔟', earned: input.career_deals >= 10 },
    { id: 'fifty_deals', name: 'Half Century', description: '50 deal karir selesai', icon: '👑', earned: input.career_deals >= 50 },
    { id: 'perfect_rating', name: 'Perfect Score', description: 'Rating 5.0 dengan 5+ review', icon: '💯', earned: input.avg_rating >= 5.0 && input.total_reviews >= 5 },
  ];
  return badges;
}

/* ── Main scorer ── */

export function scoreAgent(input: AgentMetricsInput): AgentScoreOutput {
  const response_speed = scoreResponseSpeed(input.avg_response_minutes);
  const viewing_conversion = scoreViewingConversion(input.viewings_booked, input.viewings_from_leads);
  const deals_closed = scoreDealsClosed(input.deals_closed_period, input.deals_target);
  const customer_satisfaction = scoreCustomerSatisfaction(input.avg_rating, input.total_reviews);
  const listing_quality = scoreListingQuality(input.listings_optimized, input.total_listings);

  const breakdown = { response_speed, viewing_conversion, deals_closed, customer_satisfaction, listing_quality };

  const composite = Math.round(
    response_speed * 0.20 +
    viewing_conversion * 0.25 +
    deals_closed * 0.25 +
    customer_satisfaction * 0.20 +
    listing_quality * 0.10
  );

  const tier = classifyTier(composite);
  const badges = evaluateBadges(input, breakdown);
  const earnedCount = badges.filter(b => b.earned).length;

  // Bonus eligibility
  let bonus_eligible = false;
  let bonus_reason: string | null = null;
  if (composite >= 85 && input.deals_closed_period >= input.deals_target) {
    bonus_eligible = true;
    bonus_reason = 'Performance score 85+ dan target closing tercapai — eligible untuk bonus commission 15%';
  } else if (composite >= 75 && input.active_streak_days >= 30) {
    bonus_eligible = true;
    bonus_reason = 'Konsistensi 30-day streak dengan score 75+ — eligible untuk bonus commission 10%';
  }

  // Tips
  const tips: string[] = [];
  const weakest = Object.entries(breakdown).sort((a, b) => a[1] - b[1]);
  for (const [key, val] of weakest.slice(0, 2)) {
    if (val >= 70) continue;
    switch (key) {
      case 'response_speed': tips.push(`Respons rata-rata ${input.avg_response_minutes} menit — targetkan di bawah 15 menit untuk naik tier.`); break;
      case 'viewing_conversion': tips.push('Tingkatkan konversi lead → viewing dengan follow-up dalam 1 jam pertama.'); break;
      case 'deals_closed': tips.push(`Baru ${input.deals_closed_period}/${input.deals_target} target tercapai — fokus pada deal pipeline yang paling dekat closing.`); break;
      case 'customer_satisfaction': tips.push('Minta review dari klien yang puas — volume review membantu score naik signifikan.'); break;
      case 'listing_quality': tips.push('Optimasi listing (foto, deskripsi, harga) untuk meningkatkan visibility dan inquiry rate.'); break;
    }
  }

  // Simulated percentile (placeholder for real ranking)
  const rank_percentile = Math.min(99, Math.max(1, Math.round(composite * 0.95 + Math.random() * 5)));

  return { performance_score: composite, tier, rank_percentile, badges, bonus_eligible, bonus_reason, signal_breakdown: breakdown, tips };
}
