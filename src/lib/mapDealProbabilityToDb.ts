import type { TransactionProbabilityResult } from "@/hooks/useTransactionProbability";

export interface DealProbabilityDbFields {
  deal_probability_score: number;
  deal_probability_label: string;
  deal_close_time_estimate: string;
  deal_positive_summary: string;
  deal_risk_summary: string;
  deal_ai_recommendation: string;
}

/**
 * Maps an AI TransactionProbabilityResult into a flat object
 * ready for a database UPDATE / INSERT.
 */
export function mapDealProbabilityToDb(
  result: TransactionProbabilityResult,
): DealProbabilityDbFields {
  return {
    deal_probability_score: result.deal_probability_score,
    deal_probability_label: result.probability_level,
    deal_close_time_estimate: result.estimated_time_to_close,
    deal_positive_summary: result.positive_factors.join(" | "),
    deal_risk_summary: result.risk_factors.join(" | "),
    deal_ai_recommendation: result.recommended_action,
  };
}
