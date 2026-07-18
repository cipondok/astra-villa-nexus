import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import {
  Search as SearchIcon, MapPin, Bed, Bath, Maximize, TrendingUp,
  Sparkles, ArrowUpRight, SlidersHorizontal, X, Loader2,
  LayoutGrid, List as ListIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import ReosShell from "@/components/reos/ReosShell";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { MarketplaceDevOverlay } from "@/components/dev/MarketplaceDevOverlay";
import { indonesiaProvinces } from "@/data/indonesiaProvinces";
import villaFallback1 from "@/assets/luxe-villa-1.jpg";
import villaFallback2 from "@/assets/luxe-villa-2.jpg";
import villaFallback3 from "@/assets/luxe-villa-3.jpg";

/** Popular Indonesian cities/areas surfaced in the location dropdown alongside
 *  the 34 provinces from `indonesiaProvinces` (which is our canonical location
 *  source). Users can still type any free-text value — this only powers the
 *  <datalist> suggestions. */
const POPULAR_CITY_SUGGESTIONS = [
  "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan",
  "Denpasar", "Ubud", "Canggu", "Seminyak", "Kuta", "Uluwatu", "Nusa Dua",
  "Batam", "Makassar", "Balikpapan", "Manado", "Palembang", "Lombok",
];

const LOCATION_SUGGESTIONS: string[] = Array.from(
  new Set([
    ...indonesiaProvinces.map((p) => p.name),
    ...POPULAR_CITY_SUGGESTIONS,
  ]),
).sort((a, b) => a.localeCompare(b));

/** Columns per row matching the Tailwind grid breakpoints. */
function useGridColumns() {
  const get = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w < 640) return 1;   // grid-cols-1
    if (w < 1024) return 2;  // sm:grid-cols-2
    return 3;                // lg:grid-cols-3
  };
  const [cols, setCols] = useState<number>(get);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setCols(get()), 150);
    };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); };
  }, []);
  return cols;
}

/** Responsive page size: desktop 24 / tablet 18 / mobile 12. */
function useResponsivePageSize() {
  const get = () => {
    if (typeof window === "undefined") return 24;
    const w = window.innerWidth;
    if (w < 640) return 12;
    if (w < 1024) return 18;
    return 24;
  };
  const [size, setSize] = useState<number>(get);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setSize(get()), 150);
    };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); };
  }, []);
  return size;
}

/* ============================================================
   ASTRA Villa — Properties (REOS shell)
   Now uses the shared ReosShell so the header, footer and color
   scheme match the home page (/) exactly.
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

const PROPERTY_TYPES = ["all", "villa", "house", "apartment", "townhouse", "condo", "land", "commercial"] as const;
const LISTING_TYPES = [
  { id: "",     label: "Any" },
  { id: "sale", label: "For Sale" },
  { id: "rent", label: "For Rent" },
] as const;
const PRICE_RANGES: { id: string; label: string; min?: number; max?: number }[] = [
  { id: "",            label: "Any Price" },
  { id: "0-1b",        label: "Up to Rp 1B",       min: 0,             max: 1_000_000_000 },
  { id: "1b-3b",       label: "Rp 1B – 3B",        min: 1_000_000_000, max: 3_000_000_000 },
  { id: "3b-5b",       label: "Rp 3B – 5B",        min: 3_000_000_000, max: 5_000_000_000 },
  { id: "5b-10b",      label: "Rp 5B – 10B",       min: 5_000_000_000, max: 10_000_000_000 },
  { id: "10b-plus",    label: "Rp 10B+",           min: 10_000_000_000 },
];
const SORT_OPTIONS = [
  { id: "newest",    label: "Newest" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc",label: "Price ↓" },
  { id: "score",     label: "AI Score" },
] as const;

const PATH_PRESETS: Record<string, { listingType?: string; collection?: string; heading?: string }> = {
  "/dijual":        { listingType: "sale", heading: "Villas Dijual" },
  "/buy":           { listingType: "sale", heading: "Properties for Sale" },
  "/disewa":        { listingType: "rent", heading: "Villas Disewa" },
  "/rent":          { listingType: "rent", heading: "Properties for Rent" },
  "/sewa":          { listingType: "rent", heading: "Properties for Rent" },
  "/pre-launching": { collection: "pre-launch", heading: "Pre-Launch Collection" },
  "/pre-launch":    { collection: "pre-launch", heading: "Pre-Launch Collection" },
  "/new-projects":  { collection: "new-projects", heading: "New Projects" },
};

export default function Properties() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const preset = PATH_PRESETS[pathname] ?? {};
  const [params, setParams] = useSearchParams();

  const q          = params.get("q") || params.get("query") || "";
  const location   = params.get("location") || "";
  const tag        = params.get("tag") || "";
  const collection = params.get("collection") || preset.collection || "";
  const intent     = params.get("intent") || "";
  const type       = (params.get("type") || "all").toLowerCase();
  const sort       = (params.get("sort") || "newest").toLowerCase();
  const guests     = params.get("guests") || "";
  const when       = params.get("when") || "";
  const listingType = (params.get("listing_type") || preset.listingType || "").toLowerCase();
  const priceRangeId = (params.get("price") || "").toLowerCase();
  const priceRange = PRICE_RANGES.find((r) => r.id === priceRangeId);
  const viewMode: "grid" | "list" = (params.get("view") === "list" ? "list" : "grid");

  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(q);
  const [locationInput, setLocationInput] = useState(location);

  useEffect(() => { setSearchInput(q); }, [q]);
  useEffect(() => { setLocationInput(location); }, [location]);

  const pageSize = useResponsivePageSize();

  // ------- Marketplace analytics -------
  const { trackEvent } = useTrackEvent();
  const fetchCountRef = useRef(0);
  const inFlightPagesRef = useRef<Set<number>>(new Set());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const endOfListFiredRef = useRef(false);
  const sentinelTriggerCountRef = useRef(0);
  const duplicatesDetectedRef = useRef(0); // duplicate REQUESTS (same page in flight twice)
  const duplicateRowsRef = useRef(0);      // duplicate ROWS returned across pages
  const filtersKey = `${q}|${location}|${tag}|${collection}|${intent}|${type}|${sort}|${listingType}|${priceRangeId}|${pageSize}`;
  const filtersKeyRef = useRef(filtersKey);
  // Reset counters when the query key changes (new search / filter set).
  useEffect(() => {
    if (filtersKeyRef.current !== filtersKey) {
      filtersKeyRef.current = filtersKey;
      fetchCountRef.current = 0;
      inFlightPagesRef.current.clear();
      seenIdsRef.current.clear();
      endOfListFiredRef.current = false;
      sentinelTriggerCountRef.current = 0;
      duplicatesDetectedRef.current = 0;
      duplicateRowsRef.current = 0;
    }
  }, [filtersKey]);

  // Skip the initial scroll-to-top so useScrollRestore can honor prior position on back-nav.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [q, location, tag, collection, intent, type, sort, listingType, priceRangeId, pathname]);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["reos-properties", { q, location, tag, collection, intent, type, sort, listingType, priceRangeId, pageSize }],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<Listing[]> => {
      const pageIndex = pageParam as number;
      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;

      // Duplicate-request guard: track pages already in flight for this filter set.
      const inFlight = inFlightPagesRef.current;
      const isDuplicate = inFlight.has(pageIndex);
      if (isDuplicate) {
        duplicatesDetectedRef.current += 1;
        trackEvent("marketplace_duplicate_request_detected", {
          metadata: {
            page_index: pageIndex,
            page_size: pageSize,
            filters_key: filtersKey,
            in_flight_pages: Array.from(inFlight),
          },
        });
      }
      inFlight.add(pageIndex);
      fetchCountRef.current += 1;
      const fetchNumber = fetchCountRef.current;

      trackEvent("marketplace_fetch_start", {
        metadata: {
          page_index: pageIndex,
          page_size: pageSize,
          from,
          to,
          fetch_number: fetchNumber,
          filters_key: filtersKey,
        },
      });

      let query = supabase
        .from("properties")
        .select("id,title,city,area,location,price,price_idr,property_type,listing_type,bedrooms,bathrooms,area_sqm,images,image_urls,cover_image,investment_score,roi_percentage,rental_yield_percentage,is_featured,status,development_status")
        .eq("status", "active");

      if (q) query = query.ilike("title", `%${q}%`);
      if (location) {
        query = query.or(`city.ilike.%${location}%,area.ilike.%${location}%,location.ilike.%${location}%`);
      }
      if (type !== "all") query = query.eq("property_type", type);
      if (listingType) query = query.eq("listing_type", listingType);
      if (priceRange?.min != null) query = query.gte("price", priceRange.min);
      if (priceRange?.max != null) query = query.lte("price", priceRange.max);

      const COLLECTION_TO_DEV: Record<string, string[]> = {
        "pre-launch":   ["pre_launch", "pre-launch", "prelaunch"],
        "new-projects": ["new_project", "new-projects", "new_projects"],
      };
      const devStatuses = collection ? COLLECTION_TO_DEV[collection] : null;
      if (devStatuses?.length) query = query.in("development_status", devStatuses);

      switch (sort) {
        case "price-asc":  query = query.order("price", { ascending: true,  nullsFirst: false } as any); break;
        case "price-desc": query = query.order("price", { ascending: false, nullsFirst: false } as any); break;
        case "score":      query = query.order("investment_score", { ascending: false, nullsFirst: false } as any); break;
        default:           query = query.order("created_at", { ascending: false });
      }

      const t0 = performance.now();
      const { data, error } = await query.range(from, to);
      const durationMs = Math.round(performance.now() - t0);

      inFlight.delete(pageIndex);

      if (error) {
        trackEvent("marketplace_fetch_error", {
          metadata: {
            page_index: pageIndex,
            page_size: pageSize,
            duration_ms: durationMs,
            message: error.message,
            fetch_number: fetchNumber,
          },
        });
        throw error;
      }

      const rows = (data ?? []) as Listing[];
      // Count duplicates against previously-seen ids for this filter set.
      let duplicates = 0;
      for (const r of rows) {
        if (seenIdsRef.current.has(r.id)) duplicates += 1;
        else seenIdsRef.current.add(r.id);
      }
      duplicateRowsRef.current += duplicates;

      trackEvent("marketplace_batch_loaded", {
        metadata: {
          page_index: pageIndex,
          page_size: pageSize,
          rows_returned: rows.length,
          duplicates_dropped: duplicates,
          duration_ms: durationMs,
          fetch_number: fetchNumber,
          was_duplicate_request: isDuplicate,
          filters_key: filtersKey,
        },
      });

      return rows;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return allPages.length;
    },
    staleTime: 60_000,
    retry: 0,
  });


  const collectionTitle = collection ? (COLLECTION_LABELS[collection] || collection) : null;

  const heading = useMemo(() => {
    if (preset.heading)  return preset.heading;
    if (collectionTitle) return collectionTitle;
    if (tag)             return `${tag[0].toUpperCase()}${tag.slice(1)} Villas`;
    if (intent === "investment") return "Investment Villas";
    if (q)               return `Results for "${q}"`;
    if (location)        return `Villas in ${location}`;
    return "All Villas";
  }, [preset.heading, collectionTitle, tag, intent, q, location]);

  const subheading = useMemo(() => {
    const parts: string[] = [];
    if (location) parts.push(location);
    if (when)     parts.push(`for ${when}`);
    if (guests)   parts.push(`${guests} guest${Number(guests) > 1 ? "s" : ""}`);
    if (!parts.length) return "Hand-picked sanctuaries across ASEAN, ranked by ASTRA AI.";
    return parts.join(" · ");
  }, [location, when, guests]);

  const clearAll = () => setParams({});

  const activeChips: { key: string; label: string }[] = [];
  if (q)          activeChips.push({ key: "q",          label: `"${q}"` });
  if (location)   activeChips.push({ key: "location",   label: location });
  if (tag)        activeChips.push({ key: "tag",        label: tag });
  if (collection) activeChips.push({ key: "collection", label: collectionTitle ?? collection });
  if (intent)     activeChips.push({ key: "intent",     label: intent });
  if (type !== "all") activeChips.push({ key: "type", label: type });
  if (listingType)    activeChips.push({ key: "listing_type", label: listingType === "sale" ? "For Sale" : "For Rent" });
  if (priceRange)     activeChips.push({ key: "price", label: priceRange.label });

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

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (searchInput.trim()) next.set("q", searchInput.trim()); else next.delete("q");
    if (locationInput.trim()) next.set("location", locationInput.trim()); else next.delete("location");
    setParams(next);
  };

  // Flatten paginated pages and dedupe by id (defensive against overlap).
  const results = useMemo<Listing[]>(() => {
    const pages = data?.pages ?? [];
    const seen = new Set<string>();
    const out: Listing[] = [];
    for (const page of pages) {
      for (const item of page) {
        if (!seen.has(item.id)) { seen.add(item.id); out.push(item); }
      }
    }
    return out;
  }, [data]);

  // Sentinel for infinite scroll — fires ~600px before hitting bottom.
  const [sentinelRef, sentinelVisible] = useIntersectionObserver({
    rootMargin: "600px",
    freezeOnceVisible: false,
  });
  useEffect(() => {
    if (!sentinelVisible) return;
    if (isLoading) return;
    const pagesLoaded = data?.pages?.length ?? 0;
    if (hasNextPage && !isFetchingNextPage) {
      sentinelTriggerCountRef.current += 1;
      trackEvent("marketplace_next_page_trigger", {
        metadata: {
          trigger_number: sentinelTriggerCountRef.current,
          pages_loaded: pagesLoaded,
          rows_loaded: results.length,
          page_size: pageSize,
          filters_key: filtersKey,
        },
      });
      fetchNextPage();
    } else if (hasNextPage && isFetchingNextPage) {
      // Sentinel re-fired while a page was already in flight — should be blocked.
      trackEvent("marketplace_next_page_blocked", {
        metadata: {
          reason: "already_fetching",
          pages_loaded: pagesLoaded,
          rows_loaded: results.length,
          filters_key: filtersKey,
        },
      });
    }
  }, [sentinelVisible, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage, data?.pages?.length, results.length, pageSize, filtersKey, trackEvent]);

  // Fire once when pagination completes for this filter set.
  useEffect(() => {
    if (isLoading || isFetchingNextPage) return;
    if (hasNextPage) return;
    if (!data?.pages?.length) return;
    if (endOfListFiredRef.current) return;
    endOfListFiredRef.current = true;
    trackEvent("marketplace_end_of_list", {
      metadata: {
        total_rows: results.length,
        pages_loaded: data.pages.length,
        total_fetches: fetchCountRef.current,
        sentinel_triggers: sentinelTriggerCountRef.current,
        page_size: pageSize,
        filters_key: filtersKey,
      },
    });
  }, [hasNextPage, isLoading, isFetchingNextPage, data?.pages?.length, results.length, pageSize, filtersKey, trackEvent]);


  const titleHead = heading.split(" ")[0];
  const titleTail = heading.split(" ").slice(1).join(" ") || "Villas";

  return (
    <ReosShell>
      <SEOHead
        title={`${heading} · ASTRA Villa`}
        description="Curated luxury villas across ASEAN — search by location, type and intent, ranked by ASTRA AI."
      />

      <section className="mx-auto max-w-[1600px] px-6 pt-10 md:pt-14 pb-6">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.28em] reos-gold mb-3">
            Discover · The Collection
          </div>
          <h1 className="text-[34px] md:text-[44px] leading-[1.05] font-semibold tracking-tight text-[var(--text)]">
            {titleHead} <em className="reos-gold not-italic">{titleTail}</em>
          </h1>
          <p className="mt-4 text-[14px] text-[var(--text-2)] leading-relaxed">{subheading}</p>
        </div>

        {/* Search bar */}
        <form onSubmit={submitSearch} className="mt-8 reos-card p-2 flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-2)]" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search villas, projects or developers…"
              aria-label="Search properties"
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] focus:border-[var(--line-strong)] outline-none text-sm placeholder:text-[var(--text-2)] text-[var(--text)]"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-2)]" />
            <input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Location: Bali, Jakarta, Phuket…"
              aria-label="Location"
              list="astra-locations"
              autoComplete="off"
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] focus:border-[var(--line-strong)] outline-none text-sm placeholder:text-[var(--text-2)] text-[var(--text)]"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl reos-cta text-[13px] inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <SearchIcon className="h-4 w-4" /> Search
          </button>
        </form>

        {/* Shared location suggestion list — sourced from provinces DB + popular cities.
            Users can still type any free-text value. */}
        <datalist id="astra-locations">
          {LOCATION_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        {/* Active filter chips + controls */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => removeParam(chip.key)}
              className="reos-chip inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] transition-colors"
            >
              {chip.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          {activeChips.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-3)] hover:reos-gold transition-colors"
            >
              Clear all
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            {/* Grid / List view toggle — persisted via ?view= URL param */}
            <div
              role="group"
              aria-label="Toggle results view"
              className="h-9 inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5"
            >
              <button
                type="button"
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view"
                onClick={() => { removeParam("view"); trackEvent("marketplace_view_mode_changed", { view: "grid" }); }}
                className={cn(
                  "h-8 px-2.5 rounded-md inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] transition-colors",
                  viewMode === "grid"
                    ? "bg-[var(--gold-soft)] reos-gold"
                    : "text-[var(--text-2)] hover:text-[var(--text)]",
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "list"}
                aria-label="List view"
                onClick={() => { updateParam("view", "list"); trackEvent("marketplace_view_mode_changed", { view: "list" }); }}
                className={cn(
                  "h-8 px-2.5 rounded-md inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] transition-colors",
                  viewMode === "list"
                    ? "bg-[var(--gold-soft)] reos-gold"
                    : "text-[var(--text-2)] hover:text-[var(--text)]",
                )}
              >
                <ListIcon className="w-3.5 h-3.5" /> List
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="h-9 px-3 rounded-lg reos-chip inline-flex items-center gap-1.5 text-[12px]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              aria-label="Sort properties"
              className="reos-chip text-[12px] rounded-lg h-9 px-3 bg-[var(--surface)] focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} className="bg-[var(--surface)] text-[var(--text)]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-5 reos-card p-5 space-y-6">
            {/* Property Type */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-2)]">Property Type</div>
                {type !== "all" && (
                  <button
                    onClick={() => removeParam("type")}
                    className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)] hover:reos-gold transition-colors inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => updateParam("type", t)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[12px] uppercase tracking-[0.16em] border transition-colors",
                      type === t
                        ? "bg-[var(--gold-soft)] border-[var(--line-strong)] reos-gold"
                        : "border-[var(--line)] text-[var(--text-2)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Listing Type */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-2)]">Listing Type</div>
                {listingType && (
                  <button
                    onClick={() => removeParam("listing_type")}
                    className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)] hover:reos-gold transition-colors inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {LISTING_TYPES.map((l) => (
                  <button
                    key={l.id || "any"}
                    onClick={() => updateParam("listing_type", l.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[12px] uppercase tracking-[0.16em] border transition-colors",
                      listingType === l.id
                        ? "bg-[var(--gold-soft)] border-[var(--line-strong)] reos-gold"
                        : "border-[var(--line)] text-[var(--text-2)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-2)]">Location (state, city or area)</div>
                {location && (
                  <button
                    onClick={() => { removeParam("location"); setLocationInput(""); }}
                    className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)] hover:reos-gold transition-colors inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <div className="relative max-w-md">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-2)]" />
                <input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      updateParam("location", locationInput.trim());
                    }
                  }}
                  onBlur={() => {
                    if (locationInput.trim() !== location) updateParam("location", locationInput.trim());
                  }}
                  placeholder="e.g. Bali, Canggu, Jakarta…"
                  aria-label="Filter by location"
                  list="astra-locations"
                  autoComplete="off"
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] focus:border-[var(--line-strong)] outline-none text-sm placeholder:text-[var(--text-2)] text-[var(--text)]"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-2)]">Price Range</div>
                {priceRangeId && (
                  <button
                    onClick={() => removeParam("price")}
                    className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)] hover:reos-gold transition-colors inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((r) => (
                  <button
                    key={r.id || "any"}
                    onClick={() => updateParam("price", r.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[12px] uppercase tracking-[0.16em] border transition-colors",
                      priceRangeId === r.id
                        ? "bg-[var(--gold-soft)] border-[var(--line-strong)] reos-gold"
                        : "border-[var(--line)] text-[var(--text-2)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer controls */}
            <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-[var(--text-3)] uppercase tracking-[0.18em]">
                {activeChips.length} active filter{activeChips.length === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAll}
                  className="h-9 px-4 rounded-lg reos-chip text-[12px] uppercase tracking-[0.16em] inline-flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Reset All
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="h-9 px-4 rounded-lg reos-cta text-[12px] uppercase tracking-[0.16em]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </section>


      {/* Results grid */}
      <section className="mx-auto max-w-[1600px] px-6 pb-12">
        {isLoading ? (
          <ResultsSkeleton count={pageSize} />
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
              <button
                type="button"
                onClick={() => navigate("/wealth-advisor")}
                className="h-10 px-5 rounded-lg reos-cta text-[13px] inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Ask AI Concierge
              </button>
            }
          />
        ) : (
          <>
            <div className="flex items-end justify-between mb-6">
              <p className="text-[12px] text-[var(--text-2)] uppercase tracking-[0.2em]">
                {results.length} villa{results.length === 1 ? "" : "s"}
                {hasNextPage && <span className="ml-1 opacity-60">· more below</span>}
              </p>
              <Link to="/wealth-advisor" className="text-[12px] reos-gold hover:underline inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Curate with AI
              </Link>
            </div>

            <VirtualizedGrid
              results={results}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              pageSize={pageSize}
            />

            {/* Sentinel — triggers next page well before viewport bottom */}
            <div ref={sentinelRef} aria-hidden className="h-10 w-full" />

            {!hasNextPage && results.length > pageSize && (
              <p className="mt-8 text-center text-[11px] uppercase tracking-[0.22em] text-[var(--text-3)]">
                — End of collection —
              </p>
            )}
          </>
        )}
      </section>

      <MarketplaceDevOverlay
        pagesLoaded={data?.pages?.length ?? 0}
        rowsLoaded={results.length}
        pageSize={pageSize}
        hasNextPage={!!hasNextPage}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        filtersKey={filtersKey}
        fetchCountRef={fetchCountRef}
        inFlightPagesRef={inFlightPagesRef}
        sentinelTriggerCountRef={sentinelTriggerCountRef}
        duplicatesDetectedRef={duplicatesDetectedRef}
        duplicateRowsRef={duplicateRowsRef}
        seenIdsRef={seenIdsRef}
      />
    </ReosShell>
  );
}

/* -------------------------------------------------------- */
/* Virtualized grid — renders only visible rows via         */
/* @tanstack/react-virtual (window scroller).               */
/* -------------------------------------------------------- */

function VirtualizedGrid({
  results,
  hasNextPage,
  isFetchingNextPage,
  pageSize,
}: {
  results: Listing[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  pageSize: number;
}) {
  const columns = useGridColumns();

  const rows = useMemo<Listing[][]>(() => {
    const out: Listing[][] = [];
    for (let i = 0; i < results.length; i += columns) {
      out.push(results.slice(i, i + columns));
    }
    return out;
  }, [results, columns]);

  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!parentRef.current) return;
      setScrollMargin(parentRef.current.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [columns]);

  // Rough row height estimate — card image is aspect 4/5 + ~180px of info.
  // Actual size is measured after mount via measureElement, so this only
  // affects initial paint / overscan.
  const estimateSize = () => (columns === 1 ? 720 : columns === 2 ? 640 : 620);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize,
    overscan: 3,
    scrollMargin,
    gap: 24,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const gridColsClass =
    columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div ref={parentRef} className="relative w-full" style={{ height: totalSize }}>
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        if (!row) return null;
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className={cn("grid gap-5 md:gap-6 absolute left-0 right-0 top-0", gridColsClass)}
            style={{
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            {row.map((p, i) => (
              <VillaCard key={p.id} listing={p} index={virtualRow.index * columns + i} />
            ))}
          </div>
        );
      })}

      {isFetchingNextPage && (
        <div
          className={cn("grid gap-5 md:gap-6 absolute left-0 right-0 top-0", gridColsClass)}
          style={{ transform: `translateY(${totalSize}px)` }}
        >
          {Array.from({ length: Math.min(pageSize, columns * 2) }).map((_, i) => (
            <VillaCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}
    </div>
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/properties/${listing.id}`} className="block group">
        <div className="reos-card overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-[var(--line-strong)] hover:shadow-[0_24px_60px_-28px_rgba(200,169,106,0.25)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-2)]">
            {/* Skeleton shimmer — visible until image decodes. Sits behind the img so no flash. */}
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                imgLoaded ? "opacity-0" : "opacity-100",
              )}
              style={{
                background:
                  "linear-gradient(110deg, var(--surface-2) 20%, var(--surface-3, rgba(255,255,255,0.06)) 40%, var(--surface-2) 60%)",
                backgroundSize: "200% 100%",
                animation: "reos-shimmer 1.6s linear infinite",
              }}
            />
            <img
              src={imgError ? FALLBACK_IMGS[index % FALLBACK_IMGS.length] : img}
              alt={listing.title ?? "Villa"}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgError(true); setImgLoaded(true); }}
              className={cn(
                "w-full h-full object-cover transition-[opacity,filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]",
                imgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md scale-[1.02]",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />


            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {listing.is_featured && (
                <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] bg-black/40 backdrop-blur reos-gold border border-[var(--line-strong)]">
                  Editor's Pick
                </span>
              )}
              {score != null && score >= 85 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] bg-black/40 backdrop-blur text-[#7be0b3] border border-[#7be0b3]/30 inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {score}
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">From</p>
                <p className="text-[22px] leading-none mt-1 text-white font-semibold truncate">
                  {formatPrice(priceNum)}
                </p>
              </div>
              <span className="w-9 h-9 grid place-items-center rounded-full bg-black/40 backdrop-blur border border-[var(--line-strong)] reos-gold opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
            <h3 className="text-[18px] leading-tight tracking-tight text-[var(--text)] font-semibold line-clamp-1 group-hover:reos-gold transition-colors">
              {listing.title ?? "Untitled Villa"}
            </h3>
            <p className="text-[12px] text-[var(--text-2)] inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 reos-gold" /> {area}
            </p>

            <div className="mt-auto pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--text-2)]">
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
                <span className="reos-gold font-semibold">{roi.toFixed(1)}% ROI</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function VillaCardSkeleton() {
  return (
    <div className="reos-card overflow-hidden" aria-hidden>
      <div className="aspect-[4/5] bg-[var(--surface-2)] animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-[var(--surface-2)] rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-[var(--surface-2)] rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-[var(--surface-2)] rounded animate-pulse" />
      </div>
    </div>
  );
}

function ResultsSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VillaCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({
  title, description, action,
}: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="reos-card p-12 md:p-20 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--gold-soft)] grid place-items-center border border-[var(--line-strong)]">
        <SearchIcon className="w-5 h-5 reos-gold" />
      </div>
      <h3 className="text-[28px] mt-6 text-[var(--text)] font-semibold">{title}</h3>
      {description && <p className="mt-3 text-[13px] text-[var(--text-2)] max-w-md mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}
