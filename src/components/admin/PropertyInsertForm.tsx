
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Building2, Save, AlertTriangle } from "lucide-react";

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  location: string;
  city: string;
  state: string;
  area: string;
  development_status: string;
  owner_type: string;
  status: string;
}

const PropertyInsertForm = () => {
  const { user, profile } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    property_type: "",
    listing_type: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    location: "",
    city: "",
    state: "",
    area: "",
    development_status: "completed",
    owner_type: "individual",
    status: "active"
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Indonesian provinces/states
  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", "North Sumatra",
    "South Sumatra", "West Sumatra", "Riau", "South Kalimantan", "East Kalimantan",
    "North Sulawesi", "South Sulawesi", "West Nusa Tenggara", "East Nusa Tenggara"
  ];

  // Check if user is authorized to create restricted development statuses
  const isAuthorizedForRestrictedTypes = () => {
    // Only admins can create restricted property types
    return isAdmin;
  };

  // Get available development status options based on user authorization
  const getAvailableDevelopmentStatuses = () => {
    const baseOptions = [
      { value: "completed", label: "Completed" },
      { value: "under_construction", label: "Under Construction" },
      { value: "planned", label: "Planned" }
    ];

    if (isAuthorizedForRestrictedTypes()) {
      return [
        ...baseOptions,
        { value: "new_project", label: "New Project" },
        { value: "pre_launching", label: "Pre-Launching" }
      ];
    }

    return baseOptions;
  };

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      if (!user) {
        throw new Error('User must be logged in to create properties');
      }

      // Additional client-side check for restricted development statuses
      if (['new_project', 'pre_launching'].includes(data.development_status) && !isAuthorizedForRestrictedTypes()) {
        throw new Error('You are not authorized to create New Project or Pre-Launching properties. Please contact an administrator.');
      }

      const propertyData = {
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        listing_type: data.listing_type,
        price: data.price ? parseFloat(data.price) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        area_sqm: data.area_sqm ? parseInt(data.area_sqm) : null,
        location: data.location,
        city: data.city,
        state: data.state,
        area: data.area,
        development_status: data.development_status,
        owner_type: data.owner_type,
        status: data.status,
        approval_status: 'approved',
        owner_id: user.id,
        images: [],
        image_urls: []
      };

      console.log('Creating property with data:', propertyData);

      const { data: result, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();
      
      if (error) {
        console.error('Property creation error:', error);
        
        // Handle authorization constraint violation
        if (error.message && error.message.includes('check_development_status_authorization')) {
          throw new Error('You are not authorized to create this type of property. Only admins, agents, and property owners can create New Project or Pre-Launching properties.');
        }
        
        throw error;
      }
      
      console.log('Property created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      showSuccess("Property Created", `Property "${data.title}" has been added successfully.`);
      setFormData({
        title: "",
        description: "",
        property_type: "",
        listing_type: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        area_sqm: "",
        location: "",
        city: "",
        state: "",
        area: "",
        development_status: "completed",
        owner_type: "individual",
        status: "active"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['featured-properties'] });
    },
    onError: (error: any) => {
      console.error('Property creation failed:', error);
      showError("Creation Failed", error.message || 'Failed to create property');
    },
  });

  const handleInputChange = (key: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.property_type || !formData.listing_type || !formData.location) {
      showError("Validation Error", "Please fill in all required fields: Title, Property Type, Listing Type, and Location.");
      return;
    }

    if (!user) {
      showError("Authentication Error", "You must be logged in to create properties.");
      return;
    }
    
    // Additional validation for restricted development statuses
    if (['new_project', 'pre_launching'].includes(formData.development_status) && !isAuthorizedForRestrictedTypes()) {
      showError("Authorization Error", "You are not authorized to create New Project or Pre-Launching properties. Please contact an administrator.");
      return;
    }
    
    createPropertyMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Add New Property
        </CardTitle>
        <CardDescription>
          Create a new property listing in the system
          {!isAuthorizedForRestrictedTypes() && (
            <div className="mt-2 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                Note: Only admins, agents, and property owners can create "New Project" or "Pre-Launching" properties.
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter property title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="property_type">Property Type *</Label>
                <Select 
                  value={formData.property_type} 
                  onValueChange={(value) => handleInputChange('property_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="listing_type">Listing Type *</Label>
                <Select 
                  value={formData.listing_type} 
                  onValueChange={(value) => handleInputChange('listing_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="lease">For Lease</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter property description"
                rows={3}
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  placeholder="Number of bedrooms"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  placeholder="Number of bathrooms"
                />
              </div>
              <div>
                <Label htmlFor="area_sqm">Area (sqm)</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                  placeholder="Area in square meters"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State/Province *</Label>
                <Select 
                  value={formData.state} 
                  onValueChange={(value) => handleInputChange('state', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indonesianStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="area">Area/District</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Enter area or district"
                />
              </div>
              <div>
                <Label htmlFor="location">Full Address *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter full address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="development_status">Development Status</Label>
                <Select 
                  value={formData.development_status} 
                  onValueChange={(value) => handleInputChange('development_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableDevelopmentStatuses().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        {['new_project', 'pre_launching'].includes(option.value) && !isAuthorizedForRestrictedTypes() && (
                          <span className="text-xs text-amber-600 ml-2">(Restricted)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {['new_project', 'pre_launching'].includes(formData.development_status) && (
                  <p className="text-xs text-amber-600 mt-1">
                    This option is restricted to authorized users only.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="owner_type">Owner Type</Label>
                <Select 
                  value={formData.owner_type} 
                  onValueChange={(value) => handleInputChange('owner_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={createPropertyMutation.isPending}
              className="w-full md:w-auto"
            >
              {createPropertyMutation.isPending ? (
                'Creating Property...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Property
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyInsertForm;
