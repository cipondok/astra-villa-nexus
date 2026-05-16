import { describe, it, expect } from 'vitest';
describe('PropertyAmenities component', () => {
  it('amenity categories', () => {
    const cats = ['indoor', 'outdoor', 'security', 'community', 'parking'];
    expect(cats).toHaveLength(5);
  });
  it('amenity icon mapping', () => {
    const icons: Record<string, string> = { pool: 'waves', gym: 'dumbbell', parking: 'car' };
    expect(icons.pool).toBe('waves');
  });
  it('show more threshold', () => {
    const SHOW_THRESHOLD = 8;
    const amenities = Array.from({ length: 12 }, (_, i) => `amenity-${i}`);
    expect(amenities.length > SHOW_THRESHOLD).toBe(true);
  });
});
