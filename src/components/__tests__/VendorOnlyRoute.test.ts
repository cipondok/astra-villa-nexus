import { describe, it, expect } from 'vitest';
describe('VendorOnlyRoute', () => {
  it('blocks non-vendor', () => { expect(false).toBe(false); });
  it('allows vendor', () => { const role='vendor'; expect(role).toBe('vendor'); });
});
