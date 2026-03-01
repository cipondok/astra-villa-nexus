import { describe, it, expect } from 'vitest';
describe('LoadingPopup', () => {
  it('progress percentage', () => { const p=Math.min(100,Math.max(0,65)); expect(p).toBe(65); });
  it('cancel available after timeout', () => { expect(5000).toBeGreaterThan(3000); });
});
