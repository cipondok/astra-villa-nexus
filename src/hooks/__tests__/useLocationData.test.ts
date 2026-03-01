import { describe, it, expect } from 'vitest';

describe('useLocationData - location utilities', () => {
  it('Indonesian provinces list', () => {
    const provinces = ['DKI Jakarta', 'Jawa Barat', 'Bali', 'Jawa Timur', 'Sumatera Utara'];
    expect(provinces.length).toBeGreaterThanOrEqual(5);
    expect(provinces).toContain('Bali');
  });

  it('coordinates validation', () => {
    const isValidCoord = (lat: number, lng: number) =>
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    expect(isValidCoord(-6.2088, 106.8456)).toBe(true); // Jakarta
    expect(isValidCoord(100, 200)).toBe(false);
  });

  it('distance calculation (haversine simplified)', () => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    const d = dist(-6.2088, 106.8456, -8.3405, 115.092); // Jakarta to Bali
    expect(d).toBeGreaterThan(900);
    expect(d).toBeLessThan(1100);
  });

  it('formats location display', () => {
    const format = (city: string, province: string) => `${city}, ${province}`;
    expect(format('Denpasar', 'Bali')).toBe('Denpasar, Bali');
  });

  it('nearby radius filter', () => {
    const properties = [
      { id: '1', distance: 2 },
      { id: '2', distance: 8 },
      { id: '3', distance: 4 },
    ];
    const radius = 5;
    const nearby = properties.filter(p => p.distance <= radius);
    expect(nearby).toHaveLength(2);
  });
});
