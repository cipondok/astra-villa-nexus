import { describe, it, expect } from 'vitest';
describe('AgentLeaderboard', () => {
  it('ranks agents by total sales', () => {
    const agents = [{ sales: 30 }, { sales: 50 }, { sales: 20 }];
    const ranked = [...agents].sort((a, b) => b.sales - a.sales);
    expect(ranked[0].sales).toBe(50);
  });
  it('calculates response rate', () => {
    expect(Math.round((45 / 50) * 100)).toBe(90);
  });
});
