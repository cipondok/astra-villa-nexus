import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DocumentVerifyRequest {
  document_type: "shm" | "shgb" | "ajb" | "imb" | "pbb" | "other";
  document_text: string;
  property_address?: string;
  owner_name?: string;
  document_number?: string;
}

export interface DocumentVerifyResult {
  is_valid: boolean;
  confidence_score: number;
  document_type_detected: string;
  verification_status: "verified" | "suspicious" | "invalid" | "needs_review";
  findings: {
    category: string;
    status: "pass" | "warning" | "fail";
    description: string;
  }[];
  extracted_data: {
    document_number?: string;
    owner_name?: string;
    property_address?: string;
    issue_date?: string;
    expiry_date?: string;
    land_area?: string;
    building_area?: string;
    issuing_authority?: string;
    registration_number?: string;
  };
  risk_factors: string[];
  recommendations: string[];
  legal_notes: string[];
  authenticity_indicators: {
    indicator: string;
    present: boolean;
    importance: "critical" | "important" | "minor";
  }[];
}

export function useDocumentVerifier() {
  return useMutation({
    mutationFn: async (input: DocumentVerifyRequest): Promise<DocumentVerifyResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "document_verify", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as DocumentVerifyResult;
    },
  });
}
