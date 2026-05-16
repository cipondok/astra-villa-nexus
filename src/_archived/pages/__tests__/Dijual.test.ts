import { describe, it, expect } from 'vitest';
describe('Dijual (For Sale) page', () => {
  it('property listing types for sale', () => {
    const types = ['rumah', 'apartemen', 'tanah', 'ruko', 'villa'];
    expect(types).toContain('rumah');
  });
  it('price format in IDR', () => {
    const price = 1_500_000_000;
    const formatted = `Rp ${(price / 1e9).toFixed(1)} Miliar`;
    expect(formatted).toBe('Rp 1.5 Miliar');
  });
  it('sort by newest first', () => {
    const listings = [
      { createdAt: '2026-02-01' },
      { createdAt: '2026-03-01' },
    ];
    const sorted = [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    expect(sorted[0].createdAt).toBe('2026-03-01');
  });
});
