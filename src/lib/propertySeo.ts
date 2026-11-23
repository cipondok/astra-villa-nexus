/**
 * Property SEO engine — builds titles, descriptions, alt text, structured
 * data and a completeness score from a listing's REAL fields only.
 * Nothing here invents specs, prices, legal status or returns.
 */
import { SITE_ORIGIN } from "@/lib/canonicalUrl";

export interface PropertySeoInput {
  id: string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  city?: string | null;
  district?: string | null;
  /** Neighbourhood / village (the `area` column on listings). */
  area?: string | null;
  province?: string | null;
  state?: string | null;
  location?: string | null;
  property_type?: string | null;
  listing_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  land_area_sqm?: number | null;
  images?: string[] | null;
  image_urls?: string[] | null;
}

const BRAND = "ASTRA Villa";
const TITLE_MAX = 60;
const DESC_MAX = 158;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string | undefined | null): boolean => !!value && UUID_RE.test(value);

const TYPE_LABEL: Record<string, string> = {
  villa: "Villa", house: "House", apartment: "Apartment", townhouse: "Townhouse",
  land: "Land", commercial: "Commercial Property", warehouse: "Warehouse",
  kost: "Boarding House", office: "Office", shophouse: "Shophouse", ruko: "Shophouse",
};

/** "KABUPATEN BADUNG" → "Badung", "kota surabaya" → "Surabaya". */
export function cleanPlace(raw?: string | null): string {
  const s = (raw || "").replace(/^\s*(kabupaten|kab\.|kota adm\.|kota)\s+/i, "").trim();
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function typeLabel(type?: string | null): string {
  const key = (type || "").toLowerCase().trim();
  return TYPE_LABEL[key] || (key ? key[0].toUpperCase() + key.slice(1) : "Property");
}

export function listingVerb(listing?: string | null): "for Sale" | "for Rent" | "" {
  const l = (listing || "").toLowerCase();
  if (l === "sale" || l === "dijual" || l === "buy") return "for Sale";
  if (l === "rent" || l === "disewa" || l === "sewa") return "for Rent";
  return "";
}

/** Most specific readable place: "Berawa, Badung" style. */
export function placeLabel(p: PropertySeoInput): string {
  const parts = [cleanPlace(p.district || p.area), cleanPlace(p.city)].filter(Boolean);
  const unique = parts.filter((v, i) => parts.indexOf(v) === i);
  if (unique.length) return unique.join(", ");
  return cleanPlace(p.province || p.state) || cleanPlace(p.location) || "Indonesia";
}

/** Path used for internal links and canonical URLs. */
export function propertyPath(p: { id: string; slug?: string | null }): string {
  return p.slug ? `/properties/${p.slug}` : `/property/${p.id}`;
}

export function propertyUrl(p: { id: string; slug?: string | null }): string {
  return `${SITE_ORIGIN}${propertyPath(p)}`;
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** e.g. "Luxury Private Villa for Sale in Berawa, Badung | ASTRA Villa" (≤ 60 chars when possible). */
export function buildSeoTitle(p: PropertySeoInput): string {
  const suffix = ` | ${BRAND}`;
  const place = placeLabel(p);
  const verb = listingVerb(p.listing_type);
  const rawTitle = (p.title || "").replace(/\s+/g, " ").trim();
  // Listing titles that already name the place read fine on their own.
  const titleHasPlace = rawTitle && cleanPlace(p.city) && rawTitle.toLowerCase().includes(cleanPlace(p.city).toLowerCase());
  const generic = `${typeLabel(p.property_type)}${verb ? ` ${verb}` : ""} in ${place}`;
  let core = rawTitle ? (titleHasPlace ? rawTitle : `${rawTitle} in ${place}`) : generic;
  // Normalise ALL-CAPS region words that come from the address data.
  core = core.replace(/\b(KABUPATEN|KOTA)\s+/g, "");
  if (core.length + suffix.length > TITLE_MAX) {
    core = core.length > TITLE_MAX ? clip(core, TITLE_MAX) : core;
    return core.length + suffix.length <= 70 ? `${core}${suffix}` : core;
  }
  return `${core}${suffix}`;
}

export function formatIdrShort(n?: number | null): string {
  if (!n || n <= 0) return "";
  if (n >= 1_000_000_000) return `IDR ${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)} billion`;
  if (n >= 1_000_000) return `IDR ${Math.round(n / 1_000_000)} million`;
  return `IDR ${n.toLocaleString("en-US")}`;
}

/** Meta description from real facts first, the listing's own description second. */
export function buildMetaDescription(p: PropertySeoInput): string {
  const type = typeLabel(p.property_type).toLowerCase();
  const verb = listingVerb(p.listing_type);
  const place = placeLabel(p);
  const facts: string[] = [];
  if (p.bedrooms) facts.push(`${p.bedrooms} bedroom${p.bedrooms > 1 ? "s" : ""}`);
  if (p.bathrooms) facts.push(`${p.bathrooms} bathroom${p.bathrooms > 1 ? "s" : ""}`);
  if (p.area_sqm) facts.push(`${p.area_sqm} m² building`);
  else if (p.land_area_sqm) facts.push(`${p.land_area_sqm} m² land`);
  const price = formatIdrShort(p.price);
  let lead = `${type[0].toUpperCase()}${type.slice(1)}${verb ? ` ${verb.toLowerCase()}` : ""} in ${place}`;
  if (facts.length) lead += ` with ${facts.join(", ")}`;
  if (price) lead += `, ${price}`;
  lead += ".";
  const own = (p.description || "").replace(/\s+/g, " ").trim();
  const tail = own ? ` ${own}` : ` View photos, specifications, location and contact the agent on ${BRAND}.`;
  return clip(`${lead}${tail}`, DESC_MAX);
}

/** Descriptive alt text for photo #index (0-based). */
export function buildImageAlt(p: PropertySeoInput, index = 0): string {
  const name = (p.title || `${typeLabel(p.property_type)} in ${placeLabel(p)}`).replace(/\b(KABUPATEN|KOTA)\s+/g, "");
  return index === 0 ? `${name} — main photo` : `${name} — photo ${index + 1}`;
}

/** Schema.org residence type that matches the property type. */
export function schemaTypeFor(type?: string | null): string {
  switch ((type || "").toLowerCase()) {
    case "house": case "villa": case "townhouse": return "SingleFamilyResidence";
    case "apartment": case "condo": return "Apartment";
    case "kost": return "Residence";
    case "land": return "Place";
    case "commercial": case "warehouse": case "office": case "shophouse": case "ruko": return "Place";
    default: return "Residence";
  }
}

export function propertyImages(p: PropertySeoInput): string[] {
  const list = (p.images?.length ? p.images : p.image_urls) || [];
  return list.filter((u) => typeof u === "string" && /^https?:\/\//.test(u));
}

/** Breadcrumb trail: Home › Properties › City › Listing. */
export function buildBreadcrumbs(p: PropertySeoInput): { name: string; url: string }[] {
  const crumbs = [
    { name: "Home", url: `${SITE_ORIGIN}/` },
    { name: "Properties", url: `${SITE_ORIGIN}/properties` },
  ];
  const city = cleanPlace(p.city);
  if (city) crumbs.push({ name: city, url: `${SITE_ORIGIN}/location/${encodeURIComponent(city.toLowerCase().replace(/\s+/g, "-"))}` });
  crumbs.push({ name: (p.title || typeLabel(p.property_type)).replace(/\b(KABUPATEN|KOTA)\s+/g, ""), url: propertyUrl(p) });
  return crumbs;
}

/** JSON-LD graph: listing + offer + residence + breadcrumb. Only real fields are emitted. */
export function buildPropertyJsonLd(p: PropertySeoInput): object[] {
  const url = propertyUrl(p);
  const images = propertyImages(p).slice(0, 6);
  const address = {
    "@type": "PostalAddress",
    ...(cleanPlace(p.district || p.area) && { streetAddress: cleanPlace(p.district || p.area) }),
    ...(cleanPlace(p.city) && { addressLocality: cleanPlace(p.city) }),
    ...(cleanPlace(p.province || p.state) && { addressRegion: cleanPlace(p.province || p.state) }),
    addressCountry: "ID",
  };
  const residence: Record<string, unknown> = {
    "@type": schemaTypeFor(p.property_type),
    name: p.title || typeLabel(p.property_type),
    address,
    ...(p.bedrooms ? { numberOfBedrooms: p.bedrooms, numberOfRooms: p.bedrooms } : {}),
    ...(p.bathrooms ? { numberOfBathroomsTotal: p.bathrooms } : {}),
    ...(p.area_sqm ? { floorSize: { "@type": "QuantitativeValue", value: p.area_sqm, unitCode: "MTK" } } : {}),
  };
  const listing: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    name: buildSeoTitle(p).replace(` | ${BRAND}`, ""),
    description: buildMetaDescription(p),
    url,
    ...(images.length && { image: images }),
    about: residence,
    ...(p.price && p.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "IDR",
            availability: "https://schema.org/InStock",
            url,
            ...(listingVerb(p.listing_type) === "for Rent" && { businessFunction: "http://purl.org/goodrelations/v1#LeaseOut" }),
            seller: { "@type": "Organization", name: BRAND, url: SITE_ORIGIN },
          },
        }
      : {}),
  };
  const crumbs = buildBreadcrumbs(p);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  };
  return [listing, breadcrumb];
}

/** Minimal structural validation run before the JSON-LD is shipped. */
export function validatePropertyJsonLd(graph: object[]): string[] {
  const errors: string[] = [];
  const listing = graph[0] as Record<string, any> | undefined;
  if (!listing || listing["@type"] !== "RealEstateListing") errors.push("missing RealEstateListing");
  if (listing && !listing.name) errors.push("listing has no name");
  if (listing && !/^https:\/\//.test(listing.url || "")) errors.push("listing url must be absolute https");
  if (listing?.offers && !(listing.offers.price > 0)) errors.push("offer price must be positive");
  const crumbs = graph[1] as Record<string, any> | undefined;
  if (!crumbs || crumbs["@type"] !== "BreadcrumbList" || !crumbs.itemListElement?.length) errors.push("missing breadcrumbs");
  return errors;
}

export interface SeoCheck { key: string; label: string; passed: boolean; weight: number }

/** 0–100 completeness score for the admin SEO health view. */
export function seoCompleteness(p: PropertySeoInput): { score: number; checks: SeoCheck[] } {
  const desc = (p.description || "").trim();
  const words = desc ? desc.split(/\s+/).length : 0;
  const imgs = propertyImages(p);
  const checks: SeoCheck[] = [
    { key: "slug", label: "Readable web address", passed: !!p.slug, weight: 10 },
    { key: "title", label: "Title of 15–80 characters", passed: (p.title || "").trim().length >= 15 && (p.title || "").trim().length <= 80, weight: 15 },
    { key: "description", label: "Description of 60+ words", passed: words >= 60, weight: 20 },
    { key: "price", label: "Price set", passed: !!p.price && p.price > 0, weight: 10 },
    { key: "location", label: "City and area set", passed: !!cleanPlace(p.city) && !!cleanPlace(p.district || p.area), weight: 15 },
    { key: "images", label: "At least 5 photos", passed: imgs.length >= 5, weight: 15 },
    { key: "specs", label: "Size and rooms set", passed: !!(p.area_sqm || p.land_area_sqm) && (p.property_type === "land" || !!p.bedrooms), weight: 15 },
  ];
  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  return { score, checks };
}
