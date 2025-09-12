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
  area_name: string;
}

interface IndonesianLocationSelectorProps {
  selectedProvinceCode: string;
  selectedCityCode: string;
  selectedAreaName: string;
  onProvinceChange: (code: string, name: string) => void;
  onCityChange: (code: string, name: string) => void;
  onAreaChange: (name: string) => void;
  showLabel?: boolean;
  className?: string;
}

const IndonesianLocationSelector: React.FC<IndonesianLocationSelectorProps> = ({
  selectedProvinceCode,
  selectedCityCode,
  selectedAreaName,
  onProvinceChange,
  onCityChange,
  onAreaChange,
  showLabel = true,
  className = ""
}) => {
  const [provinces, setProvinces] = useState<Array<{code: string, name: string}>>([]);
  const [cities, setCities] = useState<Array<{code: string, name: string, type: string}>>([]);
  const [areas, setAreas] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(false);

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (selectedProvinceCode && selectedProvinceCode !== 'all') {
      fetchCities(selectedProvinceCode);
    } else {
      setCities([]);
      onCityChange('all', '');
    }
  }, [selectedProvinceCode]);

  // Fetch areas when city changes
  useEffect(() => {
    if (selectedCityCode && selectedCityCode !== 'all') {
      fetchAreas(selectedProvinceCode, selectedCityCode);
    } else {
      setAreas([]);
      onAreaChange('');
    }
  }, [selectedCityCode, selectedProvinceCode]);

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

  const fetchAreas = async (provinceCode: string, cityCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('area_name')
        .eq('province_code', provinceCode)
        .eq('city_code', cityCode)
        .eq('is_active', true)
        .order('area_name');

      if (error) throw error;

      // Get unique area names
      const uniqueAreas = [...new Set(data?.map(item => item.area_name) || [])];
      setAreas(uniqueAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinces.find(p => p.code === value);
    onProvinceChange(value, selectedProvince?.name || '');
    if (value === 'all') {
      setCities([]);
      setAreas([]);
    }
  };

  const handleCityChange = (value: string) => {
    const selectedCity = cities.find(c => c.code === value);
    onCityChange(value, selectedCity?.name || '');
    if (value === 'all') {
      setAreas([]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabel && (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-semibold">Lokasi Bisnis</Label>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province Selection */}
        <div>
          <Label htmlFor="province">Provinsi</Label>
          <Select value={selectedProvinceCode} onValueChange={handleProvinceChange}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder={loading ? "Memuat provinsi..." : "Pilih Provinsi"} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="all">Semua Provinsi</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code} className="text-gray-900 hover:bg-blue-50">
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div>
          <Label htmlFor="city">Kota/Kabupaten</Label>
          <Select 
            value={selectedCityCode} 
            onValueChange={handleCityChange}
            disabled={!selectedProvinceCode || selectedProvinceCode === 'all' || cities.length === 0}
          >
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue 
                placeholder={
                  !selectedProvinceCode || selectedProvinceCode === 'all' 
                    ? "Pilih provinsi dulu" 
                    : loading 
                      ? "Memuat kota..." 
                      : "Pilih Kota/Kabupaten"
                } 
              />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="all">Semua Kota/Kabupaten</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.code} value={city.code} className="text-gray-900 hover:bg-blue-50">
                  {city.type} {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Selection */}
        <div>
          <Label htmlFor="area">Kecamatan/Area</Label>
          <Select 
            value={selectedAreaName} 
            onValueChange={onAreaChange}
            disabled={!selectedCityCode || selectedCityCode === 'all' || areas.length === 0}
          >
            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
              <SelectValue 
                placeholder={
                  !selectedCityCode || selectedCityCode === 'all' 
                    ? "Pilih kota dulu" 
                    : loading 
                      ? "Memuat area..." 
                      : "Pilih Kecamatan/Area"
                } 
              />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="">Semua Area</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area} value={area} className="text-gray-900 hover:bg-blue-50">
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default IndonesianLocationSelector;