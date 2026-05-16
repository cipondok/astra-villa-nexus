import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Villa = {
  id: string;
  slug: string;
  title: string;
  description: string;
  city: string;
  address: string;
  price_idr: number;
  listing_type: "sale" | "rent";
  bedrooms: number;
  bathrooms: number;
  land_sqm: number;
  building_sqm: number;
  status: "draft" | "published" | "sold";
  featured: boolean;
  cover_image: string | null;
  images: string[];
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type VillaFilters = {
  search?: string;
  city?: string;
  listing_type?: "sale" | "rent" | "all";
  minBeds?: number;
  featured?: boolean;
};

export function useVillas(filters: VillaFilters = {}) {
  return useQuery({
    queryKey: ["villas", filters],
    queryFn: async () => {
      let q = supabase
        .from("properties")
        .select("*")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters.city && filters.city !== "all") q = q.eq("city", filters.city);
      if (filters.listing_type && filters.listing_type !== "all") q = q.eq("listing_type", filters.listing_type);
      if (filters.minBeds) q = q.gte("bedrooms", filters.minBeds);
      if (filters.featured) q = q.eq("featured", true);
      if (filters.search) q = q.or(`title.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);

      const { data, error } = await q.limit(60);
      if (error) throw error;
      return (data ?? []) as Villa[];
    },
  });
}

export function useVilla(slug: string | undefined) {
  return useQuery({
    queryKey: ["villa", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Villa | null;
    },
    enabled: !!slug,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["villa-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("city")
        .eq("status", "published");
      if (error) throw error;
      const set = new Set<string>();
      (data ?? []).forEach((r) => r.city && set.add(r.city));
      return Array.from(set).sort();
    },
  });
}
