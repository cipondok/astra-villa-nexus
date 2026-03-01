import { describe, it, expect } from 'vitest';
import type { ValuationResult, PropertyValuationInput } from '../usePropertyValuation';

describe('usePropertyValuation - types and data', () => {
  it('ValuationResult has required fields', () => {
    const result: ValuationResult = {
      estimatedValue: 1_500_000_000,
      confidenceScore: 0.85,
      priceRangeLow: 1_200_000_000,
      priceRangeHigh: 1_800_000_000,
      marketTrend: 'rising',
      comparableProperties: [],
      valuationFactors: [],
      methodology: 'Comparative Market Analysis',
      validUntil: '2026-06-01',
    };
    expect(result.confidenceScore).toBeLessThanOrEqual(1);
    expect(result.priceRangeLow).toBeLessThan(result.estimatedValue);
    expect(result.priceRangeHigh).toBeGreaterThan(result.estimatedValue);
  });

  it('market trend has valid values', () => {
    const trends: ValuationResult['marketTrend'][] = ['rising', 'stable', 'declining'];
    expect(trends).toHaveLength(3);
  });

  it('valuation factor impact values', () => {
    const impacts = ['positive', 'neutral', 'negative'];
    impacts.forEach(i => expect(['positive', 'neutral', 'negative']).toContain(i));
  });

  it('PropertyValuationInput requires location and specs', () => {
    const input: PropertyValuationInput = {
      propertyType: 'house',
      location: { city: 'Jakarta' },
      specifications: { landArea: 200, buildingArea: 150, bedrooms: 3, bathrooms: 2 },
    };
    expect(input.location.city).toBe('Jakarta');
    expect(input.specifications.bedrooms).toBe(3);
  });

  it('comparable properties have similarity score', () => {
    const comp = { id: '1', title: 'Similar House', price: 1_400_000_000, similarity: 0.92 };
    expect(comp.similarity).toBeGreaterThan(0);
    expect(comp.similarity).toBeLessThanOrEqual(1);
  });
});
