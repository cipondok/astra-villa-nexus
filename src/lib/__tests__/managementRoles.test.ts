import { describe, it, expect } from 'vitest';
import { canManageProperties, isManagementPath, MANAGEMENT_ROLES } from '@/lib/managementRoles';

describe('managementRoles', () => {
  it('allows every management role', () => {
    MANAGEMENT_ROLES.forEach((role) => {
      expect(canManageProperties([role])).toBe(true);
    });
  });

  it('blocks non-management roles', () => {
    expect(canManageProperties(['general_user'])).toBe(false);
    expect(canManageProperties(['investor', 'vendor'])).toBe(false);
    expect(canManageProperties([])).toBe(false);
    expect(canManageProperties()).toBe(false);
  });

  it('allows a mixed role set containing a management role', () => {
    expect(canManageProperties(['general_user', 'agent'])).toBe(true);
  });

  it('matches the management path and its sub-routes', () => {
    expect(isManagementPath('/my-properties')).toBe(true);
    expect(isManagementPath('/my-properties/123')).toBe(true);
    expect(isManagementPath('/my-properties/123/edit')).toBe(true);
  });

  it('does not match unrelated or look-alike paths', () => {
    expect(isManagementPath('/my-properties-archive')).toBe(false);
    expect(isManagementPath('/properties')).toBe(false);
    expect(isManagementPath('/dashboard')).toBe(false);
  });
});
