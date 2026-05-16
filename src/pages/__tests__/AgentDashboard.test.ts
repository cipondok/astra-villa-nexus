import { describe, it, expect } from 'vitest';

describe('AgentDashboard', () => {
  it('calculates agent response rate', () => {
    const responded = 45;
    const total = 50;
    const rate = Math.round((responded / total) * 100);
    expect(rate).toBe(90);
  });

  it('lists active and sold properties', () => {
    const properties = [
      { status: 'active' },
      { status: 'sold' },
      { status: 'active' },
    ];
    const active = properties.filter(p => p.status === 'active');
    expect(active).toHaveLength(2);
  });
});
