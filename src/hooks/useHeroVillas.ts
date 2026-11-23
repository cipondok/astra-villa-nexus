import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HeroVilla {
  id: string;
  href: string;
  title: string;
  city: string;
  price: number;
  image: string;
  bedrooms: number | null;
  bathrooms: number | null;
  roi: number | null;
}

export const HERO_VILLA_LIMIT = 5;

/** "KABUPATEN Temanggung" -> "Temanggung", "KOTA BANDUNG" -> "Bandung". */
export function cleanPlaceName(raw: string | null | undefined): string {
  if (!raw) return "";
  const stripped = raw.replace(/\b(KABUPATEN|KAB\.|KOTA)\s+/gi, "").trim();
  return stripped
    .split(/\s+/)
    .map((w) => (w === w.toUpperCase() && w.length > 1 ? w[0] + w.slice(1).toLowerCase() : w))
    .join(" ");
}

/**
 * Picks the homepage slideshow villas: active villas for sale that have a photo,
 * featured first, then by investment score. Falls back to villas for rent only
 * when there are no villas for sale with a photo.
 */
export function pickHeroVillas(rows: any[], limit = HERO_VILLA_LIMIT): HeroVilla[] {
  const withImage = rows
    .filter((r) => r && (r.property_type ?? "villa").toLowerCase() === "villa")
    .filter((r) => (r.status ?? "active") === "active")
    .map((r) => ({ r, image: r.cover_image || (Array.isArray(r.images) ? r.images.find(Boolean) : null) }))
    .filter((x) => !!x.image);

  const rank = (a: any, b: any) =>
    Number(!!b.r.is_featured) - Number(!!a.r.is_featured) ||
    (Number(b.r.investment_score) || 0) - (Number(a.r.investment_score) || 0);

  const forSale = withImage.filter((x) => (x.r.listing_type ?? "sale") === "sale").sort(rank);
  const chosen = forSale.length ? forSale : withImage.sort(rank);

  return chosen.slice(0, limit).map(({ r, image }) => ({
    id: r.id,
    href: `/property/${r.slug ?? r.id}`,
    title: cleanPlaceName(r.title) || "Villa",
    city: cleanPlaceName(r.city || r.location),
    price: Number(r.price) || 0,
    image,
    bedrooms: r.bedrooms ?? null,
    bathrooms: r.bathrooms ?? null,
    roi: r.roi_percentage != null ? Number(r.roi_percentage) : null,
  }));
}

/** Real villa listings for the homepage hero slideshow. */
export function useHeroVillas() {
  const [villas, setVillas] = useState<HeroVilla[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, slug, title, city, location, price, listing_type, property_type, status, cover_image, images, bedrooms, bathrooms, roi_percentage, investment_score, is_featured")
        .eq("status", "active")
        .eq("property_type", "villa")
        .order("is_featured", { ascending: false, nullsFirst: false })
        .order("investment_score", { ascending: false, nullsFirst: false })
        .limit(40);
      if (!cancelled && !error && data) setVillas(pickHeroVillas(data));
    })();
    return () => { cancelled = true; };
  }, []);

  return villas;
}
