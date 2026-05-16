import { describe, it, expect } from 'vitest';
import { ContentCensor } from '../contentCensor';

describe('ContentCensor', () => {
  describe('censorContent', () => {
    it('censors Indonesian phone numbers', () => {
      const result = ContentCensor.censorContent('Call me at 08123456789');
      expect(result).not.toContain('08123456789');
      expect(result).toContain('xxx');
    });

    it('censors +62 phone numbers', () => {
      const result = ContentCensor.censorContent('Contact +6281234567890');
      expect(result).not.toContain('+6281234567890');
    });

    it('censors email addresses', () => {
      const result = ContentCensor.censorContent('Email me at test@example.com');
      expect(result).not.toContain('test@example.com');
      expect(result).toContain('xxxx');
    });

    it('censors URLs', () => {
      const result = ContentCensor.censorContent('Visit https://example.com');
      expect(result).not.toContain('https://example.com');
    });

    it('censors WhatsApp links', () => {
      const result = ContentCensor.censorContent('Chat on wa.me/628123456');
      expect(result).not.toContain('wa.me/628123456');
    });

    it('preserves clean text', () => {
      const text = 'This is a clean property description with no contact info';
      expect(ContentCensor.censorContent(text)).toBe(text);
    });

    it('censors multiple items in one string', () => {
      const text = 'Call 08123456789 or email me@test.com';
      const result = ContentCensor.censorContent(text);
      expect(result).not.toContain('08123456789');
      expect(result).not.toContain('me@test.com');
    });
  });

  describe('containsProhibitedContent', () => {
    it('detects phone numbers', () => {
      expect(ContentCensor.containsProhibitedContent('Call 08123456789')).toBe(true);
    });

    it('detects emails', () => {
      expect(ContentCensor.containsProhibitedContent('user@test.com')).toBe(true);
    });

    it('returns false for clean text', () => {
      expect(ContentCensor.containsProhibitedContent('Nice house for sale')).toBe(false);
    });
  });
});
