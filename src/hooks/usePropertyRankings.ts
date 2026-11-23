import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RankingKind = "popular" | "trending" | "most_viewed" | "most_saved" | "most_shared" | "newest";

export interface RankedProperty {
  id: string;
  slug: string | null;
  title: string;
  city: string | null;
  district: string | null;
  price: number | null;
  listing_type: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  image: string | null;
  score: number;
  unique_views: number;
  saves: number;
  shares: number;
  inquiries: number;
}

interface RankRow { property_id: string; score: number; unique_views: number; saves: number; shares: number; inquiries: number }

/** Listings ranked server-side from real views, saves, shares and inquiries. */
export function usePropertyRankings(kind: RankingKind, limit = 8, withPhoto = false) {
  return useQuery({
    queryKey: ["property-rankings", kind, limit, withPhoto],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<RankedProperty[]> => {
      const { data: ranks, error } = await supabase.rpc("get_property_rankings" as never, { p_kind: kind, p_limit: limit, p_with_photo: withPhoto } as never);
      if (error) throw error;
      const rows = (ranks as unknown as RankRow[]) || [];
      if (!rows.length) return [];
      const { data: props, error: pErr } = await supabase
        .from("properties")
        .select("id, slug, title, city, area, price, listing_type, property_type, bedrooms, bathrooms, cover_image, thumbnail_url, images, image_urls")
        .in("id", rows.map((r) => r.property_id));
      if (pErr) throw pErr;
      const byId = new Map((props || []).map((p: any) => [p.id, p]));
      return rows
        .map((r) => {
          const p: any = byId.get(r.property_id);
          if (!p) return null;
          const image = p.cover_image || p.thumbnail_url || p.images?.[0] || p.image_urls?.[0] || null;
          return {
            id: p.id, slug: p.slug, title: p.title, city: p.city, district: p.area, price: p.price,
            listing_type: p.listing_type, property_type: p.property_type, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
            image, score: Number(r.score) || 0, unique_views: Number(r.unique_views) || 0, saves: Number(r.saves) || 0,
            shares: Number(r.shares) || 0, inquiries: Number(r.inquiries) || 0,
          } as RankedProperty;
        })
        .filter((x): x is RankedProperty => !!x);
    },
  });
}
