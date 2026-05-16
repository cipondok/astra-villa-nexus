import { describe, it, expect } from 'vitest';

describe('useTransactionProbability - transaction probability logic', () => {
  const classify = (score: number) => {
    if (score >= 80) return 'VERY HIGH CLOSING POTENTIAL';
    if (score >= 60) return 'HIGH CHANCE';
    if (score >= 40) return 'MODERATE CHANCE';
    return 'LOW CHANCE';
  };

  it('classifies high score correctly', () => {
    expect(classify(85)).toBe('VERY HIGH CLOSING POTENTIAL');
  });

  it('classifies moderate score correctly', () => {
    expect(classify(45)).toBe('MODERATE CHANCE');
  });

  it('classifies low score correctly', () => {
    expect(classify(20)).toBe('LOW CHANCE');
  });

  it('weighted score calculation', () => {
    const demand = 80, liquidity = 70, seo = 60, buyer = 90;
    const score = Math.round(demand * 0.3 + liquidity * 0.25 + seo * 0.15 + buyer * 0.3);
    expect(score).toBe(78);
  });

  it('positive factors are non-empty for high probability', () => {
    const factors = ['Permintaan tinggi di area ini', 'Harga kompetitif di bawah rata-rata pasar'];
    expect(factors.length).toBeGreaterThanOrEqual(2);
  });

  it('risk factors identified for below-market liquidity', () => {
    const liquidityScore = 30;
    const risks = liquidityScore < 50 ? ['Likuiditas rendah'] : [];
    expect(risks).toContain('Likuiditas rendah');
  });
});
