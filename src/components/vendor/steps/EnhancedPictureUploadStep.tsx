import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Package, Wrench, Sparkles } from 'lucide-react';
import OptimizedImageUpload from '../OptimizedImageUpload';
import { OptimizedImageResult } from '@/utils/imageOptimization';

interface EnhancedPictureUploadStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const EnhancedPictureUploadStep: React.FC<EnhancedPictureUploadStepProps> = ({ 
  formData, 
  updateFormData 
}) => {
  // Check if this is a product category
  const isProductCategory = formData.implementationType === 'products' || formData.implementationType === 'mixed';
  
  // Handle optimized images
  const handleImagesOptimized = (results: OptimizedImageResult[]) => {
    // Store both the files and the optimization results
    const serviceImages = results.map(result => result.optimizedFile);
    const imageUrls = results.map(result => result.previewUrl);
    const optimizationData = results.map(result => ({
      originalSize: result.originalFile.size,
      optimizedSize: result.optimizedFile.size,
      compressionRatio: result.compressionRatio,
      dimensions: result.dimensions,
      hasBackgroundRemoved: !!result.backgroundRemovedFile,
      hasThumbnail: !!result.thumbnailFile
    }));
    
    updateFormData({ 
      serviceImages,
      imageUrls,
      optimizationData
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <Label className="text-xl font-semibold">Smart Image Upload & Optimization</Label>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload high-quality images of your {isProductCategory ? 'products' : 'services'}. 
          Our AI-powered system will automatically optimize them for web performance, 
          compress file sizes, and enhance visual appeal.
        </p>
      </div>

      {/* Category-specific guidance */}
      {isProductCategory ? (
        <Alert className="border-purple-200 bg-purple-50">
          <Package className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Product Photography Tips:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Use well-lit, neutral backgrounds for best background removal results</li>
              <li>• Show products from multiple angles</li>
              <li>• Include detail shots of important features</li>
              <li>• Ensure products fill most of the frame</li>
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-blue-200 bg-blue-50">
          <Wrench className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Service Photography Tips:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Show before/after examples of your work</li>
              <li>• Include photos of your tools and equipment</li>
              <li>• Document your work process</li>
              <li>• Add team photos to build trust</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Optimized Image Upload Component */}
      <OptimizedImageUpload
        onImagesOptimized={handleImagesOptimized}
        maxImages={10}
        maxFileSize={10 * 1024 * 1024} // 10MB for original files
        enableBackgroundRemoval={isProductCategory} // Enable BG removal for products
        enableThumbnails={true}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        className="w-full"
      />

      {/* Current Images Summary */}
      {formData.serviceImages && formData.serviceImages.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-900 flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Upload Summary
              </h4>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {formData.serviceImages.length} images ready
              </Badge>
            </div>
            
            {formData.optimizationData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-green-900">Total Images</p>
                  <p className="text-green-700">{formData.serviceImages.length}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-900">Avg. Compression</p>
                  <p className="text-green-700">
                    {Math.round(
                      formData.optimizationData.reduce((acc: number, data: any) => acc + data.compressionRatio, 0) / 
                      formData.optimizationData.length
                    )}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-900">BG Removed</p>
                  <p className="text-green-700">
                    {formData.optimizationData.filter((data: any) => data.hasBackgroundRemoved).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-900">Thumbnails</p>
                  <p className="text-green-700">
                    {formData.optimizationData.filter((data: any) => data.hasThumbnail).length}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Type Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-medium mb-2">Work Examples</h4>
          <p className="text-sm text-muted-foreground">
            Showcase completed projects and successful outcomes
          </p>
        </Card>
        
        <Card className="text-center p-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wrench className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-medium mb-2">Process & Equipment</h4>
          <p className="text-sm text-muted-foreground">
            Show your professional tools and working methods
          </p>
        </Card>
        
        <Card className="text-center p-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-medium mb-2">Products & Materials</h4>
          <p className="text-sm text-muted-foreground">
            Display products you offer or materials you use
          </p>
        </Card>
      </div>

      {/* Performance Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Smart Optimization Benefits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800">Automatic image compression</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800">WebP format conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800">Smart resize & cropping</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-blue-800">AI background removal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-blue-800">Thumbnail generation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-blue-800">Faster page loading</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPictureUploadStep;