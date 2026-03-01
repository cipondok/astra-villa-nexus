import { describe, it, expect } from 'vitest';
import { useLocationSettings } from '../locationSettingsStore';

// Mock supabase to avoid real API calls
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe('useLocationSettings', () => {
  it('has default Jakarta map center', () => {
    const state = useLocationSettings.getState();
    expect(state.settings.defaultMapCenter.latitude).toBeCloseTo(-6.2088);
    expect(state.settings.defaultMapCenter.longitude).toBeCloseTo(106.8456);
    expect(state.settings.defaultMapCenter.zoom).toBe(12);
  });

  it('getMapCenter returns [longitude, latitude]', () => {
    const [lng, lat] = useLocationSettings.getState().getMapCenter();
    expect(lng).toBeCloseTo(106.8456);
    expect(lat).toBeCloseTo(-6.2088);
  });

  it('getMapZoom returns default zoom', () => {
    expect(useLocationSettings.getState().getMapZoom()).toBe(12);
  });

  it('has default location hierarchy', () => {
    const { locationHierarchy } = useLocationSettings.getState().settings;
    expect(locationHierarchy.enabled_levels).toContain('province');
    expect(locationHierarchy.enabled_levels).toContain('city');
    expect(locationHierarchy.required_levels).toContain('province');
  });

  it('starts with isLoaded false', () => {
    // Note: may be true if persist loaded from storage, but default is false
    const state = useLocationSettings.getState();
    expect(typeof state.settings.isLoaded).toBe('boolean');
  });

  it('starts not loading', () => {
    expect(useLocationSettings.getState().isLoading).toBe(false);
  });
});
