import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface LocationData {
  province_code: string;
  province_name: string;
  city_code: string;
  city_name: string;
  city_type: string;
  district_name?: string;
  subdistrict_name?: string;
}

interface LocationSelectorProps {
  selectedProvince: string;
  selectedCity: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  showLabel?: boolean;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedProvince,
  selectedCity,
  onProvinceChange,
  onCityChange,
  showLabel = true,
  className = ""
}) => {
  const [provinces, setProvinces] = useState<Array<{code: string, name: string}>>([]);
  const [cities, setCities] = useState<Array<{code: string, name: string, type: string}>>([]);
  const [loading, setLoading] = useState(false);

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (selectedProvince && selectedProvince !== 'all') {
      fetchCities(selectedProvince);
    } else {
      setCities([]);
      onCityChange('all');
    }
  }, [selectedProvince]);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('province_code, province_name')
        .eq('is_active', true)
        .order('province_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueProvinces = data?.reduce((acc: Array<{code: string, name: string}>, curr) => {
        if (!acc.find(p => p.code === curr.province_code)) {
          acc.push({
            code: curr.province_code,
            name: curr.province_name
          });
        }
        return acc;
      }, []) || [];

      setProvinces(uniqueProvinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('city_code, city_name, city_type')
        .eq('province_code', provinceCode)
        .eq('is_active', true)
        .order('city_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueCities = data?.reduce((acc: Array<{code: string, name: string, type: string}>, curr) => {
        if (!acc.find(c => c.code === curr.city_code)) {
          acc.push({
            code: curr.city_code,
            name: curr.city_name,
            type: curr.city_type
          });
        }
        return acc;
      }, []) || [];

      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    onProvinceChange(value);
    if (value === 'all') {
      setCities([]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabel && (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-semibold">Lokasi</Label>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Province Selection */}
        <div>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Memuat provinsi..." : "Pilih Provinsi"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Provinsi</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div>
          <Select 
            value={selectedCity} 
            onValueChange={onCityChange}
            disabled={!selectedProvince || selectedProvince === 'all' || cities.length === 0}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  !selectedProvince || selectedProvince === 'all' 
                    ? "Pilih provinsi dulu" 
                    : loading 
                      ? "Memuat kota..." 
                      : "Pilih Kota/Kabupaten"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kota/Kabupaten</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  {city.type} {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;