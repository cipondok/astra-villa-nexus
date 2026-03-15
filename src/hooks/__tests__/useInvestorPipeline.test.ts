import { describe, it, expect } from "vitest";
import { analyzePipeline } from "../useInvestorPipeline";

describe("analyzePipeline", () => {
  it("returns EXCELLENT FLOW for strong funnel", () => {
    const r = analyzePipeline({ review_count: 20, visits: 12, offers: 6, closed: 3 });
    expect(r.pipeline_health).toBe("EXCELLENT FLOW");
    expect(r.bottleneck_stage).toBe("NO BOTTLENECK");
  });

  it("detects REVIEW → VISIT bottleneck", () => {
    const r = analyzePipeline({ review_count: 20, visits: 3, offers: 2, closed: 1 });
    expect(r.bottleneck_stage).toBe("REVIEW → VISIT");
  });

  it("detects TOP OF FUNNEL when no reviews", () => {
    const r = analyzePipeline({ review_count: 0, visits: 0, offers: 0, closed: 0 });
    expect(r.bottleneck_stage).toBe("TOP OF FUNNEL");
    expect(r.pipeline_health).toBe("CRITICAL PIPELINE");
  });

  it("detects OFFER → CLOSING bottleneck", () => {
    const r = analyzePipeline({ review_count: 10, visits: 8, offers: 6, closed: 0 });
    expect(r.bottleneck_stage).toBe("OFFER → CLOSING");
  });

  it("returns conversion rates as percentages", () => {
    const r = analyzePipeline({ review_count: 10, visits: 5, offers: 2, closed: 1 });
    expect(r.conversion_rates.review_to_visit).toBe(50);
    expect(r.conversion_rates.visit_to_offer).toBe(40);
    expect(r.conversion_rates.offer_to_close).toBe(50);
  });
});
