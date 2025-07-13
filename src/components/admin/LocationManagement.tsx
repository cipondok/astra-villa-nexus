import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Download,
  Upload,
  TreePine,
  Building,
  Home,
  Globe,
  CheckCircle,
  XCircle,
  Info,
  Archive
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Location {
  id: string;
  province_code: string;
  province_name: string;
  city_code: string;
  city_name: string;
  city_type: string;
  district_code?: string;
  district_name?: string;
  subdistrict_code?: string;
  subdistrict_name?: string;
  postal_code?: string;
  area_name: string;
  coordinates?: any;
  population?: number;
  area_km2?: number;
  is_capital?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const LocationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [activeTab, setActiveTab] = useState('tree');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  
  const queryClient = useQueryClient();

  // Form state for add/edit
  const [formData, setFormData] = useState({
    province_code: '',
    province_name: '',
    city_code: '',
    city_name: '',
    city_type: 'KOTA',
    district_code: '',
    district_name: '',
    subdistrict_code: '',
    subdistrict_name: '',
    postal_code: '',
    area_name: '',
    population: '',
    area_km2: '',
    is_capital: false,
    is_active: true
  });

  // Fetch locations
  const { data: locations = [], isLoading, error } = useQuery({
    queryKey: ['locations', searchTerm, selectedProvince, selectedCity],
    queryFn: async () => {
      let query = supabase
        .from('locations')
        .select('*')
        .order('province_name', { ascending: true })
        .order('city_name', { ascending: true })
        .order('district_name', { ascending: true })
        .order('subdistrict_name', { ascending: true });

      if (searchTerm) {
        query = query.or(`province_name.ilike.%${searchTerm}%,city_name.ilike.%${searchTerm}%,district_name.ilike.%${searchTerm}%,subdistrict_name.ilike.%${searchTerm}%,area_name.ilike.%${searchTerm}%`);
      }

      if (selectedProvince) {
        query = query.eq('province_name', selectedProvince);
      }

      if (selectedCity) {
        query = query.eq('city_name', selectedCity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Location[];
    }
  });

  // Get unique provinces and cities for filters
  const provinces = [...new Set(locations.map(loc => loc.province_name))].sort();
  const cities = selectedProvince 
    ? [...new Set(locations.filter(loc => loc.province_name === selectedProvince).map(loc => loc.city_name))].sort()
    : [];

  // Add location mutation
  const addLocationMutation = useMutation({
    mutationFn: async (newLocation: any) => {
      const locationData = {
        ...newLocation,
        population: newLocation.population ? parseInt(newLocation.population.toString()) : null,
        area_km2: newLocation.area_km2 ? parseFloat(newLocation.area_km2.toString()) : null
      };
      
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location added successfully');
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add location: ${error.message}`);
    }
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const updateData = {
        ...updates,
        population: updates.population ? parseInt(updates.population.toString()) : null,
        area_km2: updates.area_km2 ? parseFloat(updates.area_km2.toString()) : null
      };
      
      const { data, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
      setShowEditDialog(false);
      setEditingLocation(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update location: ${error.message}`);
    }
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
      setShowDeleteDialog(false);
      setLocationToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete location: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      province_code: '',
      province_name: '',
      city_code: '',
      city_name: '',
      city_type: 'KOTA',
      district_code: '',
      district_name: '',
      subdistrict_code: '',
      subdistrict_name: '',
      postal_code: '',
      area_name: '',
      population: '',
      area_km2: '',
      is_capital: false,
      is_active: true
    });
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
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
      is_active: location.is_active
    });
    setShowEditDialog(true);
  };

  const handleDelete = (location: Location) => {
    setLocationToDelete(location);
    setShowDeleteDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.province_name || !formData.city_name || !formData.area_name) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingLocation) {
      updateLocationMutation.mutate({
        id: editingLocation.id,
        updates: formData
      });
    } else {
      addLocationMutation.mutate(formData);
    }
  };

  // Group locations for tree view
  const locationTree = locations.reduce((acc, location) => {
    const provinceKey = location.province_name;
    const cityKey = `${location.province_name}-${location.city_name}`;
    const districtKey = location.district_name ? `${cityKey}-${location.district_name}` : null;

    if (!acc[provinceKey]) {
      acc[provinceKey] = {
        name: location.province_name,
        code: location.province_code,
        cities: {}
      };
    }

    if (!acc[provinceKey].cities[cityKey]) {
      acc[provinceKey].cities[cityKey] = {
        name: location.city_name,
        code: location.city_code,
        type: location.city_type,
        districts: {},
        locations: []
      };
    }

    if (districtKey && location.district_name) {
      if (!acc[provinceKey].cities[cityKey].districts[districtKey]) {
        acc[provinceKey].cities[cityKey].districts[districtKey] = {
          name: location.district_name,
          code: location.district_code,
          subdistricts: []
        };
      }
      acc[provinceKey].cities[cityKey].districts[districtKey].subdistricts.push(location);
    } else {
      acc[provinceKey].cities[cityKey].locations.push(location);
    }

    return acc;
  }, {} as any);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Error loading locations: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Indonesian Location Administration Management
          </CardTitle>
          <CardDescription>
            Manage Indonesian administrative locations including provinces, cities, districts, and subdistricts
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-2 flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Provinces</SelectItem>
                  {provinces.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProvince && (
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex gap-2">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Locations</p>
                <p className="text-2xl font-bold">{locations.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provinces</p>
                <p className="text-2xl font-bold">{provinces.length}</p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cities</p>
                <p className="text-2xl font-bold">{[...new Set(locations.map(l => l.city_name))].length}</p>
              </div>
              <Building className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{locations.filter(l => l.is_active).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tree" className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Tree View
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Table View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tree" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading locations...</div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-auto">
                  {Object.entries(locationTree).map(([provinceName, province]: any) => (
                    <div key={provinceName} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 font-semibold text-lg mb-3">
                        <Globe className="h-5 w-5 text-blue-600" />
                        {province.name} ({province.code})
                      </div>
                      
                      <div className="ml-6 space-y-3">
                        {Object.entries(province.cities).map(([cityKey, city]: any) => (
                          <div key={cityKey} className="border-l-2 border-muted pl-4">
                            <div className="flex items-center gap-2 font-medium mb-2">
                              <Building className="h-4 w-4 text-green-600" />
                              {city.type} {city.name} ({city.code})
                            </div>
                            
                            {Object.keys(city.districts).length > 0 && (
                              <div className="ml-6 space-y-2">
                                {Object.entries(city.districts).map(([districtKey, district]: any) => (
                                  <div key={districtKey} className="border-l-2 border-muted-foreground/30 pl-4">
                                    <div className="flex items-center gap-2 font-medium text-sm mb-1">
                                      <Home className="h-3 w-3 text-orange-600" />
                                      {district.name} ({district.code})
                                    </div>
                                    
                                    <div className="ml-4 space-y-1">
                                      {district.subdistricts.map((location: Location) => (
                                        <div key={location.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-red-500" />
                                            <span>{location.subdistrict_name} - {location.area_name}</span>
                                            {location.postal_code && (
                                              <Badge variant="outline" className="text-xs">{location.postal_code}</Badge>
                                            )}
                                            <Badge variant={location.is_active ? "default" : "secondary"}>
                                              {location.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(location)}>
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(location)}>
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {city.locations.length > 0 && (
                              <div className="ml-6 space-y-1">
                                {city.locations.map((location: Location) => (
                                  <div key={location.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-red-500" />
                                      <span>{location.area_name}</span>
                                      {location.postal_code && (
                                        <Badge variant="outline" className="text-xs">{location.postal_code}</Badge>
                                      )}
                                      <Badge variant={location.is_active ? "default" : "secondary"}>
                                        {location.is_active ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="ghost" onClick={() => handleEdit(location)}>
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => handleDelete(location)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading locations...</div>
              ) : (
                <div className="rounded-md border max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Province</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Subdistrict</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Postal Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">
                            {location.province_name}
                            <br />
                            <span className="text-xs text-muted-foreground">({location.province_code})</span>
                          </TableCell>
                          <TableCell>
                            {location.city_type} {location.city_name}
                            <br />
                            <span className="text-xs text-muted-foreground">({location.city_code})</span>
                          </TableCell>
                          <TableCell>
                            {location.district_name || '-'}
                            {location.district_code && (
                              <><br /><span className="text-xs text-muted-foreground">({location.district_code})</span></>
                            )}
                          </TableCell>
                          <TableCell>
                            {location.subdistrict_name || '-'}
                            {location.subdistrict_code && (
                              <><br /><span className="text-xs text-muted-foreground">({location.subdistrict_code})</span></>
                            )}
                          </TableCell>
                          <TableCell>{location.area_name}</TableCell>
                          <TableCell>{location.postal_code || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={location.is_active ? "default" : "secondary"}>
                              {location.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(location)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(location)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingLocation(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Update location information' : 'Add a new Indonesian administrative location'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Province Information */}
            <div className="space-y-2">
              <Label htmlFor="province_code">Province Code *</Label>
              <Input
                id="province_code"
                value={formData.province_code}
                onChange={(e) => setFormData(prev => ({ ...prev, province_code: e.target.value }))}
                placeholder="e.g., 32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province_name">Province Name *</Label>
              <Input
                id="province_name"
                value={formData.province_name}
                onChange={(e) => setFormData(prev => ({ ...prev, province_name: e.target.value }))}
                placeholder="e.g., Jawa Barat"
              />
            </div>

            {/* City Information */}
            <div className="space-y-2">
              <Label htmlFor="city_code">City Code *</Label>
              <Input
                id="city_code"
                value={formData.city_code}
                onChange={(e) => setFormData(prev => ({ ...prev, city_code: e.target.value }))}
                placeholder="e.g., 3273"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city_name">City Name *</Label>
              <Input
                id="city_name"
                value={formData.city_name}
                onChange={(e) => setFormData(prev => ({ ...prev, city_name: e.target.value }))}
                placeholder="e.g., Bandung"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city_type">City Type</Label>
              <Select value={formData.city_type} onValueChange={(value) => setFormData(prev => ({ ...prev, city_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KOTA">KOTA</SelectItem>
                  <SelectItem value="KABUPATEN">KABUPATEN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_name">Area Name *</Label>
              <Input
                id="area_name"
                value={formData.area_name}
                onChange={(e) => setFormData(prev => ({ ...prev, area_name: e.target.value }))}
                placeholder="e.g., Bandung"
              />
            </div>

            {/* District Information */}
            <div className="space-y-2">
              <Label htmlFor="district_code">District Code</Label>
              <Input
                id="district_code"
                value={formData.district_code}
                onChange={(e) => setFormData(prev => ({ ...prev, district_code: e.target.value }))}
                placeholder="e.g., 327301"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district_name">District Name</Label>
              <Input
                id="district_name"
                value={formData.district_name}
                onChange={(e) => setFormData(prev => ({ ...prev, district_name: e.target.value }))}
                placeholder="e.g., Coblong"
              />
            </div>

            {/* Subdistrict Information */}
            <div className="space-y-2">
              <Label htmlFor="subdistrict_code">Subdistrict Code</Label>
              <Input
                id="subdistrict_code"
                value={formData.subdistrict_code}
                onChange={(e) => setFormData(prev => ({ ...prev, subdistrict_code: e.target.value }))}
                placeholder="e.g., 32730101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdistrict_name">Subdistrict Name</Label>
              <Input
                id="subdistrict_name"
                value={formData.subdistrict_name}
                onChange={(e) => setFormData(prev => ({ ...prev, subdistrict_name: e.target.value }))}
                placeholder="e.g., Lebak Gede"
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                placeholder="e.g., 40132"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="population">Population</Label>
              <Input
                id="population"
                type="number"
                value={formData.population}
                onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                placeholder="e.g., 100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_km2">Area (km²)</Label>
              <Input
                id="area_km2"
                type="number"
                step="0.01"
                value={formData.area_km2}
                onChange={(e) => setFormData(prev => ({ ...prev, area_km2: e.target.value }))}
                placeholder="e.g., 15.5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_capital"
                  checked={formData.is_capital}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_capital: e.target.checked }))}
                />
                <Label htmlFor="is_capital">Is Capital</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Is Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
              setEditingLocation(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={addLocationMutation.isPending || updateLocationMutation.isPending}
            >
              {addLocationMutation.isPending || updateLocationMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{locationToDelete?.area_name}" in {locationToDelete?.city_name}, {locationToDelete?.province_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => locationToDelete && deleteLocationMutation.mutate(locationToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLocationMutation.isPending}
            >
              {deleteLocationMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LocationManagement;