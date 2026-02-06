import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Building2, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileLocationSelectorProps {
  selectedProvinceCode: string;
  selectedCityCode: string;
  selectedDistrictCode: string;
  selectedSubdistrictCode: string;
  buildingAddress: string;
  onProvinceChange: (code: string, name: string) => void;
  onCityChange: (code: string, name: string) => void;
  onDistrictChange: (code: string, name: string) => void;
  onSubdistrictChange: (code: string, name: string) => void;
  onBuildingAddressChange: (address: string) => void;
  language?: 'en' | 'id';
  className?: string;
}

const ProfileLocationSelector: React.FC<ProfileLocationSelectorProps> = ({
  selectedProvinceCode,
  selectedCityCode,
  selectedDistrictCode,
  selectedSubdistrictCode,
  buildingAddress,
  onProvinceChange,
  onCityChange,
  onDistrictChange,
  onSubdistrictChange,
  onBuildingAddressChange,
  language = 'id',
  className = ""
}) => {
  const [provinces, setProvinces] = useState<Array<{code: string, name: string}>>([]);
  const [cities, setCities] = useState<Array<{code: string, name: string, type: string}>>([]);
  const [districts, setDistricts] = useState<Array<{code: string, name: string}>>([]);
  const [subdistricts, setSubdistricts] = useState<Array<{code: string, name: string}>>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);

  const t = {
    en: {
      province: 'Province',
      city: 'City/Regency',
      district: 'District',
      subdistrict: 'Sub-district',
      buildingAddress: 'Building/Street Address',
      selectProvince: 'Select Province',
      selectCity: 'Select City',
      selectDistrict: 'Select District',
      selectSubdistrict: 'Select Sub-district',
      selectProvinceFirst: 'Select province first',
      selectCityFirst: 'Select city first',
      selectDistrictFirst: 'Select district first',
      loading: 'Loading...',
      buildingPlaceholder: 'Building name, street, number, RT/RW...',
      step: 'Step',
    },
    id: {
      province: 'Provinsi',
      city: 'Kota/Kabupaten',
      district: 'Kecamatan',
      subdistrict: 'Kelurahan/Desa',
      buildingAddress: 'Alamat Gedung/Jalan',
      selectProvince: 'Pilih Provinsi',
      selectCity: 'Pilih Kota/Kabupaten',
      selectDistrict: 'Pilih Kecamatan',
      selectSubdistrict: 'Pilih Kelurahan/Desa',
      selectProvinceFirst: 'Pilih provinsi dulu',
      selectCityFirst: 'Pilih kota dulu',
      selectDistrictFirst: 'Pilih kecamatan dulu',
      loading: 'Memuat...',
      buildingPlaceholder: 'Nama gedung, jalan, nomor, RT/RW...',
      step: 'Langkah',
    },
  };

  const text = t[language];

  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      fetchCities(selectedProvinceCode);
    } else {
      setCities([]);
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [selectedProvinceCode]);

  // Fetch districts when city changes
  useEffect(() => {
    if (selectedCityCode) {
      fetchDistricts(selectedCityCode);
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [selectedCityCode]);

  // Fetch subdistricts when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      fetchSubdistricts(selectedDistrictCode);
    } else {
      setSubdistricts([]);
    }
  }, [selectedDistrictCode]);

  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const { data, error } = await supabase
        .from('locations')
        .select('province_code, province_name')
        .eq('is_active', true)
        .not('province_code', 'is', null)
        .neq('province_code', '')
        .order('province_name')
        .limit(10000);

      if (error) throw error;

      const uniqueProvinces = data?.reduce((acc: Array<{code: string, name: string}>, curr) => {
        if (curr.province_code && curr.province_name && !acc.find(p => p.code === curr.province_code)) {
          acc.push({ code: curr.province_code, name: curr.province_name });
        }
        return acc;
      }, []) || [];

      setProvinces(uniqueProvinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    if (!provinceCode) return;
    
    try {
      setLoadingCities(true);
      const { data, error } = await supabase
        .from('locations')
        .select('city_code, city_name, city_type')
        .eq('province_code', provinceCode)
        .eq('is_active', true)
        .not('city_code', 'is', null)
        .neq('city_code', '')
        .order('city_name')
        .limit(1000);

      if (error) throw error;

      const uniqueCities = data?.reduce((acc: Array<{code: string, name: string, type: string}>, curr) => {
        if (curr.city_code && curr.city_name && !acc.find(c => c.code === curr.city_code)) {
          acc.push({ code: curr.city_code, name: curr.city_name, type: curr.city_type || '' });
        }
        return acc;
      }, []) || [];

      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchDistricts = async (cityCode: string) => {
    if (!cityCode) return;
    
    try {
      setLoadingDistricts(true);
      const { data, error } = await supabase
        .from('locations')
        .select('district_code, district_name')
        .eq('city_code', cityCode)
        .eq('is_active', true)
        .not('district_code', 'is', null)
        .neq('district_code', '')
        .order('district_name')
        .limit(1000);

      if (error) throw error;

      const uniqueDistricts = data?.reduce((acc: Array<{code: string, name: string}>, curr) => {
        if (curr.district_code && curr.district_name && !acc.find(d => d.code === curr.district_code)) {
          acc.push({ code: curr.district_code, name: curr.district_name });
        }
        return acc;
      }, []) || [];

      setDistricts(uniqueDistricts);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchSubdistricts = async (districtCode: string) => {
    if (!districtCode) return;
    
    try {
      setLoadingSubdistricts(true);
      const { data, error } = await supabase
        .from('locations')
        .select('subdistrict_code, subdistrict_name')
        .eq('district_code', districtCode)
        .eq('is_active', true)
        .not('subdistrict_code', 'is', null)
        .neq('subdistrict_code', '')
        .order('subdistrict_name')
        .limit(1000);

      if (error) throw error;

      const uniqueSubdistricts = data?.reduce((acc: Array<{code: string, name: string}>, curr) => {
        if (curr.subdistrict_code && curr.subdistrict_name && !acc.find(s => s.code === curr.subdistrict_code)) {
          acc.push({ code: curr.subdistrict_code, name: curr.subdistrict_name });
        }
        return acc;
      }, []) || [];

      setSubdistricts(uniqueSubdistricts);
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
    } finally {
      setLoadingSubdistricts(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinces.find(p => p.code === value);
    onProvinceChange(value, selectedProvince?.name || '');
    // Reset dependent fields
    onCityChange('', '');
    onDistrictChange('', '');
    onSubdistrictChange('', '');
  };

  const handleCityChange = (value: string) => {
    const selectedCity = cities.find(c => c.code === value);
    onCityChange(value, selectedCity?.name || '');
    // Reset dependent fields
    onDistrictChange('', '');
    onSubdistrictChange('', '');
  };

  const handleDistrictChange = (value: string) => {
    const selectedDistrict = districts.find(d => d.code === value);
    onDistrictChange(value, selectedDistrict?.name || '');
    // Reset dependent field
    onSubdistrictChange('', '');
  };

  const handleSubdistrictChange = (value: string) => {
    const selectedSubdistrict = subdistricts.find(s => s.code === value);
    onSubdistrictChange(value, selectedSubdistrict?.name || '');
  };

  const getStepStatus = (step: number) => {
    if (step === 1) return selectedProvinceCode ? 'complete' : 'active';
    if (step === 2) return selectedCityCode ? 'complete' : selectedProvinceCode ? 'active' : 'pending';
    if (step === 3) return selectedDistrictCode ? 'complete' : selectedCityCode ? 'active' : 'pending';
    if (step === 4) return selectedSubdistrictCode ? 'complete' : selectedDistrictCode ? 'active' : 'pending';
    return 'pending';
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Step Indicator */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
        {[1, 2, 3, 4].map((step, idx) => {
          const status = getStepStatus(step);
          return (
            <React.Fragment key={step}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                status === 'complete' && "bg-primary text-primary-foreground",
                status === 'active' && "bg-primary/20 text-primary border border-primary",
                status === 'pending' && "bg-muted text-muted-foreground"
              )}>
                {step}
              </div>
              {idx < 3 && (
                <ChevronRight className={cn(
                  "h-3 w-3",
                  status === 'complete' ? "text-primary" : "text-muted-foreground/50"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Province */}
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {text.step} 1 — {text.province}
        </Label>
        <Select value={selectedProvinceCode} onValueChange={handleProvinceChange}>
          <SelectTrigger className="h-8 text-xs bg-background border-border">
            <SelectValue placeholder={loadingProvinces ? text.loading : text.selectProvince} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.code} className="text-xs">
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 2: City */}
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {text.step} 2 — {text.city}
        </Label>
        <Select 
          value={selectedCityCode} 
          onValueChange={handleCityChange}
          disabled={!selectedProvinceCode || cities.length === 0}
        >
          <SelectTrigger className="h-8 text-xs bg-background border-border">
            {loadingCities ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{text.loading}</span>
              </div>
            ) : (
              <SelectValue 
                placeholder={!selectedProvinceCode ? text.selectProvinceFirst : text.selectCity} 
              />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {cities.map((city) => (
              <SelectItem key={city.code} value={city.code} className="text-xs">
                {city.type} {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 3: District */}
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {text.step} 3 — {text.district}
        </Label>
        <Select 
          value={selectedDistrictCode} 
          onValueChange={handleDistrictChange}
          disabled={!selectedCityCode || districts.length === 0}
        >
          <SelectTrigger className="h-8 text-xs bg-background border-border">
            {loadingDistricts ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{text.loading}</span>
              </div>
            ) : (
              <SelectValue 
                placeholder={!selectedCityCode ? text.selectCityFirst : text.selectDistrict} 
              />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {districts.map((district) => (
              <SelectItem key={district.code} value={district.code} className="text-xs">
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 4: Subdistrict */}
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {text.step} 4 — {text.subdistrict}
        </Label>
        <Select 
          value={selectedSubdistrictCode} 
          onValueChange={handleSubdistrictChange}
          disabled={!selectedDistrictCode || subdistricts.length === 0}
        >
          <SelectTrigger className="h-8 text-xs bg-background border-border">
            {loadingSubdistricts ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{text.loading}</span>
              </div>
            ) : (
              <SelectValue 
                placeholder={!selectedDistrictCode ? text.selectDistrictFirst : text.selectSubdistrict} 
              />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {subdistricts.map((subdistrict) => (
              <SelectItem key={subdistrict.code} value={subdistrict.code} className="text-xs">
                {subdistrict.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Building/Street Address */}
      <div className="space-y-1 pt-2 border-t border-border/50">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {text.buildingAddress}
        </Label>
        <Input
          value={buildingAddress}
          onChange={(e) => onBuildingAddressChange(e.target.value)}
          placeholder={text.buildingPlaceholder}
          className="h-8 text-xs"
          maxLength={200}
        />
      </div>
    </div>
  );
};

export default ProfileLocationSelector;
