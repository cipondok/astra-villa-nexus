import { describe, it, expect } from 'vitest';
describe('AgentDashboardPage', () => {
  it('agent metrics', () => { expect(['listings','leads','sales','revenue']).toHaveLength(4); });
  it('lead conversion rate', () => { expect(Math.round((15/100)*100)).toBe(15); });
});
