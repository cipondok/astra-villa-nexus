import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileImage, 
  Zap, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ImageIcon,
  Gauge,
  Sparkles
} from 'lucide-react';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { formatFileSize } from '@/utils/imageOptimization';
import { toast } from 'sonner';

const ImageOptimizationPanel: React.FC = () => {
  const { optimizedImages, isOptimizing, optimizeImages, clearOptimizedImages, removeImage } = useImageOptimization();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleOptimizeImages(files);
    } else {
      toast.error('Please drop valid image files');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleOptimizeImages(files);
    }
  };

  const handleOptimizeImages = async (files: File[]) => {
    if (files.length === 0) return;
    
    try {
      await optimizeImages(files);
      toast.success(`Successfully optimized ${files.length} image(s)`);
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Failed to optimize images');
    }
  };

  const getTotalSavings = () => {
    return optimizedImages.reduce((total, img) => {
      return total + (img.originalSize - img.optimizedSize);
    }, 0);
  };

  const getAverageCompression = () => {
    if (optimizedImages.length === 0) return 0;
    return Math.round(
      optimizedImages.reduce((total, img) => total + img.compressionRatio, 0) / optimizedImages.length
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Image Optimization Center</h2>
          <p className="text-muted-foreground">
            Optimize property images with WebP conversion and compression
          </p>
        </div>
        {optimizedImages.length > 0 && (
          <Button variant="outline" onClick={clearOptimizedImages}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Statistics */}
      {optimizedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <div className="text-2xl font-bold">{optimizedImages.length}</div>
              </div>
              <p className="text-xs text-muted-foreground">Images Processed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-green-500" />
                <div className="text-2xl font-bold">{getAverageCompression()}%</div>
              </div>
              <p className="text-xs text-muted-foreground">Average Compression</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-blue-500" />
                <div className="text-2xl font-bold">{formatFileSize(getTotalSavings())}</div>
              </div>
              <p className="text-xs text-muted-foreground">Total Savings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <div className="text-2xl font-bold">
                  {optimizedImages.filter(img => img.webpFile).length}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">WebP Converted</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Upload Images for Optimization
          </CardTitle>
          <CardDescription>
            Drag & drop images or click to select. Supports JPEG, PNG, WebP formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {dragActive ? 'Drop images here' : 'Drag images here to optimize'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Or click to select files from your computer
                </p>
              </div>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="image-upload"
                disabled={isOptimizing}
              />
              
              <Button
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isOptimizing}
                variant="outline"
              >
                {isOptimizing ? 'Optimizing...' : 'Select Images'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimizedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>
              Review optimized images and download them when ready
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizedImages.map((image) => (
                <div key={image.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {image.thumbnailUrl ? (
                          <img
                            src={image.thumbnailUrl}
                            alt="Thumbnail"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        {image.isOptimizing && (
                          <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">{image.originalFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {image.dimensions.width} × {image.dimensions.height}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {image.error ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      ) : image.isOptimizing ? (
                        <Badge variant="secondary" className="text-xs">
                          Optimizing...
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Optimized
                        </Badge>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {!image.isOptimizing && !image.error && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Original Size</p>
                          <p className="font-medium">{formatFileSize(image.originalSize)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Optimized Size</p>
                          <p className="font-medium">{formatFileSize(image.optimizedSize)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Compression</p>
                          <p className="font-medium text-green-600">{image.compressionRatio}%</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex space-x-2">
                        {image.webpUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = image.webpUrl!;
                              link.download = image.originalFile.name.replace(/\.[^/.]+$/, '.webp');
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            WebP
                          </Button>
                        )}
                        
                        {image.jpegUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = image.jpegUrl!;
                              link.download = image.originalFile.name.replace(/\.[^/.]+$/, '.jpg');
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            JPEG
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {image.error && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{image.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips and Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">WebP Benefits:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 25-35% smaller file sizes</li>
                <li>• Better compression than JPEG</li>
                <li>• Supports transparency</li>
                <li>• Faster page load times</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use WebP for modern browsers</li>
                <li>• Keep JPEG as fallback</li>
                <li>• Optimize images before upload</li>
                <li>• Use appropriate dimensions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageOptimizationPanel;