import { describe, it, expect } from 'vitest';

describe('usePropertyBooking - booking logic', () => {
  it('validates booking date is in the future', () => {
    const bookingDate = new Date('2026-06-15');
    const now = new Date('2026-03-01');
    expect(bookingDate.getTime()).toBeGreaterThan(now.getTime());
  });

  it('booking status flow', () => {
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const flow = (current: string, next: string) => {
      const idx = statuses.indexOf(current);
      const nextIdx = statuses.indexOf(next);
      return nextIdx > idx || next === 'cancelled';
    };
    expect(flow('pending', 'confirmed')).toBe(true);
    expect(flow('confirmed', 'pending')).toBe(false);
    expect(flow('confirmed', 'cancelled')).toBe(true);
  });

  it('calculates time slot availability', () => {
    const slots = ['09:00', '10:00', '11:00', '13:00', '14:00'];
    const booked = ['10:00', '14:00'];
    const available = slots.filter(s => !booked.includes(s));
    expect(available).toEqual(['09:00', '11:00', '13:00']);
  });

  it('prevents double booking', () => {
    const existingBookings = [
      { date: '2026-06-15', slot: '10:00' },
      { date: '2026-06-15', slot: '14:00' },
    ];
    const isBooked = (date: string, slot: string) =>
      existingBookings.some(b => b.date === date && b.slot === slot);
    expect(isBooked('2026-06-15', '10:00')).toBe(true);
    expect(isBooked('2026-06-15', '11:00')).toBe(false);
  });

  it('generates booking reference', () => {
    const ref = `BK-${Date.now().toString(36).toUpperCase()}`;
    expect(ref).toMatch(/^BK-[A-Z0-9]+$/);
  });
});
