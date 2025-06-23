import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import EnhancedLocationSelector from "@/components/property/EnhancedLocationSelector";
import { DetailedAddressData } from "@/components/property/DetailedAddressForm";

interface PropertyListingFormProps {
  onSuccess: () => void;
}

const PropertyListingForm = ({ onSuccess }: PropertyListingFormProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "",
    listing_type: "",
    location: "",
    state: "",
    city: "",
    area: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    development_status: "completed",
    three_d_model_url: "",
    virtual_tour_url: "",
    detailed_address: null as DetailedAddressData | null
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('properties')
        .insert({
          ...data,
          owner_id: user?.id,
          price: data.price ? parseFloat(data.price) : null,
          bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
          bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
          area_sqm: data.area_sqm ? parseInt(data.area_sqm) : null,
          status: 'pending_approval',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Submitted", "Your property has been submitted successfully and is pending approval.");
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      onSuccess();
      setFormData({
        title: "",
        description: "",
        property_type: "",
        listing_type: "",
        location: "",
        state: "",
        city: "",
        area: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        area_sqm: "",
        development_status: "completed",
        three_d_model_url: "",
        virtual_tour_url: "",
        detailed_address: null as DetailedAddressData | null
      });
    },
    onError: (error: any) => {
      showError("Error", error.message || "Failed to create property");
    }
  });

  const handleDetailedAddressChange = (addressData: DetailedAddressData) => {
    setFormData(prev => ({ ...prev, detailed_address: addressData }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.property_type || !formData.listing_type || !formData.state || !formData.city || !formData.area) {
      showError("Missing Information", "Please fill in all required fields including location.");
      return;
    }
    createPropertyMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Property Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Beautiful 3BR House"
            required
          />
        </div>

        <div>
          <Label htmlFor="property_type">Property Type *</Label>
          <Select value={formData.property_type} onValueChange={(value) => handleChange('property_type', value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="listing_type">Listing Type *</Label>
          <Select value={formData.listing_type} onValueChange={(value) => handleChange('listing_type', value)} required>
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
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="City, Area"
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="500000"
          />
        </div>

        <div>
          <Label htmlFor="area_sqm">Area (sqm)</Label>
          <Input
            id="area_sqm"
            type="number"
            value={formData.area_sqm}
            onChange={(e) => handleChange('area_sqm', e.target.value)}
            placeholder="150"
          />
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            placeholder="3"
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
            placeholder="2"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="development_status">Development Status *</Label>
          <Select value={formData.development_status} onValueChange={(value) => handleChange('development_status', value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select development status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="new_project">New Project</SelectItem>
              <SelectItem value="pre_launching">Pre-launching</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Location Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Lokasi Properti</h3>
        <EnhancedLocationSelector
          selectedState={formData.state}
          selectedCity={formData.city}
          selectedArea={formData.area}
          onStateChange={(state) => handleChange('state', state)}
          onCityChange={(city) => handleChange('city', city)}
          onAreaChange={(area) => handleChange('area', area)}
          onLocationChange={(location) => handleChange('location', location)}
          onDetailedAddressChange={handleDetailedAddressChange}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your property..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="three_d_model_url">3D Model URL</Label>
        <Input
          id="three_d_model_url"
          value={formData.three_d_model_url}
          onChange={(e) => handleChange('three_d_model_url', e.target.value)}
          placeholder="e.g., https://example.com/model.glb"
        />
      </div>

      <div>
        <Label htmlFor="virtual_tour_url">Virtual Tour URL</Label>
        <Input
          id="virtual_tour_url"
          value={formData.virtual_tour_url}
          onChange={(e) => handleChange('virtual_tour_url', e.target.value)}
          placeholder="e.g., https://example.com/tour"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={createPropertyMutation.isPending}>
          {createPropertyMutation.isPending ? 'Submitting...' : 'Submit Property'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PropertyListingForm;
