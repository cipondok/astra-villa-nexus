/**
 * Shared property-search vocabulary: the homepage search builds URLs with these
 * ids and the listings page (/properties, /dijual, /disewa, /new-projects) reads them.
 */

export type SearchTab = "buy" | "rent" | "new";

export interface PriceRange {
  id: string;
  label: string;
  min?: number;
  max?: number;
  /** Which listing type the range is meant for. */
  for: "sale" | "rent";
}

export const PRICE_RANGES: PriceRange[] = [
  { id: "0-1b", label: "Hingga Rp 1 M", min: 0, max: 1_000_000_000, for: "sale" },
  { id: "1b-3b", label: "Rp 1 M – 3 M", min: 1_000_000_000, max: 3_000_000_000, for: "sale" },
  { id: "3b-5b", label: "Rp 3 M – 5 M", min: 3_000_000_000, max: 5_000_000_000, for: "sale" },
  { id: "5b-10b", label: "Rp 5 M – 10 M", min: 5_000_000_000, max: 10_000_000_000, for: "sale" },
  { id: "10b-plus", label: "Di atas Rp 10 M", min: 10_000_000_000, for: "sale" },
  { id: "rent-0-10m", label: "Hingga Rp 10 jt", min: 0, max: 10_000_000, for: "rent" },
  { id: "rent-10m-50m", label: "Rp 10 jt – 50 jt", min: 10_000_000, max: 50_000_000, for: "rent" },
  { id: "rent-50m-150m", label: "Rp 50 jt – 150 jt", min: 50_000_000, max: 150_000_000, for: "rent" },
  { id: "rent-150m-plus", label: "Di atas Rp 150 jt", min: 150_000_000, for: "rent" },
];

export function priceRangesFor(listingType: string): PriceRange[] {
  return PRICE_RANGES.filter((r) => r.for === (listingType === "rent" ? "rent" : "sale"));
}

export function findPriceRange(id: string | null | undefined): PriceRange | undefined {
  return id ? PRICE_RANGES.find((r) => r.id === id) : undefined;
}

/** Property types stored in properties.property_type, with Indonesian labels. */
export const PROPERTY_TYPES: { id: string; label: string }[] = [
  { id: "house", label: "Rumah" },
  { id: "villa", label: "Villa" },
  { id: "apartment", label: "Apartemen" },
  { id: "land", label: "Tanah" },
  { id: "townhouse", label: "Townhouse" },
  { id: "commercial", label: "Komersial" },
  { id: "warehouse", label: "Gudang" },
  { id: "kost", label: "Kost" },
  { id: "hotel", label: "Hotel & Resort" },
];

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export interface SearchInput {
  tab: SearchTab;
  location?: string;
  type?: string;
  price?: string;
  beds?: number | string;
}

/** Builds the listings URL for a homepage search. Empty values are left out. */
export function buildPropertySearchUrl({ tab, location, type, price, beds }: SearchInput): string {
  const base = tab === "rent" ? "/disewa" : tab === "new" ? "/new-projects" : "/dijual";
  const params = new URLSearchParams();
  const loc = (location ?? "").trim();
  if (loc) params.set("location", loc);
  if (type && type !== "all") params.set("type", type);
  const range = findPriceRange(price);
  // A rent price range on a sale search (or the reverse) would silently match nothing.
  if (range && range.for === (tab === "rent" ? "rent" : "sale")) params.set("price", range.id);
  const b = Number(beds);
  if (Number.isInteger(b) && b > 0) params.set("beds", String(b));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
