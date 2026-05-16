import { describe, it, expect } from "vitest";
import { suggestPriceAdjustment } from "../usePriceAdjustment";

describe("suggestPriceAdjustment", () => {
  it("returns RAISE PRICE for hot demand + peak cycle", () => {
    const r = suggestPriceAdjustment({ price: 1_000_000_000, demand: "very_hot", deal_score: 85, cycle: "PEAK" });
    expect(r.price_adjustment_signal).toBe("RAISE PRICE");
    expect(r.suggested_price_range).toContain("Rp");
  });

  it("returns HOLD PRICE for moderate signals", () => {
    const r = suggestPriceAdjustment({ price: 500_000_000, demand: "warm", deal_score: 60, cycle: "EXPANSION" });
    expect(r.price_adjustment_signal).toBe("HOLD PRICE");
  });

  it("returns AGGRESSIVE REPRICE for weak signals", () => {
    const r = suggestPriceAdjustment({ price: 800_000_000, demand: "cool", deal_score: 10, cycle: "CORRECTION" });
    expect(r.price_adjustment_signal).toBe("AGGRESSIVE REPRICE");
  });

  it("formats IDR price range correctly", () => {
    const r = suggestPriceAdjustment({ price: 2_000_000_000, demand: "hot", deal_score: 70, cycle: "EXPANSION" });
    expect(r.suggested_price_range).toMatch(/Rp/);
    expect(r.suggested_price_range).toContain("–");
  });
});
