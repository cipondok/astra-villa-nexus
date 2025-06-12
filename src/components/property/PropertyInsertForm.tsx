
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PropertyInsertForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "",
    listing_type: "",
    location: "",
    state: "",
    city: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    images: [] as string[]
  });

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const insertPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('properties')
        .insert([{
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price ? Number(propertyData.price) : null,
          property_type: propertyData.property_type,
          listing_type: propertyData.listing_type,
          location: propertyData.location || `${propertyData.area}, ${propertyData.city}, ${propertyData.state}`,
          state: propertyData.state,
          city: propertyData.city,
          area: propertyData.area,
          bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
          bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
          area_sqm: propertyData.area_sqm ? Number(propertyData.area_sqm) : null,
          owner_id: user.id,
          agent_id: profile?.role === 'agent' ? user.id : null,
          owner_type: profile?.role === 'property_owner' ? 'individual' : 'agent',
          approval_status: 'pending',
          status: 'pending_approval',
          image_urls: propertyData.images
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      alert("Property submitted successfully! It will be reviewed by our admin team.");
      navigate('/');
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        property_type: "",
        listing_type: "",
        location: "",
        state: "",
        city: "",
        area: "",
        bedrooms: "",
        bathrooms: "",
        area_sqm: "",
        images: []
      });
    },
    onError: (error) => {
      alert(`Failed to submit property: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to add a property");
      return;
    }

    if (!formData.title || !formData.property_type || !formData.listing_type) {
      alert("Please fill in all required fields");
      return;
    }

    insertPropertyMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="p-8">
            <Home className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to add a property listing.
            </p>
            <Button onClick={() => navigate('/')} className="mr-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Property Listing
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {profile?.role === 'agent' ? 'Agent' : 'Owner'}
            </span>
          </CardTitle>
          <CardDescription>
            List your property for sale or rent
            {profile?.role === 'agent' && (
              <span className="block text-blue-600 text-sm mt-1">
                You are logged in as an agent: {profile.full_name || profile.email}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Beautiful Family Home"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div>
                <Label htmlFor="property_type">Property Type *</Label>
                <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="listing_type">Listing Type *</Label>
                <Select value={formData.listing_type} onValueChange={(value) => handleInputChange('listing_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="California"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Beverly Hills"
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  placeholder="3"
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
                  placeholder="2"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="area_sqm">Area (sqm)</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                  placeholder="120"
                  min="0"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed property description..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={insertPropertyMutation.isPending}
              >
                {insertPropertyMutation.isPending ? 'Submitting...' : 'Submit Property for Review'}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyInsertForm;
