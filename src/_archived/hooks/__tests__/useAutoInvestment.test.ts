import { describe, it, expect } from "vitest";
import { recommendAutoInvestment } from "../useAutoInvestment";

describe("recommendAutoInvestment", () => {
  it("returns AUTO-BUY for top signals", () => {
    const r = recommendAutoInvestment({ opportunity: 90, roi: "A", momentum: "SURGING" });
    expect(r.auto_investment_signal).toBe("AUTO-BUY RECOMMENDED");
    expect(r.confidence_level).toBe("HIGH");
  });

  it("returns STRONG CONSIDERATION for solid signals", () => {
    const r = recommendAutoInvestment({ opportunity: 65, roi: "B", momentum: "ACCELERATING" });
    expect(r.auto_investment_signal).toBe("STRONG CONSIDERATION");
  });

  it("returns WATCHLIST for weak signals", () => {
    const r = recommendAutoInvestment({ opportunity: 40, roi: "C", momentum: "STEADY" });
    expect(r.auto_investment_signal).toBe("WATCHLIST — MONITOR");
  });

  it("returns DO NOT ENGAGE for poor signals", () => {
    const r = recommendAutoInvestment({ opportunity: 10, roi: "D", momentum: "DECLINING" });
    expect(r.auto_investment_signal).toBe("DO NOT ENGAGE");
  });
});
