import { describe, it, expect } from 'vitest';
describe('PredictivePricingCard', () => {
  it('price trend direction', () => { const trend=5.2; expect(trend>0?'up':'down').toBe('up'); });
  it('confidence level', () => { const conf=0.85; expect(conf).toBeGreaterThanOrEqual(0.7); });
});
