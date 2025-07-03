
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
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Settings, Eye, CheckCircle, XCircle, Pause, Edit, Plus, Trash2, X } from "lucide-react";

const CreateServiceForm = () => {
  const [serviceData, setServiceData] = useState({
    main_category_id: '',
    sub_category_id: '',
    approved_service_name_id: '',
    category_id: '', // Implementation type
    custom_service_name: '',
    service_description: '',
    location_type: 'on_site',
    service_location_state: '',
    service_location_city: '',
    service_location_area: '',
    duration_value: 1,
    duration_unit: 'hours',
    requirements: '',
    cancellation_policy: '',
    currency: 'IDR',
    is_active: true
  });
  
  const [selectedVendor, setSelectedVendor] = useState('');
  const [serviceItems, setServiceItems] = useState([
    { item_name: '', item_description: '', price: 0, duration_minutes: 60, unit: 'per_item' }
  ]);
  const [useCustomName, setUseCustomName] = useState(false);
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendors for admin selection
  const { data: vendors } = useQuery({
    queryKey: ['vendors-for-service'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select(`
          id,
          vendor_id,
          business_name,
          profiles!inner(full_name, email)
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch main categories
  const { data: mainCategories } = useQuery({
    queryKey: ['vendor-main-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_main_categories' as any)
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch sub categories based on selected main category
  const { data: subCategories } = useQuery({
    queryKey: ['vendor-sub-categories', serviceData.main_category_id],
    queryFn: async () => {
      if (!serviceData.main_category_id) return [];
      
      const { data, error } = await supabase
        .from('vendor_sub_categories' as any)
        .select('*')
        .eq('main_category_id', serviceData.main_category_id)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!serviceData.main_category_id
  });

  // Fetch approved service names based on selected sub category
  const { data: approvedServiceNames } = useQuery({
    queryKey: ['approved-service-names', serviceData.sub_category_id],
    queryFn: async () => {
      if (!serviceData.sub_category_id) return [];
      
      const { data, error } = await supabase
        .from('approved_service_names' as any)
        .select('*')
        .eq('sub_category_id', serviceData.sub_category_id)
        .eq('is_active', true)
        .order('service_name');
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!serviceData.sub_category_id
  });

  // Fetch vendor service categories for implementation types
  const { data: implementationTypes } = useQuery({
    queryKey: ['vendor-service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as any[];
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
    queryKey: ['locations-cities', serviceData.service_location_state],
    queryFn: async () => {
      if (!serviceData.service_location_state) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('city_name')
        .eq('province_name', serviceData.service_location_state)
        .eq('is_active', true)
        .not('city_name', 'is', null);
      
      if (error) throw error;
      
      // Get unique cities
      const uniqueCities = [...new Set(data.map(item => item.city_name))];
      return uniqueCities.sort();
    },
    enabled: !!serviceData.service_location_state
  });

  // Fetch areas based on selected city
  const { data: areas } = useQuery({
    queryKey: ['locations-areas', serviceData.service_location_state, serviceData.service_location_city],
    queryFn: async () => {
      if (!serviceData.service_location_state || !serviceData.service_location_city) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('area_name')
        .eq('province_name', serviceData.service_location_state)
        .eq('city_name', serviceData.service_location_city)
        .eq('is_active', true)
        .not('area_name', 'is', null);
      
      if (error) throw error;
      
      // Get unique areas
      const uniqueAreas = [...new Set(data.map(item => item.area_name))];
      return uniqueAreas.sort();
    },
    enabled: !!serviceData.service_location_state && !!serviceData.service_location_city
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVendor) throw new Error('Please select a vendor');
      
      // Prepare service data for the new hierarchy
      const selectedServiceName = approvedServiceNames?.find(s => s.id === serviceData.approved_service_name_id);
      const finalServiceData = {
        ...serviceData,
        service_name: useCustomName ? serviceData.custom_service_name : selectedServiceName?.service_name || '',
        vendor_id: selectedVendor,
        admin_approval_status: 'approved' // Admin created services are auto-approved
      };

      const response = await supabase.functions.invoke('vendor-service-management', {
        method: 'POST',
        body: {
          action: 'create',
          vendor_id: selectedVendor,
          serviceData: finalServiceData,
          serviceItems: serviceItems.filter(item => item.item_name.trim())
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Success", "Vendor service created successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-services'] });
      // Reset form
      setServiceData({
        main_category_id: '',
        sub_category_id: '',
        approved_service_name_id: '',
        category_id: '',
        custom_service_name: '',
        service_description: '',
        location_type: 'on_site',
        service_location_state: '',
        service_location_city: '',
        service_location_area: '',
        duration_value: 1,
        duration_unit: 'hours',
        requirements: '',
        cancellation_policy: '',
        currency: 'IDR',
        is_active: true
      });
      setSelectedVendor('');
      setUseCustomName(false);
      setServiceItems([{ item_name: '', item_description: '', price: 0, duration_minutes: 60, unit: 'per_item' }]);
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to create service");
    }
  });

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

  return (
    <div className="space-y-6">
      {/* Vendor Selection */}
      <div className="space-y-2">
        <Label htmlFor="vendor">Select Vendor *</Label>
        <Select value={selectedVendor} onValueChange={setSelectedVendor}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors?.map((vendor) => (
              <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                {vendor.business_name} ({vendor.profiles.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced 4-Level Hierarchy Selection */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-l-4 border-l-primary">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Service Category Hierarchy
              </Label>
              <p className="text-muted-foreground mt-1">Follow the 4-step process to categorize your service</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              4-Level Structure
            </Badge>
          </div>
          
          {/* Step Progress Indicator */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${serviceData.main_category_id ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${serviceData.main_category_id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>1</div>
              <span className="text-sm font-medium">Main</span>
            </div>
            <div className={`w-8 h-0.5 ${serviceData.main_category_id ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center space-x-2 ${serviceData.sub_category_id ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${serviceData.sub_category_id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
              <span className="text-sm font-medium">Sub</span>
            </div>
            <div className={`w-8 h-0.5 ${serviceData.sub_category_id ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center space-x-2 ${(serviceData.approved_service_name_id || useCustomName) ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${(serviceData.approved_service_name_id || useCustomName) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>3</div>
              <span className="text-sm font-medium">Service</span>
            </div>
            <div className={`w-8 h-0.5 ${(serviceData.approved_service_name_id || useCustomName) ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center space-x-2 ${serviceData.category_id ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${serviceData.category_id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>4</div>
              <span className="text-sm font-medium">Type</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Main Category */}
            <Card className={`p-4 transition-all duration-200 ${serviceData.main_category_id ? 'ring-2 ring-primary/20 bg-primary/5' : 'bg-muted/30'}`}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <Label className="font-semibold text-base">Main Category</Label>
                </div>
                <p className="text-sm text-muted-foreground">Product or Service Type</p>
                <Select 
                  value={serviceData.main_category_id} 
                  onValueChange={(value) => setServiceData(prev => ({
                    ...prev, 
                    main_category_id: value,
                    sub_category_id: '',
                    approved_service_name_id: '',
                    category_id: ''
                  }))}
                >
                  <SelectTrigger className="bg-background border-2 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Choose main category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {mainCategories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-3 py-1">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Step 2: Sub Category */}
            <Card className={`p-4 transition-all duration-200 ${serviceData.sub_category_id ? 'ring-2 ring-primary/20 bg-primary/5' : serviceData.main_category_id ? 'bg-muted/30' : 'bg-muted/10 opacity-50'}`}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <Label className="font-semibold text-base">Sub Category</Label>
                </div>
                <p className="text-sm text-muted-foreground">Service Area or Product Class</p>
                <Select 
                  value={serviceData.sub_category_id} 
                  onValueChange={(value) => setServiceData(prev => ({
                    ...prev, 
                    sub_category_id: value,
                    approved_service_name_id: '',
                    category_id: ''
                  }))}
                  disabled={!serviceData.main_category_id}
                >
                  <SelectTrigger className="bg-background border-2 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Choose sub category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {subCategories?.map((subCategory) => (
                      <SelectItem key={subCategory.id} value={subCategory.id}>
                        <div className="flex items-center space-x-3 py-1">
                          <span className="text-lg">{subCategory.icon}</span>
                          <div>
                            <div className="font-medium">{subCategory.name}</div>
                            <div className="text-xs text-muted-foreground">{subCategory.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 3: Service Name */}
            <Card className={`p-4 transition-all duration-200 ${(serviceData.approved_service_name_id || useCustomName) ? 'ring-2 ring-primary/20 bg-primary/5' : serviceData.sub_category_id ? 'bg-muted/30' : 'bg-muted/10 opacity-50'}`}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <Label className="font-semibold text-base">Service Name</Label>
                </div>
                <p className="text-sm text-muted-foreground">Specific Service Offering</p>
                
                <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg border">
                  <Switch
                    checked={useCustomName}
                    onCheckedChange={setUseCustomName}
                    disabled={!serviceData.sub_category_id}
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Custom Service Name</Label>
                    <p className="text-xs text-muted-foreground">Create your own service name</p>
                  </div>
                </div>

                {!useCustomName ? (
                  <Select 
                    value={serviceData.approved_service_name_id} 
                    onValueChange={(value) => setServiceData(prev => ({ ...prev, approved_service_name_id: value, category_id: '' }))}
                    disabled={!serviceData.sub_category_id}
                  >
                    <SelectTrigger className="bg-background border-2 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Choose approved service..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {approvedServiceNames?.map((serviceName) => (
                        <SelectItem key={serviceName.id} value={serviceName.id}>
                          <div className="py-1">
                            <div className="font-medium">{serviceName.service_name}</div>
                            {serviceName.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {serviceName.description}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={serviceData.custom_service_name}
                      onChange={(e) => setServiceData(prev => ({ ...prev, custom_service_name: e.target.value }))}
                      placeholder="Enter custom service name..."
                      disabled={!serviceData.sub_category_id}
                      className="border-2 hover:border-primary/50 transition-colors"
                    />
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
                      <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm font-medium">Admin approval automatic</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Step 4: Implementation Type */}
            <Card className={`p-4 transition-all duration-200 ${serviceData.category_id ? 'ring-2 ring-primary/20 bg-primary/5' : (serviceData.approved_service_name_id || useCustomName) ? 'bg-muted/30' : 'bg-muted/10 opacity-50'}`}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <Label className="font-semibold text-base">Implementation Type</Label>
                </div>
                <p className="text-sm text-muted-foreground">How this service is implemented</p>
                <Select
                  value={serviceData.category_id}
                  onValueChange={(value) => setServiceData(prev => ({ ...prev, category_id: value }))}
                  disabled={!serviceData.approved_service_name_id && !useCustomName}
                >
                  <SelectTrigger className="bg-background border-2 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Choose implementation..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {implementationTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-3 py-1">
                          <span className="text-lg">{type.icon}</span>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="service_description">Description</Label>
        <Textarea
          id="service_description"
          value={serviceData.service_description}
          onChange={(e) => setServiceData(prev => ({...prev, service_description: e.target.value}))}
          placeholder="Describe the service in detail..."
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

      {/* Required Service Location Selection */}
      <div className="space-y-4">
        <div className="border-l-4 border-primary pl-4">
          <Label className="text-base font-semibold text-primary">Service Location *</Label>
          <p className="text-sm text-muted-foreground">Select the specific area where this service will be provided</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service_location_state">State/Province *</Label>
            <Select 
              value={serviceData.service_location_state || ''} 
              onValueChange={(value) => setServiceData(prev => ({
                ...prev, 
                service_location_state: value,
                service_location_city: '',
                service_location_area: ''
              }))}
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
              value={serviceData.service_location_city || ''} 
              onValueChange={(value) => setServiceData(prev => ({
                ...prev, 
                service_location_city: value,
                service_location_area: ''
              }))}
              disabled={!serviceData.service_location_state}
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
              value={serviceData.service_location_area || ''} 
              onValueChange={(value) => setServiceData(prev => ({
                ...prev, 
                service_location_area: value
              }))}
              disabled={!serviceData.service_location_city}
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

      {/* Optional Service Items & Pricing */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-lg font-semibold text-blue-900">Service Items & Pricing</Label>
              <p className="text-sm text-blue-700 mt-1">
                Optional: Add specific pricing items for this service. If skipped, vendors can add their own pricing later.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addServiceItem} className="border-blue-200 text-blue-700 hover:bg-blue-100">
              <Plus className="h-4 w-4 mr-1" />
              Add Pricing Item
            </Button>
          </div>
          
          <div className="bg-blue-100/50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Service Items are Optional</p>
                <p>You can create the service without pricing items. Vendors can add their own pricing structure later through their dashboard.</p>
              </div>
            </div>
          </div>
          
          {serviceItems.length > 0 && serviceItems[0].item_name && (
            <div className="space-y-3">
              {serviceItems.map((item, index) => (
                <Card key={index} className="p-4 bg-white border border-blue-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-blue-900">Pricing Item {index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeServiceItem(index)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Item Name *</Label>
                        <Input
                          value={item.item_name}
                          onChange={(e) => updateServiceItem(index, 'item_name', e.target.value)}
                          placeholder="e.g., Basic Service Package"
                          className="border-blue-200 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Starting Price (IDR) *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateServiceItem(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="150000"
                          className="border-blue-200 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={item.item_description}
                        onChange={(e) => updateServiceItem(index, 'item_description', e.target.value)}
                        placeholder="Describe what's included in this pricing item..."
                        rows={2}
                        className="border-blue-200 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

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
        <Label htmlFor="is_active">Activate service immediately</Label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={() => createServiceMutation.mutate()} 
          disabled={!selectedVendor || (!serviceData.approved_service_name_id && !useCustomName) || !serviceData.category_id || createServiceMutation.isPending}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8 py-2 text-white font-medium"
        >
          {createServiceMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Service...</span>
            </div>
          ) : 'Create Vendor Service'}
        </Button>
      </div>
    </div>
  );
};

const AdminVendorServiceManagement = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [adminAction, setAdminAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Format IDR currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch all vendor services
  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-vendor-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_business_profiles(business_name, vendor_id),
          profiles!vendor_services_vendor_id_fkey(full_name, email),
          vendor_service_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch service control history
  const { data: serviceControls } = useQuery({
    queryKey: ['service-controls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_vendor_service_controls')
        .select(`
          *,
          vendor_services(service_name),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Admin action mutation
  const adminActionMutation = useMutation({
    mutationFn: async ({ serviceId, action, notes }: { serviceId: string; action: string; notes: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_vendor_service_controls')
        .insert({
          service_id: serviceId,
          admin_action: action,
          admin_notes: notes,
          admin_id: user.user?.id
        });
      
      if (error) throw error;

      // Update service status based on action
      const serviceUpdate: any = {};
      if (action === 'approved') serviceUpdate.is_active = true;
      if (action === 'rejected' || action === 'suspended') serviceUpdate.is_active = false;

      const { error: updateError } = await supabase
        .from('vendor_services')
        .update(serviceUpdate)
        .eq('id', serviceId);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      showSuccess("Success", "Admin action applied successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-controls'] });
      setIsDialogOpen(false);
      setAdminNotes("");
      setAdminAction("");
    },
    onError: () => {
      showError("Error", "Failed to apply admin action");
    }
  });

  // Toggle service status
  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('vendor_services')
        .update({ is_active: isActive })
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Service status updated");
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-services'] });
    },
    onError: () => {
      showError("Error", "Failed to update service status");
    }
  });

  const handleAdminAction = () => {
    if (!selectedService || !adminAction) return;
    
    adminActionMutation.mutate({
      serviceId: selectedService.id,
      action: adminAction,
      notes: adminNotes
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Service Management</h2>
          <p className="text-muted-foreground">Manage vendor services, pricing, and approvals</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Vendor Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Vendor Service</DialogTitle>
            </DialogHeader>
            <CreateServiceForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="controls">Admin Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {services?.map((service) => (
              <Card key={service.id} className="card-ios">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.service_name}</CardTitle>
                       <CardDescription>
                        {service.vendor_business_profiles?.business_name} • {service.profiles?.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={(checked) => 
                          toggleServiceMutation.mutate({ serviceId: service.id, isActive: checked })
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm text-muted-foreground">{service.service_category || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm text-muted-foreground">
                        {service.duration_value} {service.duration_unit}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location Type</Label>
                      <p className="text-sm text-muted-foreground capitalize">{service.location_type}</p>
                    </div>
                  </div>

                  {service.vendor_service_items && service.vendor_service_items.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Service Items & Pricing (IDR)</Label>
                      <div className="grid gap-2">
                        {service.vendor_service_items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{item.item_name}</span>
                            <span className="text-sm font-medium">
                              {formatIDR(item.price || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedService(service)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Admin Action
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Admin Action: {selectedService?.service_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Action</Label>
                            <Select value={adminAction} onValueChange={setAdminAction}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approved">Approve Service</SelectItem>
                                <SelectItem value="rejected">Reject Service</SelectItem>
                                <SelectItem value="suspended">Suspend Service</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Admin Notes</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes about this action..."
                            />
                          </div>
                          <Button onClick={handleAdminAction} className="w-full">
                            Apply Action
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {services?.filter(s => !s.is_active).map((service) => (
              <Card key={service.id} className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-800">{service.service_name}</CardTitle>
                  <CardDescription>Pending approval from {service.vendor_business_profiles?.business_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      setSelectedService(service);
                      setAdminAction("approved");
                      setIsDialogOpen(true);
                    }}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => {
                      setSelectedService(service);
                      setAdminAction("rejected");
                      setIsDialogOpen(true);
                    }}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="controls">
          <div className="space-y-4">
            {serviceControls?.map((control) => (
              <Card key={control.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{control.vendor_services?.service_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Action: <Badge variant="outline">{control.admin_action}</Badge>
                      </p>
                      {control.admin_notes && (
                        <p className="text-sm text-muted-foreground mt-1">{control.admin_notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        By: {control.profiles?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(control.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVendorServiceManagement;
