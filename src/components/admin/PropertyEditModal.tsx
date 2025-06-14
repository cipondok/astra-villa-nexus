import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { formatIDR } from "@/utils/currency";
import { Sparkles } from "lucide-react";

interface PropertyEditModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyEditModal = ({ property, isOpen, onClose }: PropertyEditModalProps) => {
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    property_type: "house",
    listing_type: "sale",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    owner_id: "",
    agent_id: "no-agent",
    seo_title: "",
    seo_description: "",
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all users for owner/agent selection
  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (property && isOpen) {
      console.log('Setting edit data for property:', property);
      setEditData({
        title: property.title || "",
        description: property.description || "",
        property_type: property.property_type || "house",
        listing_type: property.listing_type || "sale",
        price: property.price?.toString() || "",
        location: property.location || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area_sqm: property.area_sqm?.toString() || "",
        owner_id: property.owner_id || "",
        agent_id: property.agent_id || "no-agent",
        seo_title: property.seo_title || "",
        seo_description: property.seo_description || "",
      });
    }
  }, [property, isOpen]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: any) => {
      console.log('Updating property with data:', updates);
      const { error } = await supabase
        .from('properties')
        .update({
          ...updates,
          price: updates.price ? parseFloat(updates.price) : null,
          bedrooms: updates.bedrooms ? parseInt(updates.bedrooms) : null,
          bathrooms: updates.bathrooms ? parseInt(updates.bathrooms) : null,
          area_sqm: updates.area_sqm ? parseInt(updates.area_sqm) : null,
        })
        .eq('id', property.id);
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Property Updated", "Property has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      showError("Update Failed", error.message);
    },
  });

  const generateSeoMutation = useMutation({
    mutationFn: async ({ propertyId, title }: { propertyId: string; title: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: `Generate SEO content for property: ${title}`,
          propertyId: propertyId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (data) => {
      showSuccess("AI Content Generated", data.message || "SEO content has been generated and saved.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
    onError: (error: any) => {
      showError("Generation Failed", error.message);
    },
  });

  const handleGenerateSeo = () => {
    if (!property?.id || !property?.title) return;
    generateSeoMutation.mutate({ propertyId: property.id, title: property.title });
  };

  const handleUpdate = () => {
    const submitData = {
      ...editData,
      agent_id: editData.agent_id === "no-agent" ? null : editData.agent_id
    };
    console.log('Submitting update data:', submitData);
    updatePropertyMutation.mutate(submitData);
  };

  const propertyOwners = users?.filter(user => 
    user.role === 'property_owner' || user.role === 'admin'
  ) || [];

  const agents = users?.filter(user => 
    user.role === 'agent' || user.role === 'admin'
  ) || [];

  // Format price display
  const formatPriceDisplay = (price: string) => {
    if (!price) return '';
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? price : `${formatIDR(numPrice)} (${price} IDR)`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-50">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-800">Edit Property</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-700">
            Update property details, ownership, and generate SEO content with AI.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-gray-900 dark:text-gray-800">Title</Label>
            <Input
              id="edit-title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              placeholder="Property title"
              className="bg-white border-gray-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-location" className="text-gray-900 dark:text-gray-800">Location</Label>
            <Input
              id="edit-location"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              placeholder="Property location"
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-property-type" className="text-gray-900 dark:text-gray-800">Property Type</Label>
            <Select value={editData.property_type} onValueChange={(value) => setEditData({ ...editData, property_type: value })}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-listing-type" className="text-gray-900 dark:text-gray-800">Listing Type</Label>
            <Select value={editData.listing_type} onValueChange={(value) => setEditData({ ...editData, listing_type: value })}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="lease">For Lease</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-price" className="text-gray-900 dark:text-gray-800">
              Price (IDR)
              {editData.price && (
                <span className="text-sm text-green-600 ml-2">
                  {formatPriceDisplay(editData.price)}
                </span>
              )}
            </Label>
            <Input
              id="edit-price"
              type="number"
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              placeholder="Enter price in IDR (e.g., 850000000)"
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-area" className="text-gray-900 dark:text-gray-800">Area (sqm)</Label>
            <Input
              id="edit-area"
              type="number"
              value={editData.area_sqm}
              onChange={(e) => setEditData({ ...editData, area_sqm: e.target.value })}
              placeholder="Area in square meters"
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bedrooms" className="text-gray-900 dark:text-gray-800">Bedrooms</Label>
            <Input
              id="edit-bedrooms"
              type="number"
              value={editData.bedrooms}
              onChange={(e) => setEditData({ ...editData, bedrooms: e.target.value })}
              placeholder="Number of bedrooms"
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bathrooms" className="text-gray-900 dark:text-gray-800">Bathrooms</Label>
            <Input
              id="edit-bathrooms"
              type="number"
              value={editData.bathrooms}
              onChange={(e) => setEditData({ ...editData, bathrooms: e.target.value })}
              placeholder="Number of bathrooms"
              className="bg-white border-gray-300"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-description" className="text-gray-900 dark:text-gray-800">Description</Label>
            <Textarea
              id="edit-description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Property description"
              rows={3}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="col-span-2 space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">AI SEO Content</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateSeo}
                disabled={generateSeoMutation.isPending}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generateSeoMutation.isPending ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-title" className="text-gray-900 dark:text-gray-800">SEO Title</Label>
              <Input
                id="seo-title"
                value={editData.seo_title}
                readOnly
                placeholder="AI-generated SEO title will appear here."
                className="bg-gray-200 dark:bg-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description" className="text-gray-900 dark:text-gray-800">SEO Description</Label>
              <Textarea
                id="seo-description"
                value={editData.seo_description}
                readOnly
                placeholder="AI-generated SEO description will appear here."
                rows={2}
                className="bg-gray-200 dark:bg-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-owner" className="text-gray-900 dark:text-gray-800">Property Owner</Label>
            <Select value={editData.owner_id} onValueChange={(value) => setEditData({ ...editData, owner_id: value })}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {propertyOwners.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-agent" className="text-gray-900 dark:text-gray-800">Agent (Optional)</Label>
            <Select value={editData.agent_id || "no-agent"} onValueChange={(value) => setEditData({ ...editData, agent_id: value === "no-agent" ? null : value })}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Select agent (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="no-agent">No Agent</SelectItem>
                {agents.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updatePropertyMutation.isPending}>
            {updatePropertyMutation.isPending ? "Updating..." : "Update Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditModal;
