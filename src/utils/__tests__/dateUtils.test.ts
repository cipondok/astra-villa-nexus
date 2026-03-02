import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDistanceToNow, formatMemberDuration } from '../dateUtils';

describe('formatDistanceToNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than a minute ago', () => {
    const date = new Date('2025-06-15T11:59:30Z');
    expect(formatDistanceToNow(date)).toBe('just now');
  });

  it('returns minutes for < 60 min', () => {
    const date = new Date('2025-06-15T11:45:00Z');
    expect(formatDistanceToNow(date)).toBe('15 minutes ago');
  });

  it('returns singular minute', () => {
    const date = new Date('2025-06-15T11:59:00Z');
    expect(formatDistanceToNow(date)).toBe('1 minute ago');
  });

  it('returns hours for < 24 hours', () => {
    const date = new Date('2025-06-15T09:00:00Z');
    expect(formatDistanceToNow(date)).toBe('3 hours ago');
  });

  it('returns singular hour', () => {
    const date = new Date('2025-06-15T11:00:00Z');
    expect(formatDistanceToNow(date)).toBe('1 hour ago');
  });

  it('returns days for < 7 days', () => {
    const date = new Date('2025-06-12T12:00:00Z');
    expect(formatDistanceToNow(date)).toBe('3 days ago');
  });

  it('returns weeks for < 4 weeks', () => {
    const date = new Date('2025-06-01T12:00:00Z');
    expect(formatDistanceToNow(date)).toBe('2 weeks ago');
  });

  it('returns months for < 12 months', () => {
    const date = new Date('2025-03-15T12:00:00Z');
    expect(formatDistanceToNow(date)).toBe('3 months ago');
  });

  it('returns years for >= 12 months', () => {
    const date = new Date('2023-06-15T12:00:00Z');
    expect(formatDistanceToNow(date)).toBe('2 years ago');
  });
});

describe('formatMemberDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "< 1 Year" for less than a year', () => {
    expect(formatMemberDuration('2025-01-01T00:00:00Z')).toBe('< 1 Year');
  });

  it('returns "1 Year" for exactly 1 year', () => {
    expect(formatMemberDuration('2024-06-01T00:00:00Z')).toBe('1 Year');
  });

  it('returns "2 Years" for 2+ years', () => {
    expect(formatMemberDuration('2023-01-01T00:00:00Z')).toBe('2 Years');
  });

  it('returns "5 Years" for 5+ years', () => {
    expect(formatMemberDuration('2020-01-01T00:00:00Z')).toBe('5 Years');
  });

  it('returns "< 1 Year" for very recent join', () => {
    expect(formatMemberDuration('2025-06-14T00:00:00Z')).toBe('< 1 Year');
  });
});
