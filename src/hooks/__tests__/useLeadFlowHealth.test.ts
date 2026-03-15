import { describe, it, expect } from 'vitest';
import { evaluateLeadFlowHealth } from '../useLeadFlowHealth';

describe('evaluateLeadFlowHealth', () => {
  it('returns OPTIMAL for strong metrics', () => {
    const r = evaluateLeadFlowHealth(600, 5, 12);
    expect(r.lead_flow_stage).toBe('OPTIMAL');
    expect(r.health_score).toBeGreaterThanOrEqual(81);
  });

  it('returns EFFICIENT for good metrics', () => {
    const r = evaluateLeadFlowHealth(300, 20, 7);
    expect(r.lead_flow_stage).toBe('EFFICIENT');
  });

  it('returns NEEDS_IMPROVEMENT for weak metrics', () => {
    const r = evaluateLeadFlowHealth(150, 60, 3);
    expect(r.lead_flow_stage).toBe('NEEDS_IMPROVEMENT');
  });

  it('returns CRITICAL for poor metrics', () => {
    const r = evaluateLeadFlowHealth(50, 100, 1);
    expect(r.lead_flow_stage).toBe('CRITICAL');
  });

  it('identifies response time as bottleneck', () => {
    const r = evaluateLeadFlowHealth(400, 90, 8);
    expect(r.bottleneck_issue).toContain('respons');
  });

  it('identifies conversion as bottleneck', () => {
    const r = evaluateLeadFlowHealth(400, 10, 2);
    expect(r.bottleneck_issue.toLowerCase()).toContain('conver');
  });
});
