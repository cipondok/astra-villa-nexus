import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, UserCheck, Eye } from "lucide-react";
import PropertyImageUpload from "@/components/property/PropertyImageUpload";
import PropertyPreview from "@/components/property/PropertyPreview";
import LocationSelector from "@/components/property/LocationSelector";
import Property3DViewer from "@/components/property/Property3DViewer";
import AgentRegistrationModal from "@/components/agent/AgentRegistrationModal";

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
    agent_id: "no-agent",
    owner_id: "",
    owner_type: "individual",
    images: [] as string[],
    three_d_model_url: "",
    virtual_tour_url: ""
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showAgentRegistration, setShowAgentRegistration] = useState(false);

  const { showSuccess, showError } = useAlert();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch agents for demo selection
  const { data: agents } = useQuery({
    queryKey: ['demo-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'agent')
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  // Fetch property owners for demo selection
  const { data: owners } = useQuery({
    queryKey: ['demo-owners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'property_owner')
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  const insertPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const { error } = await supabase
        .from('properties')
        .insert([{
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price ? Number(propertyData.price) : null,
          property_type: propertyData.property_type,
          listing_type: propertyData.listing_type,
          location: propertyData.location,
          state: propertyData.state,
          city: propertyData.city,
          area: propertyData.area,
          bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
          bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
          area_sqm: propertyData.area_sqm ? Number(propertyData.area_sqm) : null,
          agent_id: propertyData.agent_id === "no-agent" ? null : propertyData.agent_id,
          owner_id: propertyData.owner_id,
          owner_type: propertyData.owner_type,
          approval_status: 'pending',
          status: 'pending_approval',
          image_urls: propertyData.images,
          three_d_model_url: propertyData.three_d_model_url || null,
          virtual_tour_url: propertyData.virtual_tour_url || null
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      showSuccess("Success", "Property submitted for admin approval. You'll be notified once it's reviewed.");
      setShowPreview(false);
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
        agent_id: "no-agent",
        owner_id: "",
        owner_type: "individual",
        images: [],
        three_d_model_url: "",
        virtual_tour_url: ""
      });
    },
    onError: (error) => {
      showError("Error", `Failed to submit property: ${error.message}`);
    }
  });

  const handlePreview = () => {
    if (!formData.title || !formData.property_type || !formData.listing_type || !formData.owner_id) {
      showError("Error", "Please fill in all required fields before preview");
      return;
    }
    
    if (!formData.area && !formData.location) {
      showError("Error", "Please select a location or enter a manual location");
      return;
    }

    setShowPreview(true);
  };

  const handleSubmit = () => {
    insertPropertyMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-fill agent if user is logged in as agent
  const fillAgentData = () => {
    if (profile?.role === 'agent' && profile?.id) {
      handleInputChange('agent_id', profile.id);
      showSuccess("Agent Selected", "Current logged-in agent has been selected");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Property Listing
            {profile?.role === 'agent' && (
              <span className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <UserCheck className="h-3 w-3" />
                Agent Mode
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Create a new property listing with full details and approval workflow
            {profile?.role === 'agent' && (
              <span className="block text-blue-600 text-sm mt-1">
                You are logged in as: {profile.full_name || 'Demo Agent'}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Property Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
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

                {/* Price */}
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

                {/* Property Type */}
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

                {/* Listing Type */}
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

                {/* Owner Type */}
                <div>
                  <Label htmlFor="owner_type">Owner Type</Label>
                  <Select value={formData.owner_type} onValueChange={(value) => handleInputChange('owner_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Owner</SelectItem>
                      <SelectItem value="dealer">Property Dealer</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Owner */}
                <div>
                  <Label htmlFor="owner_id">Property Owner *</Label>
                  <Select value={formData.owner_id} onValueChange={(value) => handleInputChange('owner_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners?.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.full_name || 'Unnamed'} ({owner.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationSelector
                selectedState={formData.state}
                selectedCity={formData.city}
                selectedArea={formData.area}
                onStateChange={(state) => handleInputChange('state', state)}
                onCityChange={(city) => handleInputChange('city', city)}
                onAreaChange={(area) => handleInputChange('area', area)}
                onLocationChange={(location) => handleInputChange('location', location)}
              />
              
              {/* Manual Location Override */}
              <div className="mt-4">
                <Label htmlFor="location">Manual Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Override with custom location"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to use selected state/city/area
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bedrooms */}
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

                {/* Bathrooms */}
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

                {/* Area */}
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
            </CardContent>
          </Card>

          {/* Property Images */}
          <PropertyImageUpload
            images={formData.images}
            onImagesChange={(images) => handleInputChange('images', JSON.stringify(images))}
          />

          {/* 3D Experience */}
          <Property3DViewer
            threeDModelUrl={formData.three_d_model_url}
            virtualTourUrl={formData.virtual_tour_url}
            onModelUrlChange={(url) => handleInputChange('three_d_model_url', url)}
            onTourUrlChange={(url) => handleInputChange('virtual_tour_url', url)}
          />

          {/* Agent Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent_id" className="flex items-center gap-2">
                    Agent (Optional)
                    {profile?.role === 'agent' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fillAgentData}
                        className="text-xs"
                      >
                        Use Current Agent
                      </Button>
                    )}
                  </Label>
                  <Select value={formData.agent_id} onValueChange={(value) => handleInputChange('agent_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-agent">No Agent</SelectItem>
                      {profile?.role === 'agent' && (
                        <SelectItem value={profile.id}>
                          {profile.full_name || 'Current Agent'} (You)
                        </SelectItem>
                      )}
                      {agents?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.full_name || 'Unnamed'} ({agent.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Agent Registration Button */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">
                    Want to become an Astra agent? Register now!
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAgentRegistration(true)}
                    className="text-blue-600 border-blue-300"
                  >
                    Register as Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              type="button"
              variant="outline"
              onClick={handlePreview}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Property
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Property Preview Modal */}
      <PropertyPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleSubmit}
        propertyData={{
          ...formData,
          images: typeof formData.images === 'string' ? JSON.parse(formData.images || '[]') : formData.images
        }}
        isSubmitting={insertPropertyMutation.isPending}
      />

      {/* Agent Registration Modal */}
      <AgentRegistrationModal
        isOpen={showAgentRegistration}
        onClose={() => setShowAgentRegistration(false)}
      />
    </>
  );
};

export default PropertyInsertForm;
