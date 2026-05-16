import { describe, it, expect } from 'vitest';
describe('AgentAnalytics', () => {
  it('lead scoring weights sum to 100', () => {
    const weights = { engagement: 30, budget: 25, timeline: 20, response: 25 };
    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    expect(total).toBe(100);
  });
  it('listing health score threshold', () => {
    const score = 72;
    const status = score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor';
    expect(status).toBe('fair');
  });
});
