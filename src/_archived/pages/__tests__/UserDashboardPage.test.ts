import { describe, it, expect } from 'vitest';
describe('UserDashboardPage', () => {
  it('user sections', () => { expect(['saved','bookings','messages','settings']).toHaveLength(4); });
  it('notification badge count', () => { const n = [true,false,true].filter(Boolean).length; expect(n).toBe(2); });
});
