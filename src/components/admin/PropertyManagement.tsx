
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
import { Building, Search, Plus, Edit, Trash2, Eye, MapPin, DollarSign, RefreshCw } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

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
  approval_status?: string;
  created_at?: string;
  owner?: PropertyOwner;
  agent?: PropertyOwner;
}

const PropertyManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyWithRelations | null>(null);
  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    property_type: "house",
    listing_type: "sale",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: ""
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-properties', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('Fetching properties...');
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(full_name, email),
          agent:profiles!properties_agent_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      console.log('Properties query result:', { data, error });
      
      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      // Transform the data to match our interface
      return data?.map((property: any) => ({
        ...property,
        owner: Array.isArray(property.owner) ? property.owner[0] : property.owner,
        agent: Array.isArray(property.agent) ? property.agent[0] : property.agent,
      })) as PropertyWithRelations[];
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
          status: 'active',
          approval_status: 'approved'
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
        area_sqm: ""
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

  const handleApprovalStatusChange = (propertyId: string, newStatus: string) => {
    updatePropertyMutation.mutate({ propertyId, updates: { approval_status: newStatus } });
  };

  const handleAddProperty = () => {
    createPropertyMutation.mutate(newProperty);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'rejected': return 'destructive';
      case 'sold': return 'outline';
      default: return 'secondary';
    }
  };

  const getApprovalBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                      Create a new property listing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
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
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <TableHead>Property</TableHead>
                  <TableHead>Owner/Agent</TableHead>
                  <TableHead>Type & Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
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
                        <div className="space-y-1">
                          <div className="font-medium">{property.title}</div>
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
                          <Badge variant="outline">{property.property_type}</Badge>
                          <div className="text-sm font-medium flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {property.price ? property.price.toLocaleString() : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={property.approval_status || 'pending'}
                          onValueChange={(value) => handleApprovalStatusChange(property.id, value)}
                        >
                          <SelectTrigger className="w-28">
                            <Badge variant={getApprovalBadgeVariant(property.approval_status || 'pending')}>
                              {property.approval_status || 'pending'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
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
    </div>
  );
};

export default PropertyManagement;
