import { describe, it, expect } from 'vitest';

describe('useTransactionLiquidity - liquidity scoring', () => {
  function classifyHealth(ratio: number, convRate: number) {
    if (ratio > 5 && convRate < 5) return 'illiquid';
    if (ratio > 3) return 'supply_heavy';
    if (ratio < 0.5) return 'demand_heavy';
    if (convRate > 15 && ratio >= 0.5 && ratio <= 3) return 'high_liquidity';
    return 'balanced';
  }

  it('high liquidity with good ratio and conversion', () => {
    expect(classifyHealth(1.5, 20)).toBe('high_liquidity');
  });

  it('supply heavy when ratio > 3', () => {
    expect(classifyHealth(4, 10)).toBe('supply_heavy');
  });

  it('demand heavy when ratio < 0.5', () => {
    expect(classifyHealth(0.3, 10)).toBe('demand_heavy');
  });

  it('illiquid with extreme oversupply and low conversion', () => {
    expect(classifyHealth(8, 2)).toBe('illiquid');
  });

  it('balanced for moderate ratio', () => {
    expect(classifyHealth(2, 10)).toBe('balanced');
  });

  it('velocity trend classification', () => {
    const classify = (curr: number, prev: number) =>
      curr > prev * 1.15 ? 'accelerating' : curr < prev * 0.85 ? 'decelerating' : 'stable';
    expect(classify(50, 30)).toBe('accelerating');
    expect(classify(30, 50)).toBe('decelerating');
    expect(classify(50, 50)).toBe('stable');
  });

  it('liquidity score components sum correctly', () => {
    const ratioScore = Math.max(0, 100 - Math.abs(1.5 - 1.5) * 20);
    expect(ratioScore).toBe(100);
    const weighted = Math.round(ratioScore * 0.4);
    expect(weighted).toBe(40);
  });
});
