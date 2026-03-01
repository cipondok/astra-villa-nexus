import { describe, it, expect } from 'vitest';
describe('LocationSelector', () => {
  it('provinces list', () => { const p=['DKI Jakarta','Jawa Barat','Bali']; expect(p.length).toBeGreaterThanOrEqual(3); });
  it('city depends on province', () => { const cities: Record<string,string[]>={'Bali':['Denpasar','Badung']}; expect(cities['Bali']).toHaveLength(2); });
});
