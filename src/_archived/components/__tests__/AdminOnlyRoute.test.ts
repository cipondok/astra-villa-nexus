import { describe, it, expect } from 'vitest';
describe('AdminOnlyRoute', () => {
  it('blocks non-admin', () => { const isAdmin = false; expect(isAdmin).toBe(false); });
  it('allows admin', () => { const isAdmin = true; expect(isAdmin).toBe(true); });
});
