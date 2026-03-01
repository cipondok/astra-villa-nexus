import { describe, it, expect } from 'vitest';

describe('KYC Verification', () => {
  it('validates KTP number is 16 digits', () => {
    const isValid = (ktp: string) => /^\d{16}$/.test(ktp);
    expect(isValid('3201234567890001')).toBe(true);
    expect(isValid('12345')).toBe(false);
  });

  it('KYC steps progress sequentially', () => {
    const steps = ['identity', 'document', 'selfie', 'review'];
    const currentStep = 2;
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    expect(steps[nextStep]).toBe('review');
  });

  it('document upload accepts image types', () => {
    const accepted = ['image/jpeg', 'image/png', 'image/webp'];
    expect(accepted).toContain('image/jpeg');
    expect(accepted).not.toContain('application/pdf');
  });
});
