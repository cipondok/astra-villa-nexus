import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MortgageAdvisorRequest {
  property_price: number;
  down_payment_percent?: number;
  monthly_income: number;
  monthly_expenses?: number;
  employment_type: "salaried" | "self_employed" | "freelancer" | "business_owner";
  employment_duration_years?: number;
  age: number;
  property_type: string;
  property_location: string;
  existing_loans?: number;
  preferred_tenor_years?: number;
  is_first_home?: boolean;
}

export interface BankComparison {
  bank_name: string;
  interest_rate_fixed: number;
  interest_rate_floating: number;
  fixed_period_years: number;
  monthly_installment_fixed: number;
  monthly_installment_floating: number;
  max_tenor_years: number;
  processing_fee_percent: number;
  total_cost_over_tenor: number;
  eligibility_score: number;
  pros: string[];
  cons: string[];
  special_offers?: string;
}

export interface MortgageAdvisorResult {
  eligibility_score: number;
  max_loan_amount: number;
  recommended_down_payment_percent: number;
  recommended_tenor_years: number;
  debt_service_ratio: number;
  affordability_status: "comfortable" | "moderate" | "stretched" | "not_recommended";
  bank_comparisons: BankComparison[];
  optimal_down_payment_analysis: {
    down_payment_percent: number;
    monthly_installment: number;
    total_interest_paid: number;
    recommendation: string;
  }[];
  subsidy_eligibility: {
    program_name: string;
    eligible: boolean;
    potential_benefit: string;
    requirements: string[];
  }[];
  risk_assessment: {
    factor: string;
    level: "low" | "medium" | "high";
    description: string;
  }[];
  tips: string[];
  documents_needed: string[];
  timeline_estimate: string;
}

export function useMortgageAdvisor() {
  return useMutation({
    mutationFn: async (input: MortgageAdvisorRequest): Promise<MortgageAdvisorResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "mortgage_advisor", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as MortgageAdvisorResult;
    },
  });
}
