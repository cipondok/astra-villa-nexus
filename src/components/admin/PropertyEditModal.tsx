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
import { Sparkles, Upload, X, Image as ImageIcon, Star, Wand2, Filter, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WatermarkSettings from "./WatermarkSettings";

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
    development_status: "completed",
    three_d_model_url: "",
    virtual_tour_url: "",
    status: "pending_approval",
    approval_status: "pending",
    city: "",
    state: "",
    area: "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all users for owner/agent selection - ALWAYS call this hook
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
    enabled: !!property, // Only fetch when property exists
  });

  // ALWAYS call useEffect hooks
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
        development_status: property.development_status || "completed",
        three_d_model_url: property.three_d_model_url || "",
        virtual_tour_url: property.virtual_tour_url || "",
        status: property.status || "pending_approval",
        approval_status: property.approval_status || "pending",
        city: property.city || "",
        state: property.state || "",
        area: property.area || "",
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

  // ALWAYS define mutations - they don't execute until called
  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!property?.id) {
        throw new Error("Property ID is required");
      }

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
      showSuccess("Property Updated", "Property has been updated successfully with all changes.");
      
      // Invalidate all relevant queries with specific refetching
      const queriesToInvalidate = [
        ['admin-properties'],
        ['properties'],
        ['property', property?.id],
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

  const generateDefaultImageMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Create a professional real estate default image with elegant design featuring the text "VillaAstra" as a watermark. The image should have a modern, clean aesthetic with a gradient background in blue and white tones, suitable for property listings. Include subtle architectural elements like building silhouettes or property icons. Make it look professional and trustworthy.`;
      
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: { prompt }
      });

      if (error) throw error;
      return data.image;
    },
    onSuccess: (imageData) => {
      // Convert base64 to blob and add to existing images
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const fileName = generateAVFilename({ name: 'villa-astra-default.png' } as File);
      const file = new File([blob], fileName, { type: 'image/png' });
      
      setImageFiles(prev => [file, ...prev]);
      showSuccess("Default Image Generated", "VillaAstra default image has been generated and added to the property.");
    },
    onError: (error: any) => {
      showError("Generation Failed", error.message);
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

  // Early return AFTER all hooks have been declared
  if (!property) {
    return null;
  }

  // Generate AV filename with 15 random digits
  const generateAVFilename = (originalFile: File): string => {
    const extension = originalFile.name.split('.').pop();
    const randomDigits = Math.random().toString().slice(2, 17).padStart(15, '0');
    return `AV${randomDigits}.${extension}`;
  };

  // Function to add watermark to image with comprehensive settings
  const addWatermarkToImage = async (file: File): Promise<File> => {
    return new Promise(async (resolve) => {
      // Get watermark settings for this property
      const { data: watermarkSettings } = await supabase
        .from('property_watermark_settings')
        .select('*')
        .eq('property_id', property.id)
        .maybeSingle();

      const settings = watermarkSettings || {
        is_enabled: true,
        watermark_type: 'text',
        text_content: 'VillaAstra',
        text_color: '#FFFFFF',
        text_opacity: 0.70,
        text_size: 24,
        text_font: 'Arial',
        watermark_image_url: null,
        image_opacity: 0.70,
        image_scale: 1.00,
        position_x: 'center',
        position_y: 'center',
        offset_x: 0,
        offset_y: 0
      };

      if (!settings.is_enabled) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx?.drawImage(img, 0, 0);
        
        if (ctx) {
          // Calculate position
          let x = img.width / 2;
          let y = img.height / 2;
          
          if (settings.position_x === 'left') x = img.width * 0.1;
          if (settings.position_x === 'right') x = img.width * 0.9;
          if (settings.position_y === 'top') y = img.height * 0.1;
          if (settings.position_y === 'bottom') y = img.height * 0.9;
          
          x += settings.offset_x || 0;
          y += settings.offset_y || 0;

          // Apply text watermark
          if (settings.watermark_type === 'text' || settings.watermark_type === 'both') {
            ctx.globalAlpha = settings.text_opacity || 0.70;
            ctx.fillStyle = settings.text_color || '#FFFFFF';
            ctx.font = `${Math.max(settings.text_size || 24, img.width / 40)}px ${settings.text_font || 'Arial'}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Add text shadow for better visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.fillText(settings.text_content || 'VillaAstra', x, y);
          }

          // Apply image watermark if available
          if ((settings.watermark_type === 'image' || settings.watermark_type === 'both') && settings.watermark_image_url) {
            const watermarkImg = new Image();
            watermarkImg.crossOrigin = 'anonymous';
            watermarkImg.onload = () => {
              ctx.globalAlpha = settings.image_opacity || 0.70;
              const scale = settings.image_scale || 1;
              const scaledWidth = watermarkImg.width * scale;
              const scaledHeight = watermarkImg.height * scale;
              
              ctx.drawImage(
                watermarkImg, 
                x - scaledWidth / 2, 
                y - scaledHeight / 2, 
                scaledWidth, 
                scaledHeight
              );
              
              // Convert canvas back to file
              canvas.toBlob((blob) => {
                if (blob) {
                  const watermarkedFile = new File([blob], generateAVFilename(file), { type: file.type });
                  resolve(watermarkedFile);
                } else {
                  resolve(file);
                }
              }, file.type);
            };
            watermarkImg.src = settings.watermark_image_url;
          } else {
            // Convert canvas back to file
            canvas.toBlob((blob) => {
              if (blob) {
                const watermarkedFile = new File([blob], generateAVFilename(file), { type: file.type });
                resolve(watermarkedFile);
              } else {
                resolve(file);
              }
            }, file.type);
          }
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
      // Add watermark to image with comprehensive settings
      const watermarkedFile = await addWatermarkToImage(file);
      
      const fileName = `${property.id}/${generateAVFilename(watermarkedFile)}`;
      
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
    
    if (imageFiles.length + existingImages.length > 15) {
      showError("Too Many Images", "Maximum 15 images allowed per property.");
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

  const totalImages = existingImages.length + imageFiles.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-50">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-800 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Edit Property - Advanced Mode
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-700">
            Complete property management with images, SEO, watermark settings, and AI tools.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Images & Media</TabsTrigger>
            <TabsTrigger value="watermark">Watermark</TabsTrigger>
            <TabsTrigger value="seo">SEO & Filters</TabsTrigger>
            <TabsTrigger value="admin">Admin Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
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
                <Label htmlFor="edit-city" className="text-gray-900 dark:text-gray-800">City</Label>
                <Input
                  id="edit-city"
                  value={editData.city}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  placeholder="City"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-state" className="text-gray-900 dark:text-gray-800">State/Province</Label>
                <Input
                  id="edit-state"
                  value={editData.state}
                  onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                  placeholder="State or Province"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-area" className="text-gray-900 dark:text-gray-800">Area/District</Label>
                <Input
                  id="edit-area"
                  value={editData.area}
                  onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                  placeholder="Area or District"
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
                <Label htmlFor="edit-development-status" className="text-gray-900 dark:text-gray-800">Development Status</Label>
                <Select value={editData.development_status} onValueChange={(value) => setEditData({ ...editData, development_status: value })}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="new_project">New Project</SelectItem>
                    <SelectItem value="pre_launching">Pre-launching</SelectItem>
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
                <Label htmlFor="edit-area-sqm" className="text-gray-900 dark:text-gray-800">Area (sqm)</Label>
                <Input
                  id="edit-area-sqm"
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

              <div className="space-y-2">
                <Label htmlFor="edit-3d-model" className="text-gray-900 dark:text-gray-800">3D Model URL</Label>
                <Input
                  id="edit-3d-model"
                  value={editData.three_d_model_url}
                  onChange={(e) => setEditData({ ...editData, three_d_model_url: e.target.value })}
                  placeholder="e.g., https://example.com/model.glb"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-virtual-tour" className="text-gray-900 dark:text-gray-800">Virtual Tour URL</Label>
                <Input
                  id="edit-virtual-tour"
                  value={editData.virtual_tour_url}
                  onChange={(e) => setEditData({ ...editData, virtual_tour_url: e.target.value })}
                  placeholder="e.g., https://example.com/tour"
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Property Images ({totalImages}/15)
                  </h3>
                  <p className="text-sm text-gray-600">Auto-watermarked with VillaAstra logo</p>
                </div>
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
                    disabled={imageUploading || totalImages >= 15}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {imageUploading ? "Uploading..." : "Add Images"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => generateDefaultImageMutation.mutate()}
                    disabled={generateDefaultImageMutation.isPending}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {generateDefaultImageMutation.isPending ? "Generating..." : "Generate Default"}
                  </Button>
                </div>
              </div>

              {totalImages > 1 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Click the star icon on any image to set it as the thumbnail for this property
                  </p>
                </div>
              )}

              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Current Images ({existingImages.length}) - Click star to set as thumbnail
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Property ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                            selectedThumbnail === imageUrl 
                              ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                          onClick={() => handleThumbnailSelect(imageUrl)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`absolute top-1 left-1 h-7 w-7 p-0 rounded-full ${
                            selectedThumbnail === imageUrl 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleThumbnailSelect(imageUrl);
                          }}
                        >
                          <Star className={`h-4 w-4 ${selectedThumbnail === imageUrl ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExistingImage(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {selectedThumbnail === imageUrl && (
                          <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">
                            Thumbnail
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imageFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    New Images ({imageFiles.length}) - Will be watermarked on upload
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {imageFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-blue-300"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Badge className="absolute bottom-1 left-1 text-xs bg-green-500">
                          New
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalImages === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No images uploaded yet</p>
                  <p className="text-sm text-gray-400">Add images or generate a default VillaAstra image</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="watermark" className="space-y-4">
            <WatermarkSettings propertyId={property.id} />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI SEO Content Generator
                </h3>
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
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg bg-red-50 dark:bg-red-100">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Admin Controls & Status Management
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-gray-900 dark:text-gray-800">Property Status</Label>
                  <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-approval-status" className="text-gray-900 dark:text-gray-800">Approval Status</Label>
                  <Select value={editData.approval_status} onValueChange={(value) => setEditData({ ...editData, approval_status: value })}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Admin Note:</strong> Changes made here will affect property visibility and searchability on the platform.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            {selectedThumbnail && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Thumbnail Selected
              </Badge>
            )}
            {totalImages > 0 && (
              <Badge variant="secondary">
                {totalImages} Image{totalImages !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updatePropertyMutation.isPending || imageUploading}
            >
              {updatePropertyMutation.isPending ? "Updating..." : imageUploading ? "Uploading Images..." : "Update Property"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditModal;
