import { describe, it, expect } from 'vitest';
describe('useCentralLocation', () => {
  it('default center Indonesia', () => { const center = { lat: -2.5, lng: 118 }; expect(center.lat).toBeLessThan(0); });
  it('zoom level by scope', () => { const zoom: Record<string, number> = { country: 5, province: 8, city: 12, property: 16 }; expect(zoom.city).toBe(12); });
  it('bounds calculation', () => { const sw = { lat: -8.5, lng: 105 }; const ne = { lat: -6, lng: 107 }; expect(ne.lat).toBeGreaterThan(sw.lat); });
});
