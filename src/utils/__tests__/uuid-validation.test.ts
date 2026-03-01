import { describe, it, expect } from 'vitest';
import { isValidUUID, requireValidUUID, safeUUID, areValidUUIDs } from '../uuid-validation';

describe('uuid-validation', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  const validUUIDUppercase = '550E8400-E29B-41D4-A716-446655440000';

  describe('isValidUUID', () => {
    it('returns true for valid UUID', () => {
      expect(isValidUUID(validUUID)).toBe(true);
    });

    it('returns true for uppercase UUID', () => {
      expect(isValidUUID(validUUIDUppercase)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidUUID(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidUUID(undefined)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidUUID('')).toBe(false);
    });

    it('returns false for random string', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
    });

    it('returns false for UUID missing segment', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    });
  });

  describe('requireValidUUID', () => {
    it('returns UUID when valid', () => {
      expect(requireValidUUID(validUUID)).toBe(validUUID);
    });

    it('throws for invalid UUID', () => {
      expect(() => requireValidUUID('bad')).toThrow('Invalid UUID format');
    });

    it('includes context in error message', () => {
      expect(() => requireValidUUID('bad', 'user_id')).toThrow('(user_id)');
    });

    it('throws for null', () => {
      expect(() => requireValidUUID(null)).toThrow();
    });
  });

  describe('safeUUID', () => {
    it('returns UUID when valid', () => {
      expect(safeUUID(validUUID)).toBe(validUUID);
    });

    it('returns null for invalid', () => {
      expect(safeUUID('bad')).toBeNull();
    });

    it('returns null for null input', () => {
      expect(safeUUID(null)).toBeNull();
    });
  });

  describe('areValidUUIDs', () => {
    it('returns true when all valid', () => {
      expect(areValidUUIDs([validUUID, validUUIDUppercase])).toBe(true);
    });

    it('returns false when any invalid', () => {
      expect(areValidUUIDs([validUUID, 'bad'])).toBe(false);
    });

    it('returns true for empty array', () => {
      expect(areValidUUIDs([])).toBe(true);
    });
  });
});
