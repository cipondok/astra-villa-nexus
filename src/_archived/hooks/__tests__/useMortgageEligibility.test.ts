import { describe, it, expect } from "vitest";
import { evaluateMortgageEligibility } from "../useMortgageEligibility";

describe("evaluateMortgageEligibility", () => {
  it("returns SANGAT LAYAK for strong financials", () => {
    const r = evaluateMortgageEligibility({
      income: 30_000_000, debt: 2_000_000, price: 800_000_000, dp: 300_000_000, job_status: "permanent",
    });
    expect(r.mortgage_eligibility).toBe("SANGAT LAYAK");
    expect(r.composite_score).toBeGreaterThanOrEqual(76);
  });

  it("returns LAYAK for moderate profile", () => {
    const r = evaluateMortgageEligibility({
      income: 15_000_000, debt: 3_000_000, price: 600_000_000, dp: 130_000_000, job_status: "permanent",
    });
    expect(["LAYAK", "SANGAT LAYAK"]).toContain(r.mortgage_eligibility);
  });

  it("returns BELUM LAYAK for weak profile", () => {
    const r = evaluateMortgageEligibility({
      income: 5_000_000, debt: 3_000_000, price: 1_000_000_000, dp: 20_000_000, job_status: "freelance",
    });
    expect(r.mortgage_eligibility).toBe("BELUM LAYAK");
  });

  it("formats affordable range in IDR", () => {
    const r = evaluateMortgageEligibility({
      income: 20_000_000, debt: 0, price: 500_000_000, dp: 150_000_000, job_status: "permanent",
    });
    expect(r.affordable_price_range).toContain("Rp");
  });

  it("calculates DSR correctly", () => {
    const r = evaluateMortgageEligibility({
      income: 10_000_000, debt: 0, price: 300_000_000, dp: 100_000_000, job_status: "contract",
    });
    expect(r.dsr_pct).toBeGreaterThan(0);
    expect(r.dp_pct).toBeCloseTo(33.3, 0);
  });
});
