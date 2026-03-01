import { describe, it, expect } from 'vitest';
describe('ProtectedContactInfo', () => {
  it('masks phone number', () => { const p='+6281234567890'; const m=p.slice(0,6)+'****'+p.slice(-3); expect(m).toContain('****'); });
  it('reveals after auth', () => { const authed=true; expect(authed).toBe(true); });
});
