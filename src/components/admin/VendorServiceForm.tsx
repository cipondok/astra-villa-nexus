import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Plus, Trash2, Save, X } from "lucide-react";

interface VendorServiceFormProps {
  service?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ServiceItem {
  item_name: string;
  item_description: string;
  price: number;
  duration_minutes: number;
  unit: string;
  currency: string;
  is_available: boolean;
}

const VendorServiceForm = ({ service, onSuccess, onCancel }: VendorServiceFormProps) => {
  const [formData, setFormData] = useState({
    service_name: "",
    service_description: "",
    service_category: "",
    location_type: "on_site",
    duration_value: 1,
    duration_unit: "hours",
    requirements: "",
    cancellation_policy: "",
    currency: "IDR",
    is_active: true,
    featured: false,
    vendor_id: ""
  });

  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const { showSuccess, showError } = useAlert();

  // Fetch vendors for selection
  const { data: vendors } = useQuery({
    queryKey: ['vendors-for-service'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          vendor_business_profiles(business_name, business_email)
        `)
        .eq('role', 'vendor')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Initialize form data when editing
  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || "",
        service_description: service.service_description || "",
        service_category: service.service_category || "",
        location_type: service.location_type || "on_site",
        duration_value: service.duration_value || 1,
        duration_unit: service.duration_unit || "hours",
        requirements: service.requirements || "",
        cancellation_policy: service.cancellation_policy || "",
        currency: service.currency || "IDR",
        is_active: service.is_active ?? true,
        featured: service.featured ?? false,
        vendor_id: service.vendor_id || ""
      });
      
      setSelectedVendor(service.vendor_id || "");
      
      if (service.vendor_service_items) {
        setServiceItems(service.vendor_service_items.map((item: any) => ({
          item_name: item.item_name,
          item_description: item.item_description || "",
          price: item.price || 0,
          duration_minutes: item.duration_minutes || 60,
          unit: item.unit || "per_item",
          currency: item.currency || "IDR",
          is_available: item.is_available ?? true
        })));
      }
    }
  }, [service]);

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.functions.invoke('vendor-service-management', {
        method: 'POST',
        body: {
          action: 'create',
          serviceData: data.serviceData,
          serviceItems: data.serviceItems,
          vendor_id: data.vendorId
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Service created successfully");
      onSuccess();
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to create service");
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.functions.invoke('vendor-service-management', {
        method: 'PUT',
        body: {
          action: 'update',
          serviceData: data.serviceData,
          serviceItems: data.serviceItems
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Service updated successfully");
      onSuccess();
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to update service");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_name || !selectedVendor) {
      showError("Error", "Please fill required fields");
      return;
    }

    const payload = {
      serviceData: {
        ...formData,
        vendor_id: selectedVendor
      },
      serviceItems,
      vendorId: selectedVendor
    };

    if (service) {
      updateServiceMutation.mutate(payload);
    } else {
      createServiceMutation.mutate(payload);
    }
  };

  const addServiceItem = () => {
    setServiceItems([...serviceItems, {
      item_name: "",
      item_description: "",
      price: 0,
      duration_minutes: 60,
      unit: "per_item",
      currency: "IDR",
      is_available: true
    }]);
  };

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const updateServiceItem = (index: number, field: string, value: any) => {
    const updated = [...serviceItems];
    updated[index] = { ...updated[index], [field]: value };
    setServiceItems(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Service Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>Basic details about the service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vendor *</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor} disabled={!!service}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.vendor_business_profiles?.business_name || vendor.full_name}
                      <span className="text-muted-foreground ml-2">({vendor.email})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Service Name *</Label>
              <Input
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                placeholder="Enter service name"
                required
              />
            </div>
          </div>

          <div>
            <Label>Service Description</Label>
            <Textarea
              value={formData.service_description}
              onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
              placeholder="Describe the service..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Service Category</Label>
              <Input
                value={formData.service_category}
                onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                placeholder="e.g., Plumbing, Electrical"
              />
            </div>

            <div>
              <Label>Location Type</Label>
              <Select 
                value={formData.location_type} 
                onValueChange={(value) => setFormData({ ...formData, location_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_site">On Site</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Duration</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  value={formData.duration_value}
                  onChange={(e) => setFormData({ ...formData, duration_value: parseInt(e.target.value) || 1 })}
                  className="flex-1"
                />
                <Select 
                  value={formData.duration_unit} 
                  onValueChange={(value) => setFormData({ ...formData, duration_unit: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>Requirements</Label>
            <Textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Any special requirements or prerequisites..."
              rows={2}
            />
          </div>

          <div>
            <Label>Cancellation Policy</Label>
            <Textarea
              value={formData.cancellation_policy}
              onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
              placeholder="Describe the cancellation policy..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Items & Pricing</CardTitle>
              <CardDescription>Define specific items and their pricing</CardDescription>
            </div>
            <Button type="button" onClick={addServiceItem} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {serviceItems.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Service Item #{index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeServiceItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={item.item_name}
                    onChange={(e) => updateServiceItem(index, 'item_name', e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <Label>Price ({formData.currency})</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateServiceItem(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="Enter price"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label>Item Description</Label>
                <Textarea
                  value={item.item_description}
                  onChange={(e) => updateServiceItem(index, 'item_description', e.target.value)}
                  placeholder="Describe this service item..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={item.duration_minutes}
                    onChange={(e) => updateServiceItem(index, 'duration_minutes', parseInt(e.target.value) || 60)}
                  />
                </div>
                
                <div>
                  <Label>Unit</Label>
                  <Select 
                    value={item.unit} 
                    onValueChange={(value) => updateServiceItem(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_item">Per Item</SelectItem>
                      <SelectItem value="per_hour">Per Hour</SelectItem>
                      <SelectItem value="per_day">Per Day</SelectItem>
                      <SelectItem value="per_project">Per Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={(checked) => updateServiceItem(index, 'is_available', checked)}
                  />
                  <Label>Available</Label>
                </div>
              </div>
            </Card>
          ))}
          
          {serviceItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No service items added yet. Click "Add Item" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};

export default VendorServiceForm;