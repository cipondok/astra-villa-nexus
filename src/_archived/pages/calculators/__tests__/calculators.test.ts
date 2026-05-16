import { describe, it, expect } from 'vitest';
describe('Calculator pages', () => {
  it('area unit converter sqm to sqft', () => {
    const sqm = 100;
    const sqft = sqm * 10.7639;
    expect(sqft).toBeCloseTo(1076.39, 0);
  });
  it('construction cost per sqm', () => {
    const costPerSqm = 5_000_000;
    const area = 200;
    expect(costPerSqm * area).toBe(1_000_000_000);
  });
  it('home loan EMI calculation', () => {
    const P = 1e9; const r = 8.5 / 100 / 12; const n = 240;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    expect(emi).toBeGreaterThan(8e6);
  });
});
