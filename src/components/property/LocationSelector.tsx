import { useCallback, useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
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
  const { language } = useTranslation();
  const prevLocationRef = useRef<string>('');
  
  // Track selected codes for proper cascading
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');

  const { defaultProvince, defaultCity, isLoaded: locationSettingsLoaded } = useCentralLocation();

  // Apply default location settings on mount
  useEffect(() => {
    if (locationSettingsLoaded && !selectedState && defaultProvince?.name) {
      onStateChange(defaultProvince.name);
      if (defaultProvince.code) setSelectedProvinceCode(defaultProvince.code);
      if (defaultCity?.name) {
        setTimeout(() => {
          onCityChange(defaultCity.name);
          if (defaultCity.code) setSelectedCityCode(defaultCity.code);
        }, 100);
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

  // Fetch provinces using RPC (returns all 38 correctly)
  const { data: provincesData = [] } = useQuery({
    queryKey: ['location-provinces-rpc'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_distinct_provinces');
      if (error) throw error;
      return (data || [])
        .filter((p: any) => p.province_name && p.province_code)
        .sort((a: any, b: any) => a.province_name.localeCompare(b.province_name, 'id'));
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch cities using RPC filtered by province code
  const { data: citiesData = [] } = useQuery({
    queryKey: ['location-cities-rpc', selectedProvinceCode],
    queryFn: async () => {
      if (!selectedProvinceCode) return [];
      const { data, error } = await supabase.rpc('get_distinct_cities', { 
        p_province_code: selectedProvinceCode 
      });
      if (error) throw error;
      return (data || [])
        .filter((c: any) => c.city_name && c.city_code)
        .sort((a: any, b: any) => a.city_name.localeCompare(b.city_name, 'id'));
    },
    enabled: !!selectedProvinceCode,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch districts using RPC filtered by province + city code
  const { data: districtsData = [] } = useQuery({
    queryKey: ['location-districts-rpc', selectedProvinceCode, selectedCityCode],
    queryFn: async () => {
      if (!selectedProvinceCode || !selectedCityCode) return [];
      const { data, error } = await supabase.rpc('get_distinct_districts', { 
        p_province_code: selectedProvinceCode,
        p_city_code: selectedCityCode
      });
      if (error) throw error;
      return (data || [])
        .filter((d: any) => d.district_name && d.district_code)
        .sort((a: any, b: any) => a.district_name.localeCompare(b.district_name, 'id'));
    },
    enabled: !!selectedProvinceCode && !!selectedCityCode,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch subdistricts using RPC filtered by province + city + district code
  const { data: subdistrictsData = [] } = useQuery({
    queryKey: ['location-subdistricts-rpc', selectedProvinceCode, selectedCityCode, selectedDistrictCode],
    queryFn: async () => {
      if (!selectedProvinceCode || !selectedCityCode || !selectedDistrictCode) return [];
      const { data, error } = await supabase.rpc('get_distinct_subdistricts', { 
        p_province_code: selectedProvinceCode,
        p_city_code: selectedCityCode,
        p_district_code: selectedDistrictCode
      });
      if (error) throw error;
      return (data || [])
        .filter((s: any) => s.subdistrict_name && s.subdistrict_code)
        .sort((a: any, b: any) => a.subdistrict_name.localeCompare(b.subdistrict_name, 'id'));
    },
    enabled: !!selectedProvinceCode && !!selectedCityCode && !!selectedDistrictCode,
    staleTime: 10 * 60 * 1000,
  });

  // Update location string when selections change
  useEffect(() => {
    if (selectedState && selectedCity && selectedDistrict) {
      const parts = [selectedSubdistrict, selectedDistrict, selectedCity, selectedState].filter(Boolean);
      const locationString = parts.join(', ');
      if (locationString !== prevLocationRef.current) {
        prevLocationRef.current = locationString;
        onLocationChange(locationString);
      }
    }
  }, [selectedState, selectedCity, selectedDistrict, selectedSubdistrict, onLocationChange]);

  const handleStateChange = useCallback((provinceCode: string) => {
    const province = provincesData.find((p: any) => p.province_code === provinceCode);
    setSelectedProvinceCode(provinceCode);
    setSelectedCityCode('');
    setSelectedDistrictCode('');
    onStateChange(province?.province_name || '');
    onCityChange('');
    onDistrictChange('');
    onSubdistrictChange('');
  }, [provincesData, onStateChange, onCityChange, onDistrictChange, onSubdistrictChange]);

  const handleCityChange = useCallback((cityCode: string) => {
    const city = citiesData.find((c: any) => c.city_code === cityCode);
    setSelectedCityCode(cityCode);
    setSelectedDistrictCode('');
    const displayName = city ? `${city.city_type || ''} ${city.city_name}`.trim() : '';
    onCityChange(displayName);
    onDistrictChange('');
    onSubdistrictChange('');
  }, [citiesData, onCityChange, onDistrictChange, onSubdistrictChange]);

  const handleDistrictChange = useCallback((districtCode: string) => {
    const district = districtsData.find((d: any) => d.district_code === districtCode);
    setSelectedDistrictCode(districtCode);
    onDistrictChange(district?.district_name || '');
    onSubdistrictChange('');
  }, [districtsData, onDistrictChange, onSubdistrictChange]);

  const handleSubdistrictChange = useCallback((subdistrictCode: string) => {
    const subdistrict = subdistrictsData.find((s: any) => s.subdistrict_code === subdistrictCode);
    onSubdistrictChange(subdistrict?.subdistrict_name || '');
  }, [subdistrictsData, onSubdistrictChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="state">{t.province} *</Label>
          <SearchableSelect
            options={provincesData.map((p: any) => ({ value: p.province_code, label: p.province_name }))}
            value={selectedProvinceCode}
            onChange={handleStateChange}
            placeholder={t.selectProvince}
            searchPlaceholder={language === 'id' ? 'Cari provinsi...' : 'Search province...'}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="city">{t.city} *</Label>
          <SearchableSelect
            options={citiesData.map((c: any) => ({ value: c.city_code, label: `${c.city_type || ''} ${c.city_name}`.trim() }))}
            value={selectedCityCode}
            onChange={handleCityChange}
            placeholder={!selectedProvinceCode ? t.selectProvince : t.selectCity}
            searchPlaceholder={language === 'id' ? 'Cari kota/kabupaten...' : 'Search city/regency...'}
            disabled={!selectedProvinceCode}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="district">{t.district} *</Label>
          <SearchableSelect
            options={districtsData.map((d: any) => ({ value: d.district_code, label: d.district_name }))}
            value={selectedDistrictCode}
            onChange={handleDistrictChange}
            placeholder={!selectedCityCode ? t.selectCity : t.selectDistrict}
            searchPlaceholder={language === 'id' ? 'Cari kecamatan...' : 'Search district...'}
            disabled={!selectedCityCode}
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="subdistrict" className="flex items-center gap-2">
              {t.subdistrict} {subdistrictsData.length === 0 && selectedDistrictCode ? t.optional : '*'}
              {selectedDistrictCode && subdistrictsData.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {subdistrictsData.length} {language === 'id' ? 'di kecamatan ini' : 'in this district'}
                </span>
              )}
            </Label>
            <span className="text-[10px] text-muted-foreground" title="75.753 Desa + 8.486 Kelurahan + 37 Transmigrasi">
              🇮🇩 84.276 total
            </span>
          </div>
          <SearchableSelect
            options={subdistrictsData.map((s: any) => ({ value: s.subdistrict_code, label: s.subdistrict_name }))}
            value={selectedSubdistrict ? subdistrictsData.find((s: any) => s.subdistrict_name === selectedSubdistrict)?.subdistrict_code || '' : ''}
            onChange={handleSubdistrictChange}
            placeholder={!selectedDistrictCode ? t.selectDistrict : `${t.selectSubdistrict}${subdistrictsData.length > 0 ? ` (${subdistrictsData.length})` : ''}`}
            searchPlaceholder={language === 'id' ? 'Cari kelurahan/desa...' : 'Search subdistrict/village...'}
            disabled={!selectedDistrictCode}
            className="mt-1"
          />
        </div>
      </div>

      {/* No subdistricts available notice */}
      {selectedDistrictCode && subdistrictsData.length === 0 && (
        <Alert className="bg-chart-3/10 border-chart-3/30">
          <AlertCircle className="h-4 w-4 text-chart-3" />
          <AlertDescription className="text-foreground">
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
