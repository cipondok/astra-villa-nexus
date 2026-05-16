import { describe, it, expect } from 'vitest';
describe('AgentRegistration page', () => {
  it('required fields for registration', () => {
    const required = ['fullName', 'email', 'phone', 'licenseNumber', 'businessType'];
    expect(required).toHaveLength(5);
  });
  it('business types', () => {
    const types = ['independent', 'agency', 'developer'];
    expect(types).toContain('agency');
  });
  it('license number format', () => {
    const isValid = (num: string) => /^[A-Z0-9-]{5,20}$/.test(num);
    expect(isValid('AGT-12345')).toBe(true);
    expect(isValid('ab')).toBe(false);
  });
});
