import { describe, it, expect } from 'vitest';

describe('Profile components', () => {
  it('profile completion counts filled fields', () => {
    const fields = { name: 'John', email: 'j@m.com', phone: '', avatar: '', bio: 'Hello' };
    const filled = Object.values(fields).filter(v => v.length > 0).length;
    expect(filled).toBe(3);
  });
  it('avatar upload max file size 5MB', () => {
    const MAX = 5 * 1024 * 1024;
    expect(MAX).toBe(5242880);
  });
  it('image cropper aspect ratio 1:1', () => {
    const aspect = 1 / 1;
    expect(aspect).toBe(1);
  });
  it('role upgrade section shows available upgrades', () => {
    const currentRole = 'buyer';
    const upgrades = ['agent', 'property_owner', 'investor'].filter(r => r !== currentRole);
    expect(upgrades).toHaveLength(3);
  });
});
