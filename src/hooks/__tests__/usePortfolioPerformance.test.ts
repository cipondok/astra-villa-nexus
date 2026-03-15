import { describe, it, expect } from 'vitest';
import { analyzePortfolioPerformance } from '../usePortfolioPerformance';

describe('analyzePortfolioPerformance', () => {
  it('returns OUTPERFORMING for strong asset', () => {
    const r = analyzePortfolioPerformance({
      purchase_price: 1_000_000_000, current_price: 1_300_000_000,
      monthly_rent: 12_000_000, growth_score: 85, demand_level: 'high', liquidity_score: 75,
    });
    expect(r.asset_performance_level).toBe('OUTPERFORMING');
    expect(r.strategy_signal).toBe('HOLD & GROW');
    expect(r.capital_gain_percent).toContain('+30.0%');
  });

  it('returns STRONG for good asset', () => {
    const r = analyzePortfolioPerformance({
      purchase_price: 1_000_000_000, current_price: 1_100_000_000,
      monthly_rent: 8_000_000, growth_score: 65, demand_level: 'moderate', liquidity_score: 60,
    });
    expect(r.asset_performance_level).toBe('STRONG');
    expect(r.strategy_signal).toBe('OPTIMIZE YIELD');
  });

  it('returns STABLE for average asset', () => {
    const r = analyzePortfolioPerformance({
      purchase_price: 1_000_000_000, current_price: 1_020_000_000,
      monthly_rent: 5_000_000, growth_score: 45, demand_level: 'moderate', liquidity_score: 50,
    });
    expect(r.asset_performance_level).toBe('STABLE');
    expect(r.strategy_signal).toBe('CONSIDER SELLING');
  });

  it('returns UNDERPERFORMING for weak asset', () => {
    const r = analyzePortfolioPerformance({
      purchase_price: 1_000_000_000, current_price: 900_000_000,
      monthly_rent: 3_000_000, growth_score: 25, demand_level: 'low', liquidity_score: 30,
    });
    expect(r.asset_performance_level).toBe('UNDERPERFORMING');
    expect(r.strategy_signal).toBe('URGENT REVIEW');
    expect(r.capital_gain_percent).toContain('-10.0%');
  });

  it('calculates rental yield correctly', () => {
    const r = analyzePortfolioPerformance({
      purchase_price: 1_000_000_000, current_price: 1_200_000_000,
      monthly_rent: 10_000_000, growth_score: 70, demand_level: 'high', liquidity_score: 70,
    });
    expect(r.rental_yield_percent).toBe('10.0%');
  });
});
