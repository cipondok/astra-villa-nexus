import { describe, it, expect, beforeEach } from 'vitest';
import { getAiDisabledUntil, isAiTemporarilyDisabled, markAiTemporarilyDisabled } from '../aiAvailability';

const STORAGE_KEY = 'ai_disabled_until';

describe('aiAvailability', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('getAiDisabledUntil', () => {
    it('returns 0 when nothing stored', () => {
      expect(getAiDisabledUntil()).toBe(0);
    });

    it('returns stored timestamp', () => {
      localStorage.setItem(STORAGE_KEY, '9999999999999');
      expect(getAiDisabledUntil()).toBe(9999999999999);
    });

    it('returns 0 for invalid value', () => {
      localStorage.setItem(STORAGE_KEY, 'not-a-number');
      expect(getAiDisabledUntil()).toBe(0);
    });
  });

  describe('isAiTemporarilyDisabled', () => {
    it('returns false when not disabled', () => {
      expect(isAiTemporarilyDisabled()).toBe(false);
    });

    it('returns true when disabled until future', () => {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 60000));
      expect(isAiTemporarilyDisabled()).toBe(true);
    });

    it('returns false when disabled time has passed', () => {
      localStorage.setItem(STORAGE_KEY, String(Date.now() - 1000));
      expect(isAiTemporarilyDisabled()).toBe(false);
    });
  });

  describe('markAiTemporarilyDisabled', () => {
    it('sets future timestamp in localStorage', () => {
      markAiTemporarilyDisabled(5000);
      const stored = Number(localStorage.getItem(STORAGE_KEY));
      expect(stored).toBeGreaterThan(Date.now());
      expect(stored).toBeLessThanOrEqual(Date.now() + 5000);
    });

    it('makes isAiTemporarilyDisabled return true', () => {
      markAiTemporarilyDisabled(10000);
      expect(isAiTemporarilyDisabled()).toBe(true);
    });
  });
});
