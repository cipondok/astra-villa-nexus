
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatIDR } from "@/utils/currency";
import PropertyViewModal from "./PropertyViewModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PropertyListManagementProps {
  onAddProperty?: () => void;
}

const PropertyListManagement = ({ onAddProperty }: PropertyListManagementProps) => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const itemsPerPage = 10;

  // Fetch all properties with owner and agent details
  const { data: propertiesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-properties', currentPage, searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      console.log('Fetching properties for admin dashboard...');
      
      try {
        // Build the base query with proper joins
        let query = supabase
          .from('properties')
          .select(`
            *,
            owner:profiles!properties_owner_id_fkey(id, full_name, email),
            agent:profiles!properties_agent_id_fkey(id, full_name, email)
          `);

        // Apply filters
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
        }
        if (statusFilter !== "all") {
          query = query.eq('status', statusFilter);
        }
        if (typeFilter !== "all") {
          query = query.eq('property_type', typeFilter);
        }

        // Get total count with same filters
        let countQuery = supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        if (searchTerm) {
          countQuery = countQuery.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
        }
        if (statusFilter !== "all") {
          countQuery = countQuery.eq('status', statusFilter);
        }
        if (typeFilter !== "all") {
          countQuery = countQuery.eq('property_type', typeFilter);
        }

        const { count } = await countQuery;

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        const { data, error } = await query
          .range(from, to)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching properties:', error);
          throw error;
        }
        
        console.log('Properties fetched successfully:', data?.length || 0);
        console.log('Sample property data:', data?.[0]);
        
        return {
          properties: data || [],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / itemsPerPage)
        };
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        throw error;
      }
    },
  });

  const properties = propertiesData?.properties || [];
  const totalPages = propertiesData?.totalPages || 1;
  const totalCount = propertiesData?.totalCount || 0;

  console.log('Current properties state:', properties.length, 'Total count:', totalCount);

  // Delete property mutation
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
      refetch();
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  // Update property status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ propertyId, status }: { propertyId: string; status: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ status, approval_status: status === 'active' ? 'approved' : 'pending' })
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Status Updated", "Property status has been updated successfully.");
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleDelete = (propertyId: string, propertyTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${propertyTitle}"?`)) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleView = (property: any) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const handleEdit = (propertyId: string) => {
    // Navigate to edit page or open edit modal
    window.open(`/property/${propertyId}/edit`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'sold':
        return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700"><CheckCircle className="h-3 w-3 mr-1" />Sold</Badge>;
      case 'rented':
        return <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700"><CheckCircle className="h-3 w-3 mr-1" />Rented</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Property Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all property listings in the system ({totalCount} properties)
          </p>
        </div>
        <Button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={onAddProperty}
        >
          <Plus className="h-4 w-4" />
          Add New Property
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Status</SelectItem>
                <SelectItem value="active" className="text-gray-900 dark:text-gray-100">Active</SelectItem>
                <SelectItem value="pending_approval" className="text-gray-900 dark:text-gray-100">Pending Approval</SelectItem>
                <SelectItem value="sold" className="text-gray-900 dark:text-gray-100">Sold</SelectItem>
                <SelectItem value="rented" className="text-gray-900 dark:text-gray-100">Rented</SelectItem>
                <SelectItem value="inactive" className="text-gray-900 dark:text-gray-100">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Types</SelectItem>
                <SelectItem value="house" className="text-gray-900 dark:text-gray-100">House</SelectItem>
                <SelectItem value="apartment" className="text-gray-900 dark:text-gray-100">Apartment</SelectItem>
                <SelectItem value="villa" className="text-gray-900 dark:text-gray-100">Villa</SelectItem>
                <SelectItem value="townhouse" className="text-gray-900 dark:text-gray-100">Townhouse</SelectItem>
                <SelectItem value="condo" className="text-gray-900 dark:text-gray-100">Condo</SelectItem>
                <SelectItem value="land" className="text-gray-900 dark:text-gray-100">Land</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Properties ({properties.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Complete list of all property listings in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No properties found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                  ? "No properties match your current filters."
                  : "Start by adding your first property to the system."
                }
              </p>
              {(!searchTerm && statusFilter === "all" && typeFilter === "all") && (
                <Button onClick={onAddProperty} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Property
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="text-gray-700 dark:text-gray-300">Property</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Owner/Agent</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Location</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Price</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => {
                      // Handle owner and agent data - they could be arrays or single objects
                      const owner = Array.isArray(property.owner) ? property.owner[0] : property.owner;
                      const agent = Array.isArray(property.agent) ? property.agent[0] : property.agent;
                      
                      return (
                        <TableRow key={property.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{property.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {property.bedrooms}BR • {property.bathrooms}BA • {property.area_sqm}m²
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                Owner: {owner?.full_name || 'Unknown'}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">{owner?.email}</div>
                              {agent && (
                                <>
                                  <div className="font-medium text-blue-600 dark:text-blue-400 mt-1">
                                    Agent: {agent.full_name}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">{agent.email}</div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-gray-900 dark:text-gray-100">{property.property_type}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{property.location}</TableCell>
                          <TableCell>
                            <div className="text-gray-900 dark:text-gray-100">
                              {property.price ? formatIDR(property.price) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{property.listing_type}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{new Date(property.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleView(property)}
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(property.id)}
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {property.status === 'pending_approval' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateStatusMutation.mutate({ propertyId: property.id, status: 'active' })}
                                  className="border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(property.id, property.title)}
                                className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i + 1);
                            }}
                            isActive={currentPage === i + 1}
                            className="text-gray-900 dark:text-gray-100"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Property View Modal */}
      <PropertyViewModal
        property={selectedProperty}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedProperty(null);
        }}
      />
    </div>
  );
};

export default PropertyListManagement;
