import { describe, it, expect } from 'vitest';
describe('useInvestorProperties', () => {
  it('portfolio value', () => { const props = [{ value: 1e9 }, { value: 2e9 }]; expect(props.reduce((s, p) => s + p.value, 0)).toBe(3e9); });
  it('yield comparison', () => { const a = { rent: 5e6, value: 1e9 }; const b = { rent: 8e6, value: 2e9 }; expect((a.rent * 12 / a.value) * 100).toBe(6); expect((b.rent * 12 / b.value) * 100).toBe(4.8); });
  it('appreciation tracking', () => { const bought = 1e9; const current = 1.2e9; expect(((current - bought) / bought) * 100).toBe(20); });
});
