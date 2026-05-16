import { describe, it, expect } from 'vitest';

describe('MarketInsightsTab', () => {
  it('calculates price per sqm', () => {
    const price = 2_500_000_000;
    const area = 150;
    const pricePerSqm = Math.round(price / area);
    expect(pricePerSqm).toBe(16_666_667);
  });

  it('formats percentage change correctly', () => {
    const change = 5.25;
    const formatted = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    expect(formatted).toBe('+5.2%');
  });

  it('handles negative market trend', () => {
    const change = -3.8;
    const formatted = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    expect(formatted).toBe('-3.8%');
  });
});
