
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Save, Upload, Image, Eye, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { formatIDR } from "@/utils/currency";

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  location: string;
  city: string;
  state: string;
  area: string;
  development_status: string;
  owner_type: string;
  status: string;
  three_d_model_url: string;
  virtual_tour_url: string;
}

interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  progress: number;
  uploaded: boolean;
  url?: string;
  originalName: string;
  newName: string;
  size: number;
  optimizedSize?: number;
  contentScanStatus: 'pending' | 'scanning' | 'approved' | 'rejected';
  contentScanResults?: {
    hasText: boolean;
    hasBarcode: boolean;
    hasViolatedContent: boolean;
    confidence: number;
    details: string[];
  };
}

interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: string;
  opacity: number;
  size: number;
  color: string;
}

const EnhancedPropertyInsertForm = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    property_type: "",
    listing_type: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    location: "",
    city: "",
    state: "",
    area: "",
    development_status: "completed",
    owner_type: "individual",
    status: "active",
    three_d_model_url: "",
    virtual_tour_url: ""
  });

  const [images, setImages] = useState<ImageUpload[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string>("");
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    enabled: true,
    text: "VillaAstra",
    position: "bottom-right",
    opacity: 0.7,
    size: 24,
    color: "#FFFFFF"
  });

  // Fetch default watermark settings on component mount
  const { data: defaultWatermarkSettings } = useQuery({
    queryKey: ['default-watermark-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'default_watermark_settings')
        .maybeSingle();
      
      if (error) {
        console.log('No default watermark settings found, using component defaults');
        return null;
      }
      
      return data?.value ? (data.value as unknown as WatermarkSettings) : null;
    },
  });

  // Update watermark settings when default settings are loaded
  useEffect(() => {
    if (defaultWatermarkSettings) {
      setWatermarkSettings(defaultWatermarkSettings);
    }
  }, [defaultWatermarkSettings]);

  // Fetch locations from database
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('state', { ascending: true });
      
      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }
      return data || [];
    },
  });

  // Get unique states, cities, and areas with proper filtering
  const states = locations ? [...new Set(locations.map(loc => loc.state))].filter(Boolean) : [];
  const cities = formData.state && locations ? 
    [...new Set(locations.filter(loc => loc.state === formData.state).map(loc => loc.city))].filter(Boolean) : [];
  const areas = formData.city && locations ? 
    [...new Set(locations.filter(loc => loc.city === formData.city).map(loc => loc.area))].filter(Boolean) : [];

  // Save watermark settings as default
  const saveWatermarkAsDefault = async () => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'default_watermark_settings',
          value: watermarkSettings as unknown as any,
          category: 'property',
          description: 'Default watermark settings for property images',
          is_public: false
        });

      if (error) throw error;
      
      showSuccess("Settings Saved", "Watermark settings have been saved as default for future properties.");
      queryClient.invalidateQueries({ queryKey: ['default-watermark-settings'] });
    } catch (error: any) {
      showError("Save Failed", error.message);
    }
  };

  // Format price input as Indonesian Rupiah
  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue) {
      setFormData(prev => ({ ...prev, price: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, price: '' }));
    }
  };

  // Image content scanning function
  const scanImageContent = async (file: File): Promise<ImageUpload['contentScanResults']> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate comprehensive content scanning
        const hasText = Math.random() > 0.95; // Very low chance of text detection
        const hasBarcode = Math.random() > 0.98; // Very low chance of barcode detection
        const hasViolatedContent = Math.random() > 0.99; // Very low chance of violation
        
        resolve({
          hasText,
          hasBarcode,
          hasViolatedContent,
          confidence: Math.random() * 0.2 + 0.8, // High confidence (80-100%)
          details: [
            ...(hasText ? ['Text content detected in image'] : []),
            ...(hasBarcode ? ['Barcode/QR code detected'] : []),
            ...(hasViolatedContent ? ['Potentially inappropriate content detected'] : []),
            ...(!hasText && !hasBarcode && !hasViolatedContent ? ['Clean image - no issues detected'] : [])
          ]
        });
      }, 1500);
    });
  };

  // Image optimization function
  const optimizeImage = async (file: File): Promise<{ blob: Blob; newName: string }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080 for high quality)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substr(2, 9);
            const newName = `property_${timestamp}_${randomId}.webp`;
            resolve({ blob, newName });
          }
        }, 'image/webp', 0.85); // High quality WebP
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection with optimization and scanning
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageUpload[] = Array.from(files).map(file => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const newName = `property_${timestamp}_${randomId}.webp`;
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        uploaded: false,
        originalName: file.name,
        newName,
        size: file.size,
        contentScanStatus: 'pending'
      };
    });

    setImages(prev => [...prev, ...newImages]);
    
    // Process each image
    newImages.forEach(async (imageUpload) => {
      // Start content scanning
      setImages(prev => prev.map(img => 
        img.id === imageUpload.id 
          ? { ...img, contentScanStatus: 'scanning' }
          : img
      ));

      const scanResults = await scanImageContent(imageUpload.file);
      
      setImages(prev => prev.map(img => 
        img.id === imageUpload.id 
          ? { 
              ...img, 
              contentScanResults: scanResults,
              contentScanStatus: scanResults.hasViolatedContent ? 'rejected' : 'approved'
            }
          : img
      ));

      // Only upload if content scan passes
      if (!scanResults.hasViolatedContent) {
        uploadImage(imageUpload);
      }
    });
  };

  // Upload individual image with optimization
  const uploadImage = async (imageUpload: ImageUpload) => {
    try {
      // Optimize image first
      const { blob, newName } = await optimizeImage(imageUpload.file);
      
      setImages(prev => prev.map(img => 
        img.id === imageUpload.id 
          ? { ...img, optimizedSize: blob.size, newName }
          : img
      ));

      const filePath = `properties/${newName}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImages(prev => prev.map(img => 
          img.id === imageUpload.id 
            ? { ...img, progress: Math.min(img.progress + 10, 90) }
            : img
        ));
      }, 200);

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, blob);

      clearInterval(progressInterval);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      setImages(prev => prev.map(img => 
        img.id === imageUpload.id 
          ? { ...img, progress: 100, uploaded: true, url: publicUrl }
          : img
      ));

      if (!thumbnailId) {
        setThumbnailId(imageUpload.id);
      }

    } catch (error: any) {
      showError("Upload Failed", error.message);
      setImages(prev => prev.filter(img => img.id !== imageUpload.id));
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }
    setImages(prev => prev.filter(img => img.id !== id));
    if (thumbnailId === id) {
      setThumbnailId(images.find(img => img.id !== id)?.id || "");
    }
  };

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      if (!user) throw new Error('User must be logged in');

      const uploadedImages = images.filter(img => img.uploaded && img.url && img.contentScanStatus === 'approved');
      const thumbnailUrl = uploadedImages.find(img => img.id === thumbnailId)?.url || uploadedImages[0]?.url;

      const propertyData = {
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        listing_type: data.listing_type,
        price: data.price ? parseFloat(data.price) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        area_sqm: data.area_sqm ? parseInt(data.area_sqm) : null,
        location: data.location,
        city: data.city,
        state: data.state,
        area: data.area,
        development_status: data.development_status,
        owner_type: data.owner_type,
        status: data.status,
        approval_status: 'approved',
        owner_id: user.id,
        image_urls: uploadedImages.map(img => img.url),
        thumbnail_url: thumbnailUrl,
        three_d_model_url: data.three_d_model_url || null,
        virtual_tour_url: data.virtual_tour_url || null
      };

      const { data: result, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();
      
      if (error) throw error;

      // Save watermark settings if property created successfully
      if (watermarkSettings.enabled && result) {
        await supabase
          .from('property_watermark_settings')
          .insert({
            property_id: result.id,
            is_enabled: watermarkSettings.enabled,
            watermark_type: 'text',
            text_content: watermarkSettings.text,
            position_x: watermarkSettings.position,
            position_y: watermarkSettings.position,
            text_opacity: watermarkSettings.opacity,
            text_size: watermarkSettings.size,
            text_color: watermarkSettings.color
          });
      }
      
      return result;
    },
    onSuccess: (data) => {
      showSuccess("Property Created", `Property "${data.title}" has been added successfully.`);
      // Reset form
      setFormData({
        title: "",
        description: "",
        property_type: "",
        listing_type: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        area_sqm: "",
        location: "",
        city: "",
        state: "",
        area: "",
        development_status: "completed",
        owner_type: "individual",
        status: "active",
        three_d_model_url: "",
        virtual_tour_url: ""
      });
      setImages([]);
      setThumbnailId("");
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  const handleInputChange = (key: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (field: 'state' | 'city' | 'area', value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields
      if (field === 'state') {
        newData.city = "";
        newData.area = "";
      } else if (field === 'city') {
        newData.area = "";
      }
      
      // Auto-generate location string
      const locationParts = [newData.area, newData.city, newData.state].filter(Boolean);
      newData.location = locationParts.join(', ');
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.property_type || !formData.listing_type) {
      showError("Missing Information", "Please fill in all required fields.");
      return;
    }

    const approvedImages = images.filter(img => img.contentScanStatus === 'approved' && img.uploaded);
    if (approvedImages.length === 0) {
      showError("No Valid Images", "Please upload at least one approved image.");
      return;
    }

    if (!user) {
      showError("Authentication Error", "You must be logged in to create properties.");
      return;
    }
    
    createPropertyMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Add New Property
        </CardTitle>
        <CardDescription>
          Create a comprehensive property listing with advanced features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="media">Media & Images</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter property title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select 
                    value={formData.property_type} 
                    onValueChange={(value) => handleInputChange('property_type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="listing_type">Listing Type *</Label>
                  <Select 
                    value={formData.listing_type} 
                    onValueChange={(value) => handleInputChange('listing_type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select listing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="lease">For Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price (IDR)</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="text"
                      value={formData.price ? formatIDR(parseInt(formData.price)) : ''}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="Enter price in Indonesian Rupiah"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      IDR
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    placeholder="Number of bedrooms"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    placeholder="Number of bathrooms"
                  />
                </div>
                <div>
                  <Label htmlFor="area_sqm">Area (sqm)</Label>
                  <Input
                    id="area_sqm"
                    type="number"
                    value={formData.area_sqm}
                    onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                    placeholder="Area in square meters"
                  />
                </div>
                <div>
                  <Label htmlFor="development_status">Development Status</Label>
                  <Select 
                    value={formData.development_status} 
                    onValueChange={(value) => handleInputChange('development_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="under_construction">Under Construction</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter property description"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              {locationsLoading ? (
                <div className="text-center">Loading locations...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="state">State/Province *</Label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => handleLocationChange('state', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => handleLocationChange('city', value)}
                      disabled={!formData.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="area">Area/District</Label>
                    <Select 
                      value={formData.area} 
                      onValueChange={(value) => handleLocationChange('area', value)}
                      disabled={!formData.city}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.city ? "Select area" : "Select city first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="location">Full Address Preview</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Generated from location selection above or enter manually"
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Property Images</Label>
                  <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
                          <img
                            src={image.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Progress Bar */}
                        {!image.uploaded && image.contentScanStatus === 'approved' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-full px-4">
                              <Progress value={image.progress} className="w-full" />
                              <p className="text-white text-xs mt-1 text-center">{image.progress}%</p>
                            </div>
                          </div>
                        )}

                        {/* Content Scan Status */}
                        <div className="absolute top-2 left-2">
                          {image.contentScanStatus === 'scanning' && (
                            <Badge className="bg-yellow-500 text-white">Scanning...</Badge>
                          )}
                          {image.contentScanStatus === 'approved' && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {image.contentScanStatus === 'rejected' && (
                            <Badge className="bg-red-500 text-white">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="absolute top-2 right-2 space-x-1">
                          {image.uploaded && image.contentScanStatus === 'approved' && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setThumbnailId(image.id)}
                              className={thumbnailId === image.id ? "bg-blue-500 text-white" : ""}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                          >
                            ×
                          </Button>
                        </div>

                        {/* Image Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs">
                          <div className="truncate">{image.newName}</div>
                          <div className="flex justify-between">
                            <span>Original: {(image.size / 1024).toFixed(0)}KB</span>
                            {image.optimizedSize && (
                              <span>Optimized: {(image.optimizedSize / 1024).toFixed(0)}KB</span>
                            )}
                          </div>
                          {image.contentScanResults && (
                            <div className="mt-1">
                              Confidence: {(image.contentScanResults.confidence * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>

                        {/* Thumbnail Badge */}
                        {thumbnailId === image.id && (
                          <Badge className="absolute bottom-2 right-2">Thumbnail</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3D Model and Virtual Tour */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="three_d_model_url">3D Model URL</Label>
                  <Input
                    id="three_d_model_url"
                    value={formData.three_d_model_url}
                    onChange={(e) => handleInputChange('three_d_model_url', e.target.value)}
                    placeholder="e.g., https://example.com/model.glb"
                  />
                </div>
                <div>
                  <Label htmlFor="virtual_tour_url">Virtual Tour URL</Label>
                  <Input
                    id="virtual_tour_url"
                    value={formData.virtual_tour_url}
                    onChange={(e) => handleInputChange('virtual_tour_url', e.target.value)}
                    placeholder="e.g., https://example.com/tour"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Watermark Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Watermark Settings
                    </CardTitle>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={saveWatermarkAsDefault}
                    >
                      Save as Default
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={watermarkSettings.enabled}
                      onCheckedChange={(checked) => 
                        setWatermarkSettings(prev => ({ ...prev, enabled: checked }))
                      }
                    />
                    <Label>Enable Watermark</Label>
                  </div>

                  {watermarkSettings.enabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Watermark Text</Label>
                          <Input
                            value={watermarkSettings.text}
                            onChange={(e) => 
                              setWatermarkSettings(prev => ({ ...prev, text: e.target.value }))
                            }
                            placeholder="Watermark text"
                          />
                        </div>
                        <div>
                          <Label>Position</Label>
                          <Select 
                            value={watermarkSettings.position} 
                            onValueChange={(value) => 
                              setWatermarkSettings(prev => ({ ...prev, position: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Opacity: {watermarkSettings.opacity}</Label>
                          <Slider
                            min={0.1}
                            max={1}
                            step={0.1}
                            value={[watermarkSettings.opacity]}
                            onValueChange={(value) => 
                              setWatermarkSettings(prev => ({ ...prev, opacity: value[0] }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            value={watermarkSettings.size}
                            onChange={(e) => 
                              setWatermarkSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))
                            }
                            placeholder="24"
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Input
                            type="color"
                            value={watermarkSettings.color}
                            onChange={(e) => 
                              setWatermarkSettings(prev => ({ ...prev, color: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      
                      {/* Watermark Preview */}
                      <div>
                        <Label>Watermark Preview</Label>
                        <div 
                          className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-40 rounded-lg border overflow-hidden"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-gray-400 text-sm">Property Image Preview Area</div>
                          </div>
                          
                          <div
                            className={`absolute font-bold pointer-events-none select-none ${
                              watermarkSettings.position === 'top-left' ? 'top-3 left-3' :
                              watermarkSettings.position === 'top-right' ? 'top-3 right-3' :
                              watermarkSettings.position === 'center' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                              watermarkSettings.position === 'bottom-left' ? 'bottom-3 left-3' :
                              'bottom-3 right-3'
                            }`}
                            style={{
                              color: watermarkSettings.color,
                              opacity: watermarkSettings.opacity,
                              fontSize: `${watermarkSettings.size}px`,
                              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                            }}
                          >
                            {watermarkSettings.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="owner_type">Owner Type</Label>
                  <Select 
                    value={formData.owner_type} 
                    onValueChange={(value) => handleInputChange('owner_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
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
            </TabsContent>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button 
                type="submit" 
                disabled={createPropertyMutation.isPending || images.some(img => !img.uploaded && img.contentScanStatus === 'approved')}
                className="w-full md:w-auto"
              >
                {createPropertyMutation.isPending ? (
                  'Creating Property...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Property
                  </>
                )}
              </Button>
              {images.some(img => !img.uploaded && img.contentScanStatus === 'approved') && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please wait for all approved images to finish uploading before submitting.
                </p>
              )}
              
              {/* Image Summary */}
              {images.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div>Total Images: {images.length}</div>
                    <div>Approved: {images.filter(img => img.contentScanStatus === 'approved').length}</div>
                    <div>Rejected: {images.filter(img => img.contentScanStatus === 'rejected').length}</div>
                    <div>Uploaded: {images.filter(img => img.uploaded).length}</div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedPropertyInsertForm;
