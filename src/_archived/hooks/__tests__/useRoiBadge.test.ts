import { describe, it, expect } from "vitest";
import { generateRoiBadge } from "../useRoiBadge";

describe("generateRoiBadge", () => {
  it("returns HIGH CAPITAL GAIN for high ROI + low yield", () => {
    const result = generateRoiBadge({ roi_percent: 75, rental_yield: 3 });
    expect(result.label).toContain("HIGH CAPITAL GAIN");
    expect(result.variant).toBe("capital");
  });

  it("returns STRONG RENTAL CASHFLOW for yield >= 7%", () => {
    const result = generateRoiBadge({ roi_percent: 30, rental_yield: 8 });
    expect(result.label).toContain("STRONG RENTAL CASHFLOW");
    expect(result.variant).toBe("rental");
  });

  it("returns BALANCED ROI for high ROI + decent yield", () => {
    const result = generateRoiBadge({ roi_percent: 45, rental_yield: 5.5 });
    expect(result.label).toContain("BALANCED ROI");
    expect(result.variant).toBe("balanced");
  });

  it("returns LONG TERM WEALTH for moderate metrics", () => {
    const result = generateRoiBadge({ roi_percent: 25, rental_yield: 3 });
    expect(result.label).toContain("LONG TERM WEALTH");
    expect(result.variant).toBe("longterm");
  });

  it("returns LOW RETURN for poor metrics", () => {
    const result = generateRoiBadge({ roi_percent: 10, rental_yield: 2 });
    expect(result.label).toContain("LOW RETURN");
    expect(result.variant).toBe("low");
  });

  it("prioritizes STRONG RENTAL over CAPITAL GAIN when yield >= 7%", () => {
    const result = generateRoiBadge({ roi_percent: 60, rental_yield: 8 });
    expect(result.variant).toBe("rental");
  });
});
