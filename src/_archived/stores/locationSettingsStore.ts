import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface MapCenter {
  latitude: number;
  longitude: number;
  zoom: number;
  city?: string;
  province?: string;
}

export interface DefaultLocation {
  code: string;
  name: string;
  province_code?: string;
}

export interface LocationHierarchy {
  enabled_levels: string[];
  required_levels: string[];
}

export interface LocationSettings {
  defaultMapCenter: MapCenter;
  defaultProvince: DefaultLocation | null;
  defaultCity: DefaultLocation | null;
  locationHierarchy: LocationHierarchy;
  isLoaded: boolean;
}

interface LocationSettingsStore {
  settings: LocationSettings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateMapCenter: (center: Partial<MapCenter>) => Promise<void>;
  updateDefaultProvince: (province: DefaultLocation | null) => Promise<void>;
  updateDefaultCity: (city: DefaultLocation | null) => Promise<void>;
  getMapCenter: () => [number, number];
  getMapZoom: () => number;
}

const defaultSettings: LocationSettings = {
  defaultMapCenter: {
    latitude: -6.2088,
    longitude: 106.8456,
    zoom: 12,
    city: 'Jakarta',
    province: 'DKI Jakarta',
  },
  defaultProvince: null,
  defaultCity: null,
  locationHierarchy: {
    enabled_levels: ['province', 'city', 'district', 'subdistrict'],
    required_levels: ['province', 'city'],
  },
  isLoaded: false,
};

export const useLocationSettings = create<LocationSettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,

      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('location_admin_settings')
            .select('setting_key, setting_value')
            .in('setting_key', [
              'default_map_center',
              'default_province',
              'default_city',
              'location_hierarchy_levels',
            ]);

          if (error) throw error;

          const settingsMap: Record<string, any> = {};
          data?.forEach((row) => {
            settingsMap[row.setting_key] = row.setting_value;
          });

          set({
            settings: {
              defaultMapCenter: settingsMap.default_map_center || defaultSettings.defaultMapCenter,
              defaultProvince: settingsMap.default_province || null,
              defaultCity: settingsMap.default_city || null,
              locationHierarchy: settingsMap.location_hierarchy_levels || defaultSettings.locationHierarchy,
              isLoaded: true,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error('Error fetching location settings:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch settings',
            isLoading: false,
            settings: { ...defaultSettings, isLoaded: true }
          });
        }
      },

      updateMapCenter: async (center: Partial<MapCenter>) => {
        const currentCenter = get().settings.defaultMapCenter;
        const newCenter = { ...currentCenter, ...center };

        try {
          const { error } = await supabase
            .from('location_admin_settings')
            .update({ 
              setting_value: newCenter,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', 'default_map_center');

          if (error) throw error;

          set((state) => ({
            settings: {
              ...state.settings,
              defaultMapCenter: newCenter,
            },
          }));
        } catch (error) {
          console.error('Error updating map center:', error);
          throw error;
        }
      },

      updateDefaultProvince: async (province: DefaultLocation | null) => {
        try {
          // Cast to Json type for Supabase
          const jsonValue = province ? JSON.parse(JSON.stringify(province)) : null;
          
          const { error } = await supabase
            .from('location_admin_settings')
            .update({ 
              setting_value: jsonValue,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', 'default_province');

          if (error) throw error;

          set((state) => ({
            settings: {
              ...state.settings,
              defaultProvince: province,
            },
          }));
        } catch (error) {
          console.error('Error updating default province:', error);
          throw error;
        }
      },

      updateDefaultCity: async (city: DefaultLocation | null) => {
        try {
          // Cast to Json type for Supabase
          const jsonValue = city ? JSON.parse(JSON.stringify(city)) : null;
          
          const { error } = await supabase
            .from('location_admin_settings')
            .update({ 
              setting_value: jsonValue,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', 'default_city');

          if (error) throw error;

          set((state) => ({
            settings: {
              ...state.settings,
              defaultCity: city,
            },
          }));
        } catch (error) {
          console.error('Error updating default city:', error);
          throw error;
        }
      },

      getMapCenter: () => {
        const { defaultMapCenter } = get().settings;
        return [defaultMapCenter.longitude, defaultMapCenter.latitude] as [number, number];
      },

      getMapZoom: () => {
        return get().settings.defaultMapCenter.zoom;
      },
    }),
    {
      name: 'location-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Hook to initialize settings on app load
export const useInitLocationSettings = () => {
  const { fetchSettings, settings } = useLocationSettings();
  
  if (!settings.isLoaded) {
    fetchSettings();
  }
  
  return settings;
};
