import { describe, it, expect } from 'vitest';
import { analyzePortfolioOverview } from '../usePortfolioOverview';

describe('analyzePortfolioOverview', () => {
  it('returns ELITE for strong multi-property portfolio', () => {
    const r = analyzePortfolioOverview({ property_count: 8, avg_growth: 82, avg_yield: 7.5 });
    expect(r.portfolio_strength).toBe('ELITE PORTFOLIO');
    expect(r.composite_score).toBeGreaterThanOrEqual(75);
  });

  it('returns STRONG for good portfolio', () => {
    const r = analyzePortfolioOverview({ property_count: 3, avg_growth: 65, avg_yield: 5.5 });
    expect(r.portfolio_strength).toBe('STRONG PORTFOLIO');
  });

  it('returns GROWING for moderate portfolio', () => {
    const r = analyzePortfolioOverview({ property_count: 2, avg_growth: 45, avg_yield: 4.0 });
    expect(r.portfolio_strength).toBe('GROWING PORTFOLIO');
  });

  it('returns EARLY STAGE for beginner', () => {
    const r = analyzePortfolioOverview({ property_count: 1, avg_growth: 25, avg_yield: 2.0 });
    expect(r.portfolio_strength).toBe('EARLY STAGE PORTFOLIO');
  });

  it('adjusts diversification tip based on property count', () => {
    const small = analyzePortfolioOverview({ property_count: 2, avg_growth: 85, avg_yield: 9 });
    const large = analyzePortfolioOverview({ property_count: 7, avg_growth: 85, avg_yield: 9 });
    expect(small.diversification_tip).toContain('kota sekunder');
    expect(large.diversification_tip).toContain('tipe aset');
  });
});
