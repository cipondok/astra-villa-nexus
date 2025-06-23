
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Edit, Trash2, MapPin, Save, X } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface Location {
  id: string;
  province_code: string;
  province_name: string;
  city_code: string;
  city_name: string;
  city_type: string;
  district_code?: string;
  district_name?: string;
  area_name: string;
  postal_code?: string;
  is_capital: boolean;
  is_active: boolean;
}

const LocationDatabaseManager = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocation, setNewLocation] = useState({
    province_code: "",
    province_name: "",
    city_code: "",
    city_name: "",
    city_type: "KOTA",
    district_code: "",
    district_name: "",
    area_name: "",
    postal_code: "",
    is_capital: false,
    is_active: true
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
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
        .filter(loc => loc.province_name === selectedProvince)
        .map(loc => loc.city_name))]
    : [];

  // Filtered locations
  const filteredLocations = locations.filter(loc => {
    if (selectedProvince && loc.province_name !== selectedProvince) return false;
    if (selectedCity && loc.city_name !== selectedCity) return false;
    return true;
  });

  // Add location mutation
  const addLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Lokasi baru berhasil ditambahkan");
      setNewLocation({
        province_code: "",
        province_name: "",
        city_code: "",
        city_name: "",
        city_type: "KOTA",
        district_code: "",
        district_name: "",
        area_name: "",
        postal_code: "",
        is_capital: false,
        is_active: true
      });
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (error: any) => {
      showError("Gagal", error.message || 'Gagal menambahkan lokasi');
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (locationData: Location) => {
      const { data, error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', locationData.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Lokasi berhasil diperbarui");
      setEditingLocation(null);
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (error: any) => {
      showError("Gagal", error.message || 'Gagal memperbarui lokasi');
    },
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Berhasil", "Lokasi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (error: any) => {
      showError("Gagal", error.message || 'Gagal menghapus lokasi');
    },
  });

  const handleAddLocation = () => {
    if (!newLocation.province_name || !newLocation.city_name || !newLocation.area_name) {
      showError("Validasi", "Mohon lengkapi Provinsi, Kota/Kabupaten, dan Area");
      return;
    }
    addLocationMutation.mutate(newLocation);
  };

  const handleUpdateLocation = () => {
    if (!editingLocation) return;
    updateLocationMutation.mutate(editingLocation);
  };

  const handleDeleteLocation = (locationId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) {
      deleteLocationMutation.mutate(locationId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Manajemen Database Lokasi
          </h2>
          <p className="text-muted-foreground">
            Kelola data lokasi provinsi, kota/kabupaten, dan area
          </p>
        </div>
        <Badge variant="secondary">
          Total: {locations.length} lokasi
        </Badge>
      </div>

      {/* Add New Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Lokasi Baru
          </CardTitle>
          <CardDescription>
            Tambahkan lokasi baru ke dalam database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="new-province-code">Kode Provinsi</Label>
              <Input
                id="new-province-code"
                value={newLocation.province_code}
                onChange={(e) => setNewLocation(prev => ({ ...prev, province_code: e.target.value }))}
                placeholder="31"
              />
            </div>
            <div>
              <Label htmlFor="new-province-name">Nama Provinsi</Label>
              <Input
                id="new-province-name"
                value={newLocation.province_name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, province_name: e.target.value }))}
                placeholder="DKI Jakarta"
              />
            </div>
            <div>
              <Label htmlFor="new-city-code">Kode Kota/Kabupaten</Label>
              <Input
                id="new-city-code"
                value={newLocation.city_code}
                onChange={(e) => setNewLocation(prev => ({ ...prev, city_code: e.target.value }))}
                placeholder="3171"
              />
            </div>
            <div>
              <Label htmlFor="new-city-name">Nama Kota/Kabupaten</Label>
              <Input
                id="new-city-name"
                value={newLocation.city_name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, city_name: e.target.value }))}
                placeholder="Jakarta Pusat"
              />
            </div>
            <div>
              <Label htmlFor="new-city-type">Tipe Kota</Label>
              <Select 
                value={newLocation.city_type} 
                onValueChange={(value) => setNewLocation(prev => ({ ...prev, city_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KOTA">KOTA</SelectItem>
                  <SelectItem value="KABUPATEN">KABUPATEN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-area-name">Nama Area/Kecamatan</Label>
              <Input
                id="new-area-name"
                value={newLocation.area_name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, area_name: e.target.value }))}
                placeholder="Gambir"
              />
            </div>
            <div>
              <Label htmlFor="new-postal-code">Kode Pos</Label>
              <Input
                id="new-postal-code"
                value={newLocation.postal_code}
                onChange={(e) => setNewLocation(prev => ({ ...prev, postal_code: e.target.value }))}
                placeholder="10110"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleAddLocation}
              disabled={addLocationMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {addLocationMutation.isPending ? 'Menyimpan...' : 'Tambah Lokasi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Lokasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filter-province">Filter berdasarkan Provinsi</Label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Provinsi</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-city">Filter berdasarkan Kota/Kabupaten</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kota/Kabupaten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kota/Kabupaten</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lokasi</CardTitle>
          <CardDescription>
            Menampilkan {filteredLocations.length} dari {locations.length} lokasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provinsi</TableHead>
                  <TableHead>Kota/Kabupaten</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Area/Kecamatan</TableHead>
                  <TableHead>Kode Pos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.province_name}</TableCell>
                    <TableCell>
                      {location.city_name}
                      {location.is_capital && (
                        <Badge variant="secondary" className="ml-2">
                          Ibu Kota
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={location.city_type === 'KOTA' ? 'default' : 'outline'}>
                        {location.city_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{location.area_name}</TableCell>
                    <TableCell>{location.postal_code || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={location.is_active ? 'success' : 'secondary'}>
                        {location.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLocation(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLocation(location.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit Location Modal */}
      {editingLocation && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Lokasi</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingLocation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nama Provinsi</Label>
                <Input
                  value={editingLocation.province_name}
                  onChange={(e) => setEditingLocation(prev => 
                    prev ? { ...prev, province_name: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label>Nama Kota/Kabupaten</Label>
                <Input
                  value={editingLocation.city_name}
                  onChange={(e) => setEditingLocation(prev => 
                    prev ? { ...prev, city_name: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label>Tipe Kota</Label>
                <Select 
                  value={editingLocation.city_type} 
                  onValueChange={(value) => setEditingLocation(prev => 
                    prev ? { ...prev, city_type: value } : null
                  )}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KOTA">KOTA</SelectItem>
                    <SelectItem value="KABUPATEN">KABUPATEN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nama Area/Kecamatan</Label>
                <Input
                  value={editingLocation.area_name}
                  onChange={(e) => setEditingLocation(prev => 
                    prev ? { ...prev, area_name: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label>Kode Pos</Label>
                <Input
                  value={editingLocation.postal_code || ''}
                  onChange={(e) => setEditingLocation(prev => 
                    prev ? { ...prev, postal_code: e.target.value } : null
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingLocation(null)}
              >
                Batal
              </Button>
              <Button
                onClick={handleUpdateLocation}
                disabled={updateLocationMutation.isPending}
              >
                {updateLocationMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LocationDatabaseManager;
