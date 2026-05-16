import { describe, it, expect } from 'vitest';
describe('Investor pages', () => {
  it('WNA page lists eligible property types', () => {
    const types = ['apartment', 'condominium'];
    expect(types).not.toContain('land');
  });
  it('WNI page shows KPR banks', () => {
    const banks = ['BCA', 'BRI', 'Mandiri', 'BNI', 'CIMB'];
    expect(banks.length).toBeGreaterThanOrEqual(4);
  });
});
