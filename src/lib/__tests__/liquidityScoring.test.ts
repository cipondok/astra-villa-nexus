import { describe, it, expect } from 'vitest';
import { calculateLiquidityScore, type LiquidityInput } from '@/lib/liquidityScoring';

const BASE: LiquidityInput = {
  views_per_day: 25,
  inquiry_conversion_rate: 15,
  viewing_bookings_per_week: 5,
  price_vs_market_pct: 0,
  days_on_market: 30,
  district_demand_index: 60,
  absorption_rate_pct: 45,
  negotiation_success_rate: 50,
};

describe('calculateLiquidityScore', () => {
  it('returns score between 0 and 100', () => {
    const r = calculateLiquidityScore(BASE);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it('highly liquid property scores >= 75', () => {
    const r = calculateLiquidityScore({
      views_per_day: 45,
      inquiry_conversion_rate: 25,
      viewing_bookings_per_week: 8,
      price_vs_market_pct: -5,
      days_on_market: 7,
      district_demand_index: 90,
      absorption_rate_pct: 80,
      negotiation_success_rate: 70,
    });
    expect(r.score).toBeGreaterThanOrEqual(75);
    expect(r.tier).toBe('HIGHLY_LIQUID');
  });

  it('overpriced stale property scores low', () => {
    const r = calculateLiquidityScore({
      views_per_day: 2,
      inquiry_conversion_rate: 1,
      viewing_bookings_per_week: 0,
      price_vs_market_pct: 18,
      days_on_market: 150,
      district_demand_index: 15,
      absorption_rate_pct: 10,
      negotiation_success_rate: 5,
    });
    expect(r.score).toBeLessThan(25);
    expect(r.visibility_boost).toBe('URGENT');
  });

  it('decay reduces score for inactive listings', () => {
    const active = calculateLiquidityScore({ ...BASE, days_since_last_engagement: 0 });
    const stale = calculateLiquidityScore({ ...BASE, days_since_last_engagement: 30 });
    expect(stale.score).toBeLessThan(active.score);
  });

  it('breakdown has 8 variables with correct weights summing to 1.0', () => {
    const r = calculateLiquidityScore(BASE);
    expect(r.breakdown).toHaveLength(8);
    const totalWeight = r.breakdown.reduce((s, b) => s + b.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 2);
  });

  it('price competitiveness: below market = high normalised', () => {
    const below = calculateLiquidityScore({ ...BASE, price_vs_market_pct: -8 });
    const above = calculateLiquidityScore({ ...BASE, price_vs_market_pct: 15 });
    expect(below.score).toBeGreaterThan(above.score);
  });

  it('estimated days-to-sell decreases with higher score', () => {
    const high = calculateLiquidityScore({
      ...BASE, views_per_day: 50, inquiry_conversion_rate: 28,
      viewing_bookings_per_week: 9, price_vs_market_pct: -10,
      days_on_market: 3, district_demand_index: 95,
      absorption_rate_pct: 90, negotiation_success_rate: 80,
    });
    const low = calculateLiquidityScore({
      ...BASE, views_per_day: 1, inquiry_conversion_rate: 0,
      viewing_bookings_per_week: 0, price_vs_market_pct: 20,
      days_on_market: 180, district_demand_index: 5,
      absorption_rate_pct: 3, negotiation_success_rate: 0,
    });
    expect(high.estimated_days_to_sell.max).toBeLessThan(low.estimated_days_to_sell.min);
  });
});
