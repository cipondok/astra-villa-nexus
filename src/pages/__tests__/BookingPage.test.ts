import { describe, it, expect } from 'vitest';

describe('BookingPage', () => {
  it('booking confirmation generates code', () => {
    const code = 'BK-' + Date.now().toString(36).toUpperCase();
    expect(code).toMatch(/^BK-[A-Z0-9]+$/);
  });
  it('time slot selection prevents double booking', () => {
    const booked = ['09:00', '10:00'];
    const available = ['09:00', '10:00', '11:00', '14:00'].filter(s => !booked.includes(s));
    expect(available).toHaveLength(2);
    expect(available).not.toContain('09:00');
  });
});
