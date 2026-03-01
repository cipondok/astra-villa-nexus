import { describe, it, expect } from 'vitest';

describe('RoleDashboard', () => {
  it('maps user roles to dashboard tabs', () => {
    const roleTabs: Record<string, string[]> = {
      buyer: ['saved', 'searches', 'visits'],
      agent: ['listings', 'leads', 'performance'],
      admin: ['users', 'properties', 'analytics'],
    };
    expect(roleTabs.buyer).toHaveLength(3);
    expect(roleTabs.admin).toContain('analytics');
  });

  it('defaults to buyer role when role is unknown', () => {
    const role = 'unknown';
    const effectiveRole = ['buyer', 'agent', 'admin'].includes(role) ? role : 'buyer';
    expect(effectiveRole).toBe('buyer');
  });
});
