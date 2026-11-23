import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cleanPlace, propertyPath } from "@/lib/propertySeo";

export interface FeaturedListing {
  id: string;
  href: string;
  title: string;
  place: string;
  price: number | null;
  listingType: "sale" | "rent" | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  buildingArea: number | null;
  landArea: number | null;
  image: string;
  isDemo: boolean;
}

export const FEATURED_LIMIT = 8;

const firstImage = (r: any): string | null => {
  if (r.cover_image) return r.cover_image;
  for (const list of [r.images, r.image_urls]) {
    if (Array.isArray(list)) {
      const hit = list.find((x: unknown) => typeof x === "string" && x.trim() !== "");
      if (hit) return hit;
    }
  }
  return r.thumbnail_url || null;
};

const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * "Properti Pilihan": active listings that have a real photo, featured first,
 * then newest, mixing property types (round-robin) so one type does not fill the row.
 * Only the listing's own fields are used — nothing is invented.
 */
export function pickFeaturedListings(rows: any[], limit = FEATURED_LIMIT): FeaturedListing[] {
  const usable = rows
    .filter((r) => r && (r.status ?? "active") === "active")
    .map((r) => ({ r, image: firstImage(r) }))
    .filter((x): x is { r: any; image: string } => !!x.image)
    .sort(
      (a, b) =>
        Number(!!b.r.is_featured) - Number(!!a.r.is_featured) ||
        String(b.r.created_at ?? "").localeCompare(String(a.r.created_at ?? "")),
    );

  const byType = new Map<string, { r: any; image: string }[]>();
  for (const x of usable) {
    const k = String(x.r.property_type || "other").toLowerCase();
    if (!byType.has(k)) byType.set(k, []);
    byType.get(k)!.push(x);
  }
  const picked: { r: any; image: string }[] = [];
  while (picked.length < limit && [...byType.values()].some((l) => l.length)) {
    for (const list of byType.values()) {
      const next = list.shift();
      if (next) picked.push(next);
      if (picked.length >= limit) break;
    }
  }

  return picked.map(({ r, image }) => {
    const lt = String(r.listing_type || "").toLowerCase();
    const area = cleanPlace(r.area);
    const city = cleanPlace(r.city || r.location);
    return {
      id: r.id,
      href: propertyPath(r),
      title: (cleanPlace(r.title) || "Properti").replace(/\bDi\b/g, "di"),
      place: [area, city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", "),
      price: num(r.price) ?? num(r.price_idr),
      listingType: lt === "sale" || lt === "rent" ? lt : null,
      propertyType: r.property_type ?? null,
      bedrooms: num(r.bedrooms),
      bathrooms: num(r.bathrooms),
      buildingArea: num(r.building_area_sqm) ?? num(r.area_sqm),
      landArea: num(r.land_area_sqm),
      image,
      isDemo: !!r.is_demo,
    };
  });
}

/** Indonesian short price: Rp 9,5 M (miliar) / Rp 18 jt (juta). */
export function formatRupiahShort(n: number | null | undefined): string {
  if (!n || n <= 0) return "";
  const fmt = (v: number) => v.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  if (n >= 1_000_000_000) return `Rp ${fmt(n / 1_000_000_000)} M`;
  if (n >= 1_000_000) return `Rp ${fmt(n / 1_000_000)} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function useFeaturedListings(limit = FEATURED_LIMIT) {
  return useQuery({
    queryKey: ["home-featured-listings", limit],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, slug, title, city, area, location, price, price_idr, listing_type, property_type, status, bedrooms, bathrooms, area_sqm, building_area_sqm, land_area_sqm, cover_image, images, image_urls, thumbnail_url, is_featured, is_demo, created_at",
        )
        .eq("status", "active")
        .order("is_featured", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      return pickFeaturedListings(data ?? [], limit);
    },
  });
}
