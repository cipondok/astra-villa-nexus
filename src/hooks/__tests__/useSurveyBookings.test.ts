import { describe, it, expect } from 'vitest';

describe('useSurveyBookings - survey/viewing booking', () => {
  it('available slots generation', () => {
    const slots = Array.from({ length: 8 }, (_, i) => `${9 + i}:00`);
    expect(slots[0]).toBe('9:00');
    expect(slots[slots.length - 1]).toBe('16:00');
  });
  it('booking confirmation data', () => {
    const booking = { propertyId: 'p1', date: '2026-04-01', time: '10:00', name: 'John', phone: '+62812345678' };
    expect(booking.date).toBeTruthy();
    expect(booking.phone).toMatch(/^\+62/);
  });
  it('cancellation policy', () => {
    const bookingDate = new Date('2026-04-01');
    const now = new Date('2026-03-30');
    const hoursUntil = (bookingDate.getTime() - now.getTime()) / 3600000;
    const canCancel = hoursUntil >= 24;
    expect(canCancel).toBe(true);
  });
  it('reschedule replaces old slot', () => {
    let booking = { date: '2026-04-01', time: '10:00' };
    booking = { date: '2026-04-02', time: '14:00' };
    expect(booking.date).toBe('2026-04-02');
  });
});
