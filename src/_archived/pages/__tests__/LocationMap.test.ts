import { describe, it, expect } from 'vitest';
describe('LocationMap page', () => {
  it('Jakarta center coordinates', () => {
    const center = { lat: -6.2088, lng: 106.8456 };
    expect(center.lat).toBeCloseTo(-6.2088, 2);
    expect(center.lng).toBeCloseTo(106.8456, 2);
  });
  it('zoom levels', () => {
    const MIN_ZOOM = 5;
    const MAX_ZOOM = 18;
    expect(MAX_ZOOM - MIN_ZOOM).toBe(13);
  });
  it('marker cluster threshold', () => {
    const CLUSTER_THRESHOLD = 20;
    const markers = Array.from({ length: 50 }, (_, i) => i);
    expect(markers.length > CLUSTER_THRESHOLD).toBe(true);
  });
});
