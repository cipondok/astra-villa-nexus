import { describe, it, expect } from 'vitest';
import {
  classifyMomentum,
  classifyInvestmentClimate,
  buildNationalIndex,
  type NationalMarketIndexData,
} from '../useNationalPropertyMarketIndex';

describe('classifyMomentum', () => {
  it('returns HIGH for score >= 65', () => {
    expect(classifyMomentum(65)).toBe('HIGH');
    expect(classifyMomentum(90)).toBe('HIGH');
  });

  it('returns MODERATE for score 40-64', () => {
    expect(classifyMomentum(40)).toBe('MODERATE');
    expect(classifyMomentum(64)).toBe('MODERATE');
  });

  it('returns LOW for score < 40', () => {
    expect(classifyMomentum(39)).toBe('LOW');
    expect(classifyMomentum(0)).toBe('LOW');
  });
});

describe('classifyInvestmentClimate', () => {
  it('returns STRONG_BUY_CYCLE for high signals', () => {
    const r = classifyInvestmentClimate(80, 75, 70, 85);
    expect(r.climate).toBe('STRONG_BUY_CYCLE');
    expect(r.climate_emoji).toBe('🟢');
  });

  it('returns SELECTIVE_OPPORTUNITY for moderate signals', () => {
    const r = classifyInvestmentClimate(50, 45, 50, 55);
    expect(r.climate).toBe('SELECTIVE_OPPORTUNITY');
    expect(r.climate_emoji).toBe('🟡');
  });

  it('returns RISK_CONTROL_PHASE for weak signals', () => {
    const r = classifyInvestmentClimate(20, 15, 25, 30);
    expect(r.climate).toBe('RISK_CONTROL_PHASE');
    expect(r.climate_emoji).toBe('🔴');
  });
});

describe('buildNationalIndex', () => {
  const makeRaw = (overrides: Partial<NationalMarketIndexData> = {}): NationalMarketIndexData => ({
    national_demand: 60,
    national_growth: 55,
    national_liquidity: 50,
    national_price_index: 58,
    national_investment_score: 62,
    momentum_score: 55,
    total_properties: 500,
    total_cities: 12,
    regional_leaders: [],
    generated_at: '',
    ...overrides,
  });

  it('builds complete index with cycle detection', () => {
    const r = buildNationalIndex(makeRaw());
    expect(r.cycle.cycle_stage).toBeDefined();
    expect(r.momentum_level).toBe('MODERATE');
    expect(r.climate.climate).toBeDefined();
  });

  it('returns EXPANSION cycle for moderate-high demand + price', () => {
    const r = buildNationalIndex(makeRaw({ national_demand: 70, national_price_index: 65, national_investment_score: 60 }));
    expect(r.cycle.cycle_stage).toBe('EXPANSION');
  });

  it('returns HIGH momentum for score >= 65', () => {
    const r = buildNationalIndex(makeRaw({ momentum_score: 75 }));
    expect(r.momentum_level).toBe('HIGH');
  });
});
