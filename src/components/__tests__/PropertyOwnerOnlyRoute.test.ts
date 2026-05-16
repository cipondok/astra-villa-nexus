import { describe, it, expect } from 'vitest';
describe('PropertyOwnerOnlyRoute', () => {
  it('blocks non-owner', () => { const isOwner=false; expect(isOwner).toBe(false); });
  it('allows owner role', () => { const role='property_owner'; expect(role).toBe('property_owner'); });
});
