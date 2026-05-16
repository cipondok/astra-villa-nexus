import { describe, it, expect } from 'vitest';
import { ContentValidator } from '../contentValidation';

describe('ContentValidator.validateDescription', () => {
  it('passes clean text', () => {
    const text = 'This is a beautiful property located in Jakarta with great amenities and nearby facilities.';
    const result = ContentValidator.validateDescription(text);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects phone numbers', () => {
    const result = ContentValidator.validateDescription('Contact me at 081234567890 for details');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Phone');
  });

  it('detects email addresses', () => {
    const result = ContentValidator.validateDescription('Email me at test@example.com for info');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Email');
  });

  it('detects URLs', () => {
    const result = ContentValidator.validateDescription('Visit https://example.com for more');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('URL');
  });

  it('detects WhatsApp links', () => {
    const result = ContentValidator.validateDescription('Chat via wa.me/6281234567890');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes('whatsapp'))).toBe(true);
  });

  it('detects script injection', () => {
    const result = ContentValidator.validateDescription('Nice place <script>alert(1)</script>');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes('code') || e.toLowerCase().includes('html'))).toBe(true);
  });

  it('detects HTML tags', () => {
    const result = ContentValidator.validateDescription('Great <b>property</b> here');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('HTML');
  });

  it('returns Indonesian messages when language is id', () => {
    const result = ContentValidator.validateDescription('Email: test@example.com', 'id');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('tidak diperbolehkan');
  });

  it('detects multiple violations at once', () => {
    const result = ContentValidator.validateDescription('Call 081234567890 or email test@example.com');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
