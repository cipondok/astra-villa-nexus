export type MatchLeadVariant = 'hot' | 'high' | 'exploring' | 'low';

export interface MatchLeadSignal {
  label: string;
  variant: MatchLeadVariant;
  emoji: string;
  priority: number;
}

/**
 * Generates a lead priority signal from match score + buyer intent score.
 * Combines both into a weighted composite (60% match, 40% intent).
 *
 * 76–100 → HOT MATCH LEAD
 * 51–75  → HIGH POTENTIAL BUYER
 * 26–50  → EXPLORING USER
 * 0–25   → LOW MATCH INTEREST
 */
export function generateMatchLeadSignal(match_score: number, intent_score: number): MatchLeadSignal {
  const m = Math.max(0, Math.min(100, match_score));
  const i = Math.max(0, Math.min(100, intent_score));
  const composite = Math.round(m * 0.6 + i * 0.4);

  if (composite >= 76) return { label: '🔥 HOT MATCH LEAD', variant: 'hot', emoji: '🔥', priority: 1 };
  if (composite >= 51) return { label: '💎 HIGH POTENTIAL BUYER', variant: 'high', emoji: '💎', priority: 2 };
  if (composite >= 26) return { label: '🔍 EXPLORING USER', variant: 'exploring', emoji: '🔍', priority: 3 };
  return { label: '❄️ LOW MATCH INTEREST', variant: 'low', emoji: '❄️', priority: 4 };
}
