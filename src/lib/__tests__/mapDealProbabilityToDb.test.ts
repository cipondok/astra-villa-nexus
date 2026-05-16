import { describe, it, expect } from "vitest";
import { mapDealProbabilityToDb } from "../mapDealProbabilityToDb";
import type { TransactionProbabilityResult } from "@/hooks/useTransactionProbability";

describe("mapDealProbabilityToDb", () => {
  const sample: TransactionProbabilityResult = {
    deal_probability_score: 81,
    probability_level: "VERY HIGH CLOSING POTENTIAL",
    estimated_time_to_close: "14–30 hari",
    positive_factors: ["Permintaan tinggi", "Harga kompetitif"],
    risk_factors: ["Persaingan listing"],
    recommended_action: "Push listing ke kanal prioritas",
  };

  it("maps all fields correctly", () => {
    const db = mapDealProbabilityToDb(sample);
    expect(db.deal_probability_score).toBe(81);
    expect(db.deal_probability_label).toBe("VERY HIGH CLOSING POTENTIAL");
    expect(db.deal_close_time_estimate).toBe("14–30 hari");
    expect(db.deal_positive_summary).toBe("Permintaan tinggi | Harga kompetitif");
    expect(db.deal_risk_summary).toBe("Persaingan listing");
    expect(db.deal_ai_recommendation).toBe("Push listing ke kanal prioritas");
  });

  it("handles empty arrays gracefully", () => {
    const db = mapDealProbabilityToDb({ ...sample, positive_factors: [], risk_factors: [] });
    expect(db.deal_positive_summary).toBe("");
    expect(db.deal_risk_summary).toBe("");
  });
});
