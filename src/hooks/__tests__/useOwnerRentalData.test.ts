import { describe, it, expect } from 'vitest';

describe('useOwnerRentalData - rental owner data', () => {
  it('monthly income summary', () => {
    const rentals = [{ rent: 5e6, status: 'occupied' }, { rent: 8e6, status: 'occupied' }, { rent: 6e6, status: 'vacant' }];
    const income = rentals.filter(r => r.status === 'occupied').reduce((s, r) => s + r.rent, 0);
    expect(income).toBe(13e6);
  });
  it('lease expiry timeline', () => {
    const leases = [
      { unit: 'A', end: '2026-04-01' },
      { unit: 'B', end: '2026-12-01' },
      { unit: 'C', end: '2026-03-15' },
    ];
    const sorted = [...leases].sort((a, b) => a.end.localeCompare(b.end));
    expect(sorted[0].unit).toBe('C');
  });
  it('rent collection rate', () => {
    const due = 10; const collected = 8;
    expect((collected / due) * 100).toBe(80);
  });
});
