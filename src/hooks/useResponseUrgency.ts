export type ResponseUrgencyVariant = 'critical' | 'high' | 'normal' | 'low';

export interface ResponseUrgencySignal {
  label: string;
  variant: ResponseUrgencyVariant;
  emoji: string;
  max_response_minutes: number;
}

/**
 * Generates agent response urgency from intent score + match score.
 * Weighted composite: 55% intent, 45% match.
 *
 * 81–100 → RESPOND IMMEDIATELY (< 5 min)
 * 61–80  → HIGH PRIORITY FOLLOW UP (< 30 min)
 * 41–60  → NORMAL RESPONSE (< 2 hours)
 * 0–40   → LOW URGENCY (< 24 hours)
 */
export function generateResponseUrgency(intent_score: number, match_score: number): ResponseUrgencySignal {
  const i = Math.max(0, Math.min(100, intent_score));
  const m = Math.max(0, Math.min(100, match_score));
  const composite = Math.round(i * 0.55 + m * 0.45);

  if (composite >= 81) return { label: '🚨 RESPOND IMMEDIATELY', variant: 'critical', emoji: '🚨', max_response_minutes: 5 };
  if (composite >= 61) return { label: '⚡ HIGH PRIORITY FOLLOW UP', variant: 'high', emoji: '⚡', max_response_minutes: 30 };
  if (composite >= 41) return { label: '📋 NORMAL RESPONSE', variant: 'normal', emoji: '📋', max_response_minutes: 120 };
  return { label: '🕐 LOW URGENCY', variant: 'low', emoji: '🕐', max_response_minutes: 1440 };
}
