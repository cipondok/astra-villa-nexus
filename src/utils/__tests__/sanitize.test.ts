import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeSync, preloadSanitizer } from '../sanitize';

describe('sanitizeSync', () => {
  it('strips HTML tags as fallback when DOMPurify not loaded', () => {
    const result = sanitizeSync('<b>bold</b> text <script>alert(1)</script>');
    expect(result).not.toContain('<b>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('bold');
    expect(result).toContain('text');
  });

  it('handles plain text without modification', () => {
    const result = sanitizeSync('Hello world');
    expect(result).toBe('Hello world');
  });

  it('strips nested tags', () => {
    const result = sanitizeSync('<div><p>content</p></div>');
    expect(result).not.toContain('<');
    expect(result).toContain('content');
  });

  it('handles empty string', () => {
    expect(sanitizeSync('')).toBe('');
  });
});

describe('preloadSanitizer', () => {
  it('returns a promise', () => {
    const result = preloadSanitizer();
    expect(result).toBeInstanceOf(Promise);
  });
});
