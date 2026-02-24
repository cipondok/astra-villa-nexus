import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Building2, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

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
  language?: 'en' | 'id' | 'zh' | 'ja' | 'ko';
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
  const { t } = useTranslation();

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
      const { data, error } = await supabase.rpc('get_distinct_provinces');
      if (error) throw error;
      const mapped = (data || []).map((d: any) => ({ code: d.province_code, name: d.province_name }));
      setProvinces(mapped);
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
      const { data, error } = await supabase.rpc('get_distinct_cities', { p_province_code: provinceCode });
      if (error) throw error;
      const mapped = (data || []).map((d: any) => ({ code: d.city_code, name: d.city_name, type: d.city_type || '' }));
      setCities(mapped);
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
      const { data, error } = await supabase.rpc('get_distinct_districts', { p_city_code: cityCode });
      if (error) throw error;
      const mapped = (data || []).map((d: any) => ({ code: d.district_code, name: d.district_name }));
      setDistricts(mapped);
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
      const { data, error } = await supabase.rpc('get_distinct_subdistricts', { p_district_code: districtCode });
      if (error) throw error;
      const mapped = (data || []).map((d: any) => ({ code: d.subdistrict_code, name: d.subdistrict_name }));
      setSubdistricts(mapped);
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
    } finally {
      setLoadingSubdistricts(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinces.find(p => p.code === value);
    onProvinceChange(value, selectedProvince?.name || '');
    onCityChange('', '');
    onDistrictChange('', '');
    onSubdistrictChange('', '');
  };

  const handleCityChange = (value: string) => {
    const selectedCity = cities.find(c => c.code === value);
    onCityChange(value, selectedCity?.name || '');
    onDistrictChange('', '');
    onSubdistrictChange('', '');
  };

  const handleDistrictChange = (value: string) => {
    const selectedDistrict = districts.find(d => d.code === value);
    onDistrictChange(value, selectedDistrict?.name || '');
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
    <div className={cn("space-y-4", className)}>
      {/* Step Indicator */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
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

      {/* Selectors Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Step 1: Province */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {t('profileLocation.province')}
          </Label>
          <Select value={selectedProvinceCode} onValueChange={handleProvinceChange}>
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground">
              <SelectValue placeholder={loadingProvinces ? t('profileLocation.loading') : t('profileLocation.selectProvince')} />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
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
            {t('profileLocation.city')}
          </Label>
          <Select 
            value={selectedCityCode} 
            onValueChange={handleCityChange}
            disabled={!selectedProvinceCode || cities.length === 0}
          >
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground">
              {loadingCities ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{t('profileLocation.loading')}</span>
                </div>
              ) : (
                <SelectValue 
                  placeholder={!selectedProvinceCode ? t('profileLocation.selectProvinceFirst') : t('profileLocation.selectCity')} 
                />
              )}
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
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
            {t('profileLocation.district')}
          </Label>
          <Select 
            value={selectedDistrictCode} 
            onValueChange={handleDistrictChange}
            disabled={!selectedCityCode || districts.length === 0}
          >
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground">
              {loadingDistricts ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{t('profileLocation.loading')}</span>
                </div>
              ) : (
                <SelectValue 
                  placeholder={!selectedCityCode ? t('profileLocation.selectCityFirst') : t('profileLocation.selectDistrict')} 
                />
              )}
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
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
            {t('profileLocation.subdistrict')}
          </Label>
          <Select 
            value={selectedSubdistrictCode} 
            onValueChange={handleSubdistrictChange}
            disabled={!selectedDistrictCode || subdistricts.length === 0}
          >
            <SelectTrigger className="h-9 text-xs bg-background border-border text-foreground">
              {loadingSubdistricts ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{t('profileLocation.loading')}</span>
                </div>
              ) : (
                <SelectValue 
                  placeholder={!selectedDistrictCode ? t('profileLocation.selectDistrictFirst') : t('profileLocation.selectSubdistrict')} 
                />
              )}
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {subdistricts.map((subdistrict) => (
                <SelectItem key={subdistrict.code} value={subdistrict.code} className="text-xs">
                  {subdistrict.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Building/Street Address */}
      <div className="space-y-1 pt-3 border-t border-border/50">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {t('profileLocation.buildingAddress')}
        </Label>
        <Input
          value={buildingAddress}
          onChange={(e) => onBuildingAddressChange(e.target.value)}
          placeholder={t('profileLocation.buildingPlaceholder')}
          className="h-9 text-xs"
          maxLength={200}
        />
      </div>
    </div>
  );
};

export default ProfileLocationSelector;
