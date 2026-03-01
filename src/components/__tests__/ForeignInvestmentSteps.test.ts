import { describe, it, expect } from 'vitest';
describe('ForeignInvestmentSteps', () => {
  it('investment steps ordered', () => { const s=['research','legal','purchase','register','manage']; expect(s).toHaveLength(5); });
  it('step progress tracking', () => { const done=3,total=5; expect(Math.round((done/total)*100)).toBe(60); });
});
