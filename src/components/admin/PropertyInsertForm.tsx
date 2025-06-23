
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
import { Building2, Save } from "lucide-react";
import EnhancedLocationSelector from "@/components/property/EnhancedLocationSelector";
import EnhancedImageUpload from "@/components/property/EnhancedImageUpload";
import { DetailedAddressData } from "@/components/property/DetailedAddressForm";

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
  detailed_address?: DetailedAddressData | null;
  images: string[];
}

const PropertyInsertForm = () => {
  const { user } = useAuth();
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
    status: "active",
    detailed_address: null,
    images: []
  });
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Generate AI image mutation
  const generateAIImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await supabase.functions.invoke('ai-image-generator', {
        body: { prompt }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return response.data.image;
    },
    onSuccess: (imageDataUrl) => {
      const newImages = [...formData.images, imageDataUrl];
      setFormData(prev => ({ ...prev, images: newImages }));
      showSuccess("AI Image Generated", "Default property image has been generated successfully.");
    },
    onError: (error: any) => {
      console.error('AI image generation failed:', error);
      showError("Image Generation Failed", error.message || 'Failed to generate default image');
    },
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      if (!user) {
        throw new Error('User must be logged in to create properties');
      }

      let finalImages = [...data.images];
      
      // Generate AI image if no images provided
      if (finalImages.length === 0) {
        setIsGeneratingImage(true);
        try {
          const prompt = `Professional real estate photo of a ${data.property_type || 'modern property'} in ${data.location || 'beautiful location'}, ${data.listing_type || 'for sale'}, architectural photography, high quality, well-lit, attractive exterior view`;
          
          const aiImage = await generateAIImageMutation.mutateAsync(prompt);
          finalImages = [aiImage];
        } catch (error) {
          console.warn('Failed to generate AI image, proceeding without images');
        } finally {
          setIsGeneratingImage(false);
        }
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
        images: finalImages,
        image_urls: finalImages
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
        status: "active",
        detailed_address: null,
        images: []
      });
      setThumbnailIndex(0);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      console.error('Property creation failed:', error);
      showError("Creation Failed", error.message || 'Failed to create property');
    },
  });

  const handleInputChange = (key: keyof PropertyFormData, value: string | DetailedAddressData | null | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDetailedAddressChange = (addressData: DetailedAddressData) => {
    handleInputChange('detailed_address', addressData);
  };

  const handleImagesChange = (images: string[]) => {
    handleInputChange('images', images);
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

          {/* Enhanced Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <EnhancedLocationSelector
              selectedState={formData.state}
              selectedCity={formData.city}
              selectedArea={formData.area}
              onStateChange={(state) => handleInputChange('state', state)}
              onCityChange={(city) => handleInputChange('city', city)}
              onAreaChange={(area) => handleInputChange('area', area)}
              onLocationChange={(location) => handleInputChange('location', location)}
              onDetailedAddressChange={handleDetailedAddressChange}
            />
          </div>

          {/* Media & Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media & Images</h3>
            <EnhancedImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              thumbnailIndex={thumbnailIndex}
              onThumbnailChange={setThumbnailIndex}
            />
            {formData.images.length === 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Auto Image Generation:</strong> If you don't upload any images, we'll automatically generate a professional property image using AI based on your property details.
                </p>
              </div>
            )}
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="under_construction">Under Construction</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
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
              disabled={createPropertyMutation.isPending || isGeneratingImage}
              className="w-full md:w-auto"
            >
              {isGeneratingImage ? (
                'Generating AI Image...'
              ) : createPropertyMutation.isPending ? (
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
