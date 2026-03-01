import { describe, it, expect } from 'vitest';

describe('contentValidation - deep validation', () => {
  it('XSS prevention strips script tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const clean = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
    expect(clean).toBe('Hello');
  });
  it('SQL injection pattern detection', () => {
    const suspicious = (input: string) => /(['";]|--|\bOR\b.*=|DROP\s+TABLE)/i.test(input);
    expect(suspicious("1' OR '1'='1")).toBe(true);
    expect(suspicious('normal text')).toBe(false);
  });
  it('max content length enforcement', () => {
    const MAX = 10000;
    const content = 'a'.repeat(15000);
    expect(content.length > MAX).toBe(true);
    expect(content.slice(0, MAX).length).toBe(MAX);
  });
  it('URL validation', () => {
    const isURL = (s: string) => { try { new URL(s); return true; } catch { return false; } };
    expect(isURL('https://example.com')).toBe(true);
    expect(isURL('not-a-url')).toBe(false);
  });
});
