import { describe, it, expect } from 'vitest';
import {
  classifyPricingSignal,
  classifyConfidence,
  computeStabilityIndex,
} from '../usePricingAutomation';

describe('classifyPricingSignal', () => {
  it('REDUCE_PRICE when deal trend declining and demand stagnant', () => {
    expect(classifyPricingSignal(-15, 50, 30, 3, 40, 40)).toBe('REDUCE_PRICE');
  });

  it('REDUCE_PRICE when deal score low + high DOM', () => {
    expect(classifyPricingSignal(0, 30, 70, 2, 40, 40)).toBe('REDUCE_PRICE');
  });

  it('INCREASE_PRICE when demand surging with high liquidity', () => {
    expect(classifyPricingSignal(5, 60, 20, 15, 65, 60)).toBe('INCREASE_PRICE');
  });

  it('MAINTAIN_PRICE when signals balanced', () => {
    expect(classifyPricingSignal(0, 50, 30, 5, 50, 50)).toBe('MAINTAIN_PRICE');
  });

  it('MAINTAIN_PRICE when demand rising but liquidity too low', () => {
    expect(classifyPricingSignal(0, 50, 30, 15, 65, 40)).toBe('MAINTAIN_PRICE');
  });

  it('does not reduce if demand momentum is positive', () => {
    expect(classifyPricingSignal(-15, 50, 30, 10, 40, 40)).toBe('MAINTAIN_PRICE');
  });
});

describe('classifyConfidence', () => {
  it('HIGH for severe reduction trigger', () => {
    expect(classifyConfidence('REDUCE_PRICE', -25, 100, 0, 30, 50)).toBe('HIGH');
  });

  it('MODERATE for moderate reduction trigger', () => {
    expect(classifyConfidence('REDUCE_PRICE', -15, 50, 0, 30, 50)).toBe('MODERATE');
  });

  it('LOW for weak reduction trigger', () => {
    expect(classifyConfidence('REDUCE_PRICE', -5, 70, 0, 30, 50)).toBe('LOW');
  });

  it('HIGH for strong increase trigger', () => {
    expect(classifyConfidence('INCREASE_PRICE', 5, 20, 25, 70, 50)).toBe('HIGH');
  });

  it('MODERATE for moderate increase trigger', () => {
    expect(classifyConfidence('INCREASE_PRICE', 5, 20, 15, 40, 50)).toBe('MODERATE');
  });

  it('HIGH for stable maintain', () => {
    expect(classifyConfidence('MAINTAIN_PRICE', 2, 30, 5, 50, 80)).toBe('HIGH');
  });

  it('MODERATE for moderate maintain', () => {
    expect(classifyConfidence('MAINTAIN_PRICE', 2, 30, 5, 50, 50)).toBe('MODERATE');
  });

  it('LOW for unstable maintain', () => {
    expect(classifyConfidence('MAINTAIN_PRICE', 10, 30, 5, 50, 30)).toBe('LOW');
  });
});

describe('computeStabilityIndex', () => {
  it('returns 100 when liquidity equals deal score', () => {
    expect(computeStabilityIndex(60, 60)).toBe(100);
  });

  it('returns lower value when scores diverge', () => {
    expect(computeStabilityIndex(80, 30)).toBe(50);
  });

  it('returns 50 when either is zero', () => {
    expect(computeStabilityIndex(0, 50)).toBe(50);
  });
});
