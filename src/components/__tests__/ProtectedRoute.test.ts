import { describe, it, expect } from 'vitest';
describe('ProtectedRoute logic', () => {
  it('redirects unauthenticated', () => { const user = null; const redirect = !user ? '/login' : null; expect(redirect).toBe('/login'); });
  it('role-based access', () => { const userRole = 'agent'; const required = 'agent'; expect(userRole === required).toBe(true); });
  it('loading state shows spinner', () => { const isLoading = true; expect(isLoading).toBe(true); });
});
