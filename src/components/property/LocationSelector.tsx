
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, ChevronRight } from "lucide-react";

interface LocationSelectorProps {
  selectedState: string;
  selectedCity: string;
  selectedArea: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
  onLocationChange: (location: string) => void;
}

const LocationSelector = ({
  selectedState,
  selectedCity,
  selectedArea,
  onStateChange,
  onCityChange,
  onAreaChange,
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
        .order('area_name', { ascending: true });
      
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

  // Get areas for selected province and city
  const areas = locations
    ? locations
        .filter(loc => loc.province_name === selectedState && loc.city_name === selectedCity)
        .map(loc => loc.area_name)
    : [];

  // Update location string when selections change
  useEffect(() => {
    if (selectedState && selectedCity && selectedArea) {
      const locationString = `${selectedArea}, ${selectedCity}, ${selectedState}`;
      onLocationChange(locationString);
    }
  }, [selectedState, selectedCity, selectedArea, onLocationChange]);

  const handleStateChange = (state: string) => {
    onStateChange(state);
    onCityChange('');
    onAreaChange('');
  };

  const handleCityChange = (city: string) => {
    onCityChange(city);
    onAreaChange('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Label htmlFor="area" className="text-gray-700 font-medium">Kecamatan/Area *</Label>
          <Select value={selectedArea} onValueChange={onAreaChange} disabled={!selectedCity}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih Kecamatan/Area" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              {areas.map((area) => (
                <SelectItem key={area} value={area} className="text-gray-900 hover:bg-blue-50">
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location Preview */}
      {selectedState && selectedCity && selectedArea && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Lokasi Terpilih:</span>
          </div>
          <div className="text-blue-700 font-medium mt-1">
            {selectedArea} <ChevronRight className="inline h-3 w-3 mx-1" />
            {selectedCity} <ChevronRight className="inline h-3 w-3 mx-1" />
            {selectedState}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
