import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ReosAiResult {
  id: string;
  title: string;
  city: string;
  state: string;
  location: string;
  property_type: string;
  listing_type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  rental_yield_percentage: number | null;
  roi_percentage: number | null;
  investment_score: number | null;
  demand_score: number | null;
  liquidity_score: number | null;
  cover_image: string | null;
  images: string[] | null;
  slug: string | null;
  ai_score: number;
  ai_reason: string;
}

export interface ReosAiResponse {
  insight: string;
  results: ReosAiResult[];
  total_pool: number;
}

export function useReosAiSearch() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReosAiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true); setError(null);
    try {
      const { data: res, error: e } = await supabase.functions.invoke<ReosAiResponse>("reos-ai-search", {
        body: { query, limit: 8 },
      });
      if (e) throw e;
      setData(res ?? null);
    } catch (err: any) {
      const msg = err?.message ?? "AI search failed";
      setError(msg.includes("429") ? "Rate limit reached. Try again shortly."
        : msg.includes("402") ? "AI credits exhausted. Add credits in workspace billing."
        : msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setData(null); setError(null); }, []);

  return { search, reset, data, loading, error };
}
