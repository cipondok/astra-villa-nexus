import { describe, it, expect } from 'vitest';
import {
  detectConcentrationRisk,
  detectGrowthImbalance,
  classifyOutlook,
  classifyRebalanceAction,
} from '../usePortfolioStrategy';

describe('detectConcentrationRisk', () => {
  it('true when city concentration >= 60%', () => {
    expect(detectConcentrationRisk(65, 40, 3)).toBe(true);
  });
  it('true when type concentration >= 70%', () => {
    expect(detectConcentrationRisk(40, 75, 3)).toBe(true);
  });
  it('false with balanced portfolio', () => {
    expect(detectConcentrationRisk(40, 50, 5)).toBe(false);
  });
  it('false with single asset', () => {
    expect(detectConcentrationRisk(100, 100, 1)).toBe(false);
  });
});

describe('detectGrowthImbalance', () => {
  it('true when growth trails benchmark by > 10', () => {
    expect(detectGrowthImbalance(35, 50)).toBe(true);
  });
  it('false when growth near benchmark', () => {
    expect(detectGrowthImbalance(45, 50)).toBe(false);
  });
  it('false when growth exceeds benchmark', () => {
    expect(detectGrowthImbalance(60, 50)).toBe(false);
  });
});

describe('classifyOutlook', () => {
  it('RISK_EXPOSURE_RISING when both risks present', () => {
    expect(classifyOutlook(true, true, 30, 50, 40, 3)).toBe('RISK_EXPOSURE_RISING');
  });
  it('STRONG_WEALTH_GROWTH when optimal metrics', () => {
    expect(classifyOutlook(false, false, 60, 50, 55, 5)).toBe('STRONG_WEALTH_GROWTH');
  });
  it('BALANCED_STRATEGY as default', () => {
    expect(classifyOutlook(false, false, 50, 50, 40, 3)).toBe('BALANCED_STRATEGY');
  });
});

describe('classifyRebalanceAction', () => {
  it('ACQUIRE_GROWTH_ZONE when concentrated', () => {
    expect(classifyRebalanceAction(true, false, 50, 50, 50, 5)).toBe('ACQUIRE_GROWTH_ZONE');
  });
  it('EXIT_WEAKENING_ASSET when growth gap + liquid', () => {
    expect(classifyRebalanceAction(false, true, 35, 50, 55, 3)).toBe('EXIT_WEAKENING_ASSET');
  });
  it('HOLD_STABLE_INCOME when growth gap + illiquid', () => {
    expect(classifyRebalanceAction(false, true, 35, 50, 40, 3)).toBe('HOLD_STABLE_INCOME');
  });
  it('HOLD_STABLE_INCOME as default', () => {
    expect(classifyRebalanceAction(false, false, 50, 50, 50, 5)).toBe('HOLD_STABLE_INCOME');
  });
});
