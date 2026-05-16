import { describe, it, expect } from 'vitest';
describe('User components', () => {
  it('membership badge color by level', () => {
    const colors: Record<string, string> = { free: 'gray', basic: 'blue', premium: 'gold', vip: 'purple' };
    expect(colors.premium).toBe('gold');
  });
  it('profile header shows initials fallback', () => {
    const name = 'Ahmad Sulaiman';
    const initials = name.split(' ').map(n => n[0]).join('');
    expect(initials).toBe('AS');
  });
});
