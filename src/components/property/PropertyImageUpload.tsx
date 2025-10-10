import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImageForUpload } from "@/utils/imageCompression";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileImage, 
  Trash2,
  Eye,
  Building,
  Home,
  Store
} from "lucide-react";

interface PropertyImageUploadProps {
  propertyType: string;
  propertyId?: string;
  onImagesUploaded?: (imageUrls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  propertyType,
  propertyId,
  onImagesUploaded,
  maxImages = 10,
  existingImages = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getPropertyTypeIcon = (type: string) => {
    switch(type) {
      case 'virtual_office':
      case 'office':
        return <Building className="h-5 w-5" />;
      case 'apartment':
      case 'house':
      case 'villa':
        return <Home className="h-5 w-5" />;
      case 'retail':
      case 'warehouse':
        return <Store className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch(type) {
      case 'virtual_office': return 'Virtual Office';
      case 'office': return 'Office Space';
      case 'apartment': return 'Apartment';
      case 'house': return 'House';
      case 'villa': return 'Villa';
      case 'retail': return 'Retail Space';
      case 'warehouse': return 'Warehouse';
      default: return 'Property';
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - uploadedImages.length;
    
    if (fileArray.length > remainingSlots) {
      toast({
        title: "Too Many Images",
        description: `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image type. Only JPEG, PNG, WebP, and GIF are allowed.`,
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 5MB size limit.`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      uploadImages(validFiles);
    }
  };

  const uploadImages = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Optimize images to WebP format before uploading
      const optimizedFiles = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const optimizedFile = await optimizeImageForUpload(files[i], {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp'
          });
          optimizedFiles.push(optimizedFile);
          setUploadProgress(Math.round(((i + 1) / files.length) * 50)); // First 50% for optimization
        } catch (error) {
          console.error('Image optimization failed:', error);
          toast({
            title: "Optimization Failed",
            description: `Failed to optimize ${files[i].name}. Using original file.`,
            variant: "destructive",
          });
          optimizedFiles.push(files[i]); // Fall back to original if optimization fails
        }
      }

      const formData = new FormData();
      optimizedFiles.forEach(file => formData.append('files', file));
      formData.append('property_type', propertyType);
      if (propertyId) {
        formData.append('property_id', propertyId);
      }

      const functionUrl = 'https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/upload-property-images';
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      let result: any;
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `Upload failed (${response.status})`);
        } catch {
          const text = await response.text();
          throw new Error(text || `Upload failed (${response.status})`);
        }
      } else {
        try {
          result = await response.json();
        } catch {
          throw new Error('Upload failed: invalid response from server');
        }
      }

      const newImageUrls = result.files.map((file: any) => file.publicUrl);
      const updatedImages = [...uploadedImages, ...newImageUrls];
      
      setUploadedImages(updatedImages);
      setUploadProgress(100);
      
      if (onImagesUploaded) {
        onImagesUploaded(updatedImages);
      }

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${result.files.length} optimized WebP image(s) for ${getPropertyTypeLabel(propertyType)}`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    
    if (onImagesUploaded) {
      onImagesUploaded(updatedImages);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Property Type Header */}
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        {getPropertyTypeIcon(propertyType)}
        <span>{getPropertyTypeLabel(propertyType)} Images</span>
        <span className="text-xs text-gray-500">
          ({uploadedImages.length}/{maxImages})
        </span>
      </div>

      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center cursor-pointer"
            onClick={openFileDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                PNG, JPG, WebP, GIF up to 5MB each
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading images...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Actions */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(imageUrl, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {uploadedImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileImage className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No images uploaded yet</p>
          <p className="text-xs">Upload images to showcase your {getPropertyTypeLabel(propertyType).toLowerCase()}</p>
        </div>
      )}
    </div>
  );
};

export default PropertyImageUpload;