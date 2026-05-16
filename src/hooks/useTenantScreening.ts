import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface TenantApplication {
  full_name: string;
  email?: string;
  phone?: string;
  monthly_income: number;
  employment_type?: string;
  employer_name?: string;
  employment_duration_months?: number;
  previous_landlord_contact?: string;
  reason_for_moving?: string;
  requested_rent: number;
  pets?: string;
  num_occupants?: number;
  credit_score?: number;
  has_criminal_record?: boolean;
  eviction_history?: string;
  references?: string;
}

export interface ScreeningCategory {
  name: string;
  score: number;
  weight: number;
  findings: string[];
  recommendation: string;
}

export interface VerificationItem {
  item: string;
  status: "verified" | "pending" | "not_provided";
  priority: "required" | "recommended" | "optional";
}

export interface ScreeningResult {
  overall_score: number;
  risk_level: "low" | "moderate" | "high" | "critical";
  income_to_rent_ratio: number;
  affordability_rating: string;
  employment_stability: string;
  categories: ScreeningCategory[];
  red_flags: string[];
  green_flags: string[];
  recommended_action: "approve" | "approve_with_conditions" | "further_review" | "decline";
  conditions?: string[];
  verification_checklist: VerificationItem[];
  summary: string;
}

export function useTenantScreening() {
  return useMutation({
    mutationFn: async (application: TenantApplication): Promise<ScreeningResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "tenant_screening", payload: application },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as ScreeningResult;
    },
  });
}
