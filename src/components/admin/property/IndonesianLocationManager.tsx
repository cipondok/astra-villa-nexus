import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Plus, Edit, Trash2, Globe, Building2, Home, RefreshCw, CloudDownload, CheckCircle2, AlertCircle, Database, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { usePropertyCountsByProvince, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_COLORS } from '@/hooks/usePropertyCountsByProvince';

interface Location {
  id: string;
  province_code: string;
  province_name: string;
  city_code: string;
  city_name: string;
  city_type: 'KOTA' | 'KABUPATEN';
  district_code?: string;
  district_name?: string;
  subdistrict_code?: string;
  subdistrict_name?: string;
  postal_code?: string;
  area_name: string;
  population?: number;
  area_km2?: number;
  is_capital?: boolean;
  is_active: boolean;
  coordinates?: { lat: number; lng: number };
}

interface SyncProgress {
  step: string;
  logs: string[];
  stats: {
    provinces: number;
    cities: number;
    districts: number;
    villages: number;
    inserted: number;
    updated: number;
    errors: number;
  };
  changes: { type: string; name: string; action: string }[];
  isComplete: boolean;
  hasError: boolean;
  remaining?: number;
}

const IndonesianLocationManager = () => {
  const [activeTab, setActiveTab] = useState('provinces');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('all');
  const [selectedPostalCode, setSelectedPostalCode] = useState('all');
  const [provincePage, setProvincePage] = useState(1);
  const [cityPage, setCityPage] = useState(1);
  const [districtPage, setDistrictPage] = useState(1);
  const [subdistrictPage, setSubdistrictPage] = useState(1);
  const PAGE_SIZE = 15;
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMode, setSyncMode] = useState<'provinces' | 'districts' | 'single-province'>('provinces');
  const [selectedSyncProvince, setSelectedSyncProvince] = useState<string>('');
  const [includeVillages, setIncludeVillages] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [newLocation, setNewLocation] = useState({
    province_code: '',
    province_name: '',
    city_code: '',
    city_name: '',
    city_type: 'KOTA' as 'KOTA' | 'KABUPATEN',
    district_code: '',
    district_name: '',
    subdistrict_code: '',
    subdistrict_name: '',
    postal_code: '',
    area_name: '',
    population: '',
    area_km2: '',
    is_capital: false,
    coordinates_lat: '',
    coordinates_lng: ''
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { data: provincePropCounts } = usePropertyCountsByProvince();

  // Fetch accurate counts directly from database using RPC function (bypasses 1000 row limit)
  const { data: locationStats } = useQuery({
    queryKey: ['location-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_location_stats');
      
      if (error) {
        console.error('Error fetching location stats:', error);
        return { provinces: 0, cities: 0, districts: 0, subdistricts: 0 };
      }
      
      return data as {
        provinces: number;
        cities: number;
        districts: number;
        subdistricts: number;
      };
    },
  });

  // Fetch all unique provinces via RPC (bypasses row limit)
  const { data: allProvinceData, refetch: refetchProvinces } = useQuery({
    queryKey: ['all-provinces-unique'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_distinct_provinces');
      if (error) throw error;
      return (data || []).map((p: any) => ({ code: p.province_code, name: p.province_name }));
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  // Fetch all cities via RPC for cities tab
  const { data: allCitiesTabData } = useQuery({
    queryKey: ['all-cities-tab', selectedProvince],
    queryFn: async () => {
      const prov = selectedProvince === 'all' ? null : selectedProvince;
      const { data, error } = await supabase.rpc('get_distinct_cities', { p_province_code: prov });
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
  });

  // Fetch all districts via RPC for districts tab
  const { data: allDistrictsTabData } = useQuery({
    queryKey: ['all-districts-tab', selectedProvince, selectedCity],
    queryFn: async () => {
      const prov = selectedProvince === 'all' ? null : selectedProvince;
      const city = selectedCity === 'all' ? null : selectedCity;
      const { data, error } = await supabase.rpc('get_distinct_districts', { p_province_code: prov, p_city_code: city });
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
  });

  // Fetch all subdistricts via RPC for subdistricts tab
  const { data: allSubdistrictsTabData } = useQuery({
    queryKey: ['all-subdistricts-tab', selectedProvince, selectedCity, selectedDistrict],
    queryFn: async () => {
      const prov = selectedProvince === 'all' ? null : selectedProvince;
      const city = selectedCity === 'all' ? null : selectedCity;
      const dist = selectedDistrict === 'all' ? null : selectedDistrict;
      const { data, error } = await supabase.rpc('get_distinct_subdistricts', { p_province_code: prov, p_city_code: city, p_district_code: dist });
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
  });

  // Fetch locations (with filters applied) - use cascading filters for efficiency
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', searchTerm, selectedProvince, selectedCity, selectedDistrict],
    queryFn: async () => {
      let query = supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('province_name', { ascending: true })
        .limit(100000);

      if (searchTerm) {
        query = query.or(`province_name.ilike.%${searchTerm}%,city_name.ilike.%${searchTerm}%,district_name.ilike.%${searchTerm}%,area_name.ilike.%${searchTerm}%`);
      }

      if (selectedProvince && selectedProvince !== 'all') {
        query = query.eq('province_code', selectedProvince);
      }

      if (selectedCity && selectedCity !== 'all') {
        query = query.eq('city_code', selectedCity);
      }

      if (selectedDistrict && selectedDistrict !== 'all') {
        query = query.eq('district_code', selectedDistrict);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Location[];
    },
    staleTime: 0,
  });

  // Fetch cities for the selected province (for cascading dropdown)
  const { data: filteredCitiesData } = useQuery({
    queryKey: ['cities-by-province', selectedProvince],
    queryFn: async () => {
      if (!selectedProvince || selectedProvince === 'all') return [];
      const { data, error } = await supabase
        .from('locations')
        .select('city_code, city_name, city_type')
        .eq('province_code', selectedProvince)
        .eq('is_active', true)
        .not('city_code', 'eq', '')
        .limit(100000);
      if (error) throw error;
      const uniqueMap = new Map<string, { code: string; name: string; type: string }>();
      data?.forEach(l => {
        if (l.city_code && !uniqueMap.has(l.city_code)) {
          uniqueMap.set(l.city_code, { code: l.city_code, name: l.city_name, type: l.city_type });
        }
      });
      return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: !!selectedProvince && selectedProvince !== 'all',
  });

  // Fetch districts for selected city (for cascading dropdown)
  const { data: filteredDistrictsData } = useQuery({
    queryKey: ['districts-by-city', selectedCity],
    queryFn: async () => {
      if (!selectedCity || selectedCity === 'all') return [];
      const { data, error } = await supabase
        .from('locations')
        .select('district_code, district_name')
        .eq('city_code', selectedCity)
        .eq('is_active', true)
        .not('district_code', 'is', null)
        .not('district_code', 'eq', '')
        .limit(100000);
      if (error) throw error;
      const uniqueMap = new Map<string, { code: string; name: string }>();
      data?.forEach(l => {
        if (l.district_code && !uniqueMap.has(l.district_code)) {
          uniqueMap.set(l.district_code, { code: l.district_code, name: l.district_name || '' });
        }
      });
      return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: !!selectedCity && selectedCity !== 'all',
  });

  // Use allProvinceData for accurate province count
  const provinces = allProvinceData || [];
  
  // Use cascading data from dedicated queries
  const cities = filteredCitiesData || [];
  const districts = filteredDistrictsData || [];

  // Get all unique cities from loaded data for cities tab
  const allUniqueCities = locations ? 
    Array.from(new Map(locations.filter(l => l.city_code && l.city_code.trim() !== '').map(l => [l.city_code, { code: l.city_code, name: l.city_name, province: l.province_name }])).values()) : [];
  const allCities = allUniqueCities.sort((a, b) => a.name.localeCompare(b.name));

  // Get all unique districts from loaded data for districts tab
  const allUniqueDistricts = locations ? 
    Array.from(new Map(locations.filter(l => l.district_code && l.district_name).map(l => [l.district_code, { 
      code: l.district_code!, 
      name: l.district_name!, 
      city: l.city_name,
      province: l.province_name 
    }])).values()) : [];
  const allDistricts = allUniqueDistricts.sort((a, b) => a.name.localeCompare(b.name));

  // Get all unique subdistricts from loaded data for subdistricts tab
  const allUniqueSubdistricts = locations ? 
    Array.from(new Map(locations.filter(l => l.subdistrict_code && l.subdistrict_name).map(l => [l.subdistrict_code, { 
      code: l.subdistrict_code!, 
      name: l.subdistrict_name!, 
      district: l.district_name,
      city: l.city_name,
      province: l.province_name 
    }])).values()) : [];
  const allSubdistricts = allUniqueSubdistricts.sort((a, b) => a.name.localeCompare(b.name));

  // Get all unique postal codes
  const allUniquePostalCodes = locations ? 
    Array.from(new Map(locations.filter(l => l.postal_code).map(l => [l.postal_code, { 
      code: l.postal_code!, 
      area: l.area_name,
      city: l.city_name,
      province: l.province_name 
    }])).values()) : [];
  const allPostalCodes = allUniquePostalCodes.sort((a, b) => a.code.localeCompare(b.code));

  // Mutations
  const createLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const processedData = {
        ...locationData,
        population: locationData.population ? parseInt(locationData.population) : null,
        area_km2: locationData.area_km2 ? parseFloat(locationData.area_km2) : null,
        coordinates: (locationData.coordinates_lat && locationData.coordinates_lng) 
          ? `(${locationData.coordinates_lat},${locationData.coordinates_lng})` 
          : null,
      };
      
      // Remove coordinate fields that aren't in the table
      delete processedData.coordinates_lat;
      delete processedData.coordinates_lng;

      const { error } = await supabase.from('locations').insert([processedData]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Location Added', 'Location has been added successfully');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location-stats'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      // 23505 = unique_violation (duplicate entry)
      const isDuplicate = error?.code === '23505' ||
        /locations_no_true_duplicates_uidx/i.test(String(error?.message || ''));

      if (isDuplicate) {
        showError('Duplicate entry', 'This exact location already exists in the database.');
        return;
      }

      showError('Error', error.message);
    }
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Location Updated', 'Location has been updated successfully');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location-stats'] });
      setEditingLocation(null);
    },
    onError: (error: any) => {
      showError('Error', error.message);
    }
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Location Deleted', 'Location has been deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location-stats'] });
    },
    onError: (error: any) => {
      showError('Error', error.message);
    }
  });

  // Sync locations from official BPS API with progress tracking
  const handleSyncLocations = async () => {
    if (syncMode === 'single-province' && !selectedSyncProvince) {
      toast.error('Pilih provinsi terlebih dahulu');
      return;
    }
    
    setIsSyncing(true);
    setShowSyncDialog(true);
    setSyncProgress({
      step: 'Memulai sinkronisasi...',
      logs: ['Menghubungi server BPS...'],
      stats: { provinces: 0, cities: 0, districts: 0, villages: 0, inserted: 0, updated: 0, errors: 0 },
      changes: [],
      isComplete: false,
      hasError: false
    });

    try {
      const modeDescriptions = {
        'provinces': 'Provinsi saja (Level 1)',
        'districts': 'Batch 3 provinsi dengan kota & kecamatan',
        'single-province': 'Satu provinsi lengkap',
      };
      
      setSyncProgress(prev => prev ? {
        ...prev,
        step: `Mode: ${modeDescriptions[syncMode]}`,
        logs: [...prev.logs, `Mode: ${modeDescriptions[syncMode]}`]
      } : null);
      
      const { data, error } = await supabase.functions.invoke('sync-indonesia-locations', {
        body: { 
          mode: syncMode,
          provinceId: syncMode === 'single-province' ? selectedSyncProvince : undefined,
          includeVillages: includeVillages
        }
      });

      if (error) throw error;

      if (data?.success) {
        setSyncProgress(prev => prev ? {
          ...prev,
          step: 'Sinkronisasi selesai!',
          logs: [...(data.progress || [])],
          stats: data.stats || prev.stats,
          changes: data.changes || [],
          isComplete: true,
          hasError: false,
          remaining: data.remaining
        } : null);
        
        queryClient.invalidateQueries({ queryKey: ['locations'] });
        queryClient.invalidateQueries({ queryKey: ['location-stats'] });
        queryClient.invalidateQueries({ queryKey: ['all-provinces-unique'] });
        
        const stats = data?.stats;
        let description = stats
          ? `Provinsi: ${stats.provinces}, Kota/Kab: ${stats.cities}, Kecamatan: ${stats.districts}`
          : 'Sync selesai.';

        if (stats?.villages && stats.villages > 0) {
          description += `, Kelurahan: ${stats.villages}`;
        }
        if (data?.remaining && data.remaining > 0) {
          description += ` | Tersisa: ${data.remaining} provinsi`;
        }
        toast.success('Sinkronisasi selesai!', { description });
      } else {
        throw new Error(data?.error || 'Sinkronisasi gagal');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncProgress(prev => prev ? {
        ...prev,
        step: 'Error!',
        logs: [...prev.logs, `Error: ${err.message}`],
        isComplete: true,
        hasError: true
      } : null);
      toast.error('Sinkronisasi gagal', { description: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const resetForm = () => {
    setNewLocation({
      province_code: '',
      province_name: '',
      city_code: '',
      city_name: '',
      city_type: 'KOTA' as 'KOTA' | 'KABUPATEN',
      district_code: '',
      district_name: '',
      subdistrict_code: '',
      subdistrict_name: '',
      postal_code: '',
      area_name: '',
      population: '',
      area_km2: '',
      is_capital: false,
      coordinates_lat: '',
      coordinates_lng: ''
    });
  };

  const handleSubmit = () => {
    if (editingLocation) {
      const updates = { ...newLocation };
      // Process coordinates and numeric fields
      if (updates.coordinates_lat && updates.coordinates_lng) {
        (updates as any).coordinates = `(${updates.coordinates_lat},${updates.coordinates_lng})`;
      }
      delete (updates as any).coordinates_lat;
      delete (updates as any).coordinates_lng;
      
      updateLocationMutation.mutate({ 
        id: editingLocation.id, 
        updates: {
          ...updates,
          population: updates.population ? parseInt(updates.population) : null,
          area_km2: updates.area_km2 ? parseFloat(updates.area_km2) : null,
        }
      });
    } else {
      createLocationMutation.mutate(newLocation);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setNewLocation({
      province_code: location.province_code,
      province_name: location.province_name,
      city_code: location.city_code,
      city_name: location.city_name,
      city_type: location.city_type,
      district_code: location.district_code || '',
      district_name: location.district_name || '',
      subdistrict_code: location.subdistrict_code || '',
      subdistrict_name: location.subdistrict_name || '',
      postal_code: location.postal_code || '',
      area_name: location.area_name,
      population: location.population?.toString() || '',
      area_km2: location.area_km2?.toString() || '',
      is_capital: location.is_capital || false,
      coordinates_lat: location.coordinates?.lat?.toString() || '',
      coordinates_lng: location.coordinates?.lng?.toString() || ''
    });
    setIsAddDialogOpen(true);
  };

  // Calculate sync progress percentage
  const getSyncProgressPercentage = () => {
    if (!syncProgress) return 0;
    if (syncProgress.isComplete) return 100;
    const { provinces, cities, districts } = syncProgress.stats;
    if (syncMode === 'provinces') return provinces > 0 ? 100 : 50;
    if (syncMode === 'single-province') {
      if (districts > 0) return 90;
      if (cities > 0) return 60;
      if (provinces > 0) return 30;
      return 10;
    }
    return Math.min((provinces / 3) * 100, 95);
  };

  const renderPagination = (totalItems: number, currentPage: number, setPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) return null;
    const startResult = (currentPage - 1) * PAGE_SIZE + 1;
    const endResult = Math.min(currentPage * PAGE_SIZE, totalItems);
    const maxButtons = 5;
    let startBtn = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endBtn = Math.min(totalPages, startBtn + maxButtons - 1);
    if (endBtn - startBtn < maxButtons - 1) startBtn = Math.max(1, endBtn - maxButtons + 1);
    const pages: number[] = [];
    for (let i = startBtn; i <= endBtn; i++) pages.push(i);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-3 px-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Menampilkan <span className="font-medium">{startResult}</span>–<span className="font-medium">{endResult}</span> dari <span className="font-medium">{totalItems}</span>
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          {startBtn > 1 && <span className="px-1 text-xs text-muted-foreground">…</span>}
          {pages.map(p => (
            <Button key={p} variant={p === currentPage ? "default" : "outline"} size="sm" className="h-7 min-w-[28px] px-2 text-xs" onClick={() => setPage(p)}>{p}</Button>
          ))}
          {endBtn < totalPages && <span className="px-1 text-xs text-muted-foreground">…</span>}
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sync Progress Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSyncing ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : syncProgress?.hasError ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-chart-1" />
              )}
              Sinkronisasi Lokasi Indonesia
            </DialogTitle>
            <DialogDescription>
              {syncProgress?.step || 'Mempersiapkan...'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{getSyncProgressPercentage().toFixed(0)}%</span>
              </div>
              <Progress value={getSyncProgressPercentage()} className="h-2" />
            </div>

            {/* Stats Cards */}
            {syncProgress && (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{syncProgress.stats.provinces}</div>
                  <div className="text-xs text-muted-foreground">Provinsi</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{syncProgress.stats.cities}</div>
                  <div className="text-xs text-muted-foreground">Kota/Kab</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{syncProgress.stats.districts}</div>
                  <div className="text-xs text-muted-foreground">Kecamatan</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{syncProgress.stats.villages}</div>
                  <div className="text-xs text-muted-foreground">Kelurahan</div>
                </div>
              </div>
            )}

            {/* Database Changes */}
            {syncProgress && (syncProgress.stats.inserted > 0 || syncProgress.stats.updated > 0) && (
              <div className="flex gap-4 justify-center py-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-chart-1" />
                  <span className="text-sm"><strong>{syncProgress.stats.inserted}</strong> disimpan</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-chart-2" />
                  <span className="text-sm"><strong>{syncProgress.stats.updated}</strong> diperbarui</span>
                </div>
                {syncProgress.stats.errors > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm"><strong>{syncProgress.stats.errors}</strong> error</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress Logs */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Log Proses:</Label>
              <ScrollArea className="h-40 rounded-md border bg-muted/30 p-3">
                <div className="space-y-1 font-mono text-xs">
                  {syncProgress?.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground">[{i + 1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {isSyncing && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Recent Changes */}
            {syncProgress && syncProgress.changes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Perubahan Terbaru ({syncProgress.changes.length}):</Label>
                <ScrollArea className="h-32 rounded-md border bg-muted/30 p-3">
                  <div className="space-y-1 text-xs">
                    {syncProgress.changes.slice(0, 30).map((change, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant={change.action === 'inserted' ? 'default' : 'secondary'} className="text-[10px] h-4">
                          {change.type}
                        </Badge>
                        <span>{change.name}</span>
                        <span className="text-muted-foreground">- {change.action}</span>
                      </div>
                    ))}
                    {syncProgress.changes.length > 30 && (
                      <div className="text-muted-foreground">... dan {syncProgress.changes.length - 30} lainnya</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Remaining Info */}
            {syncProgress?.remaining !== undefined && syncProgress.remaining > 0 && (
              <div className="bg-chart-5/10 border border-chart-5/20 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-chart-5" />
                  <span>Masih ada <strong>{syncProgress.remaining}</strong> provinsi yang belum disinkronkan. Jalankan lagi untuk melanjutkan.</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSyncDialog(false)}
              disabled={isSyncing}
            >
              {syncProgress?.isComplete ? 'Tutup' : 'Batal'}
            </Button>
            {syncProgress?.isComplete && syncProgress.remaining !== undefined && syncProgress.remaining > 0 && (
              <Button onClick={handleSyncLocations} disabled={isSyncing}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Lanjutkan Sinkronisasi
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pengelolaan Wilayah Indonesia
          </CardTitle>
          <CardDescription>
            Kelola provinsi, kota/kabupaten, kecamatan, dan kelurahan/desa untuk listing properti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="provinces" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Provinsi ({locationStats?.provinces ?? 0})
              </TabsTrigger>
              <TabsTrigger value="cities" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Kota/Kabupaten ({locationStats?.cities ?? 0})
              </TabsTrigger>
              <TabsTrigger value="districts" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Kecamatan ({locationStats?.districts ?? 0})
              </TabsTrigger>
              <TabsTrigger value="subdistricts" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Kelurahan/Desa ({locationStats?.subdistricts ?? 0})
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Kelola
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2 items-center">
                <Input
                  placeholder="Cari lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                {/* Step 1: Province */}
                <Select value={selectedProvince} onValueChange={(v) => {
                  setSelectedProvince(v);
                  setSelectedCity('all');
                  setSelectedDistrict('all');
                  setSelectedSubdistrict('all');
                }}>
                  <SelectTrigger className="w-48 bg-card border-border">
                    <SelectValue placeholder={`Provinsi (${locationStats?.provinces ?? 0})`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-y-auto bg-card border-border z-50">
                    <SelectItem value="all" className="font-medium">
                      Semua Provinsi ({locationStats?.provinces ?? provinces.length})
                    </SelectItem>
                    {provinces.map((prov) => (
                      <SelectItem key={prov.code} value={prov.code}>
                        {prov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Step 2: City (only when province selected) */}
                {selectedProvince && selectedProvince !== 'all' && (
                  <Select value={selectedCity} onValueChange={(v) => {
                    setSelectedCity(v);
                    setSelectedDistrict('all');
                    setSelectedSubdistrict('all');
                  }}>
                    <SelectTrigger className="w-52 bg-card border-border">
                      <SelectValue placeholder={`Kota/Kab (${cities.length})`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto bg-card border-border z-50">
                      <SelectItem value="all" className="font-medium">
                        Semua Kota/Kab ({cities.length})
                      </SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Step 3: District (only when city selected) */}
                {selectedCity && selectedCity !== 'all' && (
                  <Select value={selectedDistrict} onValueChange={(v) => {
                    setSelectedDistrict(v);
                    setSelectedSubdistrict('all');
                  }}>
                    <SelectTrigger className="w-48 bg-card border-border">
                      <SelectValue placeholder={`Kecamatan (${districts.length})`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto bg-card border-border z-50">
                      <SelectItem value="all" className="font-medium">
                        Semua Kecamatan ({districts.length})
                      </SelectItem>
                      {districts.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Step 4: Subdistrict filter (from loaded data) */}
                {selectedDistrict && selectedDistrict !== 'all' && allSubdistricts.length > 0 && (
                  <Select value={selectedSubdistrict} onValueChange={setSelectedSubdistrict}>
                    <SelectTrigger className="w-52 bg-card border-border">
                      <SelectValue placeholder={`Kelurahan (${allSubdistricts.length})`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto bg-card border-border z-50">
                      <SelectItem value="all" className="font-medium">
                        Semua Kelurahan ({allSubdistricts.length})
                      </SelectItem>
                      {allSubdistricts.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <Select value={syncMode} onValueChange={(v) => setSyncMode(v as any)}>
                  <SelectTrigger className="w-52 bg-card border-border">
                    <SelectValue placeholder="Pilih mode sync" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="provinces">Provinsi Saja (Level 1)</SelectItem>
                    <SelectItem value="districts">Batch 3 Provinsi + Kecamatan</SelectItem>
                    <SelectItem value="single-province">Pilih 1 Provinsi Lengkap</SelectItem>
                  </SelectContent>
                </Select>
                
                {syncMode === 'single-province' && (
                  <Select value={selectedSyncProvince} onValueChange={setSelectedSyncProvince}>
                    <SelectTrigger className="w-48 bg-card border-border">
                      <SelectValue placeholder="Pilih provinsi" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto bg-card border-border z-50">
                      {provinces.map((prov) => (
                        <SelectItem key={prov.code} value={prov.code}>
                          {prov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {syncMode === 'single-province' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeVillages"
                      checked={includeVillages}
                      onCheckedChange={(checked) => setIncludeVillages(checked as boolean)}
                    />
                    <label htmlFor="includeVillages" className="text-sm cursor-pointer">
                      + Kelurahan
                    </label>
                  </div>
                )}

                <Button 
                  onClick={handleSyncLocations} 
                  disabled={isSyncing}
                  variant="outline"
                  className="gap-2"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CloudDownload className="h-4 w-4" />
                  )}
                  {isSyncing ? 'Syncing...' : 'Sync BPS'}
                </Button>

                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) {
                    setEditingLocation(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Lokasi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</DialogTitle>
                      <DialogDescription>
                        {editingLocation ? 'Perbarui data lokasi yang sudah ada' : 'Isi data untuk menambahkan lokasi baru'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="province_code">Kode Provinsi</Label>
                          <Input
                            id="province_code"
                            value={newLocation.province_code}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, province_code: e.target.value }))}
                            placeholder="11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="province_name">Nama Provinsi</Label>
                          <Input
                            id="province_name"
                            value={newLocation.province_name}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, province_name: e.target.value }))}
                            placeholder="Aceh"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city_code">Kode Kota/Kab</Label>
                          <Input
                            id="city_code"
                            value={newLocation.city_code}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, city_code: e.target.value }))}
                            placeholder="1101"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city_name">Nama Kota/Kab</Label>
                          <Input
                            id="city_name"
                            value={newLocation.city_name}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, city_name: e.target.value }))}
                            placeholder="Banda Aceh"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city_type">Tipe</Label>
                          <Select 
                            value={newLocation.city_type} 
                            onValueChange={(v) => setNewLocation(prev => ({ ...prev, city_type: v as 'KOTA' | 'KABUPATEN' }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="KOTA">Kota</SelectItem>
                              <SelectItem value="KABUPATEN">Kabupaten</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="district_code">Kode Kecamatan</Label>
                          <Input
                            id="district_code"
                            value={newLocation.district_code}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, district_code: e.target.value }))}
                            placeholder="110101"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district_name">Nama Kecamatan</Label>
                          <Input
                            id="district_name"
                            value={newLocation.district_name}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, district_name: e.target.value }))}
                            placeholder="Baiturrahman"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subdistrict_code">Kode Kelurahan/Desa</Label>
                          <Input
                            id="subdistrict_code"
                            value={newLocation.subdistrict_code}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, subdistrict_code: e.target.value }))}
                            placeholder="1101010001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subdistrict_name">Nama Kelurahan/Desa</Label>
                          <Input
                            id="subdistrict_name"
                            value={newLocation.subdistrict_name}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, subdistrict_name: e.target.value }))}
                            placeholder="Ateuk Jawo"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Kode Pos</Label>
                          <Input
                            id="postal_code"
                            value={newLocation.postal_code}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, postal_code: e.target.value }))}
                            placeholder="23241"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="area_name">Nama Area</Label>
                          <Input
                            id="area_name"
                            value={newLocation.area_name}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, area_name: e.target.value }))}
                            placeholder="Ateuk Jawo, Baiturrahman"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="population">Populasi</Label>
                          <Input
                            id="population"
                            type="number"
                            value={newLocation.population}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, population: e.target.value }))}
                            placeholder="50000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="area_km2">Luas (km²)</Label>
                          <Input
                            id="area_km2"
                            type="number"
                            step="0.01"
                            value={newLocation.area_km2}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, area_km2: e.target.value }))}
                            placeholder="10.5"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coordinates_lat">Latitude</Label>
                          <Input
                            id="coordinates_lat"
                            type="number"
                            step="any"
                            value={newLocation.coordinates_lat}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, coordinates_lat: e.target.value }))}
                            placeholder="5.5483"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coordinates_lng">Longitude</Label>
                          <Input
                            id="coordinates_lng"
                            type="number"
                            step="any"
                            value={newLocation.coordinates_lng}
                            onChange={(e) => setNewLocation(prev => ({ ...prev, coordinates_lng: e.target.value }))}
                            placeholder="95.3238"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleSubmit}>
                        {editingLocation ? 'Simpan Perubahan' : 'Tambah Lokasi'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Provinces Tab */}
            <TabsContent value="provinces">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Provinsi</TableHead>
                    <TableHead>Jumlah Kota/Kab</TableHead>
                    <TableHead>Property Types</TableHead>
                    <TableHead>Total Properties</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      const allProvs = allProvinceData || [];
                      const paginated = allProvs.slice((provincePage - 1) * PAGE_SIZE, provincePage * PAGE_SIZE);
                      return paginated.map((prov) => {
                        const propTypes = provincePropCounts?.[prov.name] || {};
                        const totalProps = Object.values(propTypes).reduce((s, c) => s + c, 0);
                        return (
                        <TableRow key={prov.code}>
                          <TableCell className="font-mono">{prov.code}</TableCell>
                          <TableCell className="font-medium">{prov.name}</TableCell>
                          <TableCell>
                            {locations?.filter(l => l.province_code === prov.code && l.city_code).length || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(propTypes).map(([type, count]) => (
                                <span key={type} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PROPERTY_TYPE_COLORS[type] || 'bg-muted text-muted-foreground'}`}>
                                  {PROPERTY_TYPE_LABELS[type] || type}: {count}
                                </span>
                              ))}
                              {Object.keys(propTypes).length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {totalProps > 0 ? (
                              <Badge variant="secondary" className="font-bold">{totalProps}</Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Aktif</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                const loc = locations?.find(l => l.province_code === prov.code);
                                if (loc) handleEdit(loc);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );});
                    })()
                  )}
                </TableBody>
              </Table>
              {renderPagination(
                (allProvinceData || []).length,
                provincePage, setProvincePage
              )}
            </TabsContent>

            {/* Cities Tab */}
            <TabsContent value="cities">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Kota/Kabupaten</TableHead>
                    <TableHead>Provinsi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      const cities = allCitiesTabData || [];
                      const paginated = cities.slice((cityPage - 1) * PAGE_SIZE, cityPage * PAGE_SIZE);
                      return paginated.map((c: any) => (
                      <TableRow key={c.city_code}>
                        <TableCell className="font-mono">{c.city_code}</TableCell>
                        <TableCell className="font-medium">{c.city_name}</TableCell>
                        <TableCell>{c.province_name}</TableCell>
                        <TableCell>
                          <Badge variant={c.city_type === 'KOTA' ? 'default' : 'outline'}>
                            {c.city_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Aktif</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              const loc = locations?.find(l => l.city_code === c.city_code);
                              if (loc) handleEdit(loc);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                    })()
                  )}
                </TableBody>
              </Table>
              {renderPagination(
                (allCitiesTabData || []).length,
                cityPage, setCityPage
              )}
            </TabsContent>

            {/* Districts Tab */}
            <TabsContent value="districts">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Kecamatan</TableHead>
                    <TableHead>Kota/Kabupaten</TableHead>
                    <TableHead>Provinsi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      const districts = allDistrictsTabData || [];
                      const paginated = districts.slice((districtPage - 1) * PAGE_SIZE, districtPage * PAGE_SIZE);
                      return paginated.map((d: any) => (
                      <TableRow key={d.district_code}>
                        <TableCell className="font-mono">{d.district_code}</TableCell>
                        <TableCell className="font-medium">{d.district_name}</TableCell>
                        <TableCell>{d.city_name}</TableCell>
                        <TableCell>{d.province_name}</TableCell>
                        <TableCell>
                          <Badge variant="default">Aktif</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              const loc = locations?.find(l => l.district_code === d.district_code);
                              if (loc) handleEdit(loc);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                    })()
                  )}
                </TableBody>
              </Table>
              {renderPagination(
                (allDistrictsTabData || []).length,
                districtPage, setDistrictPage
              )}
            </TabsContent>

            {/* Subdistricts Tab */}
            <TabsContent value="subdistricts">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Kelurahan/Desa</TableHead>
                    <TableHead>Kecamatan</TableHead>
                    <TableHead>Kota/Kabupaten</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      const subs = allSubdistrictsTabData || [];
                      const paginated = subs.slice((subdistrictPage - 1) * PAGE_SIZE, subdistrictPage * PAGE_SIZE);
                      return paginated.map((s: any) => (
                      <TableRow key={s.subdistrict_code}>
                        <TableCell className="font-mono">{s.subdistrict_code}</TableCell>
                        <TableCell className="font-medium">{s.subdistrict_name}</TableCell>
                        <TableCell>{s.district_name}</TableCell>
                        <TableCell>{s.city_name}</TableCell>
                        <TableCell>
                          <Badge variant="default">Aktif</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              const loc = locations?.find(l => l.subdistrict_code === s.subdistrict_code);
                              if (loc) handleEdit(loc);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                    })()
                  )}
                </TableBody>
              </Table>
              {renderPagination(
                (allSubdistrictsTabData || []).length,
                subdistrictPage, setSubdistrictPage
              )}
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Provinsi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{locationStats?.provinces ?? provinces.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Kota/Kabupaten</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{locationStats?.cities ?? allCities.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Kecamatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{locationStats?.districts ?? allDistricts.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Kelurahan/Desa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{locationStats?.subdistricts ?? allSubdistricts.length}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Panduan Sinkronisasi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Provinsi Saja (Level 1)</div>
                        <div className="text-muted-foreground">Sync 34 provinsi saja. Cepat dan ringan.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Batch 3 Provinsi + Kecamatan</div>
                        <div className="text-muted-foreground">Sync 3 provinsi sekaligus dengan kota dan kecamatan. Jalankan berulang sampai selesai.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Pilih 1 Provinsi Lengkap</div>
                        <div className="text-muted-foreground">Sync satu provinsi dengan semua kota, kecamatan, dan opsional kelurahan/desa. Untuk update data terbaru.</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-chart-5/10 border border-chart-5/20 rounded-lg">
                      <div className="flex items-center gap-2 text-chart-5">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Tips:</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Level 3 (Kecamatan) dan Level 4 (Kelurahan/Desa) sering berubah. Gunakan mode "Pilih 1 Provinsi" untuk update data spesifik secara berkala.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndonesianLocationManager;
