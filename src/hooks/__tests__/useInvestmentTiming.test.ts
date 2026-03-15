import { describe, it, expect } from 'vitest';
import { classifyInvestmentTiming } from '../useInvestmentTiming';

describe('classifyInvestmentTiming', () => {
  it('returns EARLY OPPORTUNITY for FUTURE HOTSPOT with high score + infra', () => {
    const r = classifyInvestmentTiming(85, 'FUTURE HOTSPOT', true);
    expect(r.investment_entry_timing).toBe('EARLY OPPORTUNITY');
    expect(r.speculative_risk_level).toBe('MEDIUM');
  });

  it('returns EARLY OPPORTUNITY with HIGH risk for FUTURE HOTSPOT without infra', () => {
    const r = classifyInvestmentTiming(80, 'FUTURE HOTSPOT', false);
    expect(r.investment_entry_timing).toBe('EARLY OPPORTUNITY');
    expect(r.speculative_risk_level).toBe('HIGH');
  });

  it('returns TOO EARLY for FUTURE HOTSPOT with low score', () => {
    const r = classifyInvestmentTiming(60, 'FUTURE HOTSPOT');
    expect(r.investment_entry_timing).toBe('TOO EARLY');
    expect(r.speculative_risk_level).toBe('HIGH');
  });

  it('returns GROWTH PHASE for HIGH growth with high score', () => {
    const r = classifyInvestmentTiming(75, 'HIGH');
    expect(r.investment_entry_timing).toBe('GROWTH PHASE');
    expect(r.speculative_risk_level).toBe('LOW');
  });

  it('returns EARLY OPPORTUNITY for HIGH growth with lower score', () => {
    const r = classifyInvestmentTiming(65, 'HIGH');
    expect(r.investment_entry_timing).toBe('EARLY OPPORTUNITY');
    expect(r.speculative_risk_level).toBe('MEDIUM');
  });

  it('returns GROWTH PHASE for MODERATE with decent score', () => {
    const r = classifyInvestmentTiming(65, 'MODERATE');
    expect(r.investment_entry_timing).toBe('GROWTH PHASE');
    expect(r.speculative_risk_level).toBe('LOW');
  });

  it('returns MATURE MARKET for MODERATE with mid score', () => {
    const r = classifyInvestmentTiming(50, 'MODERATE');
    expect(r.investment_entry_timing).toBe('MATURE MARKET');
    expect(r.speculative_risk_level).toBe('LOW');
  });

  it('returns MATURE MARKET for LOW growth with some score', () => {
    const r = classifyInvestmentTiming(45, 'LOW');
    expect(r.investment_entry_timing).toBe('MATURE MARKET');
    expect(r.speculative_risk_level).toBe('MEDIUM');
  });

  it('returns TOO EARLY for LOW growth with very low score', () => {
    const r = classifyInvestmentTiming(25, 'LOW');
    expect(r.investment_entry_timing).toBe('TOO EARLY');
    expect(r.speculative_risk_level).toBe('HIGH');
  });
});
