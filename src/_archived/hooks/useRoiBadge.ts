export interface RoiBadgeInput {
  roi_percent: number;
  rental_yield: number;
}

export interface RoiBadgeResult {
  label: string;
  variant: "capital" | "rental" | "balanced" | "longterm" | "low";
}

/**
 * Generate an ROI investment badge based on total ROI % and rental yield %.
 * Pure client-side logic — no API call needed.
 */
export function generateRoiBadge(input: RoiBadgeInput): RoiBadgeResult {
  const { roi_percent, rental_yield } = input;

  // HIGH CAPITAL GAIN: ROI ≥ 50% and yield < 5%
  if (roi_percent >= 50 && rental_yield < 5) {
    return { label: "📈 HIGH CAPITAL GAIN POTENTIAL", variant: "capital" };
  }

  // STRONG RENTAL CASHFLOW: yield ≥ 7% regardless of ROI
  if (rental_yield >= 7) {
    return { label: "💰 STRONG RENTAL CASHFLOW", variant: "rental" };
  }

  // BALANCED ROI: ROI ≥ 40% and yield ≥ 5%
  if (roi_percent >= 40 && rental_yield >= 5) {
    return { label: "⚖️ BALANCED ROI PROPERTY", variant: "balanced" };
  }

  // LONG TERM WEALTH: ROI 20-49% or yield 4-6.9%
  if (roi_percent >= 20 || rental_yield >= 4) {
    return { label: "🏛️ LONG TERM WEALTH ASSET", variant: "longterm" };
  }

  // LOW RETURN: ROI < 20% and yield < 4%
  return { label: "📉 LOW RETURN INVESTMENT", variant: "low" };
}
