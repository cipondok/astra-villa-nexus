import { describe, it, expect } from 'vitest';
import { generateInsightCard } from '../useInsightCard';

describe('generateInsightCard', () => {
  it('returns premium insight for strong signals', () => {
    const r = generateInsightCard({ investment_score: 90, demand_level: 'high', liquidity_level: 'high', deal_probability: 85 });
    expect(r.insight_headline).toContain('Premium');
    expect(r.composite_score).toBeGreaterThanOrEqual(80);
  });

  it('returns strong prospect for good signals', () => {
    const r = generateInsightCard({ investment_score: 70, demand_level: 'moderate', liquidity_level: 'high', deal_probability: 65 });
    expect(r.insight_headline).toContain('Kuat');
    expect(r.composite_score).toBeGreaterThanOrEqual(60);
  });

  it('returns stable market for mixed signals', () => {
    const r = generateInsightCard({ investment_score: 50, demand_level: 'moderate', liquidity_level: 'moderate', deal_probability: 45 });
    expect(r.insight_headline).toContain('Stabil');
  });

  it('returns weak signal for poor metrics', () => {
    const r = generateInsightCard({ investment_score: 25, demand_level: 'low', liquidity_level: 'low', deal_probability: 20 });
    expect(r.insight_headline).toContain('Lemah');
    expect(r.composite_score).toBeLessThan(40);
  });

  it('handles very_high demand correctly', () => {
    const r = generateInsightCard({ investment_score: 85, demand_level: 'very_high', liquidity_level: 'high', deal_probability: 80 });
    expect(r.composite_score).toBeGreaterThanOrEqual(80);
  });
});
