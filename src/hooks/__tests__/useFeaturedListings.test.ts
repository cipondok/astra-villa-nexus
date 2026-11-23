import { describe, it, expect } from "vitest";
import { pickFeaturedListings, formatRupiahShort } from "@/hooks/useFeaturedListings";

const row = (id: string, extra: Record<string, unknown> = {}) => ({
  id, slug: `slug-${id}`, title: `Villa ${id}`, status: "active", property_type: "villa",
  listing_type: "sale", price: 1_000_000_000, cover_image: `https://img/${id}.jpg`, created_at: `2026-01-0${id.length}`, ...extra,
});

describe("Properti Pilihan selection", () => {
  it("skips listings without a photo", () => {
    const out = pickFeaturedListings([row("a"), row("b", { cover_image: null, images: [] })]);
    expect(out.map((l) => l.id)).toEqual(["a"]);
  });
  it("skips listings that are not active", () => {
    expect(pickFeaturedListings([row("a", { status: "draft" })])).toEqual([]);
  });
  it("mixes property types instead of filling the row with one type", () => {
    const rows = [row("v1"), row("v2"), row("v3"), row("h1", { property_type: "house" })];
    const out = pickFeaturedListings(rows, 2);
    expect(out.map((l) => l.propertyType).sort()).toEqual(["house", "villa"]);
  });
  it("keeps the demo flag so the card can show DEMO", () => {
    expect(pickFeaturedListings([row("a", { is_demo: true })])[0].isDemo).toBe(true);
    expect(pickFeaturedListings([row("a")])[0].isDemo).toBe(false);
  });
  it("links to the permanent readable listing URL", () => {
    expect(pickFeaturedListings([row("a")])[0].href).toBe("/properties/slug-a");
  });
  it("leaves specs empty instead of inventing them", () => {
    const l = pickFeaturedListings([row("a", { bedrooms: 0, bathrooms: null })])[0];
    expect(l.bedrooms).toBeNull();
    expect(l.bathrooms).toBeNull();
  });
});

describe("Rupiah short format", () => {
  it("uses miliar and juta", () => {
    expect(formatRupiahShort(9_500_000_000)).toBe("Rp 9,5 M");
    expect(formatRupiahShort(18_100_000)).toBe("Rp 18,1 jt");
    expect(formatRupiahShort(0)).toBe("");
  });
});
