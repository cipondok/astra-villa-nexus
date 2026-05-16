import { describe, it, expect } from 'vitest';
import { evaluateLeadFairness } from '../useLeadFairness';

describe('evaluateLeadFairness', () => {
  it('returns BALANCED for ratio <= 1.2', () => {
    const r = evaluateLeadFairness(12, 10);
    expect(r.fairness_status).toBe('BALANCED');
    expect(r.concentration_ratio).toBe(1.2);
  });

  it('returns SLIGHTLY_CONCENTRATED for ratio 1.21-1.5', () => {
    const r = evaluateLeadFairness(14, 10);
    expect(r.fairness_status).toBe('SLIGHTLY_CONCENTRATED');
    expect(r.concentration_ratio).toBe(1.4);
  });

  it('returns OVERLOADED for ratio 1.51-2.0', () => {
    const r = evaluateLeadFairness(18, 10);
    expect(r.fairness_status).toBe('OVERLOADED');
    expect(r.concentration_ratio).toBe(1.8);
  });

  it('returns CRITICALLY_UNFAIR for ratio > 2.0', () => {
    const r = evaluateLeadFairness(25, 10);
    expect(r.fairness_status).toBe('CRITICALLY_UNFAIR');
    expect(r.concentration_ratio).toBe(2.5);
  });

  it('handles zero avg_leads safely', () => {
    const r = evaluateLeadFairness(5, 0);
    expect(r.fairness_status).toBe('CRITICALLY_UNFAIR');
    expect(r.concentration_ratio).toBe(5);
  });

  it('handles equal distribution', () => {
    const r = evaluateLeadFairness(10, 10);
    expect(r.fairness_status).toBe('BALANCED');
    expect(r.concentration_ratio).toBe(1);
  });
});
