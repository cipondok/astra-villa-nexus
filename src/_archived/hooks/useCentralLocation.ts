import { useEffect } from 'react';
import { useLocationSettings } from '@/stores/locationSettingsStore';

/**
 * Hook to access centralized location settings throughout the app.
 * Automatically fetches settings if not loaded.
 * 
 * Usage:
 * const { mapCenter, zoom, defaultProvince, defaultCity, isLoaded } = useCentralLocation();
 */
export const useCentralLocation = () => {
  const { settings, fetchSettings, isLoading } = useLocationSettings();

  useEffect(() => {
    if (!settings.isLoaded && !isLoading) {
      fetchSettings();
    }
  }, [settings.isLoaded, isLoading, fetchSettings]);

  return {
    // Map settings
    mapCenter: [settings.defaultMapCenter.longitude, settings.defaultMapCenter.latitude] as [number, number],
    latitude: settings.defaultMapCenter.latitude,
    longitude: settings.defaultMapCenter.longitude,
    zoom: settings.defaultMapCenter.zoom,
    
    // Default location selections
    defaultProvince: settings.defaultProvince,
    defaultCity: settings.defaultCity,
    
    // Hierarchy settings
    enabledLevels: settings.locationHierarchy.enabled_levels,
    requiredLevels: settings.locationHierarchy.required_levels,
    
    // State
    isLoaded: settings.isLoaded,
    isLoading,
  };
};

export default useCentralLocation;
