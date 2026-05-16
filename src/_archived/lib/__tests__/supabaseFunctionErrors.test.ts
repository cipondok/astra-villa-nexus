import { describe, it, expect } from 'vitest';
import {
  getEdgeFunctionStatus,
  throwIfEdgeFunctionReturnedError,
  getEdgeFunctionUserMessage,
} from '../supabaseFunctionErrors';

describe('supabaseFunctionErrors', () => {
  describe('getEdgeFunctionStatus', () => {
    it('extracts status from context', () => {
      expect(getEdgeFunctionStatus({ context: { status: 429 } })).toBe(429);
    });

    it('extracts status from error directly', () => {
      expect(getEdgeFunctionStatus({ status: 500 })).toBe(500);
    });

    it('returns undefined for non-numeric', () => {
      expect(getEdgeFunctionStatus({ status: 'bad' })).toBeUndefined();
    });

    it('returns undefined for null', () => {
      expect(getEdgeFunctionStatus(null)).toBeUndefined();
    });
  });

  describe('throwIfEdgeFunctionReturnedError', () => {
    it('does not throw for success data', () => {
      expect(() => throwIfEdgeFunctionReturnedError({ success: true })).not.toThrow();
    });

    it('does not throw for null', () => {
      expect(() => throwIfEdgeFunctionReturnedError(null)).not.toThrow();
    });

    it('throws for status >= 400', () => {
      expect(() => throwIfEdgeFunctionReturnedError({ status: 402, error: 'Credits required' }))
        .toThrow('Credits required');
    });

    it('uses default message when error is empty', () => {
      expect(() => throwIfEdgeFunctionReturnedError({ status: 500, error: '' }))
        .toThrow('Edge function error');
    });

    it('does not throw for status < 400', () => {
      expect(() => throwIfEdgeFunctionReturnedError({ status: 200 })).not.toThrow();
    });
  });

  describe('getEdgeFunctionUserMessage', () => {
    it('returns credits message for 402', () => {
      const result = getEdgeFunctionUserMessage({ context: { status: 402 } });
      expect(result.title).toContain('credits');
    });

    it('returns rate limit message for 429', () => {
      const result = getEdgeFunctionUserMessage({ context: { status: 429 } });
      expect(result.title).toContain('Too many');
    });

    it('returns unavailable message for 503', () => {
      const result = getEdgeFunctionUserMessage({ context: { status: 503 } });
      expect(result.title).toContain('unavailable');
    });

    it('returns generic message for unknown errors', () => {
      const result = getEdgeFunctionUserMessage(new Error('Something broke'));
      expect(result.description).toBe('Something broke');
    });

    it('returns fallback for empty error', () => {
      const result = getEdgeFunctionUserMessage({});
      expect(result.description).toContain('Failed to contact AI');
    });
  });
});
