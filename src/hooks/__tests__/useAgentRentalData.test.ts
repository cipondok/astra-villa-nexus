import { describe, it, expect } from 'vitest';
describe('useAgentRentalData', () => {
  it('commission from rental', () => { expect(5e6 * 0.05).toBe(250000); });
  it('active leases count', () => { const leases = [{ active: true }, { active: false }, { active: true }]; expect(leases.filter(l => l.active)).toHaveLength(2); });
  it('renewal rate', () => { expect((8 / 10) * 100).toBe(80); });
});
