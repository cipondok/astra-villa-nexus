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
import { MapPin, Plus, Edit, Trash2, Globe, Building2, Home } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

const IndonesianLocationManager = () => {
  const [activeTab, setActiveTab] = useState('provinces');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
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

  // Fetch locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', searchTerm, selectedProvince, selectedCity],
    queryFn: async () => {
      let query = supabase
        .from('locations')
        .select('*')
        .order('province_name', { ascending: true });

      if (searchTerm) {
        query = query.or(`province_name.ilike.%${searchTerm}%,city_name.ilike.%${searchTerm}%,district_name.ilike.%${searchTerm}%,area_name.ilike.%${searchTerm}%`);
      }

      if (selectedProvince && selectedProvince !== 'all') {
        query = query.eq('province_code', selectedProvince);
      }

      if (selectedCity && selectedCity !== 'all') {
        query = query.eq('city_code', selectedCity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Location[];
    }
  });

  // Get unique provinces and cities for filters
  const provinces = [...new Set(locations?.map(l => ({ code: l.province_code, name: l.province_name })) || [])];
  const cities = selectedProvince && selectedProvince !== 'all'
    ? [...new Set(locations?.filter(l => l.province_code === selectedProvince).map(l => ({ code: l.city_code, name: l.city_name })) || [])]
    : [];

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
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
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
    },
    onError: (error: any) => {
      showError('Error', error.message);
    }
  });

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Indonesian Location Management
          </CardTitle>
          <CardDescription>
            Manage provinces, cities, districts, and areas across Indonesia for property listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="provinces" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Provinces
              </TabsTrigger>
              <TabsTrigger value="cities" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Cities
              </TabsTrigger>
              <TabsTrigger value="districts" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Districts
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manage
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Provinces</SelectItem>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                {selectedProvince && selectedProvince !== 'all' && (
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingLocation(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLocation ? 'Edit Location' : 'Add New Location'}
                    </DialogTitle>
                    <DialogDescription>
                      Enter location details for Indonesian administrative divisions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      <Label>Province Code</Label>
                      <Input
                        value={newLocation.province_code}
                        onChange={(e) => setNewLocation({...newLocation, province_code: e.target.value})}
                        placeholder="e.g., 11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Province Name</Label>
                      <Input
                        value={newLocation.province_name}
                        onChange={(e) => setNewLocation({...newLocation, province_name: e.target.value})}
                        placeholder="e.g., Aceh"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City Code</Label>
                      <Input
                        value={newLocation.city_code}
                        onChange={(e) => setNewLocation({...newLocation, city_code: e.target.value})}
                        placeholder="e.g., 1101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City Name</Label>
                      <Input
                        value={newLocation.city_name}
                        onChange={(e) => setNewLocation({...newLocation, city_name: e.target.value})}
                        placeholder="e.g., Simeulue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City Type</Label>
                      <Select value={newLocation.city_type} onValueChange={(value: 'KOTA' | 'KABUPATEN') => setNewLocation({...newLocation, city_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KOTA">Kota</SelectItem>
                          <SelectItem value="KABUPATEN">Kabupaten</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Area Name</Label>
                      <Input
                        value={newLocation.area_name}
                        onChange={(e) => setNewLocation({...newLocation, area_name: e.target.value})}
                        placeholder="Area or district name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>District Code (Optional)</Label>
                      <Input
                        value={newLocation.district_code}
                        onChange={(e) => setNewLocation({...newLocation, district_code: e.target.value})}
                        placeholder="District code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>District Name (Optional)</Label>
                      <Input
                        value={newLocation.district_name}
                        onChange={(e) => setNewLocation({...newLocation, district_name: e.target.value})}
                        placeholder="District name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postal Code (Optional)</Label>
                      <Input
                        value={newLocation.postal_code}
                        onChange={(e) => setNewLocation({...newLocation, postal_code: e.target.value})}
                        placeholder="Postal code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Population (Optional)</Label>
                      <Input
                        type="number"
                        value={newLocation.population}
                        onChange={(e) => setNewLocation({...newLocation, population: e.target.value})}
                        placeholder="Population count"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Area (km²) (Optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newLocation.area_km2}
                        onChange={(e) => setNewLocation({...newLocation, area_km2: e.target.value})}
                        placeholder="Area in square kilometers"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Latitude (Optional)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={newLocation.coordinates_lat}
                        onChange={(e) => setNewLocation({...newLocation, coordinates_lat: e.target.value})}
                        placeholder="Latitude coordinate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude (Optional)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={newLocation.coordinates_lng}
                        onChange={(e) => setNewLocation({...newLocation, coordinates_lng: e.target.value})}
                        placeholder="Longitude coordinate"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingLocation ? 'Update' : 'Create'} Location
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="provinces" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Indonesian Provinces</CardTitle>
                  <CardDescription>
                    {provinces.length} provinces available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provinces.map((province) => (
                      <Card key={province.code} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{province.name}</h4>
                            <p className="text-sm text-muted-foreground">Code: {province.code}</p>
                            <Badge variant="outline" className="mt-2">
                              {locations?.filter(l => l.province_code === province.code).length} cities
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cities and Regencies</CardTitle>
                  <CardDescription>
                    Manage cities (Kota) and regencies (Kabupaten)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City/Regency</TableHead>
                          <TableHead>Province</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Population</TableHead>
                          <TableHead>Area (km²)</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              Loading locations...
                            </TableCell>
                          </TableRow>
                        ) : locations?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No locations found
                            </TableCell>
                          </TableRow>
                        ) : (
                          locations?.map((location) => (
                            <TableRow key={location.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{location.city_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Code: {location.city_code}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{location.province_name}</TableCell>
                              <TableCell>
                                <Badge variant={location.city_type === 'KOTA' ? 'default' : 'secondary'}>
                                  {location.city_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {location.population ? location.population.toLocaleString() : '-'}
                              </TableCell>
                              <TableCell>
                                {location.area_km2 ? `${location.area_km2.toLocaleString()} km²` : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(location)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => deleteLocationMutation.mutate(location.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="districts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Districts and Sub-districts</CardTitle>
                  <CardDescription>
                    Manage districts (Kecamatan) and sub-districts (Kelurahan/Desa)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>District/Area</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Province</TableHead>
                          <TableHead>Postal Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations?.filter(l => l.district_name || l.area_name).map((location) => (
                          <TableRow key={location.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{location.district_name || location.area_name}</div>
                                {location.subdistrict_name && (
                                  <div className="text-sm text-muted-foreground">
                                    {location.subdistrict_name}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{location.city_name}</TableCell>
                            <TableCell>{location.province_name}</TableCell>
                            <TableCell>{location.postal_code || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={location.is_active ? 'default' : 'secondary'}>
                                {location.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(location)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => deleteLocationMutation.mutate(location.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{locations?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Registered locations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Provinces</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{provinces.length}</div>
                    <p className="text-sm text-muted-foreground">Available provinces</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cities & Regencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {[...new Set(locations?.map(l => l.city_code) || [])].length}
                    </div>
                    <p className="text-sm text-muted-foreground">Cities and regencies</p>
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