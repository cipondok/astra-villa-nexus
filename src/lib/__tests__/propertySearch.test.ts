import { describe, it, expect } from "vitest";
import { buildPropertySearchUrl, priceRangesFor, findPriceRange } from "@/lib/propertySearch";
import { matchLocations } from "@/data/locationSuggestions";

describe("homepage property search", () => {
  it("Beli searches properties for sale", () => {
    expect(buildPropertySearchUrl({ tab: "buy" })).toBe("/dijual");
  });
  it("Sewa searches properties for rent", () => {
    expect(buildPropertySearchUrl({ tab: "rent", location: "Bali" })).toBe("/disewa?location=Bali");
  });
  it("Properti Baru searches new projects", () => {
    expect(buildPropertySearchUrl({ tab: "new", type: "apartment" })).toBe("/new-projects?type=apartment");
  });
  it("passes location, type, price and minimum bedrooms", () => {
    expect(buildPropertySearchUrl({ tab: "buy", location: " Jakarta ", type: "house", price: "1b-3b", beds: 3 }))
      .toBe("/dijual?location=Jakarta&type=house&price=1b-3b&beds=3");
  });
  it("drops a rent price range on a buy search", () => {
    expect(buildPropertySearchUrl({ tab: "buy", price: "rent-0-10m" })).toBe("/dijual");
  });
  it("rent ranges are offered only for rent", () => {
    expect(priceRangesFor("rent").every((r) => r.id.startsWith("rent-"))).toBe(true);
    expect(priceRangesFor("sale").some((r) => r.id.startsWith("rent-"))).toBe(false);
    expect(findPriceRange("rent-10m-50m")).toMatchObject({ min: 10_000_000, max: 50_000_000 });
  });
  it("location autocomplete matches prefix first", () => {
    expect(matchLocations("band")[0]).toBe("Bandung");
    expect(matchLocations("yogya")).toContain("Yogyakarta");
  });
});
