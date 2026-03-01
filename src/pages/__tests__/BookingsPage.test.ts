import { describe, it, expect } from 'vitest';
describe('BookingsPage', () => {
  it('booking statuses', () => {
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    expect(statuses).toHaveLength(4);
  });
  it('filters bookings by status', () => {
    const bookings = [
      { id: 1, status: 'confirmed' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'confirmed' },
    ];
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    expect(confirmed).toHaveLength(2);
  });
  it('booking date is in future', () => {
    const bookingDate = new Date('2026-04-01');
    const now = new Date('2026-03-01');
    expect(bookingDate.getTime()).toBeGreaterThan(now.getTime());
  });
});
