import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentGenerateInput {
  document_type: "lease_agreement" | "sale_contract" | "handover_report" | "power_of_attorney" | "rental_receipt";
  property_title?: string;
  property_address?: string;
  property_type?: string;
  property_price?: number;
  seller_name?: string;
  buyer_name?: string;
  tenant_name?: string;
  landlord_name?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  monthly_rent?: number;
  deposit_amount?: number;
  payment_terms?: string;
  additional_clauses?: string[];
  language?: string;
}

export interface KeyTerm {
  term: string;
  value: string;
}

export interface DocumentGenerateResult {
  title: string;
  document_number: string;
  content: string;
  summary: string;
  key_terms: KeyTerm[];
  warnings: string[];
  applicable_laws: string[];
}

export function useDocumentGenerator() {
  return useMutation({
    mutationFn: async (input: DocumentGenerateInput): Promise<DocumentGenerateResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "document_generate", payload: input },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as DocumentGenerateResult;
    },
  });
}
