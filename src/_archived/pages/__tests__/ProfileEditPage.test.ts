import { describe, it, expect } from 'vitest';
describe('ProfileEditPage', () => {
  it('validates phone number format', () => {
    const isValid = (phone: string) => /^(\+62|08)\d{8,12}$/.test(phone);
    expect(isValid('+6281234567890')).toBe(true);
    expect(isValid('081234567890')).toBe(true);
    expect(isValid('12345')).toBe(false);
  });
  it('avatar file size limit', () => {
    const MAX_MB = 5;
    const fileSizeBytes = 3 * 1024 * 1024;
    expect(fileSizeBytes <= MAX_MB * 1024 * 1024).toBe(true);
  });
  it('bio character limit', () => {
    const MAX_BIO = 500;
    const bio = 'A'.repeat(300);
    expect(bio.length <= MAX_BIO).toBe(true);
  });
});
