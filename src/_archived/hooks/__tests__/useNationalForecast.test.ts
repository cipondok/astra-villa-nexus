import { describe, it, expect } from 'vitest';
import {
  classifyPriceForecast,
  classifyClimatePhase,
  isEmergingRegion,
} from '../useNationalForecast';

describe('classifyPriceForecast', () => {
  it('STRONG_GROWTH for high growth trend + demand + current growth', () => {
    expect(classifyPriceForecast(15, 12, 65)).toBe('STRONG_GROWTH');
  });

  it('MODERATE_GROWTH for positive growth with steady demand', () => {
    expect(classifyPriceForecast(5, 2, 50)).toBe('MODERATE_GROWTH');
  });

  it('STABLE when both trends flat', () => {
    expect(classifyPriceForecast(2, -3, 50)).toBe('STABLE');
  });

  it('DOWNSIDE_RISK when growth declining with weak demand', () => {
    expect(classifyPriceForecast(-8, -10, 35)).toBe('DOWNSIDE_RISK');
  });

  it('MODERATE_GROWTH not triggered if demand negative', () => {
    expect(classifyPriceForecast(5, -2, 50)).not.toBe('MODERATE_GROWTH');
  });
});

describe('classifyClimatePhase', () => {
  it('EXPANSION_CYCLE for high composite + positive trends', () => {
    expect(classifyClimatePhase(65, 8, 5)).toBe('EXPANSION_CYCLE');
  });

  it('SELECTIVE_OPPORTUNITY for moderate composite with some positive trend', () => {
    expect(classifyClimatePhase(45, 2, -1)).toBe('SELECTIVE_OPPORTUNITY');
  });

  it('RISK_CONTROL for low composite and negative trends', () => {
    expect(classifyClimatePhase(35, -5, -3)).toBe('RISK_CONTROL');
  });
});

describe('isEmergingRegion', () => {
  it('true when demand accelerating', () => {
    expect(isEmergingRegion(5, 0, 40)).toBe(true);
  });

  it('true when liquidity improving', () => {
    expect(isEmergingRegion(0, 5, 40)).toBe(true);
  });

  it('true when high growth score', () => {
    expect(isEmergingRegion(0, 0, 60)).toBe(true);
  });

  it('false when no criteria met', () => {
    expect(isEmergingRegion(1, 1, 40)).toBe(false);
  });
});
