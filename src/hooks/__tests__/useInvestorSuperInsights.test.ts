import { describe, it, expect } from 'vitest';
import {
  computePortfolioValueTrend,
  computeRentalYieldSignal,
  computeCapitalGrowthMomentum,
  computeSellHoldAdvisory,
  computeNextOpportunityHint,
} from '../useInvestorSuperInsights';
import type { PortfolioData, PortfolioProperty } from '../usePortfolioManager';

const makeProperty = (overrides: Partial<PortfolioProperty> = {}): PortfolioProperty => ({
  id: 'p1', title: 'Test Property', price: 1_000_000_000, city: 'Jakarta', state: null, location: null,
  property_type: 'apartment', listing_type: 'sale', bedrooms: 2, bathrooms: 1, area_sqm: 60,
  thumbnail_url: null, is_owned: true, investment_score: 70, demand_heat_score: 60,
  rental_yield: 6, annual_growth_rate: 8, projected_value_5y: 1_400_000_000, roi_5y: 40, risk_factor: 30,
  ...overrides,
});

const makePortfolio = (overrides: Partial<PortfolioData> = {}): PortfolioData => ({
  portfolio_value: 5_000_000_000, projected_value_5y: 7_500_000_000, average_roi: 25,
  risk_level: 'medium', avg_investment_score: 65, total_properties: 2,
  geo_concentration: false, type_concentration: false,
  unique_cities: ['Jakarta', 'Bandung'], unique_types: ['apartment', 'house'],
  top_performer: null, weakest_performer: null, generated_at: '',
  properties: [makeProperty(), makeProperty({ id: 'p2', title: 'Prop 2', city: 'Bandung' })],
  ...overrides,
});

describe('computePortfolioValueTrend', () => {
  it('returns ACCELERATING for >40% growth', () => {
    const r = computePortfolioValueTrend(makePortfolio({ portfolio_value: 1e9, projected_value_5y: 1.5e9 }));
    expect(r.trend).toBe('ACCELERATING');
    expect(r.growth_percent).toBe(50);
  });

  it('returns GROWING for 15-40% growth', () => {
    const r = computePortfolioValueTrend(makePortfolio({ portfolio_value: 1e9, projected_value_5y: 1.2e9 }));
    expect(r.trend).toBe('GROWING');
  });

  it('returns FLAT for 0-15% growth', () => {
    const r = computePortfolioValueTrend(makePortfolio({ portfolio_value: 1e9, projected_value_5y: 1.05e9 }));
    expect(r.trend).toBe('FLAT');
  });

  it('returns DECLINING for negative growth', () => {
    const r = computePortfolioValueTrend(makePortfolio({ portfolio_value: 1e9, projected_value_5y: 0.9e9 }));
    expect(r.trend).toBe('DECLINING');
  });
});

describe('computeRentalYieldSignal', () => {
  it('returns STRONG_YIELD for avg >= 7%', () => {
    const r = computeRentalYieldSignal([makeProperty({ rental_yield: 8 }), makeProperty({ rental_yield: 7 })]);
    expect(r.signal).toBe('STRONG_YIELD');
  });

  it('returns STABLE_YIELD for avg 4-7%', () => {
    const r = computeRentalYieldSignal([makeProperty({ rental_yield: 5 }), makeProperty({ rental_yield: 4 })]);
    expect(r.signal).toBe('STABLE_YIELD');
  });

  it('returns WEAK_YIELD for avg < 4%', () => {
    const r = computeRentalYieldSignal([makeProperty({ rental_yield: 2 }), makeProperty({ rental_yield: 3 })]);
    expect(r.signal).toBe('WEAK_YIELD');
  });
});

describe('computeCapitalGrowthMomentum', () => {
  it('returns SURGING for high growth + high score', () => {
    const r = computeCapitalGrowthMomentum([
      makeProperty({ annual_growth_rate: 12, investment_score: 85 }),
      makeProperty({ annual_growth_rate: 14, investment_score: 90 }),
    ]);
    expect(r.momentum).toBe('SURGING');
  });

  it('returns STALLING for low growth + low score', () => {
    const r = computeCapitalGrowthMomentum([
      makeProperty({ annual_growth_rate: 1, investment_score: 20 }),
    ]);
    expect(r.momentum).toBe('STALLING');
  });
});

describe('computeSellHoldAdvisory', () => {
  it('returns sorted advisory by composite score', () => {
    const r = computeSellHoldAdvisory([
      makeProperty({ roi_5y: 40, demand_heat_score: 80, annual_growth_rate: 2, investment_score: 80 }),
      makeProperty({ id: 'p2', roi_5y: 5, demand_heat_score: 20, annual_growth_rate: 1, investment_score: 30 }),
    ]);
    expect(r.length).toBe(2);
    expect(r[0].exit_timing.composite_score).toBeGreaterThanOrEqual(r[1].exit_timing.composite_score);
  });
});

describe('computeNextOpportunityHint', () => {
  it('suggests city not in portfolio', () => {
    const r = computeNextOpportunityHint(makePortfolio(), [
      { city: 'Surabaya', score: 85, growth_rate: 12 },
      { city: 'Jakarta', score: 90, growth_rate: 8 },
    ]);
    expect(r.suggested_zone).toBe('Surabaya');
    expect(r.gap_cities).toContain('Surabaya');
  });

  it('returns diversified if all hotspots already in portfolio', () => {
    const r = computeNextOpportunityHint(makePortfolio(), [
      { city: 'Jakarta', score: 90 },
      { city: 'Bandung', score: 80 },
    ]);
    expect(r.suggested_zone).toBe('Diversified');
  });
});
