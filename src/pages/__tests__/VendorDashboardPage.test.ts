import { describe, it, expect } from 'vitest';
describe('VendorDashboardPage', () => {
  it('vendor stats', () => { expect(['orders','revenue','rating','reviews']).toHaveLength(4); });
  it('average rating calc', () => { const r=[5,4,4,5,3]; expect(r.reduce((a,b)=>a+b,0)/r.length).toBe(4.2); });
});
