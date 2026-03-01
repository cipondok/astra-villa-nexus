import { describe, it, expect } from 'vitest';
import {
  validatePhoneNumber,
  validateEmail,
  validateName,
  validateIndonesianPhone,
  formatIndonesianPhone,
} from '../phoneValidation';

describe('validatePhoneNumber', () => {
  it('returns invalid for empty string', () => {
    expect(validatePhoneNumber('').isValid).toBe(false);
  });

  it('validates Indonesian number with +62', () => {
    const result = validatePhoneNumber('+6281234567890');
    expect(result.isValid).toBe(true);
    expect(result.country?.code).toBe('ID');
  });

  it('validates Indonesian number with 08', () => {
    const result = validatePhoneNumber('081234567890');
    expect(result.isValid).toBe(true);
    expect(result.country?.code).toBe('ID');
  });

  it('rejects invalid phone number', () => {
    const result = validatePhoneNumber('12345');
    expect(result.isValid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('validates correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(validateEmail('notanemail')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(validateEmail('test@')).toBe(false);
  });
});

describe('validateName', () => {
  it('returns false for empty string', () => {
    expect(validateName('')).toBe(false);
  });

  it('returns false for single character', () => {
    expect(validateName('A')).toBe(false);
  });

  it('validates normal name', () => {
    expect(validateName('John Doe')).toBe(true);
  });
});

describe('validateIndonesianPhone', () => {
  it('validates correct Indonesian number', () => {
    const result = validateIndonesianPhone('081234567890');
    expect(result.isValid).toBe(true);
  });

  it('rejects non-Indonesian number', () => {
    const result = validateIndonesianPhone('+60123456789');
    expect(result.isValid).toBe(false);
  });
});

describe('formatIndonesianPhone', () => {
  it('formats 08 prefix to +62', () => {
    const formatted = formatIndonesianPhone('081234567890');
    expect(formatted).toContain('+62');
    expect(formatted).not.toContain('08');
  });

  it('returns cleaned number for non-08 prefix', () => {
    const formatted = formatIndonesianPhone('+6281234567890');
    expect(formatted).toContain('+62');
  });
});
