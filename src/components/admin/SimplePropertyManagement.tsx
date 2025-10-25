import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRoles";
import PropertyEditModal from "./PropertyEditModal";
import PropertyViewModal from "./PropertyViewModal";
import PropertyBulkActions from "./PropertyBulkActions";
import {
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Building2,
  Loader2,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatIDR } from "@/utils/currency";

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
  posted_by?: Array<{
    phone?: string;
    full_name?: string;
  }>;
}

interface SimplePropertyManagementProps {
  onAddProperty?: () => void;
}

const SimplePropertyManagement = ({ onAddProperty }: SimplePropertyManagementProps) => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter states
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [vendorIdFilter, setVendorIdFilter] = useState("");
  
  // Editable WhatsApp states
  const [editingWhatsApp, setEditingWhatsApp] = useState<string | null>(null);
  const [whatsappValue, setWhatsappValue] = useState("");

  // Check if user is admin (server-validated via RLS)
  const { isAdmin } = useIsAdmin();

  console.log('🔐 Auth Check:', { 
    userEmail: user?.email, 
    isAdmin 
  });

  // Fetch properties with enhanced filtering
  const { data: allProperties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['simple-properties', searchTerm, propertyTypeFilter, statusFilter, listingTypeFilter, cityFilter, vendorIdFilter],
    queryFn: async () => {
      console.log('🔍 Fetching properties with filters...');
      
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      
      if (propertyTypeFilter) {
        query = query.eq('property_type', propertyTypeFilter);
      }
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      if (listingTypeFilter) {
        query = query.eq('listing_type', listingTypeFilter);
      }
      
      if (cityFilter) {
        query = query.ilike('city', `%${cityFilter}%`);
      }
      
      if (vendorIdFilter) {
        query = query.eq('owner_id', vendorIdFilter);
      }

      const { data: properties, error } = await query;
      
      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }

      // Fetch profiles for owner information
      if (properties && properties.length > 0) {
        const ownerIds = [...new Set(properties.map(p => p.owner_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, phone, full_name')
          .in('id', ownerIds);

        // Map profile data to properties
        const propertiesWithProfiles = properties.map(property => ({
          ...property,
          posted_by: profiles?.filter(p => p.id === property.owner_id) || []
        }));

        console.log('✅ Properties loaded:', propertiesWithProfiles.length);
        return propertiesWithProfiles;
      }
      
      console.log('✅ Properties loaded:', 0);
      return [];
    },
    enabled: !!user && isAdmin,
  });

  // Pagination calculations
  const totalPages = Math.ceil(allProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const properties = allProperties.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, propertyTypeFilter, statusFilter, listingTypeFilter, cityFilter, vendorIdFilter]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      console.log('🗑️ Deleting property:', propertyId);
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Property deleted successfully!");
      refetch();
    },
    onError: (error: any) => {
      console.error('❌ Delete error:', error);
      showError("Error", `Delete failed: ${error.message}`);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (propertyIds: string[]) => {
      console.log('🗑️ Bulk deleting:', propertyIds);
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', propertyIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", `${selectedProperties.size} properties deleted!`);
      setSelectedProperties(new Set());
      refetch();
    },
    onError: (error: any) => {
      console.error('❌ Bulk delete error:', error);
      showError("Error", `Bulk delete failed: ${error.message}`);
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedProperties.size} selected properties?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedProperties));
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedProperties);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedProperties(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(new Set(properties.map(p => p.id)));
    } else {
      setSelectedProperties(new Set());
    }
  };

  const handleViewProperty = (property: Property) => {
    setViewingProperty(property);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
  };

  // WhatsApp editing functions
  const handleEditWhatsApp = (propertyId: string, currentPhone: string) => {
    setEditingWhatsApp(propertyId);
    setWhatsappValue(currentPhone || "");
  };

  const handleSaveWhatsApp = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: whatsappValue })
        .eq('id', allProperties.find(p => p.id === propertyId)?.owner_id);
      
      if (error) throw error;
      
      showSuccess("Success", "Phone/WhatsApp number updated successfully!");
      setEditingWhatsApp(null);
      refetch();
    } catch (error: any) {
      showError("Error", `Failed to update phone number: ${error.message}`);
    }
  };

  const handleCancelWhatsApp = () => {
    setEditingWhatsApp(null);
    setWhatsappValue("");
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setPropertyTypeFilter("");
    setStatusFilter("");
    setListingTypeFilter("");
    setCityFilter("");
    setVendorIdFilter("");
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Not Logged In</h3>
          <p>Please log in to access property management.</p>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
          <p>Admin access required. Your role: {profile?.role || 'none'}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading properties...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">Error: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Simple Property Management
          </h2>
          <p className="text-gray-600">
            Indonesian Property Management Hub - {allProperties.length} total properties, showing {startIndex + 1}-{Math.min(endIndex, allProperties.length)} of page {currentPage}
          </p>
        </div>
        <Button onClick={onAddProperty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by title, location, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Property Type</label>
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspending">Suspending</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Listing Type</label>
              <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="lease">For Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">City</label>
              <Input
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Vendor ID</label>
              <Input
                placeholder="Filter by vendor..."
                value={vendorIdFilter}
                onChange={(e) => setVendorIdFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <PropertyBulkActions
        selectedProperties={Array.from(selectedProperties)}
        onClearSelection={() => setSelectedProperties(new Set())}
        totalProperties={allProperties.length}
      />

      {/* Properties Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-base">Properties ({allProperties.length} total, {properties.length} showing)</span>
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-16 w-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No properties match your search." : "No properties in database."}
              </p>
              <Button onClick={onAddProperty}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {properties.map((property) => (
                <Card key={property.id} className="group relative overflow-hidden hover:shadow-md transition-all">
                  <CardContent className="p-2">
                    {/* Checkbox & Image */}
                    <div className="relative mb-1.5">
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <Checkbox
                          checked={selectedProperties.has(property.id)}
                          onCheckedChange={(checked) => handleSelect(property.id, checked as boolean)}
                          className="bg-white shadow-sm h-3.5 w-3.5"
                        />
                      </div>
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded overflow-hidden flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary/30" />
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="font-semibold text-xs line-clamp-1 flex-1">{property.title}</h3>
                        <Badge 
                          variant="outline"
                          className={`text-[9px] px-1 py-0 h-4 shrink-0 ${
                            property.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            property.status === 'suspending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            property.status === 'hold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            property.status === 'sold' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            property.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {property.status}
                        </Badge>
                      </div>

                      {/* Price & Type */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-primary truncate">
                            {property.price ? formatIDR(property.price) : 'No price'}
                          </div>
                          <div className="text-[9px] text-muted-foreground capitalize">
                            {property.listing_type}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 capitalize shrink-0">
                          {property.property_type}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{property.bedrooms}BR</span>
                        <span>•</span>
                        <span>{property.bathrooms}BA</span>
                        <span>•</span>
                        <span>{property.area_sqm}m²</span>
                      </div>

                      {/* Location */}
                      <div className="text-[10px] text-muted-foreground line-clamp-1">
                        {property.location}{property.city ? `, ${property.city}` : ''}
                      </div>

                      {/* WhatsApp */}
                      <div className="pt-1 border-t">
                        {editingWhatsApp === property.id ? (
                          <div className="flex gap-0.5">
                            <Input
                              value={whatsappValue}
                              onChange={(e) => setWhatsappValue(e.target.value)}
                              placeholder="+62..."
                              className="text-[10px] h-6 flex-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveWhatsApp(property.id)}
                              className="h-6 w-6 p-0 text-xs"
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelWhatsApp}
                              className="h-6 w-6 p-0 text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-accent/50 p-1 rounded text-[10px] transition-colors truncate"
                            onClick={() => handleEditWhatsApp(property.id, property.posted_by?.[0]?.phone || "")}
                            title="Click to edit"
                          >
                            📱 {property.posted_by?.[0]?.phone || "Not set"}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-0.5 pt-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProperty(property)}
                          title="View Property"
                          className="h-6 flex-1 text-[10px] px-1"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProperty(property)}
                          title="Edit Property"
                          className="h-6 flex-1 text-[10px] px-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(property.id, property.title)}
                          disabled={deleteMutation.isPending}
                          title="Delete Property"
                          className="h-6 w-6 p-0"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="text-sm text-gray-500 ml-4">
              Showing {startIndex + 1}-{Math.min(endIndex, allProperties.length)} of {allProperties.length}
            </div>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {editingProperty && (
        <PropertyEditModal
          property={editingProperty}
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
        />
      )}

      {/* View Modal */}
      {viewingProperty && (
        <PropertyViewModal
          property={viewingProperty}
          isOpen={!!viewingProperty}
          onClose={() => setViewingProperty(null)}
        />
      )}
    </div>
  );
};

export default SimplePropertyManagement;