import { describe, it, expect } from "vitest";
import { forecastPropertyIndex } from "../usePropertyIndexForecast";

describe("forecastPropertyIndex", () => {
  it("returns STRONG UPTREND for bullish signals", () => {
    const r = forecastPropertyIndex({ index: 85, economy: "BOOMING", demand: 90 });
    expect(r.index_forecast_direction).toBe("STRONG UPTREND");
    expect(r.forecast_strength).toBe("HIGH CONVICTION");
  });

  it("returns MODERATE GROWTH for solid signals", () => {
    const r = forecastPropertyIndex({ index: 60, economy: "GROWING", demand: 65 });
    expect(r.index_forecast_direction).toBe("MODERATE GROWTH");
  });

  it("returns FLAT for mixed signals", () => {
    const r = forecastPropertyIndex({ index: 40, economy: "STABLE", demand: 35 });
    expect(r.index_forecast_direction).toBe("FLAT / SIDEWAYS");
  });

  it("returns DOWNTREND RISK for weak signals", () => {
    const r = forecastPropertyIndex({ index: 15, economy: "CONTRACTING", demand: 10 });
    expect(r.index_forecast_direction).toBe("DOWNTREND RISK");
    expect(r.forecast_strength).toBe("MODERATE CONVICTION");
  });
});
