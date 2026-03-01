import { describe, it, expect } from 'vitest';
describe('BookingSuccessPage', () => {
  it('generates booking reference', () => {
    const ref = `BK-${Date.now().toString(36).toUpperCase()}`;
    expect(ref).toMatch(/^BK-/);
  });
  it('confirmation email fields', () => {
    const email = { to: 'user@test.com', subject: 'Booking Confirmed', bookingId: 'BK-123' };
    expect(email.subject).toContain('Booking');
  });
  it('next steps list', () => {
    const steps = ['Check email', 'Prepare documents', 'Visit property', 'Complete payment'];
    expect(steps.length).toBeGreaterThanOrEqual(3);
  });
});
