
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
import { Sparkles, Upload, X, Image as ImageIcon, Star } from "lucide-react";

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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);

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
      
      // Handle both images and image_urls arrays
      const currentImages = property.images || property.image_urls || [];
      console.log('Current images from property:', currentImages);
      setExistingImages(currentImages);
      
      // Set thumbnail - check thumbnail_url first, then first image
      const thumbnailUrl = property.thumbnail_url || (currentImages.length > 0 ? currentImages[0] : "");
      console.log('Setting thumbnail URL:', thumbnailUrl);
      setSelectedThumbnail(thumbnailUrl);
      setImageFiles([]);
    }
  }, [property, isOpen]);

  // Function to add watermark to image
  const addWatermarkToImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx?.drawImage(img, 0, 0);
        
        if (ctx) {
          // Set watermark text properties
          ctx.globalAlpha = 0.3; // 70% transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `${Math.max(20, img.width / 20)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Add watermark text in center
          const text = 'REALESTATE.ID';
          ctx.fillText(text, img.width / 2, img.height / 2);
          
          // Convert canvas back to file
          canvas.toBlob((blob) => {
            if (blob) {
              const watermarkedFile = new File([blob], file.name, { type: file.type });
              resolve(watermarkedFile);
            } else {
              resolve(file);
            }
          }, file.type);
        } else {
          resolve(file);
        }
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      // Add watermark to image
      const watermarkedFile = await addWatermarkToImage(file);
      
      const fileExt = watermarkedFile.name.split('.').pop();
      const fileName = `${property.id}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, watermarkedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${watermarkedFile.name}`);
      }

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: any) => {
      console.log('Updating property with data:', updates);
      
      let finalImageUrls = [...existingImages];
      
      // Upload new images if any
      if (imageFiles.length > 0) {
        setImageUploading(true);
        try {
          const newImageUrls = await uploadImages(imageFiles);
          finalImageUrls = [...finalImageUrls, ...newImageUrls];
        } catch (error) {
          throw new Error(`Image upload failed: ${error}`);
        } finally {
          setImageUploading(false);
        }
      }

      // Set thumbnail - if no thumbnail selected and we have images, use first image
      let thumbnailUrl = selectedThumbnail;
      if (!thumbnailUrl && finalImageUrls.length > 0) {
        thumbnailUrl = finalImageUrls[0];
      }

      const updatePayload = {
        ...updates,
        images: finalImageUrls,
        image_urls: finalImageUrls, // Update both fields for compatibility
        thumbnail_url: thumbnailUrl,
        price: updates.price ? parseFloat(updates.price) : null,
        bedrooms: updates.bedrooms ? parseInt(updates.bedrooms) : null,
        bathrooms: updates.bathrooms ? parseInt(updates.bathrooms) : null,
        area_sqm: updates.area_sqm ? parseInt(updates.area_sqm) : null,
        updated_at: new Date().toISOString(),
      };

      console.log('Final update payload:', updatePayload);

      const { error } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', property.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      return updatePayload;
    },
    onSuccess: (updatedData) => {
      showSuccess("Property Updated", "Property has been updated successfully with images.");
      
      // Invalidate all relevant queries with specific refetching
      const queriesToInvalidate = [
        ['admin-properties'],
        ['properties'],
        ['property', property.id],
        ['all-properties'],
        ['all-users'], // In case owner/agent changed
      ];

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Clear form state
      setImageFiles([]);
      
      // Force immediate refetch of admin properties
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['admin-properties'] });
        queryClient.refetchQueries({ queryKey: ['properties'] });
      }, 100);
      
      // Close modal
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
      // Update the form with generated SEO content
      if (data.seo_title && data.seo_description) {
        setEditData(prev => ({
          ...prev,
          seo_title: data.seo_title,
          seo_description: data.seo_description
        }));
      }
      showSuccess("AI Content Generated", "SEO content has been generated and populated in the form.");
    },
    onError: (error: any) => {
      showError("Generation Failed", error.message);
    },
  });

  const handleGenerateSeo = () => {
    if (!property?.id || !editData.title) return;
    generateSeoMutation.mutate({ propertyId: property.id, title: editData.title });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      showError("Invalid Files", "Please select only image files.");
      return;
    }
    
    if (imageFiles.length + existingImages.length > 10) {
      showError("Too Many Images", "Maximum 10 images allowed per property.");
      return;
    }
    
    setImageFiles(prev => [...prev, ...imageFiles]);
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const imageToRemove = existingImages[index];
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    
    // If the removed image was the selected thumbnail, reset thumbnail selection
    if (selectedThumbnail === imageToRemove) {
      const remainingImages = existingImages.filter((_, i) => i !== index);
      setSelectedThumbnail(remainingImages.length > 0 ? remainingImages[0] : "");
    }
  };

  const handleThumbnailSelect = (imageUrl: string) => {
    console.log('Selected thumbnail:', imageUrl);
    setSelectedThumbnail(imageUrl);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-50">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-800">Edit Property</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-700">
            Update property details, images, ownership, and generate SEO content with AI.
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

          {/* Image Upload Section */}
          <div className="col-span-2 space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">Property Images (Auto-watermarked)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={imageUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imageUploading ? "Uploading..." : "Add Images"}
                </Button>
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Current Images ({existingImages.length}) - Click star to set as thumbnail
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Property ${index + 1}`}
                        className={`w-full h-20 object-cover rounded border cursor-pointer transition-all ${
                          selectedThumbnail === imageUrl 
                            ? 'border-2 border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                        onClick={() => handleThumbnailSelect(imageUrl)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-0 left-0 h-6 w-6 p-0 ${
                          selectedThumbnail === imageUrl 
                            ? 'text-yellow-500' 
                            : 'text-gray-400 opacity-0 group-hover:opacity-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThumbnailSelect(imageUrl);
                        }}
                      >
                        <Star className={`h-3 w-3 ${selectedThumbnail === imageUrl ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingImage(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                {selectedThumbnail && (
                  <p className="text-sm text-blue-600 mt-2">
                    Selected thumbnail: {existingImages.findIndex(img => img === selectedThumbnail) + 1}
                  </p>
                )}
              </div>
            )}

            {/* New Images Preview */}
            {imageFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">New Images ({imageFiles.length}) - Will be watermarked on upload</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {imageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-20 object-cover rounded border border-blue-300"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingImages.length === 0 && imageFiles.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No images uploaded yet</p>
              </div>
            )}
          </div>

          {/* AI SEO Content Section */}
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
                onChange={(e) => setEditData({ ...editData, seo_title: e.target.value })}
                placeholder="AI-generated SEO title will appear here."
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description" className="text-gray-900 dark:text-gray-800">SEO Description</Label>
              <Textarea
                id="seo-description"
                value={editData.seo_description}
                onChange={(e) => setEditData({ ...editData, seo_description: e.target.value })}
                placeholder="AI-generated SEO description will appear here."
                rows={2}
                className="bg-white border-gray-300"
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
          <Button 
            onClick={handleUpdate} 
            disabled={updatePropertyMutation.isPending || imageUploading}
          >
            {updatePropertyMutation.isPending ? "Updating..." : imageUploading ? "Uploading Images..." : "Update Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditModal;
