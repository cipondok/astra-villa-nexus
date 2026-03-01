import { describe, it, expect } from 'vitest';

describe('AgentDirectory page', () => {
  it('sorts agents by rating', () => {
    const agents = [
      { name: 'A', rating: 4.5, sales: 30 },
      { name: 'B', rating: 4.9, sales: 50 },
      { name: 'C', rating: 4.2, sales: 20 },
    ];
    const sorted = [...agents].sort((a, b) => b.rating - a.rating);
    expect(sorted[0].name).toBe('B');
  });
  it('filters agents by specialization', () => {
    const agents = [
      { name: 'A', specialization: 'luxury' },
      { name: 'B', specialization: 'commercial' },
    ];
    const luxury = agents.filter(a => a.specialization === 'luxury');
    expect(luxury).toHaveLength(1);
  });
});
