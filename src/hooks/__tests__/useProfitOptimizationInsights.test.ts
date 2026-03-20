import { describe, it, expect } from 'vitest';
import {
  classifyDomainPriority,
  computeMetabolicEfficiency,
  classifyHealthStatus,
} from '../useProfitOptimizationInsights';

describe('classifyDomainPriority', () => {
  it('returns highest strength domain', () => {
    const signals = [
      { signal_domain: 'dynamic_pricing', signal_strength: 72 },
      { signal_domain: 'cost_efficiency', signal_strength: 80 },
      { signal_domain: 'revenue_opportunity', signal_strength: 60 },
    ];
    expect(classifyDomainPriority(signals)).toBe('cost_efficiency');
  });

  it('aggregates multiple signals per domain', () => {
    const signals = [
      { signal_domain: 'dynamic_pricing', signal_strength: 40 },
      { signal_domain: 'dynamic_pricing', signal_strength: 50 },
      { signal_domain: 'cost_efficiency', signal_strength: 80 },
    ];
    expect(classifyDomainPriority(signals)).toBe('dynamic_pricing');
  });

  it('defaults to revenue_opportunity for empty', () => {
    expect(classifyDomainPriority([])).toBe('revenue_opportunity');
  });
});

describe('computeMetabolicEfficiency', () => {
  it('returns margin percentage', () => {
    expect(computeMetabolicEfficiency(1000, 700)).toBe(30);
  });

  it('handles zero revenue', () => {
    expect(computeMetabolicEfficiency(0, 100)).toBe(0);
  });

  it('handles 100% margin', () => {
    expect(computeMetabolicEfficiency(500, 0)).toBe(100);
  });

  it('handles negative margin', () => {
    expect(computeMetabolicEfficiency(100, 150)).toBe(-50);
  });
});

describe('classifyHealthStatus', () => {
  it('thriving when all metrics excellent', () => {
    expect(classifyHealthStatus(35, 97, 80)).toBe('thriving');
  });

  it('healthy when metrics moderate', () => {
    expect(classifyHealthStatus(20, 90, 55)).toBe('healthy');
  });

  it('caution when retention drops', () => {
    expect(classifyHealthStatus(8, 78, 40)).toBe('caution');
  });

  it('critical when margin collapses', () => {
    expect(classifyHealthStatus(2, 70, 30)).toBe('critical');
  });
});
