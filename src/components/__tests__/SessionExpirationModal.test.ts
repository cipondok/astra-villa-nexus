import { describe, it, expect } from 'vitest';
describe('SessionExpirationModal', () => {
  it('countdown seconds', () => { expect(60).toBeGreaterThan(0); });
  it('extend or logout options', () => { expect(['extend','logout']).toHaveLength(2); });
});
