import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Building2,
  Loader2,
  AlertTriangle
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

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  console.log('🔐 Auth Check:', { 
    userEmail: user?.email, 
    profileRole: profile?.role, 
    isAdmin 
  });

  // Fetch properties
  const { data: properties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['simple-properties', searchTerm],
    queryFn: async () => {
      console.log('🔍 Fetching properties...');
      
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }
      
      console.log('✅ Properties loaded:', data?.length);
      return data || [];
    },
    enabled: !!user && isAdmin,
  });

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
            Working version - {properties.length} properties found
          </p>
        </div>
        <Button onClick={onAddProperty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedProperties.size > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete {selectedProperties.size} Selected
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({properties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No properties match your search." : "No properties in database."}
              </p>
              <Button onClick={onAddProperty}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Property
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProperties.size === properties.length && properties.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProperties.has(property.id)}
                        onCheckedChange={(checked) => handleSelect(property.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms}BR • {property.bathrooms}BA • {property.area_sqm}m²
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {property.property_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{property.location}</div>
                        {property.city && <div className="text-gray-500">{property.city}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {property.price ? formatIDR(property.price) : 'No price'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {property.listing_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          property.status === 'active' ? 'bg-green-100 text-green-800' :
                          property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/properties/${property.id}`, '_blank')}
                          title="View Property"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log('Edit property:', property.id);
                            showSuccess("Edit", `Edit functionality for "${property.title}" coming soon!`);
                          }}
                          title="Edit Property"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(property.id, property.title)}
                          disabled={deleteMutation.isPending}
                          title="Delete Property"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePropertyManagement;