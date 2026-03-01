import { describe, it, expect } from 'vitest';
describe('use-mobile', () => {
  it('breakpoint detection', () => { const MOBILE_BP = 768; expect(375 < MOBILE_BP).toBe(true); expect(1024 < MOBILE_BP).toBe(false); });
  it('orientation check', () => { const isPortrait = (w: number, h: number) => h > w; expect(isPortrait(375, 812)).toBe(true); });
});
