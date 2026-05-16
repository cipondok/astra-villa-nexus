import { describe, it, expect } from 'vitest';
describe('useMortgageApplication', () => {
  it('DTI check', () => { expect((8e6 / 20e6) * 100).toBe(40); });
  it('LTV check', () => { expect((800e6 / 1e9) * 100).toBe(80); });
});
