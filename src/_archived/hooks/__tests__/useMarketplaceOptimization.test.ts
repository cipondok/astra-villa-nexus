import { describe, it, expect } from 'vitest';
import {
  classifyPerformanceTrend,
  classifyPrimaryAction,
  classifyCycleSignal,
  classifyNextFocus,
} from '../useMarketplaceOptimization';

describe('classifyPerformanceTrend', () => {
  it('IMPROVING for deal trend > 5', () => {
    expect(classifyPerformanceTrend(8)).toBe('IMPROVING');
  });
  it('STABLE for deal trend between -3 and 5', () => {
    expect(classifyPerformanceTrend(0)).toBe('STABLE');
    expect(classifyPerformanceTrend(-3)).toBe('STABLE');
  });
  it('DECLINING for deal trend < -3', () => {
    expect(classifyPerformanceTrend(-5)).toBe('DECLINING');
  });
});

describe('classifyPrimaryAction', () => {
  it('PRICING_ADJUSTMENT for steep decline + low deal', () => {
    expect(classifyPrimaryAction(-10, 35, 50, 0, 40)).toBe('PRICING_ADJUSTMENT');
  });
  it('SEO_OPTIMIZATION for low seo score', () => {
    expect(classifyPrimaryAction(0, 50, 30, 0, 40)).toBe('SEO_OPTIMIZATION');
  });
  it('BUYER_MATCH_ESCALATION for rising demand', () => {
    expect(classifyPrimaryAction(0, 50, 50, 8, 55)).toBe('BUYER_MATCH_ESCALATION');
  });
  it('PRICING_ADJUSTMENT for moderate decline', () => {
    expect(classifyPrimaryAction(-5, 50, 50, 0, 40)).toBe('PRICING_ADJUSTMENT');
  });
  it('MONITOR as default', () => {
    expect(classifyPrimaryAction(0, 50, 50, 0, 40)).toBe('MONITOR');
  });
});

describe('classifyCycleSignal', () => {
  it('OPTIMIZATION_IMPROVING when improving + monitor', () => {
    expect(classifyCycleSignal(8, 50, 50, 0, 40)).toBe('OPTIMIZATION_IMPROVING');
  });
  it('INTERVENTION_REQUIRED when declining', () => {
    expect(classifyCycleSignal(-10, 35, 50, 0, 40)).toBe('INTERVENTION_REQUIRED');
  });
  it('INTERVENTION_REQUIRED when seo needs fix', () => {
    expect(classifyCycleSignal(0, 50, 30, 0, 40)).toBe('INTERVENTION_REQUIRED');
  });
  it('STABLE_CONDITION as default', () => {
    expect(classifyCycleSignal(0, 50, 50, 0, 40)).toBe('STABLE_CONDITION');
  });
});

describe('classifyNextFocus', () => {
  it('DUAL_PRICE_SEO when pricing + low seo', () => {
    expect(classifyNextFocus('PRICING_ADJUSTMENT', 35, 'DECLINING')).toBe('DUAL_PRICE_SEO');
  });
  it('CONVERSION_PUSH for buyer escalation', () => {
    expect(classifyNextFocus('BUYER_MATCH_ESCALATION', 50, 'STABLE')).toBe('CONVERSION_PUSH');
  });
  it('VISIBILITY_BOOST for seo optimization', () => {
    expect(classifyNextFocus('SEO_OPTIMIZATION', 30, 'STABLE')).toBe('VISIBILITY_BOOST');
  });
  it('MOMENTUM_MAINTAIN when improving', () => {
    expect(classifyNextFocus('MONITOR', 50, 'IMPROVING')).toBe('MOMENTUM_MAINTAIN');
  });
  it('STANDARD_MONITOR as default', () => {
    expect(classifyNextFocus('MONITOR', 50, 'STABLE')).toBe('STANDARD_MONITOR');
  });
});
