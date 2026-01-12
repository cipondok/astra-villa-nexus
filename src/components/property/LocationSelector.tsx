import { useMemo, useCallback, useRef, useEffect } from "react";
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

// Helper to normalize text (Title Case)
const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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

  // Fetch all locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_name, city_name, district_name, subdistrict_name')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Normalize and deduplicate provinces
  const provinces = useMemo(() => {
    if (!locations) return [];
    const uniqueProvinces = new Map<string, string>();
    locations.forEach(loc => {
      if (loc.province_name) {
        const normalized = normalizeText(loc.province_name);
        if (!uniqueProvinces.has(normalized.toLowerCase())) {
          uniqueProvinces.set(normalized.toLowerCase(), normalized);
        }
      }
    });
    return Array.from(uniqueProvinces.values()).sort((a, b) => a.localeCompare(b, 'id'));
  }, [locations]);

  // Get cities for selected province
  const cities = useMemo(() => {
    if (!locations || !selectedState) return [];
    const stateLower = selectedState.toLowerCase();
    const uniqueCities = new Map<string, string>();
    locations
      .filter(loc => loc.province_name?.toLowerCase() === stateLower)
      .forEach(loc => {
        if (loc.city_name) {
          const normalized = normalizeText(loc.city_name);
          if (!uniqueCities.has(normalized.toLowerCase())) {
            uniqueCities.set(normalized.toLowerCase(), normalized);
          }
        }
      });
    return Array.from(uniqueCities.values()).sort((a, b) => a.localeCompare(b, 'id'));
  }, [locations, selectedState]);

  // Get districts for selected city
  const districts = useMemo(() => {
    if (!locations || !selectedState || !selectedCity) return [];
    const stateLower = selectedState.toLowerCase();
    const cityLower = selectedCity.toLowerCase();
    const uniqueDistricts = new Map<string, string>();
    locations
      .filter(loc => 
        loc.province_name?.toLowerCase() === stateLower && 
        loc.city_name?.toLowerCase() === cityLower
      )
      .forEach(loc => {
        if (loc.district_name) {
          const normalized = normalizeText(loc.district_name);
          if (!uniqueDistricts.has(normalized.toLowerCase())) {
            uniqueDistricts.set(normalized.toLowerCase(), normalized);
          }
        }
      });
    return Array.from(uniqueDistricts.values()).sort((a, b) => a.localeCompare(b, 'id'));
  }, [locations, selectedState, selectedCity]);

  // Get subdistricts for selected district
  const subdistricts = useMemo(() => {
    if (!locations || !selectedState || !selectedCity || !selectedDistrict) return [];
    const stateLower = selectedState.toLowerCase();
    const cityLower = selectedCity.toLowerCase();
    const districtLower = selectedDistrict.toLowerCase();
    const uniqueSubdistricts = new Map<string, string>();
    locations
      .filter(loc => 
        loc.province_name?.toLowerCase() === stateLower && 
        loc.city_name?.toLowerCase() === cityLower &&
        loc.district_name?.toLowerCase() === districtLower
      )
      .forEach(loc => {
        if (loc.subdistrict_name) {
          const normalized = normalizeText(loc.subdistrict_name);
          if (!uniqueSubdistricts.has(normalized.toLowerCase())) {
            uniqueSubdistricts.set(normalized.toLowerCase(), normalized);
          }
        }
      });
    return Array.from(uniqueSubdistricts.values()).sort((a, b) => a.localeCompare(b, 'id'));
  }, [locations, selectedState, selectedCity, selectedDistrict]);

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
          <Label htmlFor="subdistrict">
            {t.subdistrict} {subdistricts.length === 0 && selectedDistrict ? t.optional : '*'}
          </Label>
          <SearchableSelect
            options={subdistricts.map(s => ({ value: s, label: s }))}
            value={selectedSubdistrict}
            onChange={onSubdistrictChange}
            placeholder={!selectedDistrict ? t.selectDistrict : t.selectSubdistrict}
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
