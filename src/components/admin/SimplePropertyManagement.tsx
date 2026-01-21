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

  // Fetch properties with enhanced filtering
  const { data: allProperties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['simple-properties', searchTerm, propertyTypeFilter, statusFilter, listingTypeFilter, cityFilter, vendorIdFilter],
    queryFn: async () => {
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

        return propertiesWithProfiles;
      }
      
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
      showError("Error", `Delete failed: ${error.message}`);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (propertyIds: string[]) => {
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
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="text-sm font-medium text-destructive mb-1">Not Logged In</h3>
          <p className="text-xs text-muted-foreground">Please log in to access property management.</p>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="text-sm font-medium text-destructive mb-1">Access Denied</h3>
          <p className="text-xs text-muted-foreground">Admin access required. Your role: {profile?.role || 'none'}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-xs text-muted-foreground">Loading properties...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-3" />
          <p className="text-xs text-destructive mb-2">Error: {error.message}</p>
          <Button onClick={() => refetch()} size="sm" className="h-7 text-xs">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header - Slim Style */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Property Management
          </h2>
          <p className="text-[10px] text-muted-foreground">
            {allProperties.length} total • Showing {startIndex + 1}-{Math.min(endIndex, allProperties.length)} • Page {currentPage}
          </p>
        </div>
        <Button onClick={onAddProperty} size="sm" className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Add Property
        </Button>
      </div>

      {/* Enhanced Search and Filters - Slim Style */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-primary" />
              Search & Filters
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-[10px] px-2">
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Search by title, location, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">Property Type</label>
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="house" className="text-xs">House</SelectItem>
                  <SelectItem value="apartment" className="text-xs">Apartment</SelectItem>
                  <SelectItem value="villa" className="text-xs">Villa</SelectItem>
                  <SelectItem value="townhouse" className="text-xs">Townhouse</SelectItem>
                  <SelectItem value="commercial" className="text-xs">Commercial</SelectItem>
                  <SelectItem value="land" className="text-xs">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Status</SelectItem>
                  <SelectItem value="active" className="text-xs">Active</SelectItem>
                  <SelectItem value="suspending" className="text-xs">Suspending</SelectItem>
                  <SelectItem value="hold" className="text-xs">Hold</SelectItem>
                  <SelectItem value="sold" className="text-xs">Sold</SelectItem>
                  <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                  <SelectItem value="available" className="text-xs">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">Listing Type</label>
              <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="All Listings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Listings</SelectItem>
                  <SelectItem value="sale" className="text-xs">For Sale</SelectItem>
                  <SelectItem value="rent" className="text-xs">For Rent</SelectItem>
                  <SelectItem value="lease" className="text-xs">For Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">City</label>
              <Input
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-medium mb-1 block text-muted-foreground">Vendor ID</label>
              <Input
                placeholder="Filter by vendor..."
                value={vendorIdFilter}
                onChange={(e) => setVendorIdFilter(e.target.value)}
                className="h-7 text-xs"
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

      {/* Properties Grid - Slim Style */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="flex items-center justify-between text-xs">
            <span>Properties ({allProperties.length} total, {properties.length} showing)</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Page {currentPage} of {totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {properties.length === 0 ? (
            <div className="text-center py-6">
              <Building2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-sm font-medium mb-1 text-foreground">No Properties Found</h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                {searchTerm ? "No properties match your search." : "No properties in database."}
              </p>
              <Button onClick={onAddProperty} size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add First Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {properties.map((property) => (
                <Card key={property.id} className="group relative overflow-hidden hover:shadow-md transition-all bg-background/50 border-border/50">
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
                            property.status === 'active' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' :
                            property.status === 'suspending' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' :
                            property.status === 'hold' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                            property.status === 'sold' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                            property.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' :
                            'bg-muted text-muted-foreground border-border'
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
        
        {/* Pagination - Slim Style */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-3 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 text-xs px-2"
            >
              <ChevronLeft className="h-3 w-3 mr-0.5" />
              Prev
            </Button>
            
            <div className="flex items-center gap-1">
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
                    className="h-6 w-6 p-0 text-[10px]"
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
              className="h-7 text-xs px-2"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
            
            <span className="text-[10px] text-muted-foreground ml-2">
              {startIndex + 1}-{Math.min(endIndex, allProperties.length)} of {allProperties.length}
            </span>
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