import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Search, Plus, Edit, Trash2, Eye, MapPin, DollarSign, RefreshCw, Axis3d } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import PropertyEditModal from "./PropertyEditModal";
import PropertyViewModal from "./PropertyViewModal";
import PropertyBulkActions from "./PropertyBulkActions";
import { formatIDR } from "@/utils/currency";

interface PropertyOwner {
  full_name: string;
  email: string;
}

interface PropertyWithRelations {
  id: string;
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price?: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  status?: string;
  created_at?: string;
  owner_id?: string;
  agent_id?: string;
  owner?: PropertyOwner;
  agent?: PropertyOwner;
  development_status?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
}

const PropertyManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyWithRelations | null>(null);
  const [viewingProperty, setViewingProperty] = useState<PropertyWithRelations | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    property_type: "house",
    listing_type: "sale",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    development_status: "completed",
    three_d_model_url: "",
    virtual_tour_url: "",
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-properties', searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      console.log('Fetching properties...');
      
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter !== 'all') {
        if (categoryFilter === 'buy') {
          query = query.eq('listing_type', 'sale').eq('development_status', 'completed');
        } else if (categoryFilter === 'rent') {
          query = query.eq('listing_type', 'rent').eq('development_status', 'completed');
        } else if (categoryFilter === 'new_project') {
          query = query.eq('development_status', 'new_project');
        } else if (categoryFilter === 'pre_launching') {
          query = query.eq('development_status', 'pre_launching');
        } else if (categoryFilter === 'has_3d') {
          query = query.or('three_d_model_url.is.not.null,virtual_tour_url.is.not.null');
        }
      }

      const { data: propertiesData, error: propertiesError } = await query;
      
      console.log('Properties query result:', { data: propertiesData, error: propertiesError });
      
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        throw propertiesError;
      }

      if (!propertiesData || propertiesData.length === 0) {
        return [];
      }

      // Get unique owner and agent IDs
      const ownerIds = [...new Set(propertiesData.map(p => p.owner_id).filter(Boolean))];
      const agentIds = [...new Set(propertiesData.map(p => p.agent_id).filter(Boolean))];
      const allUserIds = [...new Set([...ownerIds, ...agentIds])];

      console.log('Fetching user profiles for IDs:', allUserIds);

      // Fetch profiles separately
      let profilesData = [];
      if (allUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', allUserIds);

        if (profilesError) {
          console.warn('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      console.log('Profiles data:', profilesData);

      // Map properties with owner/agent information
      const propertiesWithRelations = propertiesData.map((property: any) => {
        const owner = profilesData.find(p => p.id === property.owner_id);
        const agent = profilesData.find(p => p.id === property.agent_id);

        return {
          ...property,
          owner: owner ? { full_name: owner.full_name, email: owner.email } : null,
          agent: agent ? { full_name: agent.full_name, email: agent.email } : null,
        };
      });

      console.log('Final properties with relations:', propertiesWithRelations);
      return propertiesWithRelations as PropertyWithRelations[];
    },
  });

  // Debug: Log the current state
  console.log('PropertyManagement state:', { 
    properties, 
    isLoading, 
    error, 
    propertiesCount: properties?.length 
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'mycode103@gmail.com')
        .single();

      if (!adminProfile) {
        throw new Error('Admin profile not found');
      }

      const { error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          price: propertyData.price ? parseFloat(propertyData.price) : null,
          bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : null,
          bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : null,
          area_sqm: propertyData.area_sqm ? parseInt(propertyData.area_sqm) : null,
          owner_id: adminProfile.id,
          status: 'approved'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Added", "Property has been added successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setIsAddDialogOpen(false);
      setNewProperty({
        title: "",
        description: "",
        property_type: "house",
        listing_type: "sale",
        price: "",
        location: "",
        bedrooms: "",
        bathrooms: "",
        area_sqm: "",
        development_status: "completed",
        three_d_model_url: "",
        virtual_tour_url: "",
      });
    },
    onError: (error: any) => {
      showError("Add Failed", error.message);
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, updates }: { propertyId: string; updates: any }) => {
      const { error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Updated", "Property has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Deleted", "Property has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  const handleStatusChange = (propertyId: string, newStatus: string) => {
    updatePropertyMutation.mutate({ propertyId, updates: { status: newStatus } });
  };

  const handleAddProperty = () => {
    createPropertyMutation.mutate(newProperty);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending_approval': return 'secondary';
      case 'rejected': return 'destructive';
      case 'sold': return 'outline';
      default: return 'secondary';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(properties?.map(p => p.id) || []);
    } else {
      setSelectedProperties([]);
    }
  };

  const handleSelectProperty = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  const clearSelection = () => {
    setSelectedProperties([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Management
              </CardTitle>
              <CardDescription>
                Manage property listings, approvals, and content
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                      Create a new property listing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newProperty.title}
                        onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                        placeholder="Property title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newProperty.location}
                        onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                        placeholder="Property location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property_type">Property Type</Label>
                      <Select value={newProperty.property_type} onValueChange={(value) => setNewProperty({ ...newProperty, property_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="listing_type">Listing Type</Label>
                      <Select value={newProperty.listing_type} onValueChange={(value) => setNewProperty({ ...newProperty, listing_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                          <SelectItem value="lease">For Lease</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProperty.price}
                        onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                        placeholder="Property price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area_sqm">Area (sqm)</Label>
                      <Input
                        id="area_sqm"
                        type="number"
                        value={newProperty.area_sqm}
                        onChange={(e) => setNewProperty({ ...newProperty, area_sqm: e.target.value })}
                        placeholder="Area in square meters"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={newProperty.bedrooms}
                        onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                        placeholder="Number of bedrooms"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={newProperty.bathrooms}
                        onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                        placeholder="Number of bathrooms"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="development_status">Development Status</Label>
                      <Select value={newProperty.development_status} onValueChange={(value) => setNewProperty({ ...newProperty, development_status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="new_project">New Project</SelectItem>
                          <SelectItem value="pre_launching">Pre-launching</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProperty.description}
                        onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                        placeholder="Property description"
                        rows={3}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="three_d_model_url">3D Model URL</Label>
                      <Input
                        id="three_d_model_url"
                        value={newProperty.three_d_model_url}
                        onChange={(e) => setNewProperty({ ...newProperty, three_d_model_url: e.target.value })}
                        placeholder="e.g., https://example.com/model.glb"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="virtual_tour_url">Virtual Tour URL</Label>
                      <Input
                        id="virtual_tour_url"
                        value={newProperty.virtual_tour_url}
                        onChange={(e) => setNewProperty({ ...newProperty, virtual_tour_url: e.target.value })}
                        placeholder="e.g., https://example.com/tour"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddProperty}>
                      Add Property
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="buy">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="new_project">New Projects</SelectItem>
                <SelectItem value="pre_launching">Pre-launching</SelectItem>
                <SelectItem value="has_3d">Has 3D View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PropertyBulkActions 
            selectedProperties={selectedProperties}
            onClearSelection={clearSelection}
            totalProperties={properties?.length || 0}
          />

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive">
                Error loading properties: {error.message}
              </p>
            </div>
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        properties?.length > 0 && 
                        selectedProperties.length === properties.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner/Agent</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading properties...
                    </TableCell>
                  </TableRow>
                ) : properties?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="space-y-2">
                        <p>No properties found</p>
                        <p className="text-sm text-muted-foreground">
                          Click "Add Property" to create your first property listing
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  properties?.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProperties.includes(property.id)}
                          onCheckedChange={(checked) => 
                            handleSelectProperty(property.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {property.title}
                            {(property.three_d_model_url || property.virtual_tour_url) && (
                              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                <Axis3d className="h-3 w-3" /> 3D
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.location}
                          </div>
                          {property.bedrooms || property.bathrooms ? (
                            <div className="text-xs text-muted-foreground">
                              {property.bedrooms}BR • {property.bathrooms}BA • {property.area_sqm}sqm
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {property.owner?.full_name || 'Unknown Owner'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {property.owner?.email}
                          </div>
                          {property.agent && (
                            <div className="text-xs text-blue-600">
                              Agent: {property.agent.full_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="capitalize">{property.property_type}</Badge>
                          <div className="text-xs text-muted-foreground capitalize">
                            {property.development_status?.replace('_', ' ') || 'Completed'}
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {property.price ? formatIDR(property.price) : 'Price not set'}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {property.listing_type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={property.status || 'pending_approval'}
                          onValueChange={(value) => handleStatusChange(property.id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <Badge variant={getStatusBadgeVariant(property.status || 'pending_approval')}>
                              {property.status || 'pending_approval'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setViewingProperty(property)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingProperty(property)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deletePropertyMutation.mutate(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Edit Modal */}
      <PropertyEditModal
        property={editingProperty}
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
      />

      {/* View Modal */}
      <PropertyViewModal
        property={viewingProperty}
        isOpen={!!viewingProperty}
        onClose={() => setViewingProperty(null)}
      />
    </div>
  );
};

export default PropertyManagement;
