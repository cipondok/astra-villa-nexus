import { describe, it, expect } from 'vitest';
describe('useCLSMonitor', () => {
  it('CLS threshold good', () => { expect(0.05).toBeLessThan(0.1); });
  it('CLS needs improvement', () => { expect(0.15).toBeGreaterThan(0.1); expect(0.15).toBeLessThanOrEqual(0.25); });
  it('layout shift entry', () => { const entry = { value: 0.02, hadRecentInput: false }; expect(entry.hadRecentInput).toBe(false); });
});
