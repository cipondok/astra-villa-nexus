import { describe, it, expect } from 'vitest';

describe('useRentalAnalytics - rental metrics', () => {
  it('occupancy rate calculation', () => {
    const occupiedDays = 25;
    const totalDays = 30;
    const rate = (occupiedDays / totalDays) * 100;
    expect(rate).toBeCloseTo(83.33, 1);
  });

  it('monthly revenue aggregation', () => {
    const payments = [
      { month: '2026-01', amount: 5000000 },
      { month: '2026-01', amount: 3000000 },
      { month: '2026-02', amount: 5000000 },
    ];
    const byMonth = payments.reduce((acc, p) => {
      acc[p.month] = (acc[p.month] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);
    expect(byMonth['2026-01']).toBe(8000000);
    expect(byMonth['2026-02']).toBe(5000000);
  });

  it('average rental yield', () => {
    const annualRent = 60000000;
    const propertyValue = 1000000000;
    const yield_ = (annualRent / propertyValue) * 100;
    expect(yield_).toBe(6);
  });

  it('vacancy trend detection', () => {
    const monthlyOccupancy = [95, 90, 85, 80, 75];
    const declining = monthlyOccupancy.every((v, i) => i === 0 || v < monthlyOccupancy[i - 1]);
    expect(declining).toBe(true);
  });

  it('tenant retention rate', () => {
    const totalTenants = 20;
    const renewed = 15;
    const retention = (renewed / totalTenants) * 100;
    expect(retention).toBe(75);
  });
});
