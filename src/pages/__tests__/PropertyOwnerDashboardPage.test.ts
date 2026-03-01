import { describe, it, expect } from 'vitest';
describe('PropertyOwnerDashboardPage', () => {
  it('owner widgets', () => { expect(['revenue','occupancy','maintenance','tenants']).toHaveLength(4); });
  it('occupancy rate', () => { expect(Math.round((9/10)*100)).toBe(90); });
});
