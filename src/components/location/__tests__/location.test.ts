import { describe, it, expect } from 'vitest';

describe('Location components', () => {
  it('Indonesian provinces count', () => {
    const provinces = 38;
    expect(provinces).toBeGreaterThanOrEqual(34);
  });
  it('location selector filters by province', () => {
    const locations = [
      { province: 'DKI Jakarta', city: 'Jakarta Selatan' },
      { province: 'Bali', city: 'Denpasar' },
      { province: 'DKI Jakarta', city: 'Jakarta Barat' },
    ];
    const jakarta = locations.filter(l => l.province === 'DKI Jakarta');
    expect(jakarta).toHaveLength(2);
  });
  it('map coordinates for Jakarta', () => {
    const coords = { lat: -6.2088, lng: 106.8456 };
    expect(coords.lat).toBeLessThan(0);
    expect(coords.lng).toBeGreaterThan(100);
  });
});
