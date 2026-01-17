import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  value?: {
    province_code?: string;
    province_name?: string;
    city_code?: string;
    city_name?: string;
    district_code?: string;
    district_name?: string;
    subdistrict_code?: string;
    subdistrict_name?: string;
    postal_code?: string;
    full_address?: string;
  };
  onChange: (location: {
    province_code?: string;
    province_name?: string;
    city_code?: string;
    city_name?: string;
    district_code?: string;
    district_name?: string;
    subdistrict_code?: string;
    subdistrict_name?: string;
    postal_code?: string;
    full_address?: string;
  }) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value = {},
  onChange,
  label = "Business Location",
  required = false,
  disabled = false
}) => {
  const [provinces, setProvinces] = useState<Array<{code: string, name: string}>>([]);
  const [cities, setCities] = useState<Array<{code: string, name: string, type: string}>>([]);
  const [districts, setDistricts] = useState<Array<{code: string, name: string, postal_code?: string}>>([]);
  const [subdistricts, setSubdistricts] = useState<Array<{code: string, name: string, postal_code?: string}>>([]);
  const [loading, setLoading] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load cities when province_code changes
  useEffect(() => {
    if (value.province_code) {
      loadCities(value.province_code);
    } else {
      setCities([]);
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [value.province_code]);

  // Load districts when city_code changes
  useEffect(() => {
    if (value.province_code && value.city_code) {
      loadDistricts(value.province_code, value.city_code);
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [value.province_code, value.city_code]);

  // Load subdistricts when district_code changes
  useEffect(() => {
    if (value.province_code && value.city_code && value.district_code) {
      loadSubdistricts(value.province_code, value.city_code, value.district_code);
    } else {
      setSubdistricts([]);
    }
  }, [value.province_code, value.city_code, value.district_code]);

  const loadProvinces = async () => {
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
        const exists = acc.find(p => p.code === curr.province_code);
        if (!exists) {
          acc.push({
            code: curr.province_code,
            name: curr.province_name
          });
        }
        return acc;
      }, []) || [];

      setProvinces(uniqueProvinces);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (provinceCode: string) => {
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
        const exists = acc.find(c => c.code === curr.city_code);
        if (!exists) {
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
      console.error('Error loading cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provinceCode: string, cityCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('district_code, district_name, postal_code')
        .eq('province_code', provinceCode)
        .eq('city_code', cityCode)
        .not('district_code', 'is', null)
        .eq('is_active', true)
        .order('district_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueDistricts = data?.reduce((acc: Array<{code: string, name: string, postal_code?: string}>, curr) => {
        if (curr.district_code && curr.district_name) {
          const exists = acc.find(d => d.code === curr.district_code);
          if (!exists) {
            acc.push({
              code: curr.district_code,
              name: curr.district_name,
              postal_code: curr.postal_code || undefined
            });
          }
        }
        return acc;
      }, []) || [];

      setDistricts(uniqueDistricts);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubdistricts = async (provinceCode: string, cityCode: string, districtCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('subdistrict_code, subdistrict_name, postal_code')
        .eq('province_code', provinceCode)
        .eq('city_code', cityCode)
        .eq('district_code', districtCode)
        .not('subdistrict_code', 'is', null)
        .eq('is_active', true)
        .order('subdistrict_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueSubdistricts = data?.reduce((acc: Array<{code: string, name: string, postal_code?: string}>, curr) => {
        if (curr.subdistrict_code && curr.subdistrict_name) {
          const exists = acc.find(s => s.code === curr.subdistrict_code);
          if (!exists) {
            acc.push({
              code: curr.subdistrict_code,
              name: curr.subdistrict_name,
              postal_code: curr.postal_code || undefined
            });
          }
        }
        return acc;
      }, []) || [];

      setSubdistricts(uniqueSubdistricts);
    } catch (error) {
      console.error('Error loading subdistricts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    const province = provinces.find(p => p.code === provinceCode);
    const newLocation = {
      province_code: provinceCode,
      province_name: province?.name || '',
      city_code: '',
      city_name: '',
      district_code: '',
      district_name: '',
      subdistrict_code: '',
      subdistrict_name: '',
      postal_code: '',
      full_address: province?.name || ''
    };
    onChange(newLocation);
  };

  const handleCityChange = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode);
    const newLocation = {
      ...value,
      city_code: cityCode,
      city_name: city ? `${city.type} ${city.name}` : '',
      district_code: '',
      district_name: '',
      subdistrict_code: '',
      subdistrict_name: '',
      postal_code: '',
      full_address: updateFullAddress({
        province_name: value.province_name,
        city_name: city ? `${city.type} ${city.name}` : ''
      })
    };
    onChange(newLocation);
  };

  const handleDistrictChange = (districtCode: string) => {
    const district = districts.find(d => d.code === districtCode);
    const newLocation = {
      ...value,
      district_code: districtCode,
      district_name: district?.name || '',
      subdistrict_code: '',
      subdistrict_name: '',
      postal_code: district?.postal_code || '',
      full_address: updateFullAddress({
        province_name: value.province_name,
        city_name: value.city_name,
        district_name: district?.name || ''
      })
    };
    onChange(newLocation);
  };

  const handleSubdistrictChange = (subdistrictCode: string) => {
    const subdistrict = subdistricts.find(s => s.code === subdistrictCode);
    const newLocation = {
      ...value,
      subdistrict_code: subdistrictCode,
      subdistrict_name: subdistrict?.name || '',
      postal_code: subdistrict?.postal_code || value.postal_code || '',
      full_address: updateFullAddress({
        province_name: value.province_name,
        city_name: value.city_name,
        district_name: value.district_name,
        subdistrict_name: subdistrict?.name || ''
      })
    };
    onChange(newLocation);
  };

  const updateFullAddress = (location: any) => {
    const parts = [
      location.subdistrict_name,
      location.district_name,
      location.city_name,
      location.province_name
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Province */}
        <div>
          <Label htmlFor="province" className="text-sm">Province</Label>
          <Select
            value={value.province_code || ''}
            onValueChange={handleProvinceChange}
            disabled={disabled || loading}
          >
            <SelectTrigger id="province">
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city" className="text-sm">City/Regency</Label>
          <Select
            value={value.city_code || ''}
            onValueChange={handleCityChange}
            disabled={disabled || loading || !value.province_code}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  {city.type} {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div>
          <Label htmlFor="district" className="text-sm">District</Label>
          <Select
            value={value.district_code || ''}
            onValueChange={handleDistrictChange}
            disabled={disabled || loading || !value.city_code}
          >
            <SelectTrigger id="district">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.code} value={district.code}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subdistrict/Village */}
        <div>
          <Label htmlFor="subdistrict" className="text-sm flex items-center gap-2">
            Kelurahan/Desa
            {value.district_code && subdistricts.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {subdistricts.length} total
              </span>
            )}
          </Label>
          <Select
            value={value.subdistrict_code || ''}
            onValueChange={handleSubdistrictChange}
            disabled={disabled || loading || !value.district_code}
          >
            <SelectTrigger id="subdistrict">
              <SelectValue placeholder={subdistricts.length > 0 ? `Select Kelurahan/Desa (${subdistricts.length})` : "Select Kelurahan/Desa"} />
            </SelectTrigger>
            <SelectContent>
              {subdistricts.map((subdistrict) => (
                <SelectItem key={subdistrict.code} value={subdistrict.code}>
                  {subdistrict.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Postal Code Display */}
      {value.postal_code && (
        <div>
          <Label className="text-sm">Postal Code</Label>
          <div className="px-3 py-2 border rounded-md bg-muted text-sm">
            {value.postal_code}
          </div>
        </div>
      )}

      {/* Full Address Preview */}
      {value.full_address && (
        <div>
          <Label className="text-sm">Location Preview</Label>
          <div className="px-3 py-2 border rounded-md bg-muted text-sm">
            {value.full_address}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;