import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Download,
  Archive,
  MoreHorizontal,
  CheckSquare,
  Square,
  Copy,
  Settings,
  SortAsc,
  SortDesc
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
  const { user, profile } = useAuth();
  const { isAdmin } = useAdminCheck();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<'created_at' | 'price' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Multi-selection state
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Don't render if not authenticated or not admin
  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Authentication Required</h3>
            <p className="text-red-600">Please log in to access property management.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">You need admin privileges to access property management.</p>
            <p className="text-sm text-gray-500 mt-2">Current role: {profile?.role || 'No role assigned'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
      const { error } = await supabase.rpc('delete_property_admin_property', { p_property_id: propertyId });
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
    if (window.confirm(`⚠️ Are you sure you want to delete "${propertyTitle}"?\n\nThis action cannot be undone and will permanently remove all property data including images and ratings.`)) {
      console.log('Admin confirmed deletion of property:', propertyId);
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleEdit = (property: Property) => {
    console.log('🔧 Opening edit modal for property:', property.id, property.title);
    console.log('Property data:', property);
    setEditingProperty(property);
    setIsEditModalOpen(true);
  };

  const handleView = (property: Property) => {
    console.log('👁️ Opening view modal for property:', property.id, property.title);
    console.log('Property data:', property);
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

  // Multi-selection handlers
  const handleSelectProperty = (propertyId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedProperties);
    if (isSelected) {
      newSelection.add(propertyId);
    } else {
      newSelection.delete(propertyId);
    }
    setSelectedProperties(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = new Set(properties.map(p => p.id));
      setSelectedProperties(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedProperties(new Set());
      setShowBulkActions(false);
    }
  };

  // Bulk operations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (propertyIds: string[]) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', propertyIds);
      
      if (error) {
        console.error('Bulk delete error:', error);
        throw new Error(`Failed to delete properties: ${error.message}`);
      }
    },
    onSuccess: () => {
      showSuccess("Properties Deleted", `${selectedProperties.size} properties have been deleted successfully.`);
      setSelectedProperties(new Set());
      setShowBulkActions(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error: any) => {
      console.error('Bulk delete mutation error:', error);
      showError("Bulk Delete Failed", error.message || 'Failed to delete selected properties');
    },
  });

  const bulkStatusUpdateMutation = useMutation({
    mutationFn: async ({ propertyIds, status }: { propertyIds: string[], status: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .in('id', propertyIds);
      
      if (error) {
        console.error('Bulk status update error:', error);
        throw new Error(`Failed to update properties: ${error.message}`);
      }
    },
    onSuccess: (_, { status }) => {
      showSuccess("Properties Updated", `${selectedProperties.size} properties status changed to ${status}.`);
      setSelectedProperties(new Set());
      setShowBulkActions(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error: any) => {
      console.error('Bulk status update mutation error:', error);
      showError("Bulk Update Failed", error.message || 'Failed to update selected properties');
    },
  });

  const handleBulkDelete = () => {
    const selectedCount = selectedProperties.size;
    if (window.confirm(`⚠️ Are you sure you want to delete ${selectedCount} selected properties?\n\nThis action cannot be undone and will permanently remove all property data including images and ratings.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedProperties));
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    const selectedCount = selectedProperties.size;
    if (window.confirm(`Are you sure you want to change the status of ${selectedCount} selected properties to "${status}"?`)) {
      bulkStatusUpdateMutation.mutate({ 
        propertyIds: Array.from(selectedProperties), 
        status 
      });
    }
  };

  const handleExportSelected = () => {
    const selectedProps = properties.filter(p => selectedProperties.has(p.id));
    const csvContent = [
      ['Title', 'Type', 'Location', 'Price', 'Status', 'Bedrooms', 'Bathrooms', 'Area (sqm)', 'Created'],
      ...selectedProps.map(p => [
        p.title,
        p.property_type,
        `${p.location}, ${p.city}`,
        p.price?.toString() || '0',
        p.status,
        p.bedrooms?.toString() || '0',
        p.bathrooms?.toString() || '0',
        p.area_sqm?.toString() || '0',
        new Date(p.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess("Export Complete", `${selectedProps.length} properties exported to CSV.`);
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
    <TooltipProvider>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 min-h-screen">
        
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Enhanced Property Management
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Advanced property administration with bulk operations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{properties.length} Properties Loaded</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                    <Eye className="h-4 w-4" />
                    <span>View & Edit</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>Bulk Operations</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  console.log('🆕 Add Property button clicked in PropertyListManagement');
                  onAddProperty?.();
                }}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Property
              </Button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/5 rounded-full translate-y-12"></div>
        </div>

        {/* Enhanced Search & Filters */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search properties by title, location, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
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
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
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
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={handleRetry} 
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh property data</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-blue-800">
                  {selectedProperties.size} properties selected
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProperties(new Set());
                    setShowBulkActions(false);
                  }}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportSelected}
                        className="text-green-600 border-green-300 hover:bg-green-100"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export selected properties to CSV</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Select onValueChange={handleBulkStatusUpdate}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Set Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Set Active</SelectItem>
                    <SelectItem value="inactive">Set Inactive</SelectItem>
                    <SelectItem value="pending_approval">Set Pending</SelectItem>
                    <SelectItem value="sold">Set Sold</SelectItem>
                    <SelectItem value="rented">Set Rented</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {bulkDeleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Properties Table */}
      <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Properties Database ({properties.length})
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                Complete management interface for all property listings
              </CardDescription>
            </div>
            
            {selectedProperties.size > 0 && (
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 rounded-lg px-4 py-2">
                <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-800 dark:text-blue-200">
                  {selectedProperties.size} Selected
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {properties.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-6">
                  <Building2 className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">No Properties Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                      ? "No properties match your current search criteria. Try adjusting your filters or search terms."
                      : "Ready to add your first property? Create a new listing to get started with the property management system."
                    }
                  </p>
                  
                  {(!searchTerm && statusFilter === "all" && typeFilter === "all") ? (
                    <Button 
                      onClick={onAddProperty} 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Property
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setTypeFilter("all");
                      }}
                      className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-700 dark:to-blue-800">
                    <TableRow className="border-b-2 border-blue-200 dark:border-blue-700">
                      <TableHead className="w-12 text-center py-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Checkbox
                              checked={selectedProperties.size === properties.length && properties.length > 0}
                              onCheckedChange={handleSelectAll}
                              aria-label="Select all properties"
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </TooltipTrigger>
                          <TooltipContent>Select all visible properties</TooltipContent>
                        </Tooltip>
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">Property Details</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">Type</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">Location</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">Price & Listing</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">Status</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">Created</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property, index) => (
                      <TableRow 
                        key={property.id} 
                        className={`
                          hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 
                          transition-all duration-300 border-b border-gray-100 dark:border-gray-700
                          ${selectedProperties.has(property.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''}
                          ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-800/50'}
                        `}
                      >
                        <TableCell className="w-12 text-center py-4">
                          <Checkbox
                            checked={selectedProperties.has(property.id)}
                            onCheckedChange={(checked) => handleSelectProperty(property.id, checked as boolean)}
                            aria-label={`Select ${property.title}`}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                              {property.title}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                {property.bedrooms || 0} Bedrooms
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                {property.bathrooms || 0} Bathrooms
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                {property.area_sqm || 0}m²
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <Badge 
                            variant="outline" 
                            className="capitalize font-medium px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-gray-300 dark:border-gray-600"
                          >
                            {property.property_type}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 dark:text-white">{property.location}</div>
                            {property.city && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                {property.city}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-bold text-lg text-gray-900 dark:text-white">
                              {property.price ? formatIDR(property.price) : (
                                <span className="text-gray-400 dark:text-gray-500 text-sm">Price not set</span>
                              )}
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="capitalize text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            >
                              {property.listing_type}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          {getStatusBadge(property.status)}
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {new Date(property.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleView(property)}
                                  className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View property details</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEdit(property)}
                                  className="h-9 w-9 p-0 hover:bg-green-50 dark:hover:bg-green-900 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200 hover:scale-105"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit property information</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(property.id, property.title)}
                                  className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 hover:scale-105"
                                  disabled={deletePropertyMutation.isPending}
                                >
                                  {deletePropertyMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete property permanently</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Edit Modal */}
      <PropertyEditModal
        property={editingProperty}
        isOpen={isEditModalOpen && !!editingProperty}
        onClose={handleCloseEditModal}
      />

      {/* Property View Modal */}
      <PropertyViewModal
        property={viewingProperty}
        isOpen={isViewModalOpen && !!viewingProperty}
        onClose={handleCloseViewModal}
        onEdit={handleEditFromView}
      />
      </div>
    </TooltipProvider>
  );
};

export default PropertyListManagement;
