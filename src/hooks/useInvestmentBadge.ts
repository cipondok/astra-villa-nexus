export interface InvestmentBadgeInput {
  investment_score: number;
  price_trend: "UP" | "STABLE" | "DOWN";
  rental_yield: string; // e.g. "5.7% - 7.5%"
}

export interface InvestmentBadgeResult {
  badge: string;
  color: "prime" | "high" | "rental" | "land" | "speculative" | "low";
}

/**
 * Generate an investment recommendation badge based on score, trend, and yield.
 * Pure client-side logic — no API call needed.
 */
export function generateInvestmentBadge(input: InvestmentBadgeInput): InvestmentBadgeResult {
  const { investment_score, price_trend, rental_yield } = input;

  // Parse yield — take the higher end if range
  const yieldMatch = rental_yield.match(/[\d.]+/g);
  const yieldPercent = yieldMatch ? Math.max(...yieldMatch.map(Number)) : 0;

  // PRIME: score ≥ 81, trend UP, yield ≥ 6%
  if (investment_score >= 81 && price_trend === "UP" && yieldPercent >= 6) {
    return { badge: "PRIME INVESTMENT", color: "prime" };
  }

  // HIGH ROI: score ≥ 65, trend UP
  if (investment_score >= 65 && price_trend === "UP") {
    return { badge: "HIGH ROI POTENTIAL", color: "high" };
  }

  // RENTAL CASHFLOW: yield ≥ 6% regardless of trend
  if (yieldPercent >= 6) {
    return { badge: "RENTAL CASHFLOW PROPERTY", color: "rental" };
  }

  // LONG TERM LAND BANK: score ≥ 50, trend STABLE or UP, low yield
  if (investment_score >= 50 && price_trend !== "DOWN" && yieldPercent < 4) {
    return { badge: "LONG TERM LAND BANK", color: "land" };
  }

  // SPECULATIVE: trend DOWN or score 31-49
  if (price_trend === "DOWN" || (investment_score >= 31 && investment_score < 50)) {
    return { badge: "SPECULATIVE AREA", color: "speculative" };
  }

  // LOW: score < 31
  return { badge: "LOW INVESTMENT VALUE", color: "low" };
}
