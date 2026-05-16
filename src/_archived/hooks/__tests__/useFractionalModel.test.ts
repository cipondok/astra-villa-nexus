import { describe, it, expect } from "vitest";
import { generateFractionalModel } from "../useFractionalModel";

describe("generateFractionalModel", () => {
  it("generates micro-fractional for very_high demand", () => {
    const r = generateFractionalModel({ property_value: 2_000_000_000, investor_demand: "very_high", yield_pct: 6 });
    expect(r.total_tokens).toBe(2000);
    expect(r.token_price).toBe(1_000_000);
    expect(r.fractional_structure).toContain("Micro-Fractional");
  });

  it("generates premium fractional for low demand", () => {
    const r = generateFractionalModel({ property_value: 500_000_000, investor_demand: "low", yield_pct: 4 });
    expect(r.token_price).toBe(25_000_000);
    expect(r.total_tokens).toBe(20);
  });

  it("selects secondary market for high volume + high yield", () => {
    const r = generateFractionalModel({ property_value: 5_000_000_000, investor_demand: "high", yield_pct: 7 });
    expect(r.liquidity_model).toContain("Secondary Market");
  });

  it("selects P2P for low token count", () => {
    const r = generateFractionalModel({ property_value: 500_000_000, investor_demand: "low", yield_pct: 3 });
    expect(r.liquidity_model).toContain("Peer-to-Peer");
  });

  it("calculates annual return per token correctly", () => {
    const r = generateFractionalModel({ property_value: 1_000_000_000, investor_demand: "moderate", yield_pct: 8 });
    expect(r.projected_annual_return_per_token).toBe(800_000);
  });
});
