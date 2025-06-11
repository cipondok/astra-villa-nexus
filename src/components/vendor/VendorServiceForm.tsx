
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ServiceFormProps {
  service?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const VendorServiceForm = ({ service, onClose, onSuccess }: ServiceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [allowedDurationUnits, setAllowedDurationUnits] = useState<string[]>(['hours']);
  const [formData, setFormData] = useState({
    service_name: '',
    service_description: '',
    category_id: '',
    duration_value: 1,
    duration_unit: 'hours',
    location_type: 'on_site',
    service_location_types: ['on_site'],
    delivery_options: {},
    requirements: '',
    cancellation_policy: '',
    is_active: true,
    featured: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchAllowedDurationUnits();
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        service_description: service.service_description || '',
        category_id: service.category_id || '',
        duration_value: service.duration_value || 1,
        duration_unit: service.duration_unit || 'hours',
        location_type: service.location_type || 'on_site',
        service_location_types: service.service_location_types || ['on_site'],
        delivery_options: service.delivery_options || {},
        requirements: service.requirements || '',
        cancellation_policy: service.cancellation_policy || '',
        is_active: service.is_active ?? true,
        featured: service.featured ?? false
      });
    }
  }, [service]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowedDurationUnits = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('vendor_business_profiles')
        .select(`
          business_nature_id,
          vendor_business_nature_categories!inner(allowed_duration_units)
        `)
        .eq('vendor_id', user.id)
        .maybeSingle();

      if (profile?.vendor_business_nature_categories) {
        setAllowedDurationUnits(profile.vendor_business_nature_categories.allowed_duration_units || ['hours']);
      }
    } catch (error: any) {
      console.error('Error fetching duration units:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.service_name.trim()) {
      toast({
        title: "Error",
        description: "Service name is required",
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

      let result;
      if (service) {
        result = await supabase
          .from('vendor_services')
          .update(serviceData)
          .eq('id', service.id);
      } else {
        result = await supabase
          .from('vendor_services')
          .insert([serviceData]);
      }

      if (result.error) throw result.error;

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

  const locationTypeOptions = [
    { id: 'on_site', label: 'On-site (at customer location)', icon: '🏠' },
    { id: 'remote', label: 'Remote/Virtual', icon: '💻' },
    { id: 'business_location', label: 'At business location', icon: '🏢' },
    { id: 'home_delivery', label: 'Home delivery', icon: '🚚' },
    { id: 'pickup_delivery', label: 'Pickup & delivery', icon: '📦' },
    { id: 'third_party_delivery', label: '3rd party delivery', icon: '🚛' }
  ];

  const handleLocationTypeChange = (locationId: string, checked: boolean) => {
    let updatedTypes = [...formData.service_location_types];
    
    if (checked) {
      if (!updatedTypes.includes(locationId)) {
        updatedTypes.push(locationId);
      }
    } else {
      updatedTypes = updatedTypes.filter(type => type !== locationId);
    }
    
    setFormData({ ...formData, service_location_types: updatedTypes });
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="text-center">Loading service categories...</div>
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
              {service ? 'Update your service details' : 'Create a new service offering'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="" disabled>No categories available</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_value">Service Duration</Label>
              <div className="flex gap-2">
                <Input
                  id="duration_value"
                  type="number"
                  value={formData.duration_value}
                  onChange={(e) => setFormData({ ...formData, duration_value: parseInt(e.target.value) || 1 })}
                  placeholder="Duration"
                  min="1"
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
                    {allowedDurationUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1 mt-1">
                {allowedDurationUnits.map((unit) => (
                  <Badge key={unit} variant="secondary" className="text-xs">
                    {unit}
                  </Badge>
                ))}
              </div>
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
                  {locationTypeOptions.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_description">Service Description</Label>
            <Textarea
              id="service_description"
              value={formData.service_description}
              onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
              placeholder="Describe your service"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Any requirements or preparations needed"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
            <Textarea
              id="cancellation_policy"
              value={formData.cancellation_policy}
              onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
              placeholder="Your cancellation policy"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : service ? "Update Service" : "Create Service"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorServiceForm;
