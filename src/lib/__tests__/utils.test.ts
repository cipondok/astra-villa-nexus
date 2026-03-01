import { describe, it, expect } from 'vitest';
import { cn, formatCurrency } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active');
  });

  it('merges tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('formatCurrency', () => {
  it('formats billions', () => {
    expect(formatCurrency(1500000000)).toBe('IDR 1.5B');
  });

  it('formats millions', () => {
    expect(formatCurrency(2500000)).toBe('IDR 2.5M');
  });

  it('formats thousands', () => {
    expect(formatCurrency(5000)).toBe('IDR 5K');
  });

  it('formats small amounts', () => {
    const result = formatCurrency(500);
    expect(result).toContain('IDR');
    expect(result).toContain('500');
  });

  it('formats exact billion', () => {
    expect(formatCurrency(1000000000)).toBe('IDR 1.0B');
  });

  it('formats exact million', () => {
    expect(formatCurrency(1000000)).toBe('IDR 1.0M');
  });
});
