export type DealConfidenceBadgeVariant = 'hot' | 'strong' | 'stable' | 'caution' | 'cold';

export interface DealConfidenceBadge {
  label: string;
  variant: DealConfidenceBadgeVariant;
  emoji: string;
}

/**
 * Generates a confidence badge label from a deal probability score (0–100).
 *
 * 81–100 → FAST SELLING LISTING
 * 61–80  → STRONG BUYER INTEREST
 * 41–60  → STABLE MARKET LISTING
 * 21–40  → NEED PRICE ADJUSTMENT
 * 0–20   → LOW MARKET RESPONSE
 */
export function generateDealConfidenceBadge(deal_score: number): DealConfidenceBadge {
  const clamped = Math.max(0, Math.min(100, Math.round(deal_score)));

  if (clamped >= 81) return { label: '🔥 FAST SELLING LISTING', variant: 'hot', emoji: '🔥' };
  if (clamped >= 61) return { label: '💎 STRONG BUYER INTEREST', variant: 'strong', emoji: '💎' };
  if (clamped >= 41) return { label: '📊 STABLE MARKET LISTING', variant: 'stable', emoji: '📊' };
  if (clamped >= 21) return { label: '⚠️ NEED PRICE ADJUSTMENT', variant: 'caution', emoji: '⚠️' };
  return { label: '❄️ LOW MARKET RESPONSE', variant: 'cold', emoji: '❄️' };
}
