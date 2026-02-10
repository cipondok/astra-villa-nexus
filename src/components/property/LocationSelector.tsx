import { useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useCentralLocation } from "@/hooks/useCentralLocation";

interface LocationSelectorProps {
  selectedState: string;
  selectedCity: string;
  selectedDistrict: string;
  selectedSubdistrict: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  onSubdistrictChange: (subdistrict: string) => void;
  onLocationChange: (location: string) => void;
}

// Helper to normalize text (Title Case + whitespace normalization)
const normalizeText = (text: string): string => {
  if (!text) return '';
  const cleaned = text.trim().replace(/\s+/g, ' ');
  return cleaned
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeKey = (text: string) => normalizeText(text).toLowerCase();

const LocationSelector = ({
  selectedState,
  selectedCity,
  selectedDistrict,
  selectedSubdistrict,
  onStateChange,
  onCityChange,
  onDistrictChange,
  onSubdistrictChange,
  onLocationChange
}: LocationSelectorProps) => {
  const { language } = useLanguage();
  const prevLocationRef = useRef<string>('');
  
  // Get centralized location settings
  const { defaultProvince, defaultCity, isLoaded: locationSettingsLoaded } = useCentralLocation();
  
  // Apply default location settings on mount
  useEffect(() => {
    if (locationSettingsLoaded && !selectedState && defaultProvince?.name) {
      onStateChange(defaultProvince.name);
      if (defaultCity?.name) {
        // Small delay to ensure state is set first
        setTimeout(() => onCityChange(defaultCity.name), 100);
      }
    }
  }, [locationSettingsLoaded, defaultProvince, defaultCity, selectedState]);

  const t = {
    en: {
      province: "Province",
      selectProvince: "Select Province",
      city: "City/Regency",
      selectCity: "Select City/Regency",
      district: "District",
      selectDistrict: "Select District",
      subdistrict: "Subdistrict/Village",
      selectSubdistrict: "Select Subdistrict/Village",
      selectedLocation: "Selected Location:",
      noSubdistrictsAvailable: "No subdistricts available for this location. You can proceed without selecting one.",
      optional: "(Optional)",
    },
    id: {
      province: "Provinsi",
      selectProvince: "Pilih Provinsi",
      city: "Kota/Kabupaten",
      selectCity: "Pilih Kota/Kabupaten",
      district: "Kecamatan",
      selectDistrict: "Pilih Kecamatan",
      subdistrict: "Kelurahan/Desa",
      selectSubdistrict: "Pilih Kelurahan/Desa",
      selectedLocation: "Lokasi Terpilih:",
      noSubdistrictsAvailable: "Tidak ada kelurahan/desa tersedia untuk lokasi ini. Anda dapat melanjutkan tanpa memilihnya.",
      optional: "(Opsional)",
    }
  }[language];

  // Fetch provinces (distinct list)
  const { data: provinces = [] } = useQuery({
    queryKey: ['location-provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_name')
        .eq('is_active', true)
        .not('province_name', 'is', null)
        .not('province_name', 'eq', '');
      
      if (error) throw error;
      const unique = new Map<string, string>();
      (data || []).forEach(loc => {
        if (loc.province_name) {
          const normalized = normalizeText(loc.province_name);
          const key = normalizeKey(loc.province_name);
          if (!unique.has(key)) unique.set(key, normalized);
        }
      });
      return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'id'));
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch cities for selected province
  const { data: cities = [] } = useQuery({
    queryKey: ['location-cities', selectedState],
    queryFn: async () => {
      if (!selectedState) return [];
      const { data, error } = await supabase
        .from('locations')
        .select('city_name')
        .eq('is_active', true)
        .ilike('province_name', selectedState)
        .not('city_name', 'is', null)
        .not('city_name', 'eq', '');
      
      if (error) throw error;
      const unique = new Map<string, string>();
      (data || []).forEach(loc => {
        if (loc.city_name) {
          const normalized = normalizeText(loc.city_name);
          const key = normalizeKey(loc.city_name);
          if (!unique.has(key)) unique.set(key, normalized);
        }
      });
      return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'id'));
    },
    enabled: !!selectedState,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch districts for selected city
  const { data: districts = [] } = useQuery({
    queryKey: ['location-districts', selectedState, selectedCity],
    queryFn: async () => {
      if (!selectedState || !selectedCity) return [];
      const { data, error } = await supabase
        .from('locations')
        .select('district_name')
        .eq('is_active', true)
        .ilike('province_name', selectedState)
        .ilike('city_name', selectedCity)
        .not('district_name', 'is', null)
        .not('district_name', 'eq', '');
      
      if (error) throw error;
      const unique = new Map<string, string>();
      (data || []).forEach(loc => {
        if (loc.district_name) {
          const normalized = normalizeText(loc.district_name);
          const key = normalizeKey(loc.district_name);
          if (!unique.has(key)) unique.set(key, normalized);
        }
      });
      return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'id'));
    },
    enabled: !!selectedState && !!selectedCity,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch subdistricts for selected district
  const { data: subdistricts = [] } = useQuery({
    queryKey: ['location-subdistricts', selectedState, selectedCity, selectedDistrict],
    queryFn: async () => {
      if (!selectedState || !selectedCity || !selectedDistrict) return [];
      const { data, error } = await supabase
        .from('locations')
        .select('subdistrict_name')
        .eq('is_active', true)
        .ilike('province_name', selectedState)
        .ilike('city_name', selectedCity)
        .ilike('district_name', selectedDistrict)
        .not('subdistrict_name', 'is', null)
        .not('subdistrict_name', 'eq', '');
      
      if (error) throw error;
      const unique = new Map<string, string>();
      (data || []).forEach(loc => {
        if (loc.subdistrict_name) {
          const normalized = normalizeText(loc.subdistrict_name);
          const key = normalizeKey(loc.subdistrict_name);
          if (!unique.has(key)) unique.set(key, normalized);
        }
      });
      return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'id'));
    },
    enabled: !!selectedState && !!selectedCity && !!selectedDistrict,
    staleTime: 10 * 60 * 1000,
  });


  // Update location string when selections change (prevent infinite loop)
  useEffect(() => {
    if (selectedState && selectedCity && selectedDistrict) {
      const parts = [selectedSubdistrict, selectedDistrict, selectedCity, selectedState].filter(Boolean);
      const locationString = parts.join(', ');
      
      // Only call if the location actually changed
      if (locationString !== prevLocationRef.current) {
        prevLocationRef.current = locationString;
        onLocationChange(locationString);
      }
    }
  }, [selectedState, selectedCity, selectedDistrict, selectedSubdistrict, onLocationChange]);

  const handleStateChange = useCallback((state: string) => {
    onStateChange(state);
    onCityChange('');
    onDistrictChange('');
    onSubdistrictChange('');
  }, [onStateChange, onCityChange, onDistrictChange, onSubdistrictChange]);

  const handleCityChange = useCallback((city: string) => {
    onCityChange(city);
    onDistrictChange('');
    onSubdistrictChange('');
  }, [onCityChange, onDistrictChange, onSubdistrictChange]);

  const handleDistrictChange = useCallback((district: string) => {
    onDistrictChange(district);
    onSubdistrictChange('');
  }, [onDistrictChange, onSubdistrictChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="state">{t.province} *</Label>
          <SearchableSelect
            options={provinces.map(p => ({ value: p, label: p }))}
            value={selectedState}
            onChange={handleStateChange}
            placeholder={t.selectProvince}
            searchPlaceholder={language === 'id' ? 'Cari provinsi...' : 'Search province...'}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="city">{t.city} *</Label>
          <SearchableSelect
            options={cities.map(c => ({ value: c, label: c }))}
            value={selectedCity}
            onChange={handleCityChange}
            placeholder={!selectedState ? t.selectProvince : t.selectCity}
            searchPlaceholder={language === 'id' ? 'Cari kota/kabupaten...' : 'Search city/regency...'}
            disabled={!selectedState}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="district">{t.district} *</Label>
          <SearchableSelect
            options={districts.map(d => ({ value: d, label: d }))}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            placeholder={!selectedCity ? t.selectCity : t.selectDistrict}
            searchPlaceholder={language === 'id' ? 'Cari kecamatan...' : 'Search district...'}
            disabled={!selectedCity}
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="subdistrict" className="flex items-center gap-2">
              {t.subdistrict} {subdistricts.length === 0 && selectedDistrict ? t.optional : '*'}
              {selectedDistrict && subdistricts.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {subdistricts.length} {language === 'id' ? 'di kecamatan ini' : 'in this district'}
                </span>
              )}
            </Label>
            <span className="text-[10px] text-muted-foreground" title="75.753 Desa + 8.486 Kelurahan + 37 Transmigrasi">
              🇮🇩 84.276 total
            </span>
          </div>
          <SearchableSelect
            options={subdistricts.map(s => ({ value: s, label: s }))}
            value={selectedSubdistrict}
            onChange={onSubdistrictChange}
            placeholder={!selectedDistrict ? t.selectDistrict : `${t.selectSubdistrict}${subdistricts.length > 0 ? ` (${subdistricts.length})` : ''}`}
            searchPlaceholder={language === 'id' ? 'Cari kelurahan/desa...' : 'Search subdistrict/village...'}
            disabled={!selectedDistrict}
            className="mt-1"
          />
        </div>
      </div>

      {/* No subdistricts available notice */}
      {selectedDistrict && subdistricts.length === 0 && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {t.noSubdistrictsAvailable}
          </AlertDescription>
        </Alert>
      )}

      {/* Location Preview */}
      {selectedState && selectedCity && selectedDistrict && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-4 w-4" />
            <span className="font-medium text-sm">{t.selectedLocation}</span>
          </div>
          <div className="text-foreground font-medium mt-1 flex flex-wrap items-center gap-1 text-sm">
            {selectedSubdistrict && (
              <>
                <span>{selectedSubdistrict}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </>
            )}
            <span>{selectedDistrict}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span>{selectedCity}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span>{selectedState}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
