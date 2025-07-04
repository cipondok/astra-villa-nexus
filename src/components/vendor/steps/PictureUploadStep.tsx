import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Camera, Image as ImageIcon, Package, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface PictureUploadStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const PictureUploadStep: React.FC<PictureUploadStepProps> = ({ formData, updateFormData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if this is a product category
  const isProductCategory = formData.implementationType === 'products' || formData.implementationType === 'mixed';
  
  // Default images based on category
  const getDefaultImage = () => {
    if (isProductCategory) {
      return 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop'; // Product placeholder
    }
    return 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop'; // Service placeholder
  };

  // Show default image if no images uploaded
  const showDefaultImage = formData.serviceImages.length === 0;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      const newImages = [...formData.serviceImages, ...validFiles];
      if (newImages.length > 10) {
        toast.error('Maximum 10 images allowed.');
        return;
      }
      
      updateFormData({ serviceImages: newImages });
      
      // Create preview URLs
      const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
      updateFormData({ 
        imageUrls: [...formData.imageUrls, ...newImageUrls] 
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.serviceImages.filter((_: any, i: number) => i !== index);
    const newUrls = formData.imageUrls.filter((_: any, i: number) => i !== index);
    
    // Cleanup URL
    if (formData.imageUrls[index]) {
      URL.revokeObjectURL(formData.imageUrls[index]);
    }
    
    updateFormData({ 
      serviceImages: newImages,
      imageUrls: newUrls 
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-4 block">Service Images (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Add photos of your work, equipment, or before/after examples. High-quality images help customers trust your service.
        </p>

        {/* Upload Area */}
        <Card 
          className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={triggerFileSelect}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Upload Service Images</p>
                <p className="text-sm text-muted-foreground">
                  Click to browse or drag and drop your images here
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Badge variant="outline">JPG, PNG, WebP</Badge>
                <Badge variant="outline">Max 5MB each</Badge>
                <Badge variant="outline">Up to 10 images</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Default Image Preview */}
      {showDefaultImage && (
        <div>
          <Label className="text-sm font-medium mb-3 block">Default Service Image</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="relative">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md">
                  <img
                    src={getDefaultImage()}
                    alt="Default service image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      Default Image (will be used if no images uploaded)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {formData.serviceImages.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Uploaded Images ({formData.serviceImages.length}/10)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.imageUrls.map((url: string, index: number) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-md">
                    <img
                      src={url}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-center mt-1 text-muted-foreground truncate">
                    {formData.serviceImages[index]?.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Image Guidelines */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Photo Guidelines
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Use high-resolution, well-lit photos</li>
            <li>• Show your work process, tools, and results</li>
            <li>• Include before/after comparisons if applicable</li>
            <li>• Avoid blurry or dark images</li>
            <li>• Make sure images are relevant to your service</li>
          </ul>
        </CardContent>
      </Card>

      {/* Suggested Image Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <ImageIcon className="h-8 w-8 mx-auto text-blue-500 mb-2" />
          <h4 className="font-medium mb-1">Work Examples</h4>
          <p className="text-xs text-muted-foreground">Photos of completed projects</p>
        </Card>
        
        <Card className="text-center p-4">
          <Camera className="h-8 w-8 mx-auto text-green-500 mb-2" />
          <h4 className="font-medium mb-1">Process Photos</h4>
          <p className="text-xs text-muted-foreground">Show how you work</p>
        </Card>
        
        <Card className="text-center p-4">
          <Upload className="h-8 w-8 mx-auto text-purple-500 mb-2" />
          <h4 className="font-medium mb-1">Equipment</h4>
          <p className="text-xs text-muted-foreground">Professional tools & materials</p>
        </Card>
      </div>
    </div>
  );
};

export default PictureUploadStep;