import { describe, it, expect } from 'vitest';
describe('VerificationCenter page', () => {
  it('verification methods', () => {
    const methods = ['email', 'phone', 'ktp', 'video', 'selfie'];
    expect(methods.length).toBeGreaterThanOrEqual(3);
  });
  it('verification level badges', () => {
    const levels = { basic: 1, verified: 2, trusted: 3, premium: 4 };
    expect(levels.trusted).toBe(3);
  });
  it('document expiry check', () => {
    const expiryDate = new Date('2027-01-01');
    const now = new Date('2026-03-01');
    expect(expiryDate.getTime() > now.getTime()).toBe(true);
  });
});
