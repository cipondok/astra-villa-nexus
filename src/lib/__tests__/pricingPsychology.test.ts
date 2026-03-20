import { describe, it, expect } from 'vitest';
import {
  scoreAnchoring,
  scoreCharmPricing,
  scoreNegotiationMargin,
  scoreUrgency,
  scoreSegmentAlignment,
  computeCharmPrice,
  optimizePricingPsychology,
} from '../pricingPsychology';

describe('scoreAnchoring', () => {
  it('high score when price near avg nearby', () => {
    expect(scoreAnchoring(2_000_000_000, 2_050_000_000)).toBeGreaterThan(80);
  });
  it('lower score when significantly overpriced', () => {
    expect(scoreAnchoring(3_000_000_000, 2_000_000_000)).toBeLessThan(50);
  });
  it('returns 50 when avg is 0', () => {
    expect(scoreAnchoring(1_000_000_000, 0)).toBe(50);
  });
});

describe('scoreCharmPricing', () => {
  it('high score for charm-ending prices', () => {
    expect(scoreCharmPricing(1_499_000_000)).toBe(95);
  });
  it('lower score for round numbers', () => {
    expect(scoreCharmPricing(2_000_000_000)).toBeLessThan(60);
  });
});

describe('scoreNegotiationMargin', () => {
  it('optimal at 5% above FMV', () => {
    expect(scoreNegotiationMargin(2_100_000_000, 2_000_000_000)).toBe(90);
  });
  it('penalizes excessive margin', () => {
    expect(scoreNegotiationMargin(2_500_000_000, 2_000_000_000)).toBeLessThan(60);
  });
});

describe('scoreUrgency', () => {
  it('high score with fresh listing and many inquiries', () => {
    expect(scoreUrgency(7, 12, 2)).toBeGreaterThan(80);
  });
  it('low score when stale with no inquiries', () => {
    expect(scoreUrgency(100, 0, 20)).toBeLessThan(30);
  });
});

describe('computeCharmPrice', () => {
  it('billion-range charm price', () => {
    expect(computeCharmPrice(2_500_000_000)).toBe(2_499_000_000);
  });
  it('sub-billion charm price', () => {
    expect(computeCharmPrice(850_000_000)).toBe(849_000_000);
  });
});

describe('optimizePricingPsychology', () => {
  it('returns valid composite score and grade', () => {
    const result = optimizePricingPsychology({
      listing_price: 2_100_000_000,
      fair_market_value: 2_000_000_000,
      avg_nearby_price: 2_050_000_000,
      days_on_market: 10,
      competing_listings: 3,
      inquiry_count_7d: 8,
      segment: 'mid',
    });
    expect(result.buyer_perception_score).toBeGreaterThanOrEqual(0);
    expect(result.buyer_perception_score).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.perception_grade);
    expect(result.urgency_messages.length).toBeGreaterThan(0);
  });

  it('luxury segment uses rounded price', () => {
    const result = optimizePricingPsychology({
      listing_price: 12_500_000_000,
      fair_market_value: 12_000_000_000,
      avg_nearby_price: 11_800_000_000,
      days_on_market: 20,
      competing_listings: 2,
      inquiry_count_7d: 3,
      segment: 'luxury',
    });
    expect(result.suggested_psychological_price % 100_000_000).toBe(0);
  });
});
