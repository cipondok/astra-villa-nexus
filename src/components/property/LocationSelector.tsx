import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { language } = useLanguage();

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
        .select('*')
        .eq('is_active', true)
        .order('province_name', { ascending: true })
        .order('city_name', { ascending: true })
        .order('district_name', { ascending: true })
        .order('subdistrict_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Get unique provinces
  const provinces = locations ? [...new Set(locations.map(loc => loc.province_name))] : [];

  // Get cities for selected province
  const cities = locations 
    ? [...new Set(locations
        .filter(loc => loc.province_name === selectedState)
        .map(loc => loc.city_name))]
    : [];

  // Get districts for selected province and city
  const districts = locations
    ? [...new Set(locations
        .filter(loc => loc.province_name === selectedState && loc.city_name === selectedCity)
        .map(loc => loc.district_name)
        .filter(Boolean))]
    : [];

  // Get subdistricts for selected province, city, and district
  const subdistricts = locations
    ? [...new Set(locations
        .filter(loc => 
          loc.province_name === selectedState && 
          loc.city_name === selectedCity && 
          loc.district_name === selectedDistrict
        )
        .map(loc => loc.subdistrict_name)
        .filter(Boolean))]
    : [];

  // Update location string when selections change
  useEffect(() => {
    if (selectedState && selectedCity && selectedDistrict) {
      // Build location string - subdistrict is optional
      const parts = [selectedSubdistrict, selectedDistrict, selectedCity, selectedState].filter(Boolean);
      const locationString = parts.join(', ');
      onLocationChange(locationString);
    }
  }, [selectedState, selectedCity, selectedDistrict, selectedSubdistrict, onLocationChange]);

  const handleStateChange = (state: string) => {
    onStateChange(state);
    onCityChange('');
    onDistrictChange('');
    onSubdistrictChange('');
  };

  const handleCityChange = (city: string) => {
    onCityChange(city);
    onDistrictChange('');
    onSubdistrictChange('');
  };

  const handleDistrictChange = (district: string) => {
    onDistrictChange(district);
    onSubdistrictChange('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="state" className="text-gray-700 font-medium">{t.province} *</Label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder={t.selectProvince} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px]">
              {provinces.map((province) => (
                <SelectItem key={province} value={province} className="text-gray-900 hover:bg-blue-50">
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city" className="text-gray-700 font-medium">{t.city} *</Label>
          <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedState}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder={t.selectCity} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px]">
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-gray-900 hover:bg-blue-50">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district" className="text-gray-700 font-medium">{t.district} *</Label>
          <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedCity}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder={t.selectDistrict} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px]">
              {districts.map((district) => (
                <SelectItem key={district} value={district} className="text-gray-900 hover:bg-blue-50">
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subdistrict" className="text-gray-700 font-medium">
            {t.subdistrict} {subdistricts.length === 0 && selectedDistrict ? t.optional : '*'}
          </Label>
          <Select 
            value={selectedSubdistrict} 
            onValueChange={onSubdistrictChange} 
            disabled={!selectedDistrict || subdistricts.length === 0}
          >
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder={t.selectSubdistrict} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px]">
              {subdistricts.length > 0 ? (
                subdistricts.map((subdistrict) => (
                  <SelectItem key={subdistrict} value={subdistrict} className="text-gray-900 hover:bg-blue-50">
                    {subdistrict}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  {t.noSubdistrictsAvailable}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* No subdistricts available notice */}
      {selectedDistrict && subdistricts.length === 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {t.noSubdistrictsAvailable}
          </AlertDescription>
        </Alert>
      )}

      {/* Location Preview */}
      {selectedState && selectedCity && selectedDistrict && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{t.selectedLocation}</span>
          </div>
          <div className="text-blue-700 font-medium mt-1 flex flex-wrap items-center gap-1">
            {selectedSubdistrict && (
              <>
                {selectedSubdistrict}
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            {selectedDistrict}
            <ChevronRight className="h-3 w-3" />
            {selectedCity}
            <ChevronRight className="h-3 w-3" />
            {selectedState}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;