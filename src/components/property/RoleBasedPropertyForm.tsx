
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, Save, AlertCircle } from "lucide-react";

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
  seo_title: string;
  seo_description: string;
  property_features: any;
}

const RoleBasedPropertyForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Check user permissions
  const canCreateProperty = profile?.role && ['property_owner', 'agent', 'admin'].includes(profile.role);
  const isAdmin = profile?.role === 'admin';
  const isAgent = profile?.role === 'agent';

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
    status: isAdmin ? "active" : "pending_approval",
    seo_title: "",
    seo_description: "",
    property_features: {}
  });

  const [advancedFeatures, setAdvancedFeatures] = useState({
    parking: false,
    swimming_pool: false,
    garden: false,
    balcony: false,
    furnished: false,
    air_conditioning: false,
    security: false,
    elevator: false
  });

  // Fetch property categories for agents/admins
  const { data: categories } = useQuery({
    queryKey: ['property-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAgent || isAdmin,
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      if (!user || !canCreateProperty) {
        throw new Error('Unauthorized to create properties');
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
        approval_status: isAdmin ? 'approved' : 'pending',
        owner_id: user.id,
        agent_id: isAgent ? user.id : null,
        images: [],
        image_urls: [],
        seo_title: data.seo_title || data.title,
        seo_description: data.seo_description || data.description,
        property_features: { ...advancedFeatures }
      };

      const { data: result, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();
      
      if (error) {
        console.error('Property creation error:', error);
        throw error;
      }
      
      return result;
    },
    onSuccess: (data) => {
      const statusMessage = isAdmin 
        ? "Property has been created and is now active."
        : "Property has been submitted for approval.";
      
      showSuccess("Property Created", `Property "${data.title}" ${statusMessage}`);
      
      // Reset form
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
        status: isAdmin ? "active" : "pending_approval",
        seo_title: "",
        seo_description: "",
        property_features: {}
      });
      
      setAdvancedFeatures({
        parking: false,
        swimming_pool: false,
        garden: false,
        balcony: false,
        furnished: false,
        air_conditioning: false,
        security: false,
        elevator: false
      });
      
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Navigate to property list
      navigate('/properties');
    },
    onError: (error: any) => {
      console.error('Property creation failed:', error);
      showError("Creation Failed", error.message || 'Failed to create property');
    },
  });

  const handleInputChange = (key: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setAdvancedFeatures(prev => ({ ...prev, [feature]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateProperty) {
      showError("Access Denied", "You don't have permission to create properties.");
      return;
    }
    
    if (!formData.title || !formData.property_type || !formData.listing_type || !formData.location) {
      showError("Validation Error", "Please fill in all required fields: Title, Property Type, Listing Type, and Location.");
      return;
    }

    if (!user) {
      showError("Authentication Error", "You must be logged in to create properties.");
      return;
    }
    
    createPropertyMutation.mutate(formData);
  };

  if (!canCreateProperty) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              You need to be a Property Owner, Agent, or Admin to create property listings.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Current role: <span className="font-medium capitalize">{profile?.role || 'Not assigned'}</span>
            </p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Create New Property Listing
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Create a new property listing with full administrative access"
            : isAgent 
            ? "Create a property listing as an agent (subject to approval)"
            : "Submit your property for listing (subject to approval)"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
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
                <Label htmlFor="price">Price (IDR)</Label>
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
                placeholder="Describe your property..."
                rows={4}
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
                  min="0"
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
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="area_sqm">Area (m²)</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                  placeholder="Area in square meters"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Property Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(advancedFeatures).map(([feature, value]) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Switch
                    id={feature}
                    checked={value}
                    onCheckedChange={(checked) => handleFeatureChange(feature, checked)}
                  />
                  <Label htmlFor={feature} className="capitalize text-sm">
                    {feature.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="location">Full Address *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter complete address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state or province"
                />
              </div>
            </div>
          </div>

          {/* SEO & Advanced Settings */}
          {(isAgent || isAdmin) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO & Advanced Settings</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div>
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    placeholder="SEO meta description"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Admin Only Settings */}
          {isAdmin && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Administrative Settings</h3>
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="under_construction">Under Construction</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="new_project">New Project</SelectItem>
                      <SelectItem value="pre_launching">Pre-launching</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="status">Listing Status</Label>
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
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {!isAdmin && (
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Property will be submitted for admin approval
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/properties')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPropertyMutation.isPending}
                  className="min-w-[120px]"
                >
                  {createPropertyMutation.isPending ? (
                    'Creating...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Property
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RoleBasedPropertyForm;
