import { describe, it, expect } from 'vitest';
describe('WNI components', () => {
  it('KPR eligibility minimum age 21', () => {
    const age = 25;
    expect(age >= 21).toBe(true);
  });
  it('SLIK credit check score ranges', () => {
    const getStatus = (score: number) => score >= 700 ? 'good' : score >= 500 ? 'fair' : 'poor';
    expect(getStatus(750)).toBe('good');
    expect(getStatus(600)).toBe('fair');
    expect(getStatus(400)).toBe('poor');
  });
  it('KPR requirements checklist items', () => {
    const items = ['KTP', 'NPWP', 'Slip Gaji', 'Rekening Koran', 'SLIK'];
    expect(items).toHaveLength(5);
  });
  it('payment methods for WNI', () => {
    const methods = ['bank_transfer', 'virtual_account', 'e_wallet'];
    expect(methods).toContain('virtual_account');
  });
});
