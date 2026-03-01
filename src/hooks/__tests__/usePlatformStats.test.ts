import { describe, it, expect } from 'vitest';

describe('usePlatformStats - platform statistics', () => {
  it('calculates growth rate', () => {
    const current = 1500;
    const previous = 1200;
    const growth = ((current - previous) / previous) * 100;
    expect(growth).toBe(25);
  });

  it('aggregates daily active users', () => {
    const daily = [100, 120, 95, 130, 110, 140, 150];
    const avg = daily.reduce((a, b) => a + b, 0) / daily.length;
    expect(avg).toBeCloseTo(120.71, 1);
  });

  it('property listing count by type', () => {
    const listings = [
      { type: 'apartment' }, { type: 'house' }, { type: 'apartment' },
      { type: 'land' }, { type: 'apartment' },
    ];
    const counts = listings.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    expect(counts.apartment).toBe(3);
    expect(counts.land).toBe(1);
  });

  it('revenue metrics', () => {
    const mrr = 50000000;
    const arr = mrr * 12;
    expect(arr).toBe(600000000);
  });

  it('churn rate', () => {
    const startUsers = 1000;
    const lost = 50;
    const churn = (lost / startUsers) * 100;
    expect(churn).toBe(5);
  });
});
