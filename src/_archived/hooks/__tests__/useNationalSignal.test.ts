import { describe, it, expect } from "vitest";
import { detectNationalSignal } from "../useNationalSignal";

describe("detectNationalSignal", () => {
  it("returns STRONG BUYING MOMENTUM for boom + expansion", () => {
    expect(detectNationalSignal("STRONG BOOM", "EXPANSION").signal).toBe("STRONG BUYING MOMENTUM");
  });

  it("returns ACCUMULATION PHASE for growth + recovery", () => {
    expect(detectNationalSignal("GROWTH", "RECOVERY").signal).toBe("ACCUMULATION PHASE");
  });

  it("returns PREMIUM MARKET RISK for stable + peak", () => {
    expect(detectNationalSignal("STABLE", "PEAK").signal).toBe("PREMIUM MARKET RISK");
  });

  it("returns CAUTIOUS INVESTMENT PERIOD for decline + correction", () => {
    expect(detectNationalSignal("DECLINE", "CORRECTION").signal).toBe("CAUTIOUS INVESTMENT PERIOD");
  });
});
