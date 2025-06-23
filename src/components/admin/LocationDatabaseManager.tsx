
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAlert } from "@/contexts/AlertContext";
import { MapPin, Plus, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const LocationDatabaseManager = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    state: "",
    city: "",
    area: "",
    postal_code: ""
  });

  // Fetch locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('state', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter locations
  const filteredLocations = locations?.filter(location => 
    !searchTerm || 
    location.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.area.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Add location mutation
  const addLocationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('locations')
        .insert({
          state: data.state,
          city: data.city,
          area: data.area,
          postal_code: data.postal_code || null,
          is_active: true
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Location Added", "New location has been added successfully.");
      setFormData({ state: "", city: "", area: "", postal_code: "" });
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (error: any) => {
      showError("Error", error.message);
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Location Updated", "Location has been updated successfully.");
      setEditingLocation(null);
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (error: any) => {
      showError("Error", error.message);
    },
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
      showSuccess("Location Deleted", "Location has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (error: any) => {
      showError("Error", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.state || !formData.city || !formData.area) {
      showError("Missing Fields", "Please fill in State, City, and Area fields.");
      return;
    }
    addLocationMutation.mutate(formData);
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
  };

  const handleUpdateStatus = (id: string, isActive: boolean) => {
    updateLocationMutation.mutate({ 
      id, 
      data: { is_active: isActive } 
    });
  };

  const handleDelete = (id: string, locationName: string) => {
    if (window.confirm(`Are you sure you want to delete "${locationName}"?`)) {
      deleteLocationMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Location Database Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage states, cities, and areas for property listings
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Add Location Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Location</CardTitle>
            <CardDescription>Add a new state, city, and area combination</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g., Jakarta"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g., Central Jakarta"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g., Menteng"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="e.g., 10310"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addLocationMutation.isPending}>
                  {addLocationMutation.isPending ? 'Adding...' : 'Add Location'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search locations by state, city, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations ({filteredLocations.length})</CardTitle>
          <CardDescription>
            Manage all location entries in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading locations...</div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
              <p className="text-gray-600 mb-4">
                No locations match your search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Postal Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.state}</TableCell>
                      <TableCell>{location.city}</TableCell>
                      <TableCell>{location.area}</TableCell>
                      <TableCell>{location.postal_code || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={location.is_active}
                            onCheckedChange={(checked) => handleUpdateStatus(location.id, checked)}
                          />
                          <Badge variant={location.is_active ? "default" : "secondary"}>
                            {location.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(location.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(location.id, `${location.area}, ${location.city}, ${location.state}`)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationDatabaseManager;
