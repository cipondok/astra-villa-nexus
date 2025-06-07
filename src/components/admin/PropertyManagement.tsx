
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Search, Check, X, Eye, Plus } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import PropertyInsertForm from "./PropertyInsertForm";

const PropertyManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(full_name, email),
          agent:profiles!properties_agent_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('approval_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
      showSuccess("Property Updated", "Property status has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleApprovalChange = (propertyId: string, newStatus: string) => {
    updatePropertyMutation.mutate({ propertyId, updates: { approval_status: newStatus } });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to safely get owner data
  const getOwnerData = (owner: any) => {
    if (Array.isArray(owner)) {
      return owner[0] || null;
    }
    return owner;
  };

  // Helper function to safely get agent data
  const getAgentData = (agent: any) => {
    if (Array.isArray(agent)) {
      return agent[0] || null;
    }
    return agent;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Property List</TabsTrigger>
          <TabsTrigger value="add">Add Property</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Management
              </CardTitle>
              <CardDescription>
                Manage property listings and approval status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties by title or location..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Properties Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Owner/Agent</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading properties...
                        </TableCell>
                      </TableRow>
                    ) : properties?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No properties found
                        </TableCell>
                      </TableRow>
                    ) : (
                      properties?.map((property) => {
                        const ownerData = getOwnerData(property.owner);
                        const agentData = getAgentData(property.agent);
                        
                        return (
                          <TableRow key={property.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{property.title}</div>
                                <div className="text-sm text-muted-foreground">{property.location}</div>
                                <div className="text-xs text-muted-foreground">
                                  {property.bedrooms}BR • {property.bathrooms}BA • {property.area_sqm}m²
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  Owner: {ownerData?.full_name || 'Unknown'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {ownerData?.email}
                                </div>
                                {agentData && (
                                  <div className="text-xs text-muted-foreground">
                                    Agent: {agentData.full_name}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline">{property.property_type}</Badge>
                                <div className="text-xs text-muted-foreground">{property.listing_type}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {property.price ? formatPrice(property.price) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(property.approval_status || 'pending')}>
                                {property.approval_status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprovalChange(property.id, 'approved')}
                                  disabled={property.approval_status === 'approved'}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprovalChange(property.id, 'rejected')}
                                  disabled={property.approval_status === 'rejected'}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <PropertyInsertForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManagement;
