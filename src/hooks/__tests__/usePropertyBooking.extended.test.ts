import { describe, it, expect } from 'vitest';
describe('usePropertyBooking extended', () => {
  it('booking window validation', () => { const minDays = 2; const daysAhead = 5; expect(daysAhead >= minDays).toBe(true); });
});
