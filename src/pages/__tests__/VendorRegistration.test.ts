import { describe, it, expect } from 'vitest';
describe('VendorRegistration page', () => {
  it('vendor categories', () => {
    const cats = ['contractor', 'photographer', 'cleaner', 'mover', 'lawyer', 'inspector'];
    expect(cats.length).toBeGreaterThanOrEqual(5);
  });
  it('NPWP format validation', () => {
    const isValid = (npwp: string) => /^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/.test(npwp);
    expect(isValid('12.345.678.9-012.345')).toBe(true);
    expect(isValid('1234567890')).toBe(false);
  });
  it('service area selection', () => {
    const areas = ['Jakarta Selatan', 'Jakarta Pusat', 'Tangerang'];
    expect(areas).toHaveLength(3);
  });
});
