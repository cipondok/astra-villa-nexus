
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

interface MainCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Subcategory {
  id: string;
  main_category_id: string;
  name: string;
  description: string;
  icon: string;
}

interface ServiceFormProps {
  service?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const EnhancedVendorServiceForm = ({ service, onClose, onSuccess }: ServiceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState({
    service_name: '',
    service_description: '',
    main_category_id: '',
    subcategory_id: '',
    duration_minutes: 60,
    location_type: 'on_site',
    requirements: '',
    cancellation_policy: '',
    is_active: true,
    featured: false,
    price_range: { min: 0, max: 0 }
  });
  const [serviceItems, setServiceItems] = useState([
    { item_name: '', item_description: '', price: 0, unit: 'per_item', duration_minutes: 60 }
  ]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        service_description: service.service_description || '',
        main_category_id: service.main_category_id || '',
        subcategory_id: service.subcategory_id || '',
        duration_minutes: service.duration_minutes || 60,
        location_type: service.location_type || 'on_site',
        requirements: service.requirements || '',
        cancellation_policy: service.cancellation_policy || '',
        is_active: service.is_active ?? true,
        featured: service.featured ?? false,
        price_range: service.price_range || { min: 0, max: 0 }
      });
    }
  }, [service]);

  useEffect(() => {
    if (formData.main_category_id) {
      const filtered = subcategories.filter(sub => sub.main_category_id === formData.main_category_id);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.main_category_id, subcategories]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      
      // Fetch main categories
      const { data: mainCats, error: mainError } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (mainError) throw mainError;
      setMainCategories(mainCats || []);

      // Fetch subcategories
      const { data: subCats, error: subError } = await supabase
        .from('vendor_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (subError) throw subError;
      setSubcategories(subCats || []);
      
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addServiceItem = () => {
    setServiceItems([...serviceItems, { 
      item_name: '', 
      item_description: '', 
      price: 0, 
      unit: 'per_item', 
      duration_minutes: 60 
    }]);
  };

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const updateServiceItem = (index: number, field: string, value: any) => {
    const updated = serviceItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setServiceItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create services",
        variant: "destructive"
      });
      return;
    }

    if (!formData.service_name.trim() || !formData.main_category_id) {
      toast({
        title: "Error",
        description: "Service name and main category are required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const serviceData = {
        ...formData,
        vendor_id: user.id
      };

      let serviceResult;
      if (service) {
        serviceResult = await supabase
          .from('vendor_services')
          .update(serviceData)
          .eq('id', service.id)
          .select()
          .single();
      } else {
        serviceResult = await supabase
          .from('vendor_services')
          .insert([serviceData])
          .select()
          .single();
      }

      if (serviceResult.error) throw serviceResult.error;

      // Save service items
      const serviceId = serviceResult.data.id;
      
      // Delete existing items if editing
      if (service) {
        await supabase
          .from('vendor_service_items')
          .delete()
          .eq('service_id', serviceId);
      }

      // Insert new items
      const itemsToInsert = serviceItems
        .filter(item => item.item_name.trim())
        .map(item => ({
          ...item,
          service_id: serviceId
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('vendor_service_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: `Service ${service ? 'updated' : 'created'} successfully`
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${service ? 'update' : 'create'} service`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="text-center">Loading categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
            <CardDescription>
              Create comprehensive service offerings with detailed categorization
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="service_name">Service Name *</Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                placeholder="Enter service name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="main_category_id">Main Category *</Label>
              <Select
                value={formData.main_category_id}
                onValueChange={(value) => setFormData({ ...formData, main_category_id: value, subcategory_id: '' })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory_id">Subcategory</Label>
              <Select
                value={formData.subcategory_id}
                onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                disabled={!formData.main_category_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.icon} {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_type">Location Type</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => setFormData({ ...formData, location_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_site">On-site (at customer location)</SelectItem>
                  <SelectItem value="remote">Remote/Virtual</SelectItem>
                  <SelectItem value="business_location">At business location</SelectItem>
                  <SelectItem value="flexible">Flexible location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service Description */}
          <div className="space-y-2">
            <Label htmlFor="service_description">Service Description</Label>
            <Textarea
              id="service_description"
              value={formData.service_description}
              onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
              placeholder="Describe your service in detail..."
              rows={3}
            />
          </div>

          {/* Service Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Service Items & Pricing</Label>
              <Button type="button" variant="outline" size="sm" onClick={addServiceItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {serviceItems.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input
                      value={item.item_name}
                      onChange={(e) => updateServiceItem(index, 'item_name', e.target.value)}
                      placeholder="Service item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (IDR)</Label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateServiceItem(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
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
                        <SelectItem value="per_sqm">Per Square Meter</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    {serviceItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeServiceItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label>Item Description</Label>
                  <Textarea
                    value={item.item_description}
                    onChange={(e) => updateServiceItem(index, 'item_description', e.target.value)}
                    placeholder="Describe this service item..."
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Any special requirements or preparations needed..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation_policy"
                value={formData.cancellation_policy}
                onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                placeholder="Your cancellation policy..."
                rows={3}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active Service</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Featured Service</Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : service ? "Update Service" : "Create Service"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedVendorServiceForm;
