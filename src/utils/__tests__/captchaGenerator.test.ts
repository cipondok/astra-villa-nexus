import { describe, it, expect } from 'vitest';
import { generateCaptchaCode, validateCaptcha } from '../captchaGenerator';

describe('generateCaptchaCode', () => {
  it('generates code of default length 6', () => {
    expect(generateCaptchaCode()).toHaveLength(6);
  });

  it('generates code of custom length', () => {
    expect(generateCaptchaCode(4)).toHaveLength(4);
    expect(generateCaptchaCode(8)).toHaveLength(8);
  });

  it('only contains allowed characters', () => {
    const allowed = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = generateCaptchaCode(100);
    for (const char of code) {
      expect(allowed).toContain(char);
    }
  });

  it('excludes ambiguous characters (0, 1, I, O)', () => {
    // Generate many codes to statistically verify
    const codes = Array.from({ length: 50 }, () => generateCaptchaCode(20)).join('');
    expect(codes).not.toContain('0');
    expect(codes).not.toContain('1');
    expect(codes).not.toContain('I');
    expect(codes).not.toContain('O');
  });
});

describe('validateCaptcha', () => {
  it('validates exact match', () => {
    expect(validateCaptcha('ABC123', 'ABC123')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(validateCaptcha('abc123', 'ABC123')).toBe(true);
    expect(validateCaptcha('AbC123', 'abc123')).toBe(true);
  });

  it('rejects wrong input', () => {
    expect(validateCaptcha('WRONG', 'ABC123')).toBe(false);
  });

  it('rejects partial match', () => {
    expect(validateCaptcha('ABC', 'ABC123')).toBe(false);
  });
});
