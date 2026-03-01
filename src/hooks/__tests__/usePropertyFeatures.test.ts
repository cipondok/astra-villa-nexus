import { describe, it, expect } from 'vitest';
import { getDefaultFeaturesForPropertyType } from '../usePropertyFeatures';

describe('usePropertyFeatures - default features by property type', () => {
  const mockFeatures = [
    { key: 'airconditioner', labelEn: 'AC', labelId: 'AC', icon: '❄️', applicableFor: ['sale' as const], category: 'basic' as const },
    { key: 'parking', labelEn: 'Parking', labelId: 'Parkir', icon: '🅿️', applicableFor: ['sale' as const], category: 'basic' as const },
    { key: 'swimmingpool', labelEn: 'Pool', labelId: 'Kolam', icon: '🏊', applicableFor: ['sale' as const], category: 'amenity' as const },
    { key: 'security', labelEn: 'Security', labelId: 'Keamanan', icon: '🔒', applicableFor: ['sale' as const], category: 'security' as const },
    { key: 'wifi', labelEn: 'WiFi', labelId: 'WiFi', icon: '📶', applicableFor: ['rent' as const], category: 'basic' as const },
    { key: 'furnished', labelEn: 'Furnished', labelId: 'Berperabot', icon: '🛋️', applicableFor: ['rent' as const], category: 'basic' as const },
    { key: 'garden', labelEn: 'Garden', labelId: 'Taman', icon: '🌿', applicableFor: ['sale' as const], category: 'environment' as const },
    { key: 'elevator', labelEn: 'Elevator', labelId: 'Lift', icon: '🛗', applicableFor: ['sale' as const], category: 'basic' as const },
  ];

  it('villa defaults include pool and garden', () => {
    const defaults = getDefaultFeaturesForPropertyType('villa', 'sale', mockFeatures);
    expect(defaults).toContain('swimmingpool');
    expect(defaults).toContain('garden');
  });

  it('apartment defaults include elevator', () => {
    const defaults = getDefaultFeaturesForPropertyType('apartment', 'sale', mockFeatures);
    expect(defaults).toContain('elevator');
  });

  it('land has no default features', () => {
    const defaults = getDefaultFeaturesForPropertyType('land', 'sale', mockFeatures);
    expect(defaults).toHaveLength(0);
  });

  it('rental adds wifi and furnished', () => {
    const defaults = getDefaultFeaturesForPropertyType('house', 'rent', mockFeatures);
    expect(defaults).toContain('wifi');
    expect(defaults).toContain('furnished');
  });

  it('filters out unavailable features', () => {
    const limited = [mockFeatures[0]]; // only airconditioner
    const defaults = getDefaultFeaturesForPropertyType('villa', 'sale', limited);
    expect(defaults).toEqual(['airconditioner']);
  });

  it('grouping by category works', () => {
    const grouped = mockFeatures.reduce((acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f);
      return acc;
    }, {} as Record<string, typeof mockFeatures>);
    expect(Object.keys(grouped)).toContain('basic');
    expect(Object.keys(grouped)).toContain('amenity');
  });
});
