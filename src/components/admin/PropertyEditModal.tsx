
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
    agent_id: ""
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
    if (property) {
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
        agent_id: property.agent_id || ""
      });
    }
  }, [property]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: any) => {
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
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Updated", "Property has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      onClose();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleUpdate = () => {
    updatePropertyMutation.mutate(editData);
  };

  const propertyOwners = users?.filter(user => 
    user.role === 'property_owner' || user.role === 'admin'
  ) || [];

  const agents = users?.filter(user => 
    user.role === 'agent' || user.role === 'admin'
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update property details and ownership
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              placeholder="Property title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              placeholder="Property location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-property-type">Property Type</Label>
            <Select value={editData.property_type} onValueChange={(value) => setEditData({ ...editData, property_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="edit-listing-type">Listing Type</Label>
            <Select value={editData.listing_type} onValueChange={(value) => setEditData({ ...editData, listing_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="lease">For Lease</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-price">Price</Label>
            <Input
              id="edit-price"
              type="number"
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              placeholder="Property price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-area">Area (sqm)</Label>
            <Input
              id="edit-area"
              type="number"
              value={editData.area_sqm}
              onChange={(e) => setEditData({ ...editData, area_sqm: e.target.value })}
              placeholder="Area in square meters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bedrooms">Bedrooms</Label>
            <Input
              id="edit-bedrooms"
              type="number"
              value={editData.bedrooms}
              onChange={(e) => setEditData({ ...editData, bedrooms: e.target.value })}
              placeholder="Number of bedrooms"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bathrooms">Bathrooms</Label>
            <Input
              id="edit-bathrooms"
              type="number"
              value={editData.bathrooms}
              onChange={(e) => setEditData({ ...editData, bathrooms: e.target.value })}
              placeholder="Number of bathrooms"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-owner">Property Owner</Label>
            <Select value={editData.owner_id} onValueChange={(value) => setEditData({ ...editData, owner_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {propertyOwners.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-agent">Agent (Optional)</Label>
            <Select value={editData.agent_id || ""} onValueChange={(value) => setEditData({ ...editData, agent_id: value || null })}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Agent</SelectItem>
                {agents.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Property description"
              rows={3}
            />
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
