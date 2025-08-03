
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
import PropertyImageUpload from "./PropertyImageUpload";
import LocationSelector from "./LocationSelector";

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
  // Rental-specific fields
  rental_periods: string[];
  minimum_rental_days: string;
  online_booking_enabled: boolean;
  booking_type: string;
  advance_booking_days: string;
  rental_terms: string;
  available_from: string;
  available_until: string;
  // Virtual office/office space fields
  pt_name_required?: string;
  business_license_required?: string;
  domicile_services?: boolean;
  mail_handling?: boolean;
  // Image upload
  images?: string[];
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
    property_features: {},
    // Rental-specific fields
    rental_periods: ["monthly"],
    minimum_rental_days: "30",
    online_booking_enabled: true,
    booking_type: "astra_villa",
    advance_booking_days: "7",
    rental_terms: "",
    available_from: "",
    available_until: ""
  });

  // Location selector state
  const [locationState, setLocationState] = useState({
    selectedState: "",
    selectedCity: "",
    selectedDistrict: "",
    selectedSubdistrict: ""
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
        images: data.images || [],
        image_urls: data.images || [],
        seo_title: data.seo_title || data.title,
        seo_description: data.seo_description || data.description,
        property_features: { ...advancedFeatures },
        // Rental-specific fields (only for rental properties)
        ...(data.listing_type === 'rent' && {
          rental_periods: data.rental_periods,
          minimum_rental_days: data.minimum_rental_days ? parseInt(data.minimum_rental_days) : 30,
          online_booking_enabled: data.online_booking_enabled,
          booking_type: data.booking_type,
          advance_booking_days: data.advance_booking_days ? parseInt(data.advance_booking_days) : 7,
          rental_terms: data.rental_terms ? JSON.parse(data.rental_terms || '{}') : {},
          available_from: data.available_from || null,
          available_until: data.available_until || null
        })
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
        property_features: {},
        rental_periods: ["monthly"],
        minimum_rental_days: "30",
        online_booking_enabled: true,
        booking_type: "astra_villa",
        advance_booking_days: "7",
        rental_terms: "",
        available_from: "",
        available_until: ""
      });

      // Reset location selector
      setLocationState({
        selectedState: "",
        selectedCity: "",
        selectedDistrict: "",
        selectedSubdistrict: ""
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
      navigate('/dijual');
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
                    <SelectItem value="office">Office Space</SelectItem>
                    <SelectItem value="virtual_office">Virtual Office</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="retail">Retail Space</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
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

          {/* Property Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Images</h3>
            <PropertyImageUpload
              propertyType={formData.property_type}
              onImagesUploaded={(imageUrls) => {
                setFormData(prev => ({ 
                  ...prev, 
                  images: imageUrls 
                }));
              }}
              maxImages={10}
            />
          </div>

          {/* Rental-Specific Fields */}
          {formData.listing_type === 'rent' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rental Information</h3>
              
              {/* Rental Period Options */}
              <div>
                <Label>Accepted Rental Periods</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {[
                    { value: 'daily', label: 'Daily (1+ days)', min: 1 },
                    { value: 'weekly', label: 'Weekly (7+ days)', min: 7 },
                    { value: 'monthly', label: 'Monthly (30+ days)', min: 30 },
                    { value: 'yearly', label: 'Yearly (365+ days)', min: 365 }
                  ].map((period) => (
                    <div key={period.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={period.value}
                        checked={formData.rental_periods.includes(period.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              rental_periods: [...prev.rental_periods, period.value],
                              minimum_rental_days: prev.minimum_rental_days || period.min.toString()
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              rental_periods: prev.rental_periods.filter(p => p !== period.value)
                            }));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={period.value} className="text-sm">{period.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Office/Office Space Company Information */}
              {(formData.property_type === 'virtual_office' || formData.property_type === 'office') && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-base">Company Information Required</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pt_name_required">PT Name Requirements</Label>
                      <textarea
                        id="pt_name_required"
                        value={formData.pt_name_required || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pt_name_required: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="e.g., Valid PT registration required, SIUP certificate needed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business_license_required">Business License Requirements</Label>
                      <textarea
                        id="business_license_required"
                        value={formData.business_license_required || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_license_required: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="e.g., NIB, SIUP, TDP, or other required business licenses"
                      />
                    </div>
                    <div>
                      <Label htmlFor="domicile_services">Domicile Services Available</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="domicile_services"
                          checked={formData.domicile_services || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, domicile_services: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="domicile_services" className="text-sm">
                          Business domicile address services provided
                        </Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="mail_handling">Mail Handling Services</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="mail_handling"
                          checked={formData.mail_handling || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, mail_handling: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="mail_handling" className="text-sm">
                          Mail and package handling included
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum_rental_days">Minimum Rental Days</Label>
                  <Input
                    id="minimum_rental_days"
                    type="number"
                    value={formData.minimum_rental_days}
                    onChange={(e) => handleInputChange('minimum_rental_days', e.target.value)}
                    placeholder="e.g., 30"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers can see minimum booking duration
                  </p>
                </div>
                <div>
                  <Label htmlFor="booking_type">Booking Type</Label>
                  <Select 
                    value={formData.booking_type} 
                    onValueChange={(value) => handleInputChange('booking_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Booking</SelectItem>
                      <SelectItem value="owner_contact">Contact Owner</SelectItem>
                      <SelectItem value="agent_assisted">Agent Assisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="advance_booking_days">Advance Booking Days</Label>
                  <Input
                    id="advance_booking_days"
                    type="number"
                    value={formData.advance_booking_days}
                    onChange={(e) => handleInputChange('advance_booking_days', e.target.value)}
                    placeholder="e.g., 7"
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="online_booking_enabled"
                    checked={formData.online_booking_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, online_booking_enabled: checked }))}
                  />
                  <Label htmlFor="online_booking_enabled">Enable Online Booking</Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => handleInputChange('available_from', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="available_until">Available Until</Label>
                  <Input
                    id="available_until"
                    type="date"
                    value={formData.available_until}
                    onChange={(e) => handleInputChange('available_until', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rental_terms">Rental Terms & Conditions</Label>
                <Textarea
                  id="rental_terms"
                  value={formData.rental_terms}
                  onChange={(e) => handleInputChange('rental_terms', e.target.value)}
                  placeholder="Enter rental terms, house rules, and conditions..."
                  rows={3}
                />
              </div>
            </div>
          )}

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
            
            {/* Database-driven Location Selector */}
            <LocationSelector
              selectedState={locationState.selectedState}
              selectedCity={locationState.selectedCity}
              selectedDistrict={locationState.selectedDistrict}
              selectedSubdistrict={locationState.selectedSubdistrict}
              onStateChange={(state) => {
                setLocationState(prev => ({ ...prev, selectedState: state }));
                setFormData(prev => ({ ...prev, state }));
              }}
              onCityChange={(city) => {
                setLocationState(prev => ({ ...prev, selectedCity: city }));
                setFormData(prev => ({ ...prev, city }));
              }}
              onDistrictChange={(district) => {
                setLocationState(prev => ({ ...prev, selectedDistrict: district }));
                setFormData(prev => ({ ...prev, area: district }));
              }}
              onSubdistrictChange={(subdistrict) => {
                setLocationState(prev => ({ ...prev, selectedSubdistrict: subdistrict }));
              }}
              onLocationChange={(location) => {
                setFormData(prev => ({ ...prev, location }));
              }}
            />

            {/* Additional Address Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_address">Street Address & Details</Label>
                <Input
                  id="full_address"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter street address, building number, etc."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Complete street address including house/building number
                </p>
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
                  onClick={() => navigate('/dijual')}
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
