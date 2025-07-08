import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  X, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Settings,
  Gauge,
  Image as ImageIcon
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import imageCompression from 'browser-image-compression';

interface OptimizedImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  thumbnailIndex: number;
  onThumbnailChange: (index: number) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

interface UploadTask {
  id: string;
  file: File;
  originalSize: number;
  compressedSize?: number;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

const OptimizedImageUpload = ({ 
  images, 
  onImagesChange, 
  thumbnailIndex, 
  onThumbnailChange,
  maxFiles = 15,
  maxSizePerFile = 3 // 3MB default limit for properties
}: OptimizedImageUploadProps) => {
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Advanced image compression options optimized for property images
  const compressionOptions = {
    maxSizeMB: maxSizePerFile,
    maxWidthOrHeight: 1920, // High quality for property images
    useWebWorker: true,
    fileType: 'image/webp', // Better compression
    initialQuality: 0.85, // Higher quality for property photos
  };

  const compressImage = async (file: File): Promise<{ compressed: File; originalSize: number; compressedSize: number }> => {
    try {
      const originalSize = file.size;
      
      // First pass: High-quality compression
      let compressed = await imageCompression(file, {
        ...compressionOptions,
        maxSizeMB: maxSizePerFile,
      });

      // If still too large, apply more aggressive compression
      if (compressed.size > maxSizePerFile * 1024 * 1024) {
        compressed = await imageCompression(file, {
          ...compressionOptions,
          maxSizeMB: maxSizePerFile * 0.8,
          initialQuality: 0.75,
        });
      }

      const compressedSize = compressed.size;
      
      return { compressed, originalSize, compressedSize };
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress image');
    }
  };

  const uploadToSupabase = async (file: File, taskId: string): Promise<string> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload to Supabase failed:', error);
      throw error;
    }
  };

  const processFile = async (file: File): Promise<void> => {
    const taskId = Math.random().toString(36).substr(2, 9);
    
    const newTask: UploadTask = {
      id: taskId,
      file,
      originalSize: file.size,
      progress: 0,
      status: 'pending'
    };

    setUploadTasks(prev => [...prev, newTask]);

    try {
      // Update status to compressing
      setUploadTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'compressing', progress: 10 } : task
      ));

      // Compress image
      const { compressed, compressedSize } = await compressImage(file);
      
      setUploadTasks(prev => prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          compressedSize, 
          progress: 40, 
          status: 'uploading' 
        } : task
      ));

      // Upload to Supabase
      const url = await uploadToSupabase(compressed, taskId);
      
      // Update progress
      setUploadTasks(prev => prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          progress: 80, 
          url 
        } : task
      ));

      // Add to images array
      onImagesChange([...images, url]);

      // Mark as completed
      setUploadTasks(prev => prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          progress: 100, 
          status: 'completed' 
        } : task
      ));

      // Show success toast
      toast({
        title: "Image Uploaded Successfully",
        description: `Compressed from ${formatFileSize(file.size)} to ${formatFileSize(compressedSize)} (${Math.round(((file.size - compressedSize) / file.size) * 100)}% reduction)`,
      });

    } catch (error) {
      console.error('Processing failed:', error);
      
      setUploadTasks(prev => prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : task
      ));

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: "destructive",
      });
    }
  };

  const handleFileSelection = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= maxSizePerFile * 1024 * 1024 * 2; // Allow larger initial files for compression
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image file`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Maximum size is ${maxSizePerFile * 2}MB`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (images.length + validFiles.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Process files sequentially to avoid overwhelming the system
    for (const file of validFiles) {
      await processFile(file);
    }

    setIsProcessing(false);
    
    // Clear completed tasks after 3 seconds
    setTimeout(() => {
      setUploadTasks(prev => prev.filter(task => task.status !== 'completed'));
    }, 3000);
    
  }, [images.length, maxFiles, maxSizePerFile, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelection(files);
  }, [handleFileSelection]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelection(files);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Adjust thumbnail index if necessary
    if (thumbnailIndex >= newImages.length) {
      onThumbnailChange(Math.max(0, newImages.length - 1));
    } else if (index <= thumbnailIndex && thumbnailIndex > 0) {
      onThumbnailChange(thumbnailIndex - 1);
    }
  };

  const setAsThumbnail = (index: number) => {
    onThumbnailChange(index);
    toast({
      title: "Thumbnail Updated",
      description: "Main property photo has been updated",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalCompressionSavings = () => {
    const completedTasks = uploadTasks.filter(task => task.status === 'completed' && task.compressedSize);
    if (completedTasks.length === 0) return { saved: 0, percent: 0 };
    
    const totalOriginal = completedTasks.reduce((sum, task) => sum + task.originalSize, 0);
    const totalCompressed = completedTasks.reduce((sum, task) => sum + (task.compressedSize || 0), 0);
    const saved = totalOriginal - totalCompressed;
    const percent = Math.round((saved / totalOriginal) * 100);
    
    return { saved, percent };
  };

  const compressionStats = getTotalCompressionSavings();
  const hasActiveTasks = uploadTasks.some(task => ['pending', 'compressing', 'uploading'].includes(task.status));

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <span>Property Photos</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              AI Optimized
            </Badge>
            {compressionStats.saved > 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                <Gauge className="h-3 w-3 mr-1" />
                {compressionStats.percent}% Compressed
              </Badge>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload high-quality property photos. Images will be automatically optimized for web performance.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${hasActiveTasks ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !hasActiveTasks && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={hasActiveTasks}
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasActiveTasks ? 'Processing Images...' : 'Upload Property Photos'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Drag and drop images here, or click to select files
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                <span>• Max {maxFiles} images</span>
                <span>• Auto compression</span>
                <span>• WebP optimization</span>
                <span>• Up to {maxSizePerFile * 2}MB per file</span>
              </div>
            </div>
            
            {!hasActiveTasks && (
              <Button variant="outline" size="sm" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {uploadTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
            {uploadTasks.map((task) => (
              <div key={task.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {task.file.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {task.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {task.status === 'error' && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-xs text-gray-600">
                      {formatFileSize(task.originalSize)}
                      {task.compressedSize && ` → ${formatFileSize(task.compressedSize)}`}
                    </span>
                  </div>
                </div>
                
                <Progress value={task.progress} className="h-2 mb-1" />
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span className="capitalize">{task.status.replace('_', ' ')}</span>
                  {task.compressedSize && task.status === 'completed' && (
                    <span className="text-green-600">
                      {Math.round(((task.originalSize - task.compressedSize) / task.originalSize) * 100)}% smaller
                    </span>
                  )}
                  {task.error && (
                    <span className="text-red-600">{task.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Uploaded Images ({images.length}/{maxFiles})
              </h4>
              {compressionStats.saved > 0 && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Saved {formatFileSize(compressionStats.saved)} total
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Thumbnail Badge */}
                    {index === thumbnailIndex && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          Main Photo
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index !== thumbnailIndex && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => setAsThumbnail(index)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">
                      Photo {index + 1}
                      {index === thumbnailIndex && (
                        <span className="text-blue-600 font-medium"> • Main</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {images.length === 0 && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Photography Tips:</strong> Include exterior views, living areas, bedrooms, kitchen, and bathrooms. 
              First uploaded image becomes the main photo. Good lighting and clean spaces attract more interest.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizedImageUpload;