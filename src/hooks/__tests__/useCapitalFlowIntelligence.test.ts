import { describe, it, expect } from 'vitest';
import { classifyFlowSignal, classifyFlowStrength } from '../useCapitalFlowIntelligence';

describe('classifyFlowSignal', () => {
  it('SPECULATIVE_HEAT when rapid growth + deal surge', () => {
    expect(classifyFlowSignal(5, 12, 60, 0, 0, 20, 70)).toBe('SPECULATIVE_HEAT');
  });
  it('CAPITAL_INFLOW when velocity + deal rising', () => {
    expect(classifyFlowSignal(3, 5, 50, 0, 0, 5, 50)).toBe('CAPITAL_INFLOW');
  });
  it('CAPITAL_OUTFLOW when liquidity dropping + inventory rising', () => {
    expect(classifyFlowSignal(0, 0, 40, -8, 3, 0, 40)).toBe('CAPITAL_OUTFLOW');
  });
  it('STABLE as default', () => {
    expect(classifyFlowSignal(0, 0, 40, 0, 0, 0, 40)).toBe('STABLE');
  });
});

describe('classifyFlowStrength', () => {
  it('CAPITAL_EXIT_RISK for speculative heat', () => {
    expect(classifyFlowStrength('SPECULATIVE_HEAT', 5, 12, 0)).toBe('CAPITAL_EXIT_RISK');
  });
  it('STRONG_INFLOW for strong inflow metrics', () => {
    expect(classifyFlowStrength('CAPITAL_INFLOW', 8, 10, 0)).toBe('STRONG_INFLOW');
  });
  it('MODERATE_ROTATION for moderate inflow', () => {
    expect(classifyFlowStrength('CAPITAL_INFLOW', 3, 5, 0)).toBe('MODERATE_ROTATION');
  });
  it('CAPITAL_EXIT_RISK for deep outflow', () => {
    expect(classifyFlowStrength('CAPITAL_OUTFLOW', 0, 0, -15)).toBe('CAPITAL_EXIT_RISK');
  });
  it('MODERATE_ROTATION for mild outflow', () => {
    expect(classifyFlowStrength('CAPITAL_OUTFLOW', 0, 0, -7)).toBe('MODERATE_ROTATION');
  });
  it('MODERATE_ROTATION for stable', () => {
    expect(classifyFlowStrength('STABLE', 0, 0, 0)).toBe('MODERATE_ROTATION');
  });
});
