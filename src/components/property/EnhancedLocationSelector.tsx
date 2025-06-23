
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ChevronRight } from "lucide-react";
import DetailedAddressForm, { DetailedAddressData } from "./DetailedAddressForm";

interface EnhancedLocationSelectorProps {
  selectedState: string;
  selectedCity: string;
  selectedArea: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
  onLocationChange: (location: string) => void;
  onDetailedAddressChange?: (addressData: DetailedAddressData) => void;
}

const EnhancedLocationSelector = ({
  selectedState,
  selectedCity,
  selectedArea,
  onStateChange,
  onCityChange,
  onAreaChange,
  onLocationChange,
  onDetailedAddressChange
}: EnhancedLocationSelectorProps) => {
  const [detailedAddress, setDetailedAddress] = useState<DetailedAddressData | null>(null);

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
      let locationString = `${selectedArea}, ${selectedCity}, ${selectedState}`;
      
      // Add detailed address if available
      if (detailedAddress) {
        const addressParts = [];
        if (detailedAddress.streetAddress) addressParts.push(detailedAddress.streetAddress);
        if (detailedAddress.blockNumber) addressParts.push(`Blok ${detailedAddress.blockNumber}`);
        if (detailedAddress.buildingName) addressParts.push(detailedAddress.buildingName);
        if (detailedAddress.apartmentName) addressParts.push(detailedAddress.apartmentName);
        if (detailedAddress.floorNumber && detailedAddress.unitNumber) {
          addressParts.push(`Lantai ${detailedAddress.floorNumber} Unit ${detailedAddress.unitNumber}`);
        } else if (detailedAddress.floorNumber) {
          addressParts.push(`Lantai ${detailedAddress.floorNumber}`);
        } else if (detailedAddress.unitNumber) {
          addressParts.push(`Unit ${detailedAddress.unitNumber}`);
        }
        
        if (addressParts.length > 0) {
          locationString = `${addressParts.join(', ')}, ${locationString}`;
        }
        
        if (detailedAddress.postalCode) {
          locationString += ` ${detailedAddress.postalCode}`;
        }
      }
      
      onLocationChange(locationString);
    }
  }, [selectedState, selectedCity, selectedArea, detailedAddress, onLocationChange]);

  const handleStateChange = (state: string) => {
    onStateChange(state);
    onCityChange('');
    onAreaChange('');
  };

  const handleCityChange = (city: string) => {
    onCityChange(city);
    onAreaChange('');
  };

  const handleDetailedAddressChange = (addressData: DetailedAddressData) => {
    setDetailedAddress(addressData);
    if (onDetailedAddressChange) {
      onDetailedAddressChange(addressData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Pilih Lokasi Wilayah
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  <SelectValue placeholder="Pilih Kota" />
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
                  <SelectValue placeholder="Pilih Area" />
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
                <span className="font-medium">Wilayah Terpilih:</span>
              </div>
              <div className="text-blue-700 font-medium mt-1">
                {selectedArea} <ChevronRight className="inline h-3 w-3 mx-1" />
                {selectedCity} <ChevronRight className="inline h-3 w-3 mx-1" />
                {selectedState}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Address Form - Only show when location is selected */}
      {selectedState && selectedCity && selectedArea && (
        <DetailedAddressForm
          onAddressChange={handleDetailedAddressChange}
        />
      )}
    </div>
  );
};

export default EnhancedLocationSelector;
