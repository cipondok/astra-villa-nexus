import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import PropertyEditModal from "./PropertyEditModal";
import PropertyViewModal from "./PropertyViewModal";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Filter,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface PropertyListManagementProps {
  onAddProperty?: () => void;
}

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  location: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  owner_id: string;
}

const PropertyListManagement = ({ onAddProperty }: PropertyListManagementProps) => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Optimized property fetch with fast timeout
  const { data: properties = [], isLoading, error, refetch, isError } = useQuery({
    queryKey: ['admin-properties', searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      console.log('Fetching admin properties with optimized query:', { searchTerm, statusFilter, typeFilter });
      
      try {
        // Fast timeout for admin queries
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Admin query timeout')), 4000); // 4 second max
        });

        let query = supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, status, created_at, owner_id, city, state, description')
          .order('created_at', { ascending: false });

        // Apply search filter
        if (searchTerm && searchTerm.trim()) {
          const searchTermLower = searchTerm.toLowerCase().trim();
          query = query.or(`title.ilike.%${searchTermLower}%,location.ilike.%${searchTermLower}%,city.ilike.%${searchTermLower}%`);
        }

        // Apply status filter
        if (statusFilter !== "all") {
          query = query.eq('status', statusFilter);
        }

        // Apply type filter
        if (typeFilter !== "all") {
          query = query.eq('property_type', typeFilter);
        }

        console.log('Executing admin query...');
        const queryWithTimeout = Promise.race([query.limit(50), timeoutPromise]);
        const { data, error } = await queryWithTimeout;
        
        if (error) {
          console.error('Admin query error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Admin properties fetched successfully:', data?.length || 0);
        return data || [];
        
      } catch (err) {
        console.error('Property fetch error:', err);
        throw err;
      }
    },
    retry: 1, // Only retry once
    retryDelay: 1000, // 1 second retry delay
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete property mutation with better error handling
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      console.log('Deleting property:', propertyId);
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Failed to delete property: ${error.message}`);
      }
    },
    onSuccess: () => {
      showSuccess("Property Deleted", "Property has been deleted successfully.");
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      showError("Delete Failed", error.message || 'Failed to delete property');
    },
  });

  const handleDelete = (propertyId: string, propertyTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${propertyTitle}"?`)) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleEdit = (property: Property) => {
    console.log('Opening edit modal for property:', property.id);
    setEditingProperty(property);
    setIsEditModalOpen(true);
  };

  const handleView = (property: Property) => {
    console.log('Opening view modal for property:', property.id);
    setViewingProperty(property);
    setIsViewModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProperty(null);
    refetch();
    queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingProperty(null);
  };

  const handleEditFromView = (property: Property) => {
    setViewingProperty(null);
    setIsViewModalOpen(false);
    setEditingProperty(property);
    setIsEditModalOpen(true);
  };

  const handleRetry = () => {
    console.log('Manual retry triggered');
    refetch();
  };

  const handleForceRefresh = () => {
    console.log('Force refresh triggered');
    queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'sold':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Sold</Badge>;
      case 'rented':
        return <Badge className="bg-purple-100 text-purple-800"><CheckCircle className="h-3 w-3 mr-1" />Rented</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Fast loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Property Management
            </h2>
            <p className="text-gray-600">Loading properties...</p>
          </div>
          <Button onClick={onAddProperty}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-medium mb-2">Loading Properties</h3>
              <p className="text-gray-600">Fetching data from database...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fast error state
  if (isError || error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Property Management
            </h2>
            <p className="text-gray-600">Database connection error</p>
          </div>
          <Button onClick={onAddProperty}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-red-800">Database Connection Error</h3>
              <p className="text-red-600 mb-4">
                {error instanceof Error ? error.message : 'Unable to connect to the database.'}
              </p>
              
              <div className="flex justify-center gap-2">
                <Button onClick={handleRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={handleForceRefresh} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Property Management
          </h2>
          <p className="text-gray-600">
            Manage all property listings ({properties.length} properties loaded)
          </p>
        </div>
        <Button onClick={onAddProperty}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({properties.length})</CardTitle>
          <CardDescription>
            Complete list of all property listings in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                  ? "No properties match your current filters. Try adjusting your search criteria."
                  : "No properties have been added to the system yet."
                }
              </p>
              {(!searchTerm && statusFilter === "all" && typeFilter === "all") && (
                <Button onClick={onAddProperty} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Property
                </Button>
              )}
              {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500">
                            {property.bedrooms || 0}BR • {property.bathrooms || 0}BA • {property.area_sqm || 0}m²
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{property.property_type}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{property.location}</div>
                          {property.city && <div className="text-gray-500">{property.city}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {property.price ? formatIDR(property.price) : 'Price not set'}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{property.listing_type}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(property.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleView(property)}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(property)}
                            className="hover:bg-green-50 text-green-600 hover:text-green-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(property.id, property.title)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletePropertyMutation.isPending}
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

      {/* Property Edit Modal */}
      {editingProperty && (
        <PropertyEditModal
          property={editingProperty}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Property View Modal */}
      {viewingProperty && (
        <PropertyViewModal
          property={viewingProperty}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          onEdit={handleEditFromView}
        />
      )}
    </div>
  );
};

export default PropertyListManagement;
