import { describe, it, expect } from "vitest";
import { pickHeroVillas, cleanPlaceName } from "../useHeroVillas";

const row = (o: any) => ({ id: o.id, property_type: "villa", status: "active", listing_type: "sale", cover_image: "x.jpg", price: 1, ...o });

describe("pickHeroVillas", () => {
  it("only shows villas for sale when some exist", () => {
    const out = pickHeroVillas([row({ id: "rent", listing_type: "rent" }), row({ id: "sale" })]);
    expect(out.map((v) => v.id)).toEqual(["sale"]);
  });

  it("skips listings without a photo", () => {
    const out = pickHeroVillas([row({ id: "nophoto", cover_image: null, images: [] }), row({ id: "photo" })]);
    expect(out.map((v) => v.id)).toEqual(["photo"]);
  });

  it("puts featured villas first, then highest investment score", () => {
    const out = pickHeroVillas([
      row({ id: "a", investment_score: 99 }),
      row({ id: "b", is_featured: true, investment_score: 10 }),
      row({ id: "c", investment_score: 50 }),
    ]);
    expect(out.map((v) => v.id)).toEqual(["b", "a", "c"]);
  });

  it("shows at most 5 villas", () => {
    const rows = Array.from({ length: 9 }, (_, i) => row({ id: String(i) }));
    expect(pickHeroVillas(rows)).toHaveLength(5);
  });

  it("links each slide to its listing page", () => {
    expect(pickHeroVillas([row({ id: "abc" })])[0].href).toBe("/property/abc");
  });
});

describe("cleanPlaceName", () => {
  it("drops the KABUPATEN prefix and fixes capitals", () => {
    expect(cleanPlaceName("KABUPATEN Temanggung")).toBe("Temanggung");
    expect(cleanPlaceName("Villa di Madureso, KABUPATEN Temanggung")).toBe("Villa di Madureso, Temanggung");
  });
});
