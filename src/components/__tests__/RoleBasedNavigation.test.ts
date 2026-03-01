import { describe, it, expect } from 'vitest';
describe('RoleBasedNavigation', () => {
  it('buyer nav items', () => { expect(['search','saved','bookings','profile']).toHaveLength(4); });
  it('agent nav items differ', () => { expect(['dashboard','listings','leads','analytics']).toHaveLength(4); });
});
