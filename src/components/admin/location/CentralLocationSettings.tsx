import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocationSettings, MapCenter, DefaultLocation } from '@/stores/locationSettingsStore';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Globe, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface Province {
  province_code: string;
  province_name: string;
}

interface City {
  city_code: string;
  city_name: string;
  province_code: string;
}

export const CentralLocationSettings = () => {
  const { settings, fetchSettings, updateMapCenter, updateDefaultProvince, updateDefaultCity, isLoading } = useLocationSettings();
  const [localMapCenter, setLocalMapCenter] = useState<MapCenter>(settings.defaultMapCenter);
  const [selectedProvince, setSelectedProvince] = useState<string>(settings.defaultProvince?.code || '');
  const [selectedCity, setSelectedCity] = useState<string>(settings.defaultCity?.code || '');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch provinces
  const { data: provinces = [] } = useQuery({
    queryKey: ['provinces-for-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_code, province_name')
        .eq('is_active', true)
        .order('province_name');
      
      if (error) throw error;
      
      // Get unique provinces
      const uniqueProvinces = data?.reduce((acc: Province[], curr) => {
        if (curr.province_code && curr.province_name && !acc.find(p => p.province_code === curr.province_code)) {
          acc.push({ province_code: curr.province_code, province_name: curr.province_name });
        }
        return acc;
      }, []) || [];
      
      return uniqueProvinces;
    },
  });

  // Fetch cities based on selected province
  const { data: cities = [] } = useQuery({
    queryKey: ['cities-for-settings', selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('city_code, city_name, province_code')
        .eq('province_code', selectedProvince)
        .eq('is_active', true)
        .order('city_name');
      
      if (error) throw error;
      
      // Get unique cities
      const uniqueCities = data?.reduce((acc: City[], curr) => {
        if (curr.city_code && curr.city_name && !acc.find(c => c.city_code === curr.city_code)) {
          acc.push({ city_code: curr.city_code, city_name: curr.city_name, province_code: curr.province_code || '' });
        }
        return acc;
      }, []) || [];
      
      return uniqueCities;
    },
    enabled: !!selectedProvince,
  });

  // Sync local state with store
  useEffect(() => {
    if (settings.isLoaded) {
      setLocalMapCenter(settings.defaultMapCenter);
      setSelectedProvince(settings.defaultProvince?.code || '');
      setSelectedCity(settings.defaultCity?.code || '');
    }
  }, [settings.isLoaded, settings.defaultMapCenter, settings.defaultProvince, settings.defaultCity]);

  const handleSaveMapCenter = async () => {
    setIsSaving(true);
    try {
      await updateMapCenter(localMapCenter);
      toast.success('Map center settings saved!');
    } catch (error) {
      toast.error('Failed to save map center settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProvinceChange = async (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedCity('');
    
    const province = provinces.find(p => p.province_code === provinceCode);
    if (province) {
      try {
        await updateDefaultProvince({
          code: province.province_code,
          name: province.province_name,
        });
        
        // Update map center to province
        const provinceCoords = getProvinceCoordinates(province.province_name);
        if (provinceCoords) {
          setLocalMapCenter(prev => ({
            ...prev,
            ...provinceCoords,
            province: province.province_name,
          }));
        }
        
        toast.success(`Default province set to ${province.province_name}`);
      } catch (error) {
        toast.error('Failed to update default province');
      }
    }
  };

  const handleCityChange = async (cityCode: string) => {
    setSelectedCity(cityCode);
    
    const city = cities.find(c => c.city_code === cityCode);
    if (city) {
      try {
        await updateDefaultCity({
          code: city.city_code,
          name: city.city_name,
          province_code: city.province_code,
        });
        
        // Update map center to city
        const cityCoords = getCityCoordinates(city.city_name);
        if (cityCoords) {
          setLocalMapCenter(prev => ({
            ...prev,
            ...cityCoords,
            city: city.city_name,
          }));
        }
        
        toast.success(`Default city set to ${city.city_name}`);
      } catch (error) {
        toast.error('Failed to update default city');
      }
    }
  };

  // Common Indonesian city coordinates
  const getCityCoordinates = (cityName: string): Partial<MapCenter> | null => {
    const coords: Record<string, { latitude: number; longitude: number; zoom: number }> = {
      'Jakarta': { latitude: -6.2088, longitude: 106.8456, zoom: 12 },
      'Jakarta Pusat': { latitude: -6.1864, longitude: 106.8341, zoom: 13 },
      'Jakarta Selatan': { latitude: -6.2615, longitude: 106.8106, zoom: 12 },
      'Jakarta Barat': { latitude: -6.1352, longitude: 106.7502, zoom: 12 },
      'Jakarta Timur': { latitude: -6.2250, longitude: 106.9004, zoom: 12 },
      'Jakarta Utara': { latitude: -6.1481, longitude: 106.8998, zoom: 12 },
      'Surabaya': { latitude: -7.2575, longitude: 112.7521, zoom: 12 },
      'Bandung': { latitude: -6.9175, longitude: 107.6191, zoom: 12 },
      'Medan': { latitude: 3.5952, longitude: 98.6722, zoom: 12 },
      'Semarang': { latitude: -6.9932, longitude: 110.4203, zoom: 12 },
      'Makassar': { latitude: -5.1477, longitude: 119.4327, zoom: 12 },
      'Palembang': { latitude: -2.9761, longitude: 104.7754, zoom: 12 },
      'Tangerang': { latitude: -6.1783, longitude: 106.6319, zoom: 12 },
      'Depok': { latitude: -6.4025, longitude: 106.7942, zoom: 12 },
      'Bekasi': { latitude: -6.2349, longitude: 106.9896, zoom: 12 },
      'Bogor': { latitude: -6.5971, longitude: 106.8060, zoom: 12 },
      'Yogyakarta': { latitude: -7.7956, longitude: 110.3695, zoom: 12 },
      'Denpasar': { latitude: -8.6705, longitude: 115.2126, zoom: 12 },
      'Malang': { latitude: -7.9666, longitude: 112.6326, zoom: 12 },
    };
    
    for (const [key, value] of Object.entries(coords)) {
      if (cityName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return null;
  };

  const getProvinceCoordinates = (provinceName: string): Partial<MapCenter> | null => {
    const coords: Record<string, { latitude: number; longitude: number; zoom: number }> = {
      'DKI Jakarta': { latitude: -6.2088, longitude: 106.8456, zoom: 11 },
      'Jawa Barat': { latitude: -6.9175, longitude: 107.6191, zoom: 9 },
      'Jawa Tengah': { latitude: -7.1500, longitude: 110.1403, zoom: 8 },
      'Jawa Timur': { latitude: -7.5361, longitude: 112.2384, zoom: 8 },
      'Bali': { latitude: -8.4095, longitude: 115.1889, zoom: 10 },
      'Sumatera Utara': { latitude: 2.1154, longitude: 99.5451, zoom: 8 },
      'Sulawesi Selatan': { latitude: -3.6688, longitude: 119.9741, zoom: 8 },
      'Kalimantan Timur': { latitude: 0.5387, longitude: 116.4194, zoom: 7 },
      'Banten': { latitude: -6.4058, longitude: 106.0640, zoom: 9 },
    };
    
    for (const [key, value] of Object.entries(coords)) {
      if (provinceName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Central Location Settings
          </CardTitle>
          <CardDescription>
            Configure default location settings that apply across all pages and maps in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Province & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Province</Label>
              <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.province_code} value={province.province_code}>
                      {province.province_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This province will be pre-selected in location dropdowns
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default City</Label>
              <Select 
                value={selectedCity} 
                onValueChange={handleCityChange}
                disabled={!selectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.city_code} value={city.city_code}>
                      {city.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This city will be pre-selected in location dropdowns
              </p>
            </div>
          </div>

          {/* Map Center Settings */}
          <div className="border-t pt-4">
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4" />
              Default Map Center
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={localMapCenter.latitude}
                  onChange={(e) => setLocalMapCenter(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={localMapCenter.longitude}
                  onChange={(e) => setLocalMapCenter(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Zoom Level</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={localMapCenter.zoom}
                  onChange={(e) => setLocalMapCenter(prev => ({ ...prev, zoom: parseInt(e.target.value) || 12 }))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveMapCenter} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Map Settings'}
              </Button>
              <Button variant="outline" onClick={() => fetchSettings()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Reload
              </Button>
            </div>
          </div>

          {/* Current Settings Preview */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Current Settings Preview</h4>
            <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
              <p><strong>Province:</strong> {settings.defaultProvince?.name || 'Not set'}</p>
              <p><strong>City:</strong> {settings.defaultCity?.name || 'Not set'}</p>
              <p><strong>Map Center:</strong> [{settings.defaultMapCenter.latitude}, {settings.defaultMapCenter.longitude}] @ zoom {settings.defaultMapCenter.zoom}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CentralLocationSettings;
