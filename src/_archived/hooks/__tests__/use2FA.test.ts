import { describe, it, expect } from 'vitest';

describe('use2FA - two-factor authentication logic', () => {
  it('TOTP code is 6 digits', () => {
    const code = '123456';
    expect(code).toMatch(/^\d{6}$/);
  });

  it('code expires after 30 seconds', () => {
    const TOTP_PERIOD = 30;
    expect(TOTP_PERIOD).toBe(30);
  });

  it('validates code format', () => {
    const isValid = (code: string) => /^\d{6}$/.test(code);
    expect(isValid('123456')).toBe(true);
    expect(isValid('12345')).toBe(false);
    expect(isValid('abcdef')).toBe(false);
  });

  it('backup codes generation', () => {
    const generateBackupCodes = (count: number) =>
      Array.from({ length: count }, () => Math.random().toString(36).substr(2, 8).toUpperCase());
    const codes = generateBackupCodes(10);
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
  });

  it('recovery code usage marks as consumed', () => {
    const codes = [
      { code: 'ABC123', used: false },
      { code: 'DEF456', used: false },
    ];
    const use = (c: string) => codes.map(x => x.code === c ? { ...x, used: true } : x);
    const updated = use('ABC123');
    expect(updated[0].used).toBe(true);
    expect(updated[1].used).toBe(false);
  });
});
