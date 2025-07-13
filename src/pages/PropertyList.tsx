
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
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
  Clock
} from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { formatIDR } from "@/utils/currency";

const PropertyList = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Check user permissions
  const canCreateProperty = profile?.role && ['property_owner', 'agent', 'admin'].includes(profile.role);
  const canEditAll = profile?.role && ['admin'].includes(profile.role);
  const canApprove = profile?.role && ['admin', 'agent'].includes(profile.role);
  const isAdmin = profile?.role === 'admin';

  // Fetch properties based on user role
  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['properties', user?.id, profile?.role],
    queryFn: async () => {
      let query = supabase.from('properties').select('*');
      
      // Role-based filtering
      if (profile?.role === 'property_owner') {
        query = query.eq('owner_id', user?.id);
      } else if (profile?.role === 'agent') {
        query = query.or(`owner_id.eq.${user?.id},agent_id.eq.${user?.id}`);
      }
      // Admin sees all properties
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!profile,
  });

  // Filter properties based on search and filters
  const filteredProperties = properties?.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesType = typeFilter === "all" || property.property_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

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

  const canEditProperty = (property: any) => {
    return isAdmin || property.owner_id === user?.id || property.agent_id === user?.id;
  };

  const canDeleteProperty = (property: any) => {
    return isAdmin || property.owner_id === user?.id;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to view properties.</p>
              <Button onClick={() => navigate('/')}>Go to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={() => setLanguage(language === "en" ? "id" : "en")}
          theme={theme}
          onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
        />
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-8 w-8" />
                  My Properties
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage your property listings and view analytics
                </p>
              </div>
              {canCreateProperty && (
                <Button onClick={() => navigate('/add-property')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Property
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
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
                <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Properties ({filteredProperties.length})</CardTitle>
              <CardDescription>
                {profile?.role === 'admin' ? 'All properties in the system' : 'Your property listings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading properties...</div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {canCreateProperty ? "Get started by adding your first property." : "No properties available."}
                  </p>
                  {canCreateProperty && (
                    <Button onClick={() => navigate('/add-property')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
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
                      {filteredProperties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{property.title}</div>
                              <div className="text-sm text-gray-500">
                                {property.bedrooms}BR • {property.bathrooms}BA • {property.area_sqm}m²
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{property.property_type}</TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>
                            {property.price ? formatIDR(property.price) : 'N/A'}
                            <div className="text-xs text-gray-500 capitalize">{property.listing_type}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/property/${property.id}`)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {canEditProperty(property) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/property/${property.id}/edit`)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                              {canApprove && property.status === 'pending_approval' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateStatusMutation.mutate({ propertyId: property.id, status: 'active' })}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              {canDeleteProperty(property) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(property.id, property.title)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
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
      </div>
    </div>
  );
};

export default PropertyList;
