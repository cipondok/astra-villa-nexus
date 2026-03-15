import { describe, it, expect } from 'vitest';
import { detectInvestmentRisk } from '../useInvestmentRiskMonitor';

describe('detectInvestmentRisk', () => {
  it('returns LOW risk for strong signals in expansion', () => {
    const r = detectInvestmentRisk({ demand_level: 'high', liquidity_level: 'high', cycle_stage: 'expansion' });
    expect(r.risk_level).toBe('LOW');
    expect(r.risk_type).toBe('MINIMAL EXPOSURE');
  });

  it('returns MODERATE risk for mixed signals', () => {
    const r = detectInvestmentRisk({ demand_level: 'moderate', liquidity_level: 'high', cycle_stage: 'peak' });
    expect(r.risk_level).toBe('MODERATE');
    expect(r.risk_type).toBe('MARKET TIMING RISK');
  });

  it('returns HIGH risk for weak demand + correction', () => {
    const r = detectInvestmentRisk({ demand_level: 'moderate', liquidity_level: 'moderate', cycle_stage: 'correction' });
    expect(r.risk_level).toBe('HIGH');
    expect(r.risk_type).toBe('LIQUIDITY TRAP RISK');
  });

  it('returns CRITICAL risk for all weak signals', () => {
    const r = detectInvestmentRisk({ demand_level: 'low', liquidity_level: 'low', cycle_stage: 'correction' });
    expect(r.risk_level).toBe('CRITICAL');
    expect(r.risk_type).toBe('CAPITAL EROSION RISK');
  });

  it('handles very_high demand in recovery', () => {
    const r = detectInvestmentRisk({ demand_level: 'very_high', liquidity_level: 'very_high', cycle_stage: 'recovery' });
    expect(r.risk_level).toBe('LOW');
  });

  it('returns Indonesian alert message', () => {
    const r = detectInvestmentRisk({ demand_level: 'high', liquidity_level: 'moderate', cycle_stage: 'expansion' });
    expect(r.alert_message).toContain('Risiko');
  });
});
