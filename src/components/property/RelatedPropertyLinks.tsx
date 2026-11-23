import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildBreadcrumbs, cleanPlace, formatIdrShort, propertyPath, typeLabel } from "@/lib/propertySeo";

interface Props {
  property: {
    id: string; slug?: string | null; title?: string | null; city?: string | null; district?: string | null; area?: string | null;
    province?: string | null; state?: string | null; property_type?: string | null; listing_type?: string | null; price?: number | null;
  };
}

interface Row { id: string; slug: string | null; title: string; city: string | null; area: string | null; price: number | null; property_type: string | null }

const citySlug = (city: string) => city.toLowerCase().replace(/\s+/g, "-");

/** Crawlable links to related listings and location pages (internal linking). */
export function RelatedPropertyLinks({ property }: Props) {
  const city = property.city || "";
  const { data } = useQuery({
    queryKey: ["related-links", property.id, city, property.property_type],
    enabled: !!city,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const base = () =>
        supabase.from("properties").select("id, slug, title, city, area, price, property_type")
          .eq("status", "active").eq("city", city).neq("id", property.id);
      const [sameType, sameCity] = await Promise.all([
        property.property_type ? base().eq("property_type", property.property_type).limit(6) : Promise.resolve({ data: [] as Row[] }),
        base().limit(6),
      ]);
      return { sameType: (sameType.data || []) as Row[], sameCity: (sameCity.data || []) as Row[] };
    },
  });

  const cityName = cleanPlace(city);
  const type = typeLabel(property.property_type);
  const crumbs = buildBreadcrumbs(property);
  const sameTypeIds = new Set((data?.sameType || []).map((r) => r.id));
  const others = (data?.sameCity || []).filter((r) => !sameTypeIds.has(r.id)).slice(0, 4);
  const priceCap = property.price && property.price > 0 ? property.price * 1.2 : null;

  const groups: { heading: string; rows: Row[] }[] = [
    { heading: `More ${type.toLowerCase()} listings in ${cityName || "this area"}`, rows: data?.sameType || [] },
    { heading: `Other properties in ${cityName || "this area"}`, rows: others },
  ].filter((g) => g.rows.length);

  return (
    <section aria-labelledby="related-links-heading" className="space-y-5">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-[11px] text-luxe-mut">
          {crumbs.map((c, i) => (
            <li key={c.url} className="inline-flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />}
              {i === crumbs.length - 1 ? (
                <span aria-current="page" className="truncate max-w-[220px] text-luxe-fg/80">{c.name}</span>
              ) : (
                <Link to={c.url.replace(/^https:\/\/[^/]+/, "")} className="hover:text-[var(--luxe-gold)]">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <h2 id="related-links-heading" className="text-[18px] font-semibold text-luxe-fg">Explore nearby</h2>

      <div className="flex flex-wrap gap-2">
        {cityName && (
          <Link to={`/location/${citySlug(cityName)}`} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-luxe px-3.5 text-[12px] text-luxe-fg/85 hover:border-[var(--luxe-gold)]/60">
            <MapPin className="h-3.5 w-3.5 text-[var(--luxe-gold)]" aria-hidden="true" /> Guide to {cityName}
          </Link>
        )}
        {cityName && property.property_type && (
          <Link to={`/properties?location=${encodeURIComponent(cityName)}&type=${property.property_type}${property.listing_type ? `&listing_type=${property.listing_type}` : ""}`} className="inline-flex min-h-[40px] items-center rounded-full border border-luxe px-3.5 text-[12px] text-luxe-fg/85 hover:border-[var(--luxe-gold)]/60">
            All {type.toLowerCase()} listings in {cityName}
          </Link>
        )}
        {cityName && priceCap && (
          <Link to={`/properties?location=${encodeURIComponent(cityName)}&sort=price-asc`} className="inline-flex min-h-[40px] items-center rounded-full border border-luxe px-3.5 text-[12px] text-luxe-fg/85 hover:border-[var(--luxe-gold)]/60">
            {cityName} properties around {formatIdrShort(property.price)}
          </Link>
        )}
      </div>

      {groups.map((g) => (
        <div key={g.heading}>
          <h3 className="text-[13px] font-semibold text-luxe-fg/90 mb-2">{g.heading}</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            {g.rows.map((r) => (
              <li key={r.id}>
                <Link to={propertyPath(r)} className="flex min-h-[40px] items-center justify-between gap-3 border-b border-luxe text-[13px] text-luxe-fg/80 hover:text-[var(--luxe-gold)]">
                  <span className="truncate">{r.title.replace(/\b(KABUPATEN|KOTA)\s+/g, "")}</span>
                  {r.price ? <span className="shrink-0 text-[11px] text-luxe-mut">{formatIdrShort(r.price)}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default RelatedPropertyLinks;
