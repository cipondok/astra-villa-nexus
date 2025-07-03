import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, Eye, X, DollarSign, Clock, MapPin } from "lucide-react";

interface ServiceItem {
  item_name: string;
  item_description: string;
  price: number;
  duration_minutes: number;
  unit: string;
}

interface ServiceFormData {
  service_name: string;
  service_description: string;
  service_category: string;
  location_type: string;
  duration_value: number;
  duration_unit: string;
  requirements: string;
  cancellation_policy: string;
  currency: string;
  is_active: boolean;
}

const ServiceForm = ({ 
  initialData, 
  initialItems, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  initialData?: ServiceFormData;
  initialItems?: ServiceItem[];
  onSubmit: (data: ServiceFormData, items: ServiceItem[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [serviceData, setServiceData] = useState<ServiceFormData>(
    initialData || {
      service_name: '',
      service_description: '',
      service_category: '',
      location_type: 'on_site',
      duration_value: 1,
      duration_unit: 'hours',
      requirements: '',
      cancellation_policy: '',
      currency: 'IDR',
      is_active: true
    }
  );
  
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>(
    initialItems || [{ 
      item_name: '', 
      item_description: '', 
      price: 0, 
      duration_minutes: 60, 
      unit: 'per_item' 
    }]
  );

  const addServiceItem = () => {
    setServiceItems([...serviceItems, { 
      item_name: '', 
      item_description: '', 
      price: 0, 
      duration_minutes: 60, 
      unit: 'per_item' 
    }]);
  };

  const removeServiceItem = (index: number) => {
    if (serviceItems.length > 1) {
      setServiceItems(serviceItems.filter((_, i) => i !== index));
    }
  };

  const updateServiceItem = (index: number, field: string, value: any) => {
    const updated = [...serviceItems];
    updated[index] = { ...updated[index], [field]: value };
    setServiceItems(updated);
  };

  const handleSubmit = () => {
    if (!serviceData.service_name.trim()) return;
    onSubmit(serviceData, serviceItems.filter(item => item.item_name.trim()));
  };

  return (
    <div className="space-y-6">
      {/* Service Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_name">Service Name *</Label>
          <Input
            id="service_name"
            value={serviceData.service_name}
            onChange={(e) => setServiceData(prev => ({...prev, service_name: e.target.value}))}
            placeholder="e.g., AC Repair Service"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service_category">Category</Label>
          <Input
            id="service_category"
            value={serviceData.service_category}
            onChange={(e) => setServiceData(prev => ({...prev, service_category: e.target.value}))}
            placeholder="e.g., Home Maintenance"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service_description">Description</Label>
        <Textarea
          id="service_description"
          value={serviceData.service_description}
          onChange={(e) => setServiceData(prev => ({...prev, service_description: e.target.value}))}
          placeholder="Describe your service in detail..."
          rows={3}
        />
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location_type">Location Type</Label>
          <Select 
            value={serviceData.location_type} 
            onValueChange={(value) => setServiceData(prev => ({...prev, location_type: value}))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on_site">On-site</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_value">Duration</Label>
          <Input
            id="duration_value"
            type="number"
            min="1"
            value={serviceData.duration_value}
            onChange={(e) => setServiceData(prev => ({...prev, duration_value: parseInt(e.target.value) || 1}))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_unit">Duration Unit</Label>
          <Select 
            value={serviceData.duration_unit} 
            onValueChange={(value) => setServiceData(prev => ({...prev, duration_unit: value}))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Service Items & Pricing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Service Items & Pricing</Label>
          <Button type="button" variant="outline" size="sm" onClick={addServiceItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        
        {serviceItems.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                {serviceItems.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeServiceItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Name *</Label>
                  <Input
                    value={item.item_name}
                    onChange={(e) => updateServiceItem(index, 'item_name', e.target.value)}
                    placeholder="e.g., Basic AC Cleaning"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Price (IDR) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateServiceItem(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="150000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Item Description</Label>
                <Textarea
                  value={item.item_description}
                  onChange={(e) => updateServiceItem(index, 'item_description', e.target.value)}
                  placeholder="Describe this service item..."
                  rows={2}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            value={serviceData.requirements}
            onChange={(e) => setServiceData(prev => ({...prev, requirements: e.target.value}))}
            placeholder="Any special requirements or preparations needed..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
          <Textarea
            id="cancellation_policy"
            value={serviceData.cancellation_policy}
            onChange={(e) => setServiceData(prev => ({...prev, cancellation_policy: e.target.value}))}
            placeholder="Cancellation terms and conditions..."
            rows={3}
          />
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={serviceData.is_active}
          onCheckedChange={(checked) => setServiceData(prev => ({...prev, is_active: checked}))}
        />
        <Label htmlFor="is_active">Activate service</Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button 
          onClick={handleSubmit} 
          disabled={!serviceData.service_name.trim() || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Service' : 'Create Service'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const VendorServiceManagement = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Format IDR currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch vendor's services
  const { data: services, isLoading } = useQuery({
    queryKey: ['vendor-services', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_service_items(*)
        `)
        .eq('vendor_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async ({ serviceData, serviceItems }: { serviceData: ServiceFormData; serviceItems: ServiceItem[] }) => {
      const response = await supabase.functions.invoke('vendor-service-management', {
        body: {
          action: 'create',
          vendor_id: user?.id,
          serviceData,
          serviceItems
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Success", "Service created successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to create service");
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, serviceData, serviceItems }: { serviceId: string; serviceData: ServiceFormData; serviceItems: ServiceItem[] }) => {
      const response = await supabase.functions.invoke('vendor-service-management', {
        body: {
          action: 'update',
          serviceId,
          serviceData,
          serviceItems
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Success", "Service updated successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      setIsEditDialogOpen(false);
      setEditingService(null);
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to update service");
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await supabase.functions.invoke('vendor-service-management', {
        body: {
          action: 'delete',
          serviceId
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Success", "Service deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      setDeleteServiceId(null);
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to delete service");
    }
  });

  const handleCreateService = (serviceData: ServiceFormData, serviceItems: ServiceItem[]) => {
    createServiceMutation.mutate({ serviceData, serviceItems });
  };

  const handleUpdateService = (serviceData: ServiceFormData, serviceItems: ServiceItem[]) => {
    if (!editingService) return;
    updateServiceMutation.mutate({ 
      serviceId: editingService.id, 
      serviceData, 
      serviceItems 
    });
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const handleDeleteService = (serviceId: string) => {
    deleteServiceMutation.mutate(serviceId);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading your services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Services</h2>
          <p className="text-muted-foreground">Manage your service offerings and pricing</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6">
        {services?.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">No services yet</h3>
                <p className="text-muted-foreground">Start by creating your first service offering</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          services?.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.service_name}</CardTitle>
                    <CardDescription>{service.service_category}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedService(service)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteServiceId(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.service_description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.duration_value} {service.duration_unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{service.location_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.currency}</span>
                    </div>
                  </div>

                  {service.vendor_service_items && service.vendor_service_items.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Pricing</Label>
                      <div className="space-y-1">
                        {service.vendor_service_items.slice(0, 2).map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.item_name}</span>
                            <span className="font-medium">{formatIDR(item.price || 0)}</span>
                          </div>
                        ))}
                        {service.vendor_service_items.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{service.vendor_service_items.length - 2} more items</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Service Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
          </DialogHeader>
          <ServiceForm
            onSubmit={handleCreateService}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createServiceMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              initialData={{
                service_name: editingService.service_name,
                service_description: editingService.service_description || '',
                service_category: editingService.service_category || '',
                location_type: editingService.location_type || 'on_site',
                duration_value: editingService.duration_value || 1,
                duration_unit: editingService.duration_unit || 'hours',
                requirements: editingService.requirements || '',
                cancellation_policy: editingService.cancellation_policy || '',
                currency: editingService.currency || 'IDR',
                is_active: editingService.is_active
              }}
              initialItems={editingService.vendor_service_items || []}
              onSubmit={handleUpdateService}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingService(null);
              }}
              isLoading={updateServiceMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Service Details Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedService?.service_name}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <p>{selectedService.service_description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{selectedService.service_category}</p>
                </div>
                <div>
                  <Label className="font-medium">Duration</Label>
                  <p className="text-sm text-muted-foreground">{selectedService.duration_value} {selectedService.duration_unit}</p>
                </div>
              </div>
              {selectedService.requirements && (
                <div>
                  <Label className="font-medium">Requirements</Label>
                  <p className="text-sm text-muted-foreground">{selectedService.requirements}</p>
                </div>
              )}
              {selectedService.cancellation_policy && (
                <div>
                  <Label className="font-medium">Cancellation Policy</Label>
                  <p className="text-sm text-muted-foreground">{selectedService.cancellation_policy}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteServiceId && handleDeleteService(deleteServiceId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorServiceManagement;