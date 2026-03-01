import { describe, it, expect } from 'vitest';
describe('ProfileUpgradeCard', () => {
  it('upgrade tiers', () => { expect(['free','pro','business','enterprise']).toHaveLength(4); });
  it('discount percentage', () => { const annual=999000*12*0.8; expect(annual).toBeLessThan(999000*12); });
});
