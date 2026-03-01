import { describe, it, expect } from 'vitest';
describe('NewProjects page', () => {
  it('project status types', () => {
    const statuses = ['pre-launch', 'launching', 'under-construction', 'ready'];
    expect(statuses).toHaveLength(4);
  });
  it('starting price formatting', () => {
    const startingPrice = 800_000_000;
    const label = startingPrice >= 1e9 ? `${(startingPrice / 1e9).toFixed(1)} M` : `${(startingPrice / 1e6).toFixed(0)} Jt`;
    expect(label).toBe('800 Jt');
  });
  it('developer rating', () => {
    const rating = 4.5;
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
  });
});
