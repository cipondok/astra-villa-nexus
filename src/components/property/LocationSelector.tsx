import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, ChevronRight } from "lucide-react";

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
    if (selectedState && selectedCity && selectedDistrict && selectedSubdistrict) {
      const locationString = `${selectedSubdistrict}, ${selectedDistrict}, ${selectedCity}, ${selectedState}`;
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
          <Label htmlFor="state" className="text-gray-700 font-medium">Provinsi *</Label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih Provinsi" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              {provinces.map((province) => (
                <SelectItem key={province} value={province} className="text-gray-900 hover:bg-blue-50">
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city" className="text-gray-700 font-medium">Kota/Kabupaten *</Label>
          <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedState}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih Kota/Kabupaten" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-gray-900 hover:bg-blue-50">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district" className="text-gray-700 font-medium">Kecamatan *</Label>
          <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedCity}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih Kecamatan" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              {districts.map((district) => (
                <SelectItem key={district} value={district} className="text-gray-900 hover:bg-blue-50">
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subdistrict" className="text-gray-700 font-medium">Kelurahan/Desa *</Label>
          <Select value={selectedSubdistrict} onValueChange={onSubdistrictChange} disabled={!selectedDistrict}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih Kelurahan/Desa" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              {subdistricts.map((subdistrict) => (
                <SelectItem key={subdistrict} value={subdistrict} className="text-gray-900 hover:bg-blue-50">
                  {subdistrict}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location Preview */}
      {selectedState && selectedCity && selectedDistrict && selectedSubdistrict && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Lokasi Terpilih:</span>
          </div>
          <div className="text-blue-700 font-medium mt-1">
            {selectedSubdistrict} <ChevronRight className="inline h-3 w-3 mx-1" />
            {selectedDistrict} <ChevronRight className="inline h-3 w-3 mx-1" />
            {selectedCity} <ChevronRight className="inline h-3 w-3 mx-1" />
            {selectedState}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;