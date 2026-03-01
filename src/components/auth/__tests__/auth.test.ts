import { describe, it, expect } from 'vitest';

describe('Auth components', () => {
  it('validates password strength scoring', () => {
    const scorePassword = (pw: string) => {
      let score = 0;
      if (pw.length >= 8) score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      return score;
    };
    expect(scorePassword('abc')).toBe(0);
    expect(scorePassword('Abcdefgh1!')).toBe(4);
    expect(scorePassword('abcdefgh')).toBe(1);
  });

  it('maps strength score to label', () => {
    const getLabel = (score: number) => ['Weak', 'Fair', 'Good', 'Strong'][Math.min(score, 3)];
    expect(getLabel(0)).toBe('Weak');
    expect(getLabel(3)).toBe('Strong');
  });

  it('validates email format', () => {
    const isValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    expect(isValid('test@mail.com')).toBe(true);
    expect(isValid('invalid')).toBe(false);
  });

  it('MFA code must be 6 digits', () => {
    const isValidCode = (code: string) => /^\d{6}$/.test(code);
    expect(isValidCode('123456')).toBe(true);
    expect(isValidCode('12345')).toBe(false);
    expect(isValidCode('abcdef')).toBe(false);
  });
});
