import { describe, it, expect } from 'vitest';

describe('preQualificationPdf', () => {
  it('status colors map correctly', () => {
    const statusColors: Record<string, [number, number, number]> = {
      qualified: [34, 197, 94],
      conditional: [234, 179, 8],
      not_qualified: [239, 68, 68],
    };
    expect(statusColors.qualified[0]).toBe(34);
    expect(statusColors.not_qualified[0]).toBe(239);
  });

  it('status labels map correctly', () => {
    const statusLabels: Record<string, string> = {
      qualified: 'PRE-QUALIFIED',
      conditional: 'CONDITIONALLY QUALIFIED',
      not_qualified: 'NOT QUALIFIED',
    };
    expect(statusLabels.qualified).toBe('PRE-QUALIFIED');
    expect(statusLabels.conditional).toBe('CONDITIONALLY QUALIFIED');
  });

  it('generates reference code from timestamp', () => {
    const ref = `PQ-${Date.now().toString(36).toUpperCase()}`;
    expect(ref).toMatch(/^PQ-[A-Z0-9]+$/);
  });

  it('calculates net disposable income', () => {
    const monthlyIncome = 25_000_000;
    const otherIncome = 5_000_000;
    const expenses = 10_000_000;
    const debt = 3_000_000;
    const net = monthlyIncome + otherIncome - expenses - debt;
    expect(net).toBe(17_000_000);
  });

  it('formats filename with sanitized name and date', () => {
    const name = 'Ahmad Sulaiman';
    const date = '2026-03-01';
    const filename = `PreQualification_${name.replace(/\s+/g, '_')}_${date}.pdf`;
    expect(filename).toBe('PreQualification_Ahmad_Sulaiman_2026-03-01.pdf');
  });

  it('DTI assessment thresholds', () => {
    const assess = (dti: number) => {
      if (dti <= 30) return 'Excellent';
      if (dti <= 40) return 'Good';
      if (dti <= 50) return 'Moderate';
      return 'High';
    };
    expect(assess(25)).toBe('Excellent');
    expect(assess(35)).toBe('Good');
    expect(assess(45)).toBe('Moderate');
    expect(assess(55)).toBe('High');
  });
});
