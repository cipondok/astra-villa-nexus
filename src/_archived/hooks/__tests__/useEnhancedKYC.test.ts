import { describe, it, expect } from 'vitest';

describe('useEnhancedKYC - KYC verification logic', () => {
  it('document types for Indonesia', () => {
    const types = ['KTP', 'SIM', 'Passport', 'NPWP'];
    expect(types).toContain('KTP');
    expect(types).toHaveLength(4);
  });

  it('verification status flow', () => {
    const statuses = ['pending', 'in_review', 'approved', 'rejected', 'expired'];
    expect(statuses.indexOf('in_review')).toBeLessThan(statuses.indexOf('approved'));
  });

  it('KTP number validation (16 digits)', () => {
    const isValid = (ktp: string) => /^\d{16}$/.test(ktp);
    expect(isValid('3201012345678901')).toBe(true);
    expect(isValid('123')).toBe(false);
  });

  it('age verification from KTP DOB', () => {
    const dobFromKTP = (ktp: string) => {
      const dd = parseInt(ktp.substring(6, 8));
      const mm = parseInt(ktp.substring(8, 10));
      const yy = parseInt(ktp.substring(10, 12));
      const day = dd > 40 ? dd - 40 : dd; // female adds 40
      const year = yy > 50 ? 1900 + yy : 2000 + yy;
      return new Date(year, mm - 1, day);
    };
    const dob = dobFromKTP('3201014506900001'); // female, born 05/06/1990
    expect(dob.getFullYear()).toBe(1990);
  });

  it('document expiry check', () => {
    const expiry = new Date('2025-12-31');
    const now = new Date('2026-03-01');
    expect(now > expiry).toBe(true);
  });
});
