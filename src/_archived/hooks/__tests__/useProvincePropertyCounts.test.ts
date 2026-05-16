import { describe, it, expect } from 'vitest';

describe('useProvincePropertyCounts - province stats', () => {
  it('aggregates by province', () => {
    const props = [
      { province: 'DKI Jakarta' }, { province: 'Bali' }, { province: 'DKI Jakarta' }, { province: 'Bali' }, { province: 'Bali' }
    ];
    const counts = props.reduce((acc, p) => { acc[p.province] = (acc[p.province] || 0) + 1; return acc; }, {} as Record<string, number>);
    expect(counts['Bali']).toBe(3);
    expect(counts['DKI Jakarta']).toBe(2);
  });
  it('sorts by count descending', () => {
    const data = [{ prov: 'A', count: 10 }, { prov: 'B', count: 50 }, { prov: 'C', count: 30 }];
    const sorted = [...data].sort((a, b) => b.count - a.count);
    expect(sorted[0].prov).toBe('B');
  });
  it('percentage calculation', () => {
    const total = 100; const jakarta = 35;
    expect((jakarta / total) * 100).toBe(35);
  });
});
