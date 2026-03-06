import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ContractAnalysisInput {
  contract_text: string;
  contract_type?: string;
  language?: string;
}

export interface ContractParty {
  role: string;
  name: string;
  details?: string;
}

export interface KeyTerm {
  category: "payment" | "duration" | "termination" | "maintenance" | "insurance" | "tax" | "transfer" | "penalty" | "other";
  term: string;
  details: string;
  importance: "critical" | "important" | "standard";
  clause_reference?: string;
}

export interface ContractRisk {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affected_party?: string;
  recommendation: string;
  legal_reference?: string;
}

export interface Obligation {
  party: string;
  obligation: string;
  deadline?: string;
  penalty_for_breach?: string;
  status?: "active" | "conditional" | "one-time";
}

export interface ContractAnalysisResult {
  summary: {
    contract_type: string;
    parties: ContractParty[];
    effective_date?: string;
    expiry_date?: string;
    property_description?: string;
    total_value?: string;
    language_detected?: string;
  };
  key_terms: KeyTerm[];
  risks: ContractRisk[];
  obligations: Obligation[];
  financial_breakdown?: {
    total_cost?: string;
    payment_schedule?: { description: string; amount: string; due_date?: string }[];
    taxes_and_fees?: { type: string; amount: string; responsible_party?: string }[];
    hidden_costs?: string[];
  };
  legal_compliance: {
    overall_score: number;
    compliant_areas?: string[];
    non_compliant_areas?: string[];
    missing_clauses?: string[];
    recommendations: string[];
  };
  overall_assessment: {
    risk_level: "low" | "moderate" | "high" | "critical";
    favorability: "buyer_favorable" | "balanced" | "seller_favorable" | "landlord_favorable" | "tenant_favorable";
    recommendation: "proceed" | "proceed_with_caution" | "negotiate" | "seek_legal_counsel" | "do_not_sign";
    reasoning: string;
    negotiation_points?: string[];
  };
}

export function useContractAnalysis() {
  return useMutation({
    mutationFn: async (input: ContractAnalysisInput): Promise<ContractAnalysisResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "contract_analysis", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as ContractAnalysisResult;
    },
  });
}
