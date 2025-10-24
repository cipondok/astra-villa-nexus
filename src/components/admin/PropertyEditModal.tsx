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
import { Edit, Save, X, Image as ImageIcon, Upload, Trash2, Wand2, AlertTriangle, Box, Filter, BarChart3, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";

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
    // Additional comprehensive fields
    thumbnail_url: "",
    three_d_model_url: "",
    virtual_tour_url: "",
    image_urls: [] as string[],
    agent_id: "",
    owner_id: "",
    approval_status: "",
    featured: false,
    floor_plan_url: "",
    video_tour_url: "",
    parking_spaces: "",
    year_built: "",
    lot_size: "",
    property_tax: "",
    maintenance_fee: "",
    amenities: [] as string[],
    nearby_facilities: [] as string[],
    transportation: [] as string[],
    seo_keywords: "",
    custom_fields: {} as Record<string, any>,
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced" | "3d" | "filters">("basic");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { isAdmin } = useAdminCheck();

  // Check if user is authorized to create restricted development statuses
  const isAuthorizedForRestrictedTypes = () => {
    // Only admins can create restricted property types
    return isAdmin;
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

  // Fetch locations from database
  const { data: provinces = [] } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_code, province_name')
        .eq('is_active', true)
        .order('province_name');
      
      if (error) throw error;
      
      // Remove duplicates
      const uniqueProvinces = data.reduce((acc: any[], curr) => {
        if (!acc.find(p => p.province_code === curr.province_code)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      return uniqueProvinces;
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('city_code, city_name, city_type')
        .eq('province_code', selectedProvince)
        .eq('is_active', true)
        .order('city_name');
      
      if (error) throw error;
      
      // Remove duplicates
      const uniqueCities = data.reduce((acc: any[], curr) => {
        if (!acc.find(c => c.city_code === curr.city_code)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      return uniqueCities;
    },
    enabled: !!selectedProvince,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ['districts', selectedCity],
    queryFn: async () => {
      if (!selectedCity) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('district_code, district_name')
        .eq('city_code', selectedCity)
        .eq('is_active', true)
        .order('district_name');
      
      if (error) throw error;
      
      // Remove duplicates
      const uniqueDistricts = data.reduce((acc: any[], curr) => {
        if (!acc.find(d => d.district_code === curr.district_code)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      return uniqueDistricts;
    },
    enabled: !!selectedCity,
  });

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
        // Additional comprehensive fields
        thumbnail_url: property.thumbnail_url || "",
        three_d_model_url: property.three_d_model_url || "",
        virtual_tour_url: property.virtual_tour_url || "",
        image_urls: Array.isArray(property.image_urls) ? property.image_urls : [],
        agent_id: property.agent_id || "",
        owner_id: property.owner_id || "",
        approval_status: property.approval_status || "",
        featured: property.featured || false,
        floor_plan_url: property.floor_plan_url || "",
        video_tour_url: property.video_tour_url || "",
        parking_spaces: property.parking_spaces?.toString() || "",
        year_built: property.year_built?.toString() || "",
        lot_size: property.lot_size?.toString() || "",
        property_tax: property.property_tax?.toString() || "",
        maintenance_fee: property.maintenance_fee?.toString() || "",
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        nearby_facilities: Array.isArray(property.nearby_facilities) ? property.nearby_facilities : [],
        transportation: Array.isArray(property.transportation) ? property.transportation : [],
        seo_keywords: property.seo_keywords || "",
        custom_fields: property.custom_fields || {},
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
      
      // Only include columns that actually exist in the properties table
      const updatePayload: any = {
        title: updates.title,
        description: updates.description,
        property_type: updates.property_type,
        listing_type: updates.listing_type,
        price: updates.price ? parseFloat(updates.price) : null,
        location: updates.location,
        bedrooms: updates.bedrooms ? parseInt(updates.bedrooms) : null,
        bathrooms: updates.bathrooms ? parseInt(updates.bathrooms) : null,
        area_sqm: updates.area_sqm ? parseInt(updates.area_sqm) : null,
        status: updates.status,
        state: updates.state,
        city: updates.city,
        area: updates.area,
        three_d_model_url: updates.three_d_model_url || null,
        virtual_tour_url: updates.virtual_tour_url || null,
        development_status: updates.development_status,
        seo_title: updates.seo_title || null,
        seo_description: updates.seo_description || null,
        approval_status: updates.approval_status,
        thumbnail_url: updates.thumbnail_url || null,
        updated_at: new Date().toISOString(),
      };

      // Add optional fields if they exist in updates
      if (updates.agent_id) updatePayload.agent_id = updates.agent_id;
      if (updates.image_urls) updatePayload.image_urls = updates.image_urls;
      if (updates.property_features) updatePayload.property_features = updates.property_features;
      if (updates.owner_type) updatePayload.owner_type = updates.owner_type;

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-6 bg-gradient-to-r from-indigo-600 to-purple-600 -mx-6 -mt-6 px-6 pt-6 text-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Edit className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Edit Property</h1>
                <p className="text-indigo-100 text-sm font-normal mt-1">Update property information and settings</p>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {!isAuthorizedForRestrictedTypes() && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-amber-200" />
              <span className="text-xs text-amber-100">
                Note: You cannot set development status to "New Project" or "Pre-Launching" - restricted to authorized users only.
              </span>
            </div>
          )}
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-1">
          <div className="space-y-6 py-4">
            {/* Image Management Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Property Gallery ({images.length} Images)
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="image-upload" className="text-slate-700 dark:text-slate-300 font-medium">Upload New Images</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Select multiple images (JPG, PNG, etc.) - Max 5MB per file
                    </p>
                    {uploading && (
                      <div className="flex items-center gap-2 text-purple-600">
                        <Upload className="h-4 w-4 animate-pulse" />
                        Uploading images...
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Generate AI Image</Label>
                    <Button
                      type="button"
                      onClick={generateAIImage}
                      disabled={generatingImage}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {generatingImage ? (
                        <>
                          <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Magic...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate AI Image
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Generate a professional property image using AI
                    </p>
                  </div>
                </div>

                {/* Current Images */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-700 shadow-lg">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=150&fit=crop';
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 bg-red-500 hover:bg-red-600"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-2 left-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-slate-100 to-purple-100 dark:from-slate-800 dark:to-purple-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto mb-4">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Images Yet</h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Upload images or generate one with AI</p>
                    <Button
                      type="button"
                      onClick={generateAIImage}
                      disabled={generatingImage}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Default Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Property Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                  <h3 className="text-lg font-bold text-white">Basic Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-slate-700 dark:text-slate-300 font-medium">Property Title</Label>
                    <Input
                      id="edit-title"
                      value={editData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter property title"
                      className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-property-type" className="text-slate-700 dark:text-slate-300 font-medium">Property Type</Label>
                    <Select value={editData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                      <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500">
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
                    <Label htmlFor="edit-listing-type" className="text-slate-700 dark:text-slate-300 font-medium">Listing Type</Label>
                    <Select value={editData.listing_type} onValueChange={(value) => handleInputChange('listing_type', value)}>
                      <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500">
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
                    <Label htmlFor="edit-development-status" className="text-slate-700 dark:text-slate-300 font-medium">Development Status</Label>
                    <Select 
                      value={editData.development_status} 
                      onValueChange={(value) => handleInputChange('development_status', value)}
                    >
                      <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-price" className="text-slate-700 dark:text-slate-300 font-medium">
                      Price (IDR)
                      {editData.price && (
                        <Badge className="ml-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
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
                      className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-slate-700 dark:text-slate-300 font-medium">Status</Label>
                    <Select value={editData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500">
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
              </div>

              {/* Property Details */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                  <h3 className="text-lg font-bold text-white">Property Specifications</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-bedrooms" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Bedrooms</Label>
                      <Input
                        id="edit-bedrooms"
                        type="number"
                        value={editData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                        placeholder="BR"
                        className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-bathrooms" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Bathrooms</Label>
                      <Input
                        id="edit-bathrooms"
                        type="number"
                        value={editData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                        placeholder="BA"
                        className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-area-sqm" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Area (m²)</Label>
                      <Input
                        id="edit-area-sqm"
                        type="number"
                        value={editData.area_sqm}
                        onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                        placeholder="sqm"
                        className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location" className="text-slate-700 dark:text-slate-300 font-medium">Full Address</Label>
                    <Input
                      id="edit-location"
                      value={editData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter full address"
                      className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-city" className="text-slate-700 dark:text-slate-300 font-medium">City</Label>
                      <Input
                        id="edit-city"
                        value={editData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-state" className="text-slate-700 dark:text-slate-300 font-medium">State/Province</Label>
                      <Input
                        id="edit-state"
                        value={editData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-area" className="text-slate-700 dark:text-slate-300 font-medium">Area/District</Label>
                    <Input
                      id="edit-area"
                      value={editData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="Area or District"
                      className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Property description"
                      rows={4}
                      className="border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Property Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                <h3 className="text-lg font-bold text-white">Additional Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Parking Spaces</Label>
                    <Input
                      type="number"
                      value={editData.parking_spaces}
                      onChange={(e) => handleInputChange('parking_spaces', e.target.value)}
                      placeholder="Number of parking spaces"
                      className="border-slate-300 dark:border-slate-600 focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Year Built</Label>
                    <Input
                      type="number"
                      value={editData.year_built}
                      onChange={(e) => handleInputChange('year_built', e.target.value)}
                      placeholder="e.g., 2020"
                      className="border-slate-300 dark:border-slate-600 focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Lot Size (m²)</Label>
                    <Input
                      type="number"
                      value={editData.lot_size}
                      onChange={(e) => handleInputChange('lot_size', e.target.value)}
                      placeholder="Lot size in square meters"
                      className="border-slate-300 dark:border-slate-600 focus:border-amber-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Property Tax (IDR/year)</Label>
                    <Input
                      type="number"
                      value={editData.property_tax}
                      onChange={(e) => handleInputChange('property_tax', e.target.value)}
                      placeholder="Annual property tax"
                      className="border-slate-300 dark:border-slate-600 focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Maintenance Fee (IDR/month)</Label>
                    <Input
                      type="number"
                      value={editData.maintenance_fee}
                      onChange={(e) => handleInputChange('maintenance_fee', e.target.value)}
                      placeholder="Monthly maintenance fee"
                      className="border-slate-300 dark:border-slate-600 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editData.featured}
                        onChange={(e) => setEditData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Property</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO & Marketing */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4">
                <h3 className="text-lg font-bold text-white">SEO & Marketing</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">SEO Keywords</Label>
                  <Textarea
                    value={editData.seo_keywords}
                    onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                    placeholder="luxury apartment, modern design, city center, investment property..."
                    rows={3}
                    className="border-slate-300 dark:border-slate-600 focus:border-pink-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comma-separated keywords for better search visibility
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Features Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4">
                <h3 className="text-lg font-bold text-white">Advanced Features</h3>
              </div>
              <div className="p-6">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === "basic" 
                        ? "bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                    Basic Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("3d")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === "3d" 
                        ? "bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50"
                    }`}
                  >
                    <Box className="h-4 w-4" />
                    3D Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("filters")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === "filters" 
                        ? "bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50"
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Display Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === "advanced" 
                        ? "bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "3d" && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">3D & Virtual Content</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">3D Model URL</Label>
                          <Input
                            value={editData.three_d_model_url}
                            onChange={(e) => handleInputChange('three_d_model_url', e.target.value)}
                            placeholder="https://example.com/model.glb"
                            className="border-slate-300 dark:border-slate-600 focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Virtual Tour URL</Label>
                          <Input
                            value={editData.virtual_tour_url}
                            onChange={(e) => handleInputChange('virtual_tour_url', e.target.value)}
                            placeholder="https://example.com/virtual-tour"
                            className="border-slate-300 dark:border-slate-600 focus:border-violet-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Floor Plan URL</Label>
                          <Input
                            value={editData.floor_plan_url}
                            onChange={(e) => handleInputChange('floor_plan_url', e.target.value)}
                            placeholder="https://example.com/floor-plan.pdf"
                            className="border-slate-300 dark:border-slate-600 focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Video Tour URL</Label>
                          <Input
                            value={editData.video_tour_url}
                            onChange={(e) => handleInputChange('video_tour_url', e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="border-slate-300 dark:border-slate-600 focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-medium">Thumbnail Image URL</Label>
                      <Input
                        value={editData.thumbnail_url}
                        onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                        placeholder="https://example.com/thumbnail.jpg"
                        className="border-slate-300 dark:border-slate-600 focus:border-violet-500"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "filters" && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Location & Search Filters</h4>
                    
                    {/* Location Selection from Database */}
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-teal-200 dark:border-teal-700">
                      <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-teal-600" />
                        Database Location Selection
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Province</Label>
                          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-teal-500 z-50">
                              <SelectValue placeholder="Select Province" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-lg z-50">
                              {provinces.map((province: any) => (
                                <SelectItem key={province.province_code} value={province.province_code} className="hover:bg-teal-50 dark:hover:bg-teal-900/20">
                                  {province.province_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">City</Label>
                          <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-teal-500 z-50">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-lg z-50">
                              {cities.map((city: any) => (
                                <SelectItem key={city.city_code} value={city.city_code} className="hover:bg-teal-50 dark:hover:bg-teal-900/20">
                                  {city.city_type} {city.city_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">District</Label>
                          <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedCity}>
                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-teal-500 z-50">
                              <SelectValue placeholder="Select District" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-lg z-50">
                              {districts.map((district: any) => (
                                <SelectItem key={district.district_code} value={district.district_code} className="hover:bg-teal-50 dark:hover:bg-teal-900/20">
                                  {district.district_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Property Filter Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Property Visibility</h5>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" defaultChecked />
                            <span className="text-sm font-medium">Show on main listings</span>
                          </label>
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" defaultChecked />
                            <span className="text-sm font-medium">Featured property</span>
                          </label>
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium">Premium highlight</span>
                          </label>
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium">Urgent sale</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-700">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Search Filters</h5>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                            <span className="text-sm font-medium">Include in price filters</span>
                          </label>
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                            <span className="text-sm font-medium">Show in location search</span>
                          </label>
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm font-medium">Exclude from bulk searches</span>
                          </label>
                          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                            <span className="text-sm font-medium">Available for comparison</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Price & Criteria Filters */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-700">
                      <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Price & Criteria Filters</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Price Range Category</Label>
                          <Select defaultValue="mid-range">
                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-amber-500 z-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-lg z-50">
                              <SelectItem value="budget">Budget (under 500M IDR)</SelectItem>
                              <SelectItem value="mid-range">Mid-Range (500M - 2B IDR)</SelectItem>
                              <SelectItem value="luxury">Luxury (2B - 10B IDR)</SelectItem>
                              <SelectItem value="ultra-luxury">Ultra Luxury (over 10B IDR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Target Audience</Label>
                          <Select defaultValue="general">
                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-amber-500 z-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-lg z-50">
                              <SelectItem value="general">General Public</SelectItem>
                              <SelectItem value="first-time">First-time Buyers</SelectItem>
                              <SelectItem value="investors">Investors</SelectItem>
                              <SelectItem value="families">Families</SelectItem>
                              <SelectItem value="professionals">Young Professionals</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "advanced" && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Advanced Settings & Analytics</h4>
                    
                    {/* Property Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Property Views</h5>
                        <p className="text-2xl font-bold text-blue-600">1,234</p>
                        <p className="text-xs text-slate-500">This month</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Inquiries</h5>
                        <p className="text-2xl font-bold text-emerald-600">45</p>
                        <p className="text-xs text-slate-500">Total received</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Favorites</h5>
                        <p className="text-2xl font-bold text-amber-600">89</p>
                        <p className="text-xs text-slate-500">User saves</p>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-200">Assignment</h5>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Agent ID</Label>
                          <Input
                            value={editData.agent_id}
                            onChange={(e) => handleInputChange('agent_id', e.target.value)}
                            placeholder="Assigned agent ID"
                            className="border-slate-300 dark:border-slate-600 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Owner ID</Label>
                          <Input
                            value={editData.owner_id}
                            onChange={(e) => handleInputChange('owner_id', e.target.value)}
                            placeholder="Property owner ID"
                            className="border-slate-300 dark:border-slate-600 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-200">Approval Status</h5>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Approval Status</Label>
                          <Select value={editData.approval_status} onValueChange={(value) => handleInputChange('approval_status', value)}>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500">
                              <SelectValue placeholder="Select approval status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending Review</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="needs_revision">Needs Revision</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-6 bg-white dark:bg-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              ID: {property.id?.slice(0, 8)}...
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updatePropertyMutation.isPending || uploading || generatingImage}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
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
