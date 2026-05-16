import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnomalyFlag {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
}

export interface FlaggedListing {
  id: string;
  title: string;
  city: string;
  price: number;
  fraud_score: number;
  flags: AnomalyFlag[];
}

export interface FraudScanResult {
  flagged: FlaggedListing[];
  total_scanned: number;
  total_flagged: number;
  summary: {
    critical: number;
    high: number;
    low: number;
    flag_types: Record<string, number>;
  };
}

async function runScan(city?: string): Promise<FraudScanResult> {
  const { data, error } = await supabase.functions.invoke("core-engine", {
    body: { mode: "anomaly_detector", city, limit: 200 },
  });
  if (error) throw error;
  return data.data as FraudScanResult;
}

export function useFraudDetector() {
  return useMutation({
    mutationFn: (city?: string) => runScan(city),
  });
}
