
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
import { Edit, Save, X, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

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
    city: "",
    state: "",
    area: "",
    status: "active",
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Initialize form data when property changes
  useEffect(() => {
    if (property && isOpen) {
      console.log('Initializing edit form with property:', property);
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
        city: property.city || "",
        state: property.state || "",
        area: property.area || "",
        status: property.status || "active",
      });

      // Parse images with better error handling
      const getPropertyImages = () => {
        if (!property.images) return [];
        
        try {
          // Handle different image formats
          if (typeof property.images === 'string') {
            // Try to parse as JSON first
            try {
              const parsed = JSON.parse(property.images);
              return Array.isArray(parsed) ? parsed : [property.images];
            } catch {
              // If JSON parse fails, treat as single image URL
              return [property.images];
            }
          }
          
          if (Array.isArray(property.images)) {
            return property.images;
          }
          
          return [];
        } catch (error) {
          console.error('Error parsing property images:', error);
          return [];
        }
      };

      const initialImages = getPropertyImages();
      console.log('Setting initial images:', initialImages);
      setImages(initialImages);
    }
  }, [property, isOpen]);

  // Upload image function
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      showError("Error", "User not authenticated");
      return null;
    }

    try {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error("File must be an image");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading image to storage:', fileName);
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      showError("Upload Error", errorMessage);
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      console.log('Starting file upload for', files.length, 'files');
      
      const uploadPromises = Array.from(files).map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
      
      if (successfulUploads.length > 0) {
        console.log('Successfully uploaded images:', successfulUploads);
        setImages(prev => {
          const newImages = [...prev, ...successfulUploads];
          console.log('Updated images array:', newImages);
          return newImages;
        });
        showSuccess("Success", `${successfulUploads.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('File upload error:', error);
      showError("Error", "Failed to upload images");
    } finally {
      setUploading(false);
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    console.log('Removing image at index:', index);
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      console.log('Images after removal:', newImages);
      return newImages;
    });
  };

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!property?.id) {
        throw new Error("Property ID is required");
      }

      console.log('Updating property with data:', updates);
      console.log('Current images state:', images);
      
      // Prepare the update payload
      const updatePayload = {
        ...updates,
        price: updates.price ? parseFloat(updates.price) : null,
        bedrooms: updates.bedrooms ? parseInt(updates.bedrooms) : null,
        bathrooms: updates.bathrooms ? parseInt(updates.bathrooms) : null,
        area_sqm: updates.area_sqm ? parseInt(updates.area_sqm) : null,
        updated_at: new Date().toISOString(),
      };

      // Handle images - convert to JSON string for storage
      if (images && images.length > 0) {
        updatePayload.images = JSON.stringify(images);
        console.log('Setting images as JSON string:', updatePayload.images);
      } else {
        updatePayload.images = JSON.stringify([]);
        console.log('Setting empty images array');
      }

      console.log('Final update payload:', updatePayload);

      const { error } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', property.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Property updated successfully');
      return updatePayload;
    },
    onSuccess: () => {
      showSuccess("Property Updated", "Property has been updated successfully.");
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      showError("Update Failed", error.message || 'Failed to update property');
    },
  });

  const handleInputChange = (key: string, value: string) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdate = () => {
    console.log('Submitting update with data:', editData);
    console.log('Current images:', images);
    updatePropertyMutation.mutate(editData);
  };

  // Format price display
  const formatPriceDisplay = (price: string) => {
    if (!price) return '';
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? price : `${formatIDR(numPrice)}`;
  };

  if (!property) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Edit Property
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update property information and settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Image Management Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Property Images ({images.length})
            </h3>
            
            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-gray-700 font-medium">Upload New Images</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500">
                Select multiple images (JPG, PNG, etc.) - Max 5MB per file
              </p>
              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Upload className="h-4 w-4 animate-pulse" />
                  Uploading images...
                </div>
              )}
            </div>

            {/* Current Images */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=150&fit=crop';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No images uploaded yet</p>
              </div>
            )}
          </div>

          {/* Property Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-gray-700 font-medium">Property Title</Label>
                <Input
                  id="edit-title"
                  value={editData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter property title"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-property-type" className="text-gray-700 font-medium">Property Type</Label>
                <Select value={editData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
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
                <Label htmlFor="edit-listing-type" className="text-gray-700 font-medium">Listing Type</Label>
                <Select value={editData.listing_type} onValueChange={(value) => handleInputChange('listing_type', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
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
                <Label htmlFor="edit-price" className="text-gray-700 font-medium">
                  Price (IDR)
                  {editData.price && (
                    <Badge variant="outline" className="ml-2 text-green-600">
                      {formatPriceDisplay(editData.price)}
                    </Badge>
                  )}
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Enter price in IDR"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-gray-700 font-medium">Status</Label>
                <Select value={editData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
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

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Details</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-bedrooms" className="text-gray-700 font-medium">Bedrooms</Label>
                  <Input
                    id="edit-bedrooms"
                    type="number"
                    value={editData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    placeholder="BR"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bathrooms" className="text-gray-700 font-medium">Bathrooms</Label>
                  <Input
                    id="edit-bathrooms"
                    type="number"
                    value={editData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    placeholder="BA"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-area-sqm" className="text-gray-700 font-medium">Area (m²)</Label>
                  <Input
                    id="edit-area-sqm"
                    type="number"
                    value={editData.area_sqm}
                    onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                    placeholder="sqm"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-gray-700 font-medium">Full Address</Label>
                <Input
                  id="edit-location"
                  value={editData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter full address"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-city" className="text-gray-700 font-medium">City</Label>
                  <Input
                    id="edit-city"
                    value={editData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state" className="text-gray-700 font-medium">State/Province</Label>
                  <Input
                    id="edit-state"
                    value={editData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-area" className="text-gray-700 font-medium">Area/District</Label>
                <Input
                  id="edit-area"
                  value={editData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Area or District"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Property description"
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              ID: {property.id?.slice(0, 8)}...
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updatePropertyMutation.isPending || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {updatePropertyMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditModal;
