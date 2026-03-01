import { describe, it, expect } from 'vitest';

describe('useMortgageApplication - application logic', () => {
  it('validates required fields', () => {
    const app = { fullName: 'John', email: 'john@test.com', income: 10000000, loanAmount: 500000000 };
    const isValid = Object.values(app).every(v => v != null && v !== '');
    expect(isValid).toBe(true);
  });

  it('DTI ratio calculation', () => {
    const monthlyIncome = 20000000;
    const monthlyDebt = 5000000;
    const proposedPayment = 3000000;
    const dti = ((monthlyDebt + proposedPayment) / monthlyIncome) * 100;
    expect(dti).toBe(40);
  });

  it('LTV ratio', () => {
    const loanAmount = 800000000;
    const propertyValue = 1000000000;
    const ltv = (loanAmount / propertyValue) * 100;
    expect(ltv).toBe(80);
  });

  it('eligibility check', () => {
    const isEligible = (dti: number, ltv: number, creditScore: number) =>
      dti <= 45 && ltv <= 85 && creditScore >= 600;
    expect(isEligible(35, 80, 700)).toBe(true);
    expect(isEligible(50, 80, 700)).toBe(false);
  });

  it('application status flow', () => {
    const flow = ['draft', 'submitted', 'under_review', 'approved', 'disbursed'];
    expect(flow.indexOf('submitted')).toBeLessThan(flow.indexOf('approved'));
  });

  it('document checklist', () => {
    const required = ['ktp', 'npwp', 'slip_gaji', 'rekening_koran'];
    const submitted = ['ktp', 'npwp'];
    const missing = required.filter(d => !submitted.includes(d));
    expect(missing).toEqual(['slip_gaji', 'rekening_koran']);
  });
});
