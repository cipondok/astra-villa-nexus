import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";

const ApprovedServiceNamesManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch approved service names
  const { data: approvedServices, isLoading } = useQuery({
    queryKey: ['approved-service-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approved_service_names')
        .select(`
          *,
          vendor_service_categories(name),
          profiles(full_name)
        `)
        .order('service_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch service name requests
  const { data: serviceRequests } = useQuery({
    queryKey: ['service-name-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_name_requests')
        .select(`
          *,
          vendor_service_categories(name),
          profiles!service_name_requests_requested_by_fkey(full_name, email),
          reviewer:profiles!service_name_requests_reviewed_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['vendor-service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  // Create service name mutation
  const createServiceMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('approved_service_names')
        .insert({
          service_name: newServiceName,
          description: newServiceDescription,
          category_id: selectedCategoryId || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Service name added successfully");
      queryClient.invalidateQueries({ queryKey: ['approved-service-names'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to add service name");
    }
  });

  // Handle service request approval
  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected', adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('service_name_requests')
        .update({
          status: action,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, add to approved service names
      if (action === 'approved') {
        const request = serviceRequests?.find(r => r.id === requestId);
        if (request) {
          const { error: insertError } = await supabase
            .from('approved_service_names')
            .insert({
              service_name: request.requested_name,
              description: request.description,
              category_id: request.category_id
            });
          
          if (insertError) throw insertError;
        }
      }

      showSuccess("Success", `Request ${action} successfully`);
      queryClient.invalidateQueries({ queryKey: ['service-name-requests'] });
      queryClient.invalidateQueries({ queryKey: ['approved-service-names'] });
    } catch (error: any) {
      showError("Error", error.message || "Failed to update request");
    }
  };

  const resetForm = () => {
    setNewServiceName("");
    setNewServiceDescription("");
    setSelectedCategoryId("");
    setEditingService(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approved Service Names</h2>
          <p className="text-muted-foreground">Manage the list of approved service names that vendors can use</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service Name
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service Name</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Enter service name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  placeholder="Describe the service"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => createServiceMutation.mutate()}
                disabled={!newServiceName.trim() || createServiceMutation.isPending}
                className="w-full"
              >
                {createServiceMutation.isPending ? 'Adding...' : 'Add Service Name'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="approved" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approved">Approved Services</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4">
            {approvedServices?.map((service) => (
              <Card key={service.id} className="card-ios">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.service_name}</CardTitle>
                      <CardDescription>
                        {service.vendor_service_categories?.name && (
                          <Badge variant="outline" className="mr-2">
                            {service.vendor_service_categories.name}
                          </Badge>
                        )}
                        Created: {new Date(service.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                {service.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4">
            {serviceRequests?.map((request) => (
              <Card key={request.id} className="card-ios">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.requested_name}</CardTitle>
                      <CardDescription>
                        Requested by: {request.profiles?.full_name} ({request.profiles?.email})
                        <br />
                        {request.vendor_service_categories?.name && (
                          <Badge variant="outline" className="mr-2 mt-1">
                            {request.vendor_service_categories.name}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        request.status === 'approved' ? 'default' : 
                        request.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {request.description && (
                    <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                  )}
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleRequestAction(request.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="mt-3 p-2 bg-muted rounded">
                      <p className="text-sm"><strong>Admin Notes:</strong> {request.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovedServiceNamesManagement;