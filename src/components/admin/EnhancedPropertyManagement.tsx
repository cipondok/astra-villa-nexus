import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
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
  RefreshCw,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square
} from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface Property {
  id: string;
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  location: string;
  city?: string;
  state?: string;
  area?: string;
  status: string;
  created_at: string;
  owner_id?: string;
  agent_id?: string;
  development_status?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
  images?: string[];
  image_urls?: string[];
  thumbnail_url?: string;
}

const EnhancedPropertyManagement = () => {
  const { user, profile } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at_desc");
  
  // Modal states
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Enhanced property fetch with comprehensive filtering
  const { data: properties = [], isLoading, error, refetch, isError } = useQuery({
    queryKey: ['enhanced-admin-properties', searchTerm, statusFilter, typeFilter, listingTypeFilter, locationFilter, priceRangeFilter, sortBy],
    queryFn: async () => {
      console.log('Fetching enhanced admin properties with filters:', { 
        searchTerm, statusFilter, typeFilter, listingTypeFilter, locationFilter, priceRangeFilter, sortBy 
      });
      
      try {
        let query = supabase
          .from('properties')
          .select('*');

        // Apply text search across multiple fields
        if (searchTerm && searchTerm.trim()) {
          const searchTermLower = searchTerm.toLowerCase().trim();
          query = query.or(`title.ilike.%${searchTermLower}%,location.ilike.%${searchTermLower}%,city.ilike.%${searchTermLower}%,state.ilike.%${searchTermLower}%,description.ilike.%${searchTermLower}%`);
        }

        // Apply location filter
        if (locationFilter && locationFilter.trim()) {
          const locationLower = locationFilter.toLowerCase().trim();
          query = query.or(`location.ilike.%${locationLower}%,city.ilike.%${locationLower}%,state.ilike.%${locationLower}%`);
        }

        // Apply status filter
        if (statusFilter !== "all") {
          query = query.eq('status', statusFilter);
        }

        // Apply property type filter
        if (typeFilter !== "all") {
          query = query.eq('property_type', typeFilter);
        }

        // Apply listing type filter
        if (listingTypeFilter !== "all") {
          query = query.eq('listing_type', listingTypeFilter);
        }

        // Apply price range filter
        if (priceRangeFilter !== "all") {
          const ranges = {
            'under_500m': { min: 0, max: 500000000 },
            '500m_1b': { min: 500000000, max: 1000000000 },
            '1b_2b': { min: 1000000000, max: 2000000000 },
            '2b_5b': { min: 2000000000, max: 5000000000 },
            'over_5b': { min: 5000000000, max: null }
          };
          
          const range = ranges[priceRangeFilter as keyof typeof ranges];
          if (range) {
            query = query.gte('price', range.min);
            if (range.max) {
              query = query.lte('price', range.max);
            }
          }
        }

        // Apply sorting
        switch (sortBy) {
          case 'title_asc':
            query = query.order('title', { ascending: true });
            break;
          case 'title_desc':
            query = query.order('title', { ascending: false });
            break;
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'created_at_asc':
            query = query.order('created_at', { ascending: true });
            break;
          case 'created_at_desc':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data, error } = await query.limit(100);
        
        if (error) {
          console.error('Enhanced admin query error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Enhanced admin properties fetched successfully:', data?.length || 0);
        return data || [];
        
      } catch (err) {
        console.error('Enhanced property fetch error:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    enabled: isAdmin, // Only fetch if user is admin
  });

  // Enhanced delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ['enhanced-admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      showError("Delete Failed", error.message || 'Failed to delete property');
    },
  });

  // Enhanced status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ propertyId, newStatus }: { propertyId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', propertyId);
      
      if (error) {
        console.error('Status update error:', error);
        throw new Error(`Failed to update status: ${error.message}`);
      }
    },
    onSuccess: () => {
      showSuccess("Status Updated", "Property status has been updated successfully.");
      refetch();
      queryClient.invalidateQueries({ queryKey: ['enhanced-admin-properties'] });
    },
    onError: (error: any) => {
      console.error('Status update error:', error);
      showError("Update Failed", error.message || 'Failed to update status');
    },
  });

  const handleDelete = (propertyId: string, propertyTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`)) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleStatusChange = (propertyId: string, newStatus: string) => {
    updateStatusMutation.mutate({ propertyId, newStatus });
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
    queryClient.invalidateQueries({ queryKey: ['enhanced-admin-properties'] });
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingProperty(null);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setListingTypeFilter("all");
    setLocationFilter("");
    setPriceRangeFilter("all");
    setSortBy("created_at_desc");
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

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
        return '🏠';
      case 'apartment':
        return '🏢';
      case 'villa':
        return '🏡';
      case 'townhouse':
        return '🏘️';
      case 'land':
        return '🌿';
      case 'commercial':
        return '🏬';
      default:
        return '🏠';
    }
  };

  // Check if user is authorized
  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">You need admin privileges to access property management.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              Enhanced Property Management
            </h2>
            <p className="text-gray-600 mt-1">Loading properties...</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-medium mb-2">Loading Properties</h3>
              <p className="text-gray-600">Fetching data from database...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              Enhanced Property Management
            </h2>
            <p className="text-gray-600 mt-1">Database connection error</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2 text-red-800">Database Connection Error</h3>
              <p className="text-red-600 mb-6">
                {error instanceof Error ? error.message : 'Unable to connect to the database.'}
              </p>
              
              <div className="flex justify-center gap-3">
                <Button onClick={() => refetch()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
                <Button onClick={clearAllFilters} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Clear Filters
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
      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Enhanced Property Management
          </h2>
          <p className="text-gray-600 mt-1">
            Advanced property management with comprehensive search and filtering ({properties.length} properties)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => window.location.href = '/admin-dashboard?section=property-management-hub'}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Search & Filters
          </CardTitle>
          <CardDescription>
            Use multiple filters to find specific properties quickly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search title, description, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="title_asc">Title A-Z</SelectItem>
                <SelectItem value="title_desc">Title Z-A</SelectItem>
                <SelectItem value="price_asc">Price Low-High</SelectItem>
                <SelectItem value="price_desc">Price High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Listing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="lease">For Lease</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under_500m">Under 500M</SelectItem>
                <SelectItem value="500m_1b">500M - 1B</SelectItem>
                <SelectItem value="1b_2b">1B - 2B</SelectItem>
                <SelectItem value="2b_5b">2B - 5B</SelectItem>
                <SelectItem value="over_5b">Over 5B</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Listings ({properties.length})</CardTitle>
          <CardDescription>
            Click on any property to view details or edit. All changes are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-medium mb-3">No Properties Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" || listingTypeFilter !== "all" || locationFilter || priceRangeFilter !== "all"
                  ? "No properties match your current search criteria. Try adjusting your filters or search terms."
                  : "No properties have been added to the system yet. Start by adding your first property."
                }
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
                <Button onClick={() => window.location.href = '/admin-dashboard?section=property-management-hub'}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Property
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Details</TableHead>
                    <TableHead>Type & Listing</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price & Specs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <span className="text-lg">{getPropertyTypeIcon(property.property_type)}</span>
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {property.id.slice(0, 8)}...
                          </div>
                          {property.description && (
                            <div className="text-xs text-gray-400 max-w-xs truncate">
                              {property.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="capitalize">
                            {property.property_type}
                          </Badge>
                          <div className="text-sm font-medium capitalize">
                            For {property.listing_type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {property.location}
                          </div>
                          {property.city && (
                            <div className="text-sm text-gray-500">{property.city}</div>
                          )}
                          {property.state && (
                            <div className="text-xs text-gray-400">{property.state}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-bold text-green-600 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {property.price ? formatIDR(property.price) : 'Not set'}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {property.bedrooms && (
                              <span className="flex items-center gap-1">
                                <Bed className="h-3 w-3" />
                                {property.bedrooms}
                              </span>
                            )}
                            {property.bathrooms && (
                              <span className="flex items-center gap-1">
                                <Bath className="h-3 w-3" />
                                {property.bathrooms}
                              </span>
                            )}
                            {property.area_sqm && (
                              <span className="flex items-center gap-1">
                                <Square className="h-3 w-3" />
                                {property.area_sqm}m²
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(property.status)}
                          <Select
                            value={property.status}
                            onValueChange={(newStatus) => handleStatusChange(property.id, newStatus)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending_approval">Pending</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                              <SelectItem value="rented">Rented</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                            className="hover:bg-red-50 text-red-600 hover:text-red-700"
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

      {/* Modals */}
      {editingProperty && (
        <PropertyEditModal
          property={editingProperty}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
        />
      )}

      {viewingProperty && (
        <PropertyViewModal
          property={viewingProperty}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default EnhancedPropertyManagement;