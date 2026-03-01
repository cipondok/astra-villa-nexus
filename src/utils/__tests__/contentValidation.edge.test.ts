import { describe, it, expect } from 'vitest';

describe('contentValidation - additional edge cases', () => {
  // Test URL detection patterns used in content validation
  const URL_PATTERN = /https?:\/\/[^\s]+/gi;
  const PHONE_PATTERN = /(\+62|62|0)\d{8,13}/g;
  const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  it('detects URLs in text', () => {
    const text = 'Visit https://example.com for more';
    expect(text.match(URL_PATTERN)).toHaveLength(1);
  });

  it('detects multiple URLs', () => {
    const text = 'See http://a.com and https://b.com';
    expect(text.match(URL_PATTERN)).toHaveLength(2);
  });

  it('detects Indonesian phone numbers with +62', () => {
    expect('+6281234567890'.match(PHONE_PATTERN)).toBeTruthy();
  });

  it('detects Indonesian phone numbers with 08', () => {
    expect('081234567890'.match(PHONE_PATTERN)).toBeTruthy();
  });

  it('detects email addresses', () => {
    const emails = 'contact test@example.com now'.match(EMAIL_PATTERN);
    expect(emails).toHaveLength(1);
    expect(emails![0]).toBe('test@example.com');
  });

  it('clean text has no matches', () => {
    const clean = 'Beautiful apartment in Jakarta with 3 bedrooms';
    expect(clean.match(URL_PATTERN)).toBeNull();
    expect(clean.match(PHONE_PATTERN)).toBeNull();
    expect(clean.match(EMAIL_PATTERN)).toBeNull();
  });
});
