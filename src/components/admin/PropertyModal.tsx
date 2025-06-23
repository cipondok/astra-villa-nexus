
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/contexts/AlertContext";
import { usePropertyById } from "@/hooks/useProperties";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Save,
  X,
  Edit,
  Loader2
} from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string | null;
  mode: 'view' | 'edit';
}

const PropertyModal = ({ isOpen, onClose, propertyId, mode }: PropertyModalProps) => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState<any>({});

  // Use the optimized hook
  const { data: property, isLoading, error } = usePropertyById(propertyId);

  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        price: property.price || "",
        location: property.location || "",
        city: property.city || "",
        state: property.state || "",
        area: property.area || "",
        bedrooms: property.bedrooms || "",
        bathrooms: property.bathrooms || "",
        area_sqm: property.area_sqm || "",
        property_type: property.property_type || "house",
        listing_type: property.listing_type || "sale",
        status: property.status || "pending_approval",
      });
    }
  }, [property]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Property updated successfully");
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleSave = () => {
    if (!propertyId) return;
    
    const updates = {
      title: formData.title,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : null,
      location: formData.location,
      city: formData.city,
      state: formData.state,
      area: formData.area,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
      property_type: formData.property_type,
      listing_type: formData.listing_type,
      status: formData.status,
      updated_at: new Date().toISOString(),
    };
    
    updatePropertyMutation.mutate(updates);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading property...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8 text-red-600">
            <span>Error loading property. Please try again.</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {isEditing ? 'Edit Property' : 'Property Details'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="owner">Owner Info</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{property.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (IDR)</Label>
                {isEditing ? (
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Enter price"
                  />
                ) : (
                  <p className="font-medium text-green-600">
                    {property.price ? formatIDR(property.price) : 'Price not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{property.location}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{property.city || 'Not specified'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{property.state || 'Not specified'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                {isEditing ? (
                  <Input
                    id="area"
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{property.area || 'Not specified'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                {isEditing ? (
                  <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
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
                ) : (
                  <p className="font-medium capitalize">{property.property_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="listing_type">Listing Type</Label>
                {isEditing ? (
                  <Select value={formData.listing_type} onValueChange={(value) => handleInputChange('listing_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="lease">For Lease</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium capitalize">{property.listing_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                    {property.status}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{property.description || 'No description available'}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updatePropertyMutation.isPending}
                >
                  {updatePropertyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {updatePropertyMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  />
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold">{property.bedrooms || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  />
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold">{property.bathrooms || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Area (sqm)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.area_sqm || ''}
                    onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                  />
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <div className="font-semibold">{property.area_sqm || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Sqm</div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="owner" className="space-y-4">
            {property.owner ? (
              <div className="space-y-3">
                <div>
                  <Label>Owner Name</Label>
                  <p className="font-medium">{property.owner.full_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-700">{property.owner.email}</p>
                </div>
                {property.owner.phone && (
                  <div>
                    <Label>Phone</Label>
                    <p className="text-gray-700">{property.owner.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No owner information available</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;
