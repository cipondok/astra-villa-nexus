import { describe, it, expect } from "vitest";
import {
  buildSeoTitle, buildMetaDescription, buildPropertyJsonLd, validatePropertyJsonLd,
  propertyPath, seoCompleteness, isUuid, cleanPlace,
} from "@/lib/propertySeo";
import { shareIntentUrl, withUtm } from "@/lib/propertyShare";

const villa = {
  id: "8b751a0f-b24d-4b59-b5c9-528c4e3c32d3",
  slug: "luxury-private-villa-berawa-badung",
  title: "Luxury Private Villa",
  description: "",
  price: 4_500_000_000,
  city: "KABUPATEN BADUNG",
  district: "Berawa",
  property_type: "villa",
  listing_type: "sale",
  bedrooms: 3,
  bathrooms: 3,
  area_sqm: 250,
  images: ["https://cdn.example.com/a.jpg"],
};

describe("property SEO", () => {
  it("uses the readable /properties/<slug> address and falls back to the id", () => {
    expect(propertyPath(villa)).toBe("/properties/luxury-private-villa-berawa-badung");
    expect(propertyPath({ id: villa.id, slug: null })).toBe(`/property/${villa.id}`);
    expect(isUuid(villa.id)).toBe(true);
    expect(isUuid(villa.slug)).toBe(false);
  });

  it("builds a branded title with the place and no region prefix", () => {
    expect(cleanPlace("KABUPATEN BADUNG")).toBe("Badung");
    expect(buildSeoTitle(villa)).toBe("Luxury Private Villa in Berawa, Badung | ASTRA Villa");
  });

  it("describes only real facts and never invents a price", () => {
    const d = buildMetaDescription(villa);
    expect(d).toContain("3 bedrooms");
    expect(d).toContain("IDR 4.5 billion");
    expect(d.length).toBeLessThanOrEqual(158);
    expect(buildMetaDescription({ ...villa, price: null })).not.toContain("IDR");
  });

  it("emits a valid listing + breadcrumb graph and skips the offer without a price", () => {
    const graph = buildPropertyJsonLd(villa);
    expect(validatePropertyJsonLd(graph)).toEqual([]);
    expect((graph[0] as any).offers.priceCurrency).toBe("IDR");
    expect((graph[0] as any).about["@type"]).toBe("SingleFamilyResidence");
    expect((buildPropertyJsonLd({ ...villa, price: 0 })[0] as any).offers).toBeUndefined();
  });

  it("scores completeness out of 100", () => {
    expect(seoCompleteness(villa).score).toBe(65);
    expect(seoCompleteness({ id: "x" }).score).toBe(0);
  });
});

describe("property sharing", () => {
  const target = { url: "https://astravilla.com/properties/luxury-private-villa-berawa-badung", title: "Luxury Private Villa", price: "IDR 4.5 billion", place: "Berawa, Badung" };

  it("tags every share link with UTM parameters", () => {
    const u = new URL(withUtm(target.url, "whatsapp"));
    expect(u.searchParams.get("utm_source")).toBe("whatsapp");
    expect(u.searchParams.get("utm_medium")).toBe("messaging");
    expect(u.searchParams.get("utm_campaign")).toBe("property_share");
  });

  it("opens the correct property page from WhatsApp, Facebook, Telegram and X", () => {
    for (const ch of ["whatsapp", "facebook", "telegram", "x"] as const) {
      const intent = shareIntentUrl(ch, target)!;
      expect(decodeURIComponent(intent)).toContain("/properties/luxury-private-villa-berawa-badung?utm_source=" + ch);
    }
    expect(shareIntentUrl("instagram", target)).toBeNull();
  });
});
