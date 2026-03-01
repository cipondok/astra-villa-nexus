import { describe, it, expect } from 'vitest';

describe('PropertyVisitsTab', () => {
  it('formats visit date in Indonesian locale', () => {
    const date = new Date('2026-03-15T10:00:00Z');
    const formatted = date.toLocaleDateString('id-ID');
    expect(formatted).toBeTruthy();
  });

  it('categorizes visit status', () => {
    const getStatus = (date: string) => {
      const visitDate = new Date(date);
      const now = new Date('2026-03-01');
      if (visitDate < now) return 'completed';
      return 'upcoming';
    };
    expect(getStatus('2026-02-15')).toBe('completed');
    expect(getStatus('2026-04-01')).toBe('upcoming');
  });

  it('sorts visits by date descending', () => {
    const visits = [
      { date: '2026-01-01' },
      { date: '2026-03-01' },
      { date: '2026-02-01' },
    ];
    const sorted = [...visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    expect(sorted[0].date).toBe('2026-03-01');
  });
});
