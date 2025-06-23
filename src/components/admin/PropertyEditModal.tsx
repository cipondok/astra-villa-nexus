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
import { Edit, Save, X, Image as ImageIcon, Upload, Trash2, Wand2, AlertTriangle } from "lucide-react";
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
    development_status: "completed",
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  // Check if user is authorized to create restricted development statuses
  const isAuthorizedForRestrictedTypes = () => {
    if (!profile) return false;
    
    // Super admin check
    if (user?.email === 'mycode103@gmail.com') return true;
    
    // Authorized roles
    return ['admin', 'agent', 'property_owner'].includes(profile.role);
  };

  // Get available development status options based on user authorization
  const getAvailableDevelopmentStatuses = () => {
    const baseOptions = [
      { value: "completed", label: "Completed" },
      { value: "under_construction", label: "Under Construction" },
      { value: "planned", label: "Planned" }
    ];

    if (isAuthorizedForRestrictedTypes()) {
      return [
        ...baseOptions,
        { value: "new_project", label: "New Project" },
        { value: "pre_launching", label: "Pre-Launching" }
      ];
    }

    return baseOptions;
  };

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
        development_status: property.development_status || "completed",
      });

      // Parse images from different sources
      const getPropertyImages = () => {
        const imageSources = [
          property.images,
          property.image_urls,
          property.thumbnail_url ? [property.thumbnail_url] : null
        ];

        for (const source of imageSources) {
          if (!source) continue;
          
          try {
            if (typeof source === 'string') {
              // Check if it's a JSON string
              if (source.startsWith('[') || source.startsWith('{')) {
                try {
                  const parsed = JSON.parse(source);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                  }
                } catch {
                  // Not JSON, treat as single URL
                  return [source];
                }
              } else {
                // Single URL string
                return [source];
              }
            }
            
            if (Array.isArray(source) && source.length > 0) {
              return source;
            }
          } catch (error) {
            console.warn('Error parsing image source:', error);
          }
        }
        
        return [];
      };

      const initialImages = getPropertyImages();
      console.log('Setting initial images:', initialImages);
      setImages(initialImages);
    }
  }, [property, isOpen]);

  // Generate AI image for property
  const generateAIImage = async () => {
    if (!property) return;
    
    setGeneratingImage(true);
    try {
      const prompt = `A beautiful ${property.property_type || 'house'} in ${property.location || 'Indonesia'}, ${property.bedrooms || 2} bedrooms, ${property.bathrooms || 1} bathrooms, modern architecture, well-lit, professional real estate photography`;
      
      console.log('Generating AI image with prompt:', prompt);
      
      const response = await fetch('/api/generate-property-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.image) {
        console.log('AI image generated successfully');
        setImages(prev => {
          const newImages = [data.image, ...prev];
          console.log('Updated images with AI generated image:', newImages);
          return newImages;
        });
        showSuccess("Success", "AI image generated successfully");
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
      showError("Error", "Failed to generate AI image");
    } finally {
      setGeneratingImage(false);
    }
  };

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

      // Additional client-side check for restricted development statuses
      if (['new_project', 'pre_launching'].includes(updates.development_status) && !isAuthorizedForRestrictedTypes()) {
        throw new Error('You are not authorized to set this property to New Project or Pre-Launching status. Please contact an administrator.');
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

      // Handle images - save as PostgreSQL array
      if (images && images.length > 0) {
        updatePayload.images = images; // Direct array assignment for PostgreSQL
        console.log('Setting images as array:', updatePayload.images);
      } else {
        updatePayload.images = []; // Empty array
        console.log('Setting empty images array');
      }

      console.log('Final update payload:', updatePayload);

      const { error } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', property.id);

      if (error) {
        console.error('Database update error:', error);
        
        // Handle authorization constraint violation
        if (error.message && error.message.includes('check_development_status_authorization')) {
          throw new Error('You are not authorized to set this development status. Only admins, agents, and property owners can create New Project or Pre-Launching properties.');
        }
        
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
    // Additional validation for restricted development statuses
    if (['new_project', 'pre_launching'].includes(editData.development_status) && !isAuthorizedForRestrictedTypes()) {
      showError("Authorization Error", "You are not authorized to set this development status. Please contact an administrator.");
      return;
    }

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
            {!isAuthorizedForRestrictedTypes() && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-xs text-amber-700">
                  Note: You cannot set development status to "New Project" or "Pre-Launching" - restricted to authorized users only.
                </span>
              </div>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Generate AI Image</Label>
                <Button
                  type="button"
                  onClick={generateAIImage}
                  disabled={generatingImage}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {generatingImage ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate AI Image
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  Generate a professional property image using AI
                </p>
              </div>
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
                <p className="text-gray-500 mb-3">No images uploaded yet</p>
                <Button
                  type="button"
                  onClick={generateAIImage}
                  disabled={generatingImage}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Default Image
                </Button>
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
                <Label htmlFor="edit-development-status" className="text-gray-700 font-medium">Development Status</Label>
                <Select 
                  value={editData.development_status} 
                  onValueChange={(value) => handleInputChange('development_status', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableDevelopmentStatuses().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        {['new_project', 'pre_launching'].includes(option.value) && !isAuthorizedForRestrictedTypes() && (
                          <span className="text-xs text-amber-600 ml-2">(Restricted)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {['new_project', 'pre_launching'].includes(editData.development_status) && !isAuthorizedForRestrictedTypes() && (
                  <p className="text-xs text-amber-600 mt-1">
                    This option is restricted to authorized users only.
                  </p>
                )}
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
              disabled={updatePropertyMutation.isPending || uploading || generatingImage}
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
