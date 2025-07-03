
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    approved_service_name_id: '',
    custom_service_name: '',
    service_description: '',
    category_id: '',
    duration_value: 1,
    duration_unit: 'hours',
    location_type: 'on_site',
    service_location_types: ['on_site'],
    service_location_state: '',
    service_location_city: '',
    service_location_area: '',
    delivery_options: {},
    requirements: '',
    cancellation_policy: '',
    is_active: true,
    featured: false
  });
  const [useCustomName, setUseCustomName] = useState(false);
  const [serviceNameRequest, setServiceNameRequest] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchAllowedDurationUnits();
    if (service) {
      setFormData({
        approved_service_name_id: service.approved_service_name_id || '',
        custom_service_name: service.service_name || '',
        service_description: service.service_description || '',
        category_id: service.category_id || '',
        duration_value: service.duration_value || 1,
        duration_unit: service.duration_unit || 'hours',
        location_type: service.location_type || 'on_site',
        service_location_types: service.service_location_types || ['on_site'],
        service_location_state: service.service_location_state || '',
        service_location_city: service.service_location_city || '',
        service_location_area: service.service_location_area || '',
        delivery_options: service.delivery_options || {},
        requirements: service.requirements || '',
        cancellation_policy: service.cancellation_policy || '',
        is_active: service.is_active ?? true,
        featured: service.featured ?? false
      });
      setUseCustomName(!service.approved_service_name_id);
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

  // Fetch approved service names
  const { data: approvedServiceNames } = useQuery({
    queryKey: ['approved-service-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approved_service_names')
        .select('*')
        .eq('is_active', true)
        .order('service_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch locations for state selection
  const { data: states } = useQuery({
    queryKey: ['locations-states'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_name')
        .eq('is_active', true)
        .not('province_name', 'is', null);
      
      if (error) throw error;
      
      // Get unique states
      const uniqueStates = [...new Set(data.map(item => item.province_name))];
      return uniqueStates.sort();
    }
  });

  // Fetch cities based on selected state
  const { data: cities } = useQuery({
    queryKey: ['locations-cities', formData.service_location_state],
    queryFn: async () => {
      if (!formData.service_location_state) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('city_name')
        .eq('province_name', formData.service_location_state)
        .eq('is_active', true)
        .not('city_name', 'is', null);
      
      if (error) throw error;
      
      // Get unique cities
      const uniqueCities = [...new Set(data.map(item => item.city_name))];
      return uniqueCities.sort();
    },
    enabled: !!formData.service_location_state
  });

  // Fetch areas based on selected city
  const { data: areas } = useQuery({
    queryKey: ['locations-areas', formData.service_location_state, formData.service_location_city],
    queryFn: async () => {
      if (!formData.service_location_state || !formData.service_location_city) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('area_name')
        .eq('province_name', formData.service_location_state)
        .eq('city_name', formData.service_location_city)
        .eq('is_active', true)
        .not('area_name', 'is', null);
      
      if (error) throw error;
      
      // Get unique areas
      const uniqueAreas = [...new Set(data.map(item => item.area_name))];
      return uniqueAreas.sort();
    },
    enabled: !!formData.service_location_state && !!formData.service_location_city
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!useCustomName && !formData.approved_service_name_id) {
      toast({
        title: "Error",
        description: "Please select a service name or request a new one",
        variant: "destructive"
      });
      return;
    }

    if (useCustomName && !formData.custom_service_name.trim()) {
      toast({
        title: "Error",
        description: "Custom service name is required",
        variant: "destructive"
      });
      return;
    }

    // Check required location fields
    if (!formData.service_location_state || !formData.service_location_city || !formData.service_location_area) {
      toast({
        title: "Error",
        description: "Service location (State, City, Area) is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const serviceData = {
        ...formData,
        service_name: useCustomName ? formData.custom_service_name : 
          approvedServiceNames?.find(s => s.id === formData.approved_service_name_id)?.service_name || '',
        vendor_id: user.id,
        admin_approval_status: 'pending' // All new services need approval
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
        description: `Service ${service ? 'updated' : 'created'} successfully and sent for admin approval`
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

  // Handle service name request
  const handleServiceNameRequest = async () => {
    if (!serviceNameRequest.trim()) return;
    
    try {
      const { error } = await supabase
        .from('service_name_requests')
        .insert({
          requested_name: serviceNameRequest,
          description: `Requested from vendor service form`,
          requested_by: user?.id
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service name request submitted for admin approval"
      });
      
      setShowRequestDialog(false);
      setServiceNameRequest('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {service ? 'Edit Service' : 'Create New Service'}
              </CardTitle>
              <CardDescription className="text-base">
                {service ? 'Update your service details' : 'Create a new service offering for your business'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-destructive/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Name Selection */}
          <Card className="p-6 bg-muted/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Service Name Selection *</Label>
                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Request New Service Name
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request New Service Name</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Service Name</Label>
                        <Input
                          value={serviceNameRequest}
                          onChange={(e) => setServiceNameRequest(e.target.value)}
                          placeholder="Enter new service name"
                        />
                      </div>
                      <Button onClick={handleServiceNameRequest} className="w-full">
                        Submit Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={useCustomName}
                  onCheckedChange={setUseCustomName}
                />
                <Label>Use custom service name (requires admin approval)</Label>
              </div>

              {!useCustomName ? (
                <div className="space-y-2">
                  <Label>Select from Approved Service Names</Label>
                  <Select 
                    value={formData.approved_service_name_id} 
                    onValueChange={(value) => setFormData({ ...formData, approved_service_name_id: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose an approved service name" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {approvedServiceNames?.map((serviceName) => (
                        <SelectItem key={serviceName.id} value={serviceName.id}>
                          {serviceName.service_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Custom Service Name</Label>
                  <Input
                    value={formData.custom_service_name}
                    onChange={(e) => setFormData({ ...formData, custom_service_name: e.target.value })}
                    placeholder="Enter custom service name"
                  />
                  <p className="text-sm text-yellow-600">⚠️ Custom service names require admin approval before going live</p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

          {/* Required Service Location Selection */}
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <Label className="text-base font-semibold text-primary">Service Location *</Label>
              <p className="text-sm text-muted-foreground">Select the specific area where you provide this service</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_location_state">State/Province *</Label>
                <Select 
                  value={formData.service_location_state} 
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    service_location_state: value,
                    service_location_city: '',
                    service_location_area: ''
                  })}
                  required
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {states?.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_location_city">City *</Label>
                <Select 
                  value={formData.service_location_city} 
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    service_location_city: value,
                    service_location_area: ''
                  })}
                  disabled={!formData.service_location_state}
                  required
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {cities?.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_location_area">Area *</Label>
                <Select 
                  value={formData.service_location_area} 
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    service_location_area: value
                  })}
                  disabled={!formData.service_location_city}
                  required
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {areas?.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              {saving ? "Saving..." : service ? "Update Service" : "Create Service"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};

export default VendorServiceForm;
