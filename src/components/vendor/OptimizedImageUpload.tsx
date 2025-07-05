import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  X,
  Camera,
  Image as ImageIcon,
  Zap,
  FileImage,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import {
  optimizeImages,
  cleanupImageUrls,
  formatFileSize,
  OptimizedImageResult,
  ImageOptimizationOptions
} from '@/utils/imageOptimization';

interface OptimizedImageUploadProps {
  onImagesOptimized: (results: OptimizedImageResult[]) => void;
  maxImages?: number;
  maxFileSize?: number;
  enableBackgroundRemoval?: boolean;
  enableThumbnails?: boolean;
  acceptedTypes?: string[];
  className?: string;
}

const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  onImagesOptimized,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  enableBackgroundRemoval = false,
  enableThumbnails = true,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}) => {
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImageResult[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [options, setOptions] = useState<ImageOptimizationOptions>({
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebpIfSupported: true,
    removeBackground: enableBackgroundRemoval,
    generateThumbnail: enableThumbnails,
    quality: 0.8
  });
  const [previewMode, setPreviewMode] = useState<'original' | 'optimized' | 'background-removed'>('optimized');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate files before processing
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`${file.name}: Unsupported file type. Please use JPEG, PNG, or WebP.`);
        continue;
      }
      
      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`${file.name}: File too large. Maximum size is ${formatFileSize(maxFileSize)}.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    // Check total image limit
    if (optimizedImages.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed. You can add ${maxImages - optimizedImages.length} more.`);
      return;
    }
    
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) return;
    
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    try {
      const results = await optimizeImages(
        validFiles,
        options,
        (completed, total) => {
          setOptimizationProgress(Math.round((completed / total) * 100));
        }
      );
      
      const newOptimizedImages = [...optimizedImages, ...results];
      setOptimizedImages(newOptimizedImages);
      onImagesOptimized(newOptimizedImages);
      
      toast.success(`Successfully optimized ${results.length} image(s)`);
    } catch (error) {
      console.error('Image optimization failed:', error);
      toast.error('Failed to optimize images. Please try again.');
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [optimizedImages, maxImages, options, onImagesOptimized, acceptedTypes, maxFileSize]);

  // Remove image
  const removeImage = useCallback((index: number) => {
    const imageToRemove = optimizedImages[index];
    
    // Cleanup URLs
    cleanupImageUrls([imageToRemove]);
    
    const newImages = optimizedImages.filter((_, i) => i !== index);
    setOptimizedImages(newImages);
    onImagesOptimized(newImages);
    
    toast.success('Image removed');
  }, [optimizedImages, onImagesOptimized]);

  // Get preview URL based on mode
  const getPreviewUrl = (result: OptimizedImageResult): string => {
    switch (previewMode) {
      case 'original':
        return URL.createObjectURL(result.originalFile);
      case 'background-removed':
        return result.backgroundRemovedUrl || result.previewUrl;
      default:
        return result.previewUrl;
    }
  };

  // Trigger file input
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Download optimized image
  const downloadOptimizedImage = (result: OptimizedImageResult) => {
    const link = document.createElement('a');
    link.href = result.previewUrl;
    link.download = result.optimizedFile.name;
    link.click();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Image Optimization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="background-removal">Remove Background</Label>
              <Switch
                id="background-removal"
                checked={options.removeBackground}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, removeBackground: checked }))
                }
                disabled={isOptimizing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="generate-thumbnails">Generate Thumbnails</Label>
              <Switch
                id="generate-thumbnails"
                checked={options.generateThumbnail}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, generateThumbnail: checked }))
                }
                disabled={isOptimizing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="webp-format">Use WebP Format</Label>
              <Switch
                id="webp-format"
                checked={options.useWebpIfSupported}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, useWebpIfSupported: checked }))
                }
                disabled={isOptimizing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Quality: {Math.round((options.quality || 0.8) * 100)}%</Label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={options.quality || 0.8}
                onChange={(e) =>
                  setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))
                }
                className="w-20"
                disabled={isOptimizing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card 
        className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={triggerFileSelect}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {isOptimizing ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {isOptimizing ? 'Optimizing Images...' : 'Upload & Optimize Images'}
              </p>
              <p className="text-sm text-muted-foreground">
                Click to browse or drag and drop your images here
              </p>
            </div>
            
            {isOptimizing && (
              <div className="w-full max-w-xs">
                <Progress value={optimizationProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {optimizationProgress}% complete
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Badge variant="outline">JPG, PNG, WebP</Badge>
              <Badge variant="outline">Max {formatFileSize(maxFileSize)}</Badge>
              <Badge variant="outline">Up to {maxImages} images</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isOptimizing}
      />

      {/* Preview Controls */}
      {optimizedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Mode
              </div>
              <Badge variant="outline">
                {optimizedImages.length}/{maxImages} images
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                variant={previewMode === 'original' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('original')}
              >
                Original
              </Button>
              <Button
                variant={previewMode === 'optimized' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('optimized')}
              >
                Optimized
              </Button>
              {options.removeBackground && (
                <Button
                  variant={previewMode === 'background-removed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('background-removed')}
                >
                  Background Removed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimized Images Grid */}
      {optimizedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {optimizedImages.map((result, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md">
                  <img
                    src={getPreviewUrl(result)}
                    alt={`Optimized image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadOptimizedImage(result);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
                  
                  {/* Compression indicator */}
                  {result.compressionRatio > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        -{result.compressionRatio}%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Background removed indicator */}
                  {result.backgroundRemovedFile && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                        BG Removed
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium truncate">
                    {result.optimizedFile.name}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(result.originalFile.size)}</span>
                    <span>→</span>
                    <span className="text-green-600">
                      {formatFileSize(result.optimizedFile.size)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.dimensions.width}×{result.dimensions.height}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Optimization Summary */}
      {optimizedImages.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully optimized {optimizedImages.length} image(s). 
            Total size reduction: {Math.round(
              optimizedImages.reduce((acc, result) => acc + result.compressionRatio, 0) / optimizedImages.length
            )}% average.
            {options.removeBackground && (
              <span className="ml-2">
                Background removal available for {optimizedImages.filter(r => r.backgroundRemovedFile).length} image(s).
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Optimization Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Higher quality settings preserve more detail but create larger files</li>
            <li>• Background removal works best with clear subjects and simple backgrounds</li>
            <li>• WebP format provides better compression than JPEG/PNG</li>
            <li>• Thumbnails are generated automatically for faster loading</li>
            <li>• Original images are preserved - you can always download the optimized versions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedImageUpload;