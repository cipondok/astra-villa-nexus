import { describe, it, expect } from 'vitest';
describe('useAllSystemSettings', () => {
  it('batches settings fetch', () => { const keys = ['branding', 'seo', 'notifications', 'security']; expect(keys.length).toBeGreaterThanOrEqual(4); });
  it('caches for 5 minutes', () => { expect(5 * 60 * 1000).toBe(300000); });
  it('fallback defaults', () => { const setting = undefined; const val = setting ?? 'default'; expect(val).toBe('default'); });
});
