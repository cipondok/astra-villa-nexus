import { describe, it, expect } from 'vitest';
import { getCooldownMessage, formatLockedUntil } from '../useProfileEditCooldown';

describe('getCooldownMessage', () => {
  it('returns support message when 3+ changes', () => {
    expect(getCooldownMessage(3, 0)).toContain('contact customer support');
  });

  it('returns locked message when days remaining', () => {
    expect(getCooldownMessage(1, 5)).toContain('5 more days');
  });

  it('pluralizes day correctly for 1 day', () => {
    expect(getCooldownMessage(1, 1)).toContain('1 more day');
    expect(getCooldownMessage(1, 1)).not.toContain('days');
  });

  it('warns about 30-day cooldown after first change', () => {
    expect(getCooldownMessage(1, 0)).toContain('30 days');
  });

  it('warns about 60-day cooldown after second change', () => {
    expect(getCooldownMessage(2, 0)).toContain('60 days');
  });

  it('returns empty string for zero changes and zero days', () => {
    expect(getCooldownMessage(0, 0)).toBe('');
  });
});

describe('formatLockedUntil', () => {
  it('returns null for null input', () => {
    expect(formatLockedUntil(null)).toBeNull();
  });

  it('formats a valid date string', () => {
    const result = formatLockedUntil('2025-06-15T00:00:00Z');
    expect(result).toBeTruthy();
    expect(result).toContain('2025');
    expect(result).toContain('June');
    expect(result).toContain('15');
  });
});
