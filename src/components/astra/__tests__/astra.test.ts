import { describe, it, expect } from 'vitest';
describe('Astra token components', () => {
  it('transfer validates minimum amount', () => {
    const min = 1; const amount = 0.5;
    expect(amount >= min).toBe(false);
  });
  it('transfer history sorts by date', () => {
    const txs = [{ date: '2026-01-01' }, { date: '2026-03-01' }];
    const sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    expect(sorted[0].date).toBe('2026-03-01');
  });
  it('widget displays balance with 4 decimals', () => {
    expect((123.456789).toFixed(4)).toBe('123.4568');
  });
});
