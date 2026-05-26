import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search as SearchIcon, MapPin, Bed, Bath, Maximize, TrendingUp,
  Sparkles, ArrowUpRight, SlidersHorizontal, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import {
  LuxeLayout, LuxeSection, LuxeSectionHead, LuxeCard, LuxeButton, LuxeSearchBar,
} from "@/components/luxe";
import villaFallback1 from "@/assets/luxe-villa-1.jpg";
import villaFallback2 from "@/assets/luxe-villa-2.jpg";
import villaFallback3 from "@/assets/luxe-villa-3.jpg";

/* ============================================================
   ASTRA Villa — Properties (Luxe Migration)
   Built on the global LuxeLayout foundation. Replaces the
   legacy Properties.tsx (archived under src/_archived/pages/).
   ============================================================ */

const FALLBACK_IMGS = [villaFallback1, villaFallback2, villaFallback3];

type Listing = {
  id: string;
  title: string;
  city: string | null;
  area: string | null;
  location: string | null;
  price: number | null;
  price_idr: number | null;
  property_type: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  images: string[] | null;
  image_urls: string[] | null;
  cover_image: string | null;
  investment_score: number | null;
  roi_percentage: number | null;
  rental_yield_percentage: number | null;
  is_featured: boolean | null;
  status: string | null;
};

function formatPrice(n: number | null | undefined): string {
  if (!n || n <= 0) return "On request";
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

const COLLECTION_LABELS: Record<string, string> = {
  luxury:    "Luxury Collection",
  coastal:   "Coastal Series",
  beachfront:"Beachfront Villas",
  jungle:    "Jungle Sanctuaries",
  cliffside: "Cliffside Architecture",
  family:    "Family Villas",
  curated:   "Curated Worlds",
};

const PROPERTY_TYPES = ["all", "villa", "house", "apartment", "land"] as const;
const SORT_OPTIONS = [
  { id: "newest",    label: "Newest" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc",label: "Price ↓" },
  { id: "score",     label: "AI Score" },
] as const;

export default function Properties() {
  const [params, setParams] = useSearchParams();

  const q          = params.get("q") || params.get("query") || "";
  const location   = params.get("location") || "";
  const tag        = params.get("tag") || "";
  const collection = params.get("collection") || "";
  const intent     = params.get("intent") || "";
  const type       = (params.get("type") || "all").toLowerCase();
  const sort       = (params.get("sort") || "newest").toLowerCase();
  const guests     = params.get("guests") || "";
  const when       = params.get("when") || "";

  const [filterOpen, setFilterOpen] = useState(false);

  // Scroll to top on filter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [q, location, tag, collection, intent, type, sort]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["luxe-properties", { q, location, tag, collection, intent, type, sort }],
    queryFn: async (): Promise<Listing[]> => {
      let query = supabase
        .from("properties")
        .select("id,title,city,area,location,price,price_idr,property_type,listing_type,bedrooms,bathrooms,area_sqm,images,image_urls,cover_image,investment_score,roi_percentage,rental_yield_percentage,is_featured,status")
        .eq("status", "active")
        .limit(60);

      if (q) query = query.ilike("title", `%${q}%`);
      if (location) {
        query = query.or(`city.ilike.%${location}%,area.ilike.%${location}%,location.ilike.%${location}%`);
      }
      if (type !== "all") query = query.eq("property_type", type);

      switch (sort) {
        case "price-asc":  query = query.order("price", { ascending: true,  nullsFirst: false } as any); break;
        case "price-desc": query = query.order("price", { ascending: false, nullsFirst: false } as any); break;
        case "score":      query = query.order("investment_score", { ascending: false, nullsFirst: false } as any); break;
        default:           query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
    staleTime: 60_000,
    retry: 0,
  });

  const collectionTitle = collection ? (COLLECTION_LABELS[collection] || collection) : null;

  const heading = useMemo(() => {
    if (collectionTitle) return collectionTitle;
    if (tag)             return `${tag[0].toUpperCase()}${tag.slice(1)} Villas`;
    if (intent === "investment") return "Investment Villas";
    if (q)               return `Results for “${q}”`;
    if (location)        return `Villas in ${location}`;
    return "All Villas";
  }, [collectionTitle, tag, intent, q, location]);

  const subheading = useMemo(() => {
    const parts: string[] = [];
    if (location) parts.push(location);
    if (when)     parts.push(`for ${when}`);
    if (guests)   parts.push(`${guests} guest${Number(guests) > 1 ? "s" : ""}`);
    if (!parts.length) return "Hand-picked sanctuaries across Bali, ranked by AI.";
    return parts.join(" · ");
  }, [location, when, guests]);

  const clearAll = () => setParams({});

  const activeChips: { key: string; label: string }[] = [];
  if (q)          activeChips.push({ key: "q",          label: `“${q}”` });
  if (location)   activeChips.push({ key: "location",   label: location });
  if (tag)        activeChips.push({ key: "tag",        label: tag });
  if (collection) activeChips.push({ key: "collection", label: collectionTitle ?? collection });
  if (intent)    activeChips.push({ key: "intent",     label: intent });
  if (type !== "all") activeChips.push({ key: "type", label: type });

  const removeParam = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    setParams(next);
  };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const results = data ?? [];

  return (
    <LuxeLayout>
      <SEOHead
        title={`${heading} · ASTRA Villa`}
        description="Curated luxury villas in Bali — search by location, dates and guests, ranked by ASTRA AI."
      />

      {/* Hero */}
      <LuxeSection pad="lg" className="pt-32 md:pt-40">
        <LuxeSectionHead
          eyebrow="Discover · The Collection"
          title={
            <>
              {heading.split(" ")[0]}{" "}
              <em className="text-luxe-gold not-italic">{heading.split(" ").slice(1).join(" ") || "Villas"}</em>
            </>
          }
          description={subheading}
        />

        <div className="mt-10">
          <LuxeSearchBar
            defaultLocation={location}
            defaultType={type !== "all" ? type : "all"}
            defaultQuery={q}
            action="/properties"
          />

        </div>

        {/* Active filter chips + controls */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => removeParam(chip.key)}
              className="luxe-glass-card inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] text-luxe-fg/80 hover:text-luxe-gold transition-colors"
            >
              {chip.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          {activeChips.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] uppercase tracking-[0.2em] text-luxe-mut hover:text-luxe-gold transition-colors"
            >
              Clear all
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <LuxeButton
              variant="ghost"
              size="sm"
              iconLeft={<SlidersHorizontal className="w-3.5 h-3.5" />}
              onClick={() => setFilterOpen((v) => !v)}
            >
              Filters
            </LuxeButton>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="luxe-glass-card text-[12px] rounded-full px-4 py-2 bg-transparent text-luxe-fg/85 border-luxe focus:outline-none focus:border-[color:var(--luxe-gold)]/60"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} className="bg-luxe-surface text-luxe-fg">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filterOpen && (
          <LuxeCard className="mt-5 p-5" variant="glass">
            <div className="luxe-eyebrow mb-3">Property Type</div>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => updateParam("type", t)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[12px] uppercase tracking-[0.16em] border transition-colors",
                    type === t
                      ? "bg-[color:var(--luxe-gold)]/15 border-[color:var(--luxe-gold)]/55 text-luxe-gold"
                      : "border-luxe text-luxe-fg/70 hover:border-[color:var(--luxe-gold)]/60 hover:text-luxe-gold"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </LuxeCard>
        )}
      </LuxeSection>

      {/* Results grid */}
      <LuxeSection pad="md" cv>
        {isLoading ? (
          <ResultsSkeleton />
        ) : isError ? (
          <EmptyState
            title="We couldn't reach the collection right now"
            description="Please refresh in a moment. Your search is preserved."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No villas match this search yet"
            description="Try broadening your filters, or ask our AI concierge to curate something for you."
            action={
              <LuxeButton to="/wealth-advisor" variant="gold" iconLeft={<Sparkles className="w-4 h-4" />}>
                Ask AI Concierge
              </LuxeButton>
            }
          />
        ) : (
          <>
            <div className="flex items-end justify-between mb-6">
              <p className="text-[12px] text-luxe-mut uppercase tracking-[0.2em] font-mono-l">
                {results.length} villa{results.length === 1 ? "" : "s"}
              </p>
              <Link to="/wealth-advisor" className="text-[12px] text-luxe-gold hover:underline inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Curate with AI
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {results.map((p, i) => (
                <VillaCard key={p.id} listing={p} index={i} />
              ))}
            </div>
          </>
        )}
      </LuxeSection>
    </LuxeLayout>
  );
}

/* -------------------------------------------------------- */
/* Subcomponents                                            */
/* -------------------------------------------------------- */

function VillaCard({ listing, index }: { listing: Listing; index: number }) {
  const img =
    listing.cover_image ||
    (Array.isArray(listing.image_urls) && listing.image_urls[0]) ||
    (Array.isArray(listing.images) && listing.images[0]) ||
    FALLBACK_IMGS[index % FALLBACK_IMGS.length];

  const priceNum = Number(listing.price_idr ?? listing.price ?? 0);
  const area = [listing.area ?? listing.location, listing.city].filter(Boolean).join(" · ") || "Bali";
  const score = listing.investment_score != null ? Math.round(Number(listing.investment_score)) : null;
  const roi = listing.roi_percentage != null ? Number(listing.roi_percentage) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/properties/${listing.id}`} className="block group">
        <LuxeCard variant="glass" radius="lg" glow interactive className="overflow-hidden flex flex-col h-full">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={img}
              alt={listing.title ?? "Villa"}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {listing.is_featured && (
                <span className="luxe-glass-card px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] text-luxe-gold border border-[color:var(--luxe-gold)]/40">
                  Editor's Pick
                </span>
              )}
              {score != null && score >= 85 && (
                <span className="luxe-glass-card px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] text-[#7be0b3] border border-[#7be0b3]/30 inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {score}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-luxe-fg/60">From</p>
                <p className="font-serif-l text-[22px] leading-none mt-1 text-luxe-fg truncate">
                  {formatPrice(priceNum)}
                </p>
              </div>
              <span className="w-9 h-9 grid place-items-center rounded-full luxe-glass-card border border-[color:var(--luxe-gold)]/40 text-luxe-gold opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
            <h3 className="font-serif-l text-[18px] leading-tight tracking-tight text-luxe-fg line-clamp-1 group-hover:text-luxe-gold transition-colors">
              {listing.title ?? "Untitled Villa"}
            </h3>
            <p className="text-[12px] text-luxe-mut inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-luxe-gold" /> {area}
            </p>

            <div className="mt-auto pt-3 border-t border-luxe flex items-center justify-between text-[11px] text-luxe-mut">
              <div className="flex items-center gap-3">
                {listing.bedrooms != null && (
                  <span className="inline-flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {listing.bedrooms}</span>
                )}
                {listing.bathrooms != null && (
                  <span className="inline-flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {listing.bathrooms}</span>
                )}
                {listing.area_sqm != null && (
                  <span className="inline-flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {listing.area_sqm}m²</span>
                )}
              </div>
              {roi != null && (
                <span className="text-luxe-gold font-mono-l">{roi.toFixed(1)}% ROI</span>
              )}
            </div>
          </div>
        </LuxeCard>
      </Link>
    </motion.div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <LuxeCard key={i} variant="glass" radius="lg" className="overflow-hidden">
          <div className="aspect-[4/5] luxe-shimmer" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-2/3 luxe-shimmer rounded" />
            <div className="h-3 w-1/2 luxe-shimmer rounded" />
            <div className="h-3 w-1/3 luxe-shimmer rounded" />
          </div>
        </LuxeCard>
      ))}
    </div>
  );
}

function EmptyState({
  title, description, action,
}: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <LuxeCard variant="glass" radius="lg" className="p-12 md:p-20 text-center">
      <div className="w-14 h-14 mx-auto rounded-full luxe-glass-card grid place-items-center border-[color:var(--luxe-gold)]/30">
        <SearchIcon className="w-5 h-5 text-luxe-gold" />
      </div>
      <h3 className="font-serif-l text-[28px] mt-6">{title}</h3>
      {description && <p className="mt-3 text-[13px] text-luxe-mut max-w-md mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </LuxeCard>
  );
}
