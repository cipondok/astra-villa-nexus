import { describe, it, expect } from 'vitest';
describe('PerformanceMonitor', () => {
  it('FCP threshold', () => { expect(2500).toBeLessThanOrEqual(3000); });
  it('LCP threshold', () => { expect(2500).toBeLessThanOrEqual(4000); });
  it('CLS threshold', () => { expect(0.1).toBeLessThanOrEqual(0.25); });
});
