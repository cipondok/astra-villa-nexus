import { useState, useEffect } from "react";
import React from "react";
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
import { Edit, Save, X, Image as ImageIcon, Upload, Trash2, Wand2, AlertTriangle, Box, Filter, BarChart3, MapPin, Calendar, Star, Home, Tag, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    seo_title: "",
    seo_description: "",
    custom_fields: {} as Record<string, any>,
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"gallery" | "info" | "seo" | "advanced">("gallery");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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
        seo_title: property.seo_title || "",
        seo_description: property.seo_description || "",
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

  // Auto-switch tabs based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      
      // Calculate which section is most visible
      const scrollPercent = scrollTop / (scrollHeight - containerHeight);
      
      if (scrollPercent < 0.25) {
        setActiveTab("gallery");
      } else if (scrollPercent < 0.5) {
        setActiveTab("info");
      } else if (scrollPercent < 0.75) {
        setActiveTab("seo");
      } else {
        setActiveTab("advanced");
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to tab content when tab is clicked
  const scrollToTab = (tab: string) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight - container.clientHeight;
    let targetScroll = 0;

    switch (tab) {
      case "gallery":
        targetScroll = 0;
        break;
      case "info":
        targetScroll = scrollHeight * 0.25;
        break;
      case "seo":
        targetScroll = scrollHeight * 0.5;
        break;
      case "advanced":
        targetScroll = scrollHeight * 0.75;
        break;
    }

    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

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
        .upload(fileName, file, { contentType: file.type, upsert: true });

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

  // Remove image (also delete from storage if possible)
  const removeImage = async (index: number) => {
    try {
      const url = images[index];
      if (url) {
        // Derive storage path from public URL
        // Expected: .../storage/v1/object/public/property-images/<path>
        let path = '';
        const marker = '/object/public/property-images/';
        const i = url.indexOf(marker);
        if (i !== -1) {
          path = url.substring(i + marker.length);
        } else {
          const altMarker = 'property-images/';
          const j = url.indexOf(altMarker);
          if (j !== -1) path = url.substring(j + altMarker.length);
        }
        if (path) {
          const { error: rmError } = await supabase.storage
            .from('property-images')
            .remove([path]);
          if (rmError) {
            console.warn('Storage remove warning:', rmError.message);
          }
        }
      }
    } catch (e) {
      console.warn('Error while removing image from storage:', e);
    } finally {
      setImages(prev => {
        const newImages = prev.filter((_, i) => i !== index);
        setEditData(ed => ({
          ...ed,
          thumbnail_url: ed.thumbnail_url === (images[index] || '') ? (newImages[0] || '') : ed.thumbnail_url
        }));
        return newImages;
      });
    }
  };

  // Remove thumbnail (set to next available image)
  const removeThumbnail = () => {
    if (images.length > 0) {
      // Find the next image that's not the current thumbnail
      const currentIndex = images.findIndex(img => img === editData.thumbnail_url);
      const nextImage = currentIndex === images.length - 1 ? images[0] : images[currentIndex + 1];
      setEditData(prev => ({ ...prev, thumbnail_url: nextImage }));
    } else {
      setEditData(prev => ({ ...prev, thumbnail_url: '' }));
    }
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

      // Handle images - save as PostgreSQL array and sync image_urls/thumbnail (thumbnail first)
      const tn = updates.thumbnail_url || (images[0] || null);
      const orderedImages = (images && images.length > 0)
        ? [tn, ...images.filter((u) => u !== tn)]
        : [];
      updatePayload.images = orderedImages;
      updatePayload.image_urls = orderedImages;
      updatePayload.thumbnail_url = tn;
      console.log('Setting images arrays and thumbnail (ordered):', { images: orderedImages, thumbnail: tn });
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
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      queryClient.invalidateQueries({ queryKey: ['property-by-id', property.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
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
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-3 bg-gradient-to-r from-indigo-600 to-purple-600 -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 px-3 sm:px-4 pt-3 sm:pt-4 text-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hidden sm:block">
                <Edit className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold">Edit Property</h1>
                <p className="text-indigo-100 text-xs font-normal mt-0.5 hidden sm:block">Update property info</p>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <DialogDescription className="sr-only">Edit property</DialogDescription>
          {!isAuthorizedForRestrictedTypes() && (
            <div className="mt-2 flex items-center gap-1.5 p-2 bg-amber-500/20 border border-amber-400/30 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="h-3 w-3 text-amber-200" />
              <span className="text-[10px] sm:text-xs text-amber-100">
                Note: Cannot set status to "New Project" or "Pre-Launching"
              </span>
            </div>
          )}
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "gallery" | "info" | "seo" | "advanced"); scrollToTab(v); }} className="w-full">
          <div className="px-2 pt-2 sticky top-0 z-10 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
            <TabsList className="h-8 grid w-full grid-cols-4 gap-1 bg-slate-200 dark:bg-slate-800 p-0.5">
              <TabsTrigger 
                value="gallery" 
                onClick={() => scrollToTab("gallery")}
                className={`text-xs h-7 ${activeTab === "gallery" ? "bg-white dark:bg-slate-700" : ""}`}
              >
                Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                onClick={() => scrollToTab("info")}
                className={`text-xs h-7 ${activeTab === "info" ? "bg-white dark:bg-slate-700" : ""}`}
              >
                Info
              </TabsTrigger>
              <TabsTrigger 
                value="seo" 
                onClick={() => scrollToTab("seo")}
                className={`text-xs h-7 ${activeTab === "seo" ? "bg-white dark:bg-slate-700" : ""}`}
              >
                SEO
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                onClick={() => scrollToTab("advanced")}
                className={`text-xs h-7 ${activeTab === "advanced" ? "bg-white dark:bg-slate-700" : ""}`}
              >
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>
        
          <div ref={scrollContainerRef} className="overflow-y-auto max-h-[calc(95vh-180px)] px-1">

            <TabsContent value="gallery" className="mt-0">
              <div className="space-y-3 py-2" id="gallery-section">
                {/* Current Thumbnail Display */}
                {editData.thumbnail_url && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Current Thumbnail
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeThumbnail}
                        className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                    <div className="relative rounded-lg overflow-hidden w-full h-32">
                      <img
                        src={editData.thumbnail_url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Image Management Section */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 sm:p-3">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      Gallery ({images.length})
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 space-y-3">
                    {/* Upload Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="image-upload" className="text-slate-700 dark:text-slate-300 font-medium text-xs">Upload Images</Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="border-slate-300 dark:border-slate-600 focus:border-purple-500 h-8 text-xs"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          JPG, PNG, max 5MB each
                        </p>
                        {uploading && (
                          <div className="flex items-center gap-1.5 text-purple-600 text-xs">
                            <Upload className="h-3 w-3 animate-pulse" />
                            Uploading...
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300 font-medium text-xs">AI Generate</Label>
                        <Button
                          type="button"
                          onClick={generateAIImage}
                          disabled={generatingImage}
                          className="w-full h-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs"
                        >
                          {generatingImage ? (
                            <>
                              <Wand2 className="h-3 w-3 mr-1.5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-3 w-3 mr-1.5" />
                              Generate AI
                            </>
                          )}
                        </Button>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          AI-powered image generation
                        </p>
                      </div>
                    </div>

                    {/* Current Images */}
                    {images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {images.map((url, index) => (
                          <div key={index} className={`group relative overflow-hidden rounded-lg bg-white dark:bg-slate-700 shadow ${editData.thumbnail_url === url ? 'ring-1 ring-amber-500' : ''}`}>
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
                            {/* Delete button */}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            {/* Set/Update thumbnail button */}
                            <Button
                              type="button"
                              variant={editData.thumbnail_url === url ? 'default' : 'secondary'}
                              size="sm"
                              className={`absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-5 px-1.5 text-[10px] ${
                                editData.thumbnail_url === url 
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                                  : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'
                              }`}
                              onClick={() => {
                                setEditData(prev => ({ ...prev, thumbnail_url: url }));
                                setImages(prev => [url, ...prev.filter((i) => i !== url)]);
                              }}
                            >
                              {editData.thumbnail_url === url ? (
                                <>
                                  <Star className="h-3 w-3 mr-0.5 fill-current" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-3 w-3 mr-0.5" />
                                  Set
                                </>
                              )}
                            </Button>
                            {/* Badges */}
                            <div className="absolute bottom-1 left-1 flex items-center gap-1">
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                #{index + 1}
                              </div>
                              {editData.thumbnail_url === url && (
                                <div className="bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">★</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gradient-to-br from-slate-100 to-purple-100 dark:from-slate-800 dark:to-purple-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto mb-2">
                          <ImageIcon className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No Images</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Upload or generate</p>
                        <Button
                          type="button"
                          onClick={generateAIImage}
                          disabled={generatingImage}
                          className="h-8 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Wand2 className="h-3 w-3 mr-1.5" />
                          Generate
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-0" id="info-section">
              <div className="space-y-3 py-2">
                {/* Property Information */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Basic Information */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2">
                      <h3 className="text-sm font-bold text-white">Basic Information</h3>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="edit-title" className="text-slate-700 dark:text-slate-300 font-medium text-xs">Property Title</Label>
                        <Input
                          id="edit-title"
                          value={editData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter title"
                          className="border-slate-300 dark:border-slate-600 focus:border-blue-500 h-8 text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="edit-property-type" className="text-slate-700 dark:text-slate-300 font-medium text-xs">Property Type</Label>
                          <Select value={editData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500 h-8 text-sm">
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

                        <div className="space-y-1">
                          <Label htmlFor="edit-listing-type" className="text-slate-700 dark:text-slate-300 font-medium text-xs">Listing Type</Label>
                          <Select value={editData.listing_type} onValueChange={(value) => handleInputChange('listing_type', value)}>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500 h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sale">Sale</SelectItem>
                              <SelectItem value="rent">Rent</SelectItem>
                              <SelectItem value="lease">Lease</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="edit-development-status" className="text-slate-700 dark:text-slate-300 font-medium text-xs">Development Status</Label>
                        <Select 
                          value={editData.development_status} 
                          onValueChange={(value) => handleInputChange('development_status', value)}
                        >
                          <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500 h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableDevelopmentStatuses().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                                {['new_project', 'pre_launching'].includes(option.value) && !isAuthorizedForRestrictedTypes() && (
                                  <span className="text-[10px] text-amber-600 ml-1">(Restricted)</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="edit-price" className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                            Price (IDR)
                            {editData.price && (
                              <Badge className="ml-1 text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                {formatPriceDisplay(editData.price)}
                              </Badge>
                            )}
                          </Label>
                          <Input
                            id="edit-price"
                            type="number"
                            value={editData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            placeholder="Price"
                            className="border-slate-300 dark:border-slate-600 focus:border-blue-500 h-8 text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="edit-status" className="text-slate-700 dark:text-slate-300 font-medium text-xs">Status</Label>
                          <Select value={editData.status} onValueChange={(value) => handleInputChange('status', value)}>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500 h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending_approval">Pending</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                              <SelectItem value="rented">Rented</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-0" id="seo-section">
              <div className="space-y-3 py-2">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2">
                    <h3 className="text-sm font-bold text-white">SEO Settings</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Meta Title</Label>
                      <Input
                        value={editData.seo_title || ''}
                        onChange={(e) => handleInputChange('seo_title', e.target.value)}
                        placeholder="SEO title"
                        className="border-slate-300 dark:border-slate-600 h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Meta Description</Label>
                      <Textarea
                        rows={2}
                        value={editData.seo_description || ''}
                        onChange={(e) => handleInputChange('seo_description', e.target.value)}
                        placeholder="SEO description"
                        className="border-slate-300 dark:border-slate-600 text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300 font-medium text-xs">Keywords</Label>
                      <Input
                        value={editData.seo_keywords || ''}
                        onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                        placeholder="keyword1, keyword2"
                        className="border-slate-300 dark:border-slate-600 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0" id="advanced-section">
              <div className="space-y-6 py-4">
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
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-2 pb-1 sm:pt-3 bg-white dark:bg-slate-800 flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5">
              ID: {property.id?.slice(0, 8)}...
            </Badge>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 sm:flex-none hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1.5" />
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updatePropertyMutation.isPending || uploading || generatingImage}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow h-8 text-xs"
            >
              <Save className="h-3 w-3 mr-1.5" />
              {updatePropertyMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditModal;
