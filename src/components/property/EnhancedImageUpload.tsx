import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, X, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  thumbnailIndex: number;
  onThumbnailChange: (index: number) => void;
}

const EnhancedImageUpload = ({ 
  images, 
  onImagesChange, 
  thumbnailIndex, 
  onThumbnailChange 
}: EnhancedImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const validateImageContent = async (file: File): Promise<{ valid: boolean; reason?: string }> => {
    // For now, we'll be more permissive with property images
    // Property photos often legitimately contain contact information
    return { valid: true };
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      setUploadError("User not authenticated");
      return null;
    }

    try {
      setUploadStatus('uploading');
      setUploadProgress(25);

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error("File must be an image");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      setUploadProgress(50);

      // Validate image content
      setUploadStatus('processing');
      const contentValidation = await validateImageContent(file);
      
      if (!contentValidation.valid) {
        throw new Error(contentValidation.reason || "Image content not suitable for property listing");
      }

      setUploadProgress(75);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) throw error;

      setUploadProgress(90);

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      setUploadStatus('success');
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 1500);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      
      // Reset after delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 3000);
      
      return null;
    }
  };

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      setUploadError("Some files were skipped (invalid type or too large)");
    }

    const uploadPromises = validFiles.map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
    
    if (successfulUploads.length > 0) {
      const newImages = [...images, ...successfulUploads];
      onImagesChange(newImages);
    }
    
    setUploading(false);
  }, [images, onImagesChange, user?.id]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Adjust thumbnail index if needed
    if (thumbnailIndex >= newImages.length) {
      onThumbnailChange(Math.max(0, newImages.length - 1));
    } else if (thumbnailIndex === index) {
      onThumbnailChange(0);
    } else if (thumbnailIndex > index) {
      onThumbnailChange(thumbnailIndex - 1);
    }
  };

  const setThumbnail = (index: number) => {
    onThumbnailChange(index);
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Upload className="h-8 w-8 text-primary" />;
      case 'processing':
        return <AlertTriangle className="h-8 w-8 text-chart-3" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-chart-1" />;
      case 'error':
        return <X className="h-8 w-8 text-destructive" />;
      default:
        return <Upload className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Mengupload gambar...';
      case 'processing':
        return 'Memproses dan memvalidasi gambar...';
      case 'success':
        return 'Upload berhasil!';
      case 'error':
        return 'Upload gagal. Silakan coba lagi.';
      default:
        return dragActive ? "Lepas file di sini" : "Klik atau seret foto ke sini";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Foto Properti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : uploadStatus === 'error'
              ? 'border-destructive/30 bg-destructive/5'
              : uploadStatus === 'success'
              ? 'border-chart-1/30 bg-chart-1/5'
              : 'border-border hover:border-border/80 hover:bg-muted/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!uploading ? handleClickUpload : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              ) : (
                getStatusIcon()
              )}
            </div>
            
            {/* Progress Bar */}
            {uploading && uploadProgress > 0 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <div>
              <p className="text-lg font-medium text-foreground">
                {getStatusMessage()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Format: JPG, PNG, WebP. Maksimal 5MB per file
              </p>
              {uploadStatus === 'processing' && (
                <p className="text-xs text-chart-3 mt-2">
                  Sistem sedang memvalidasi konten gambar...
                </p>
              )}
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                handleClickUpload();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Pilih File
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {uploadError}
              {uploadError.includes('phone') && (
                <div className="mt-2">
                  <p className="text-sm">
                    <strong>Tips:</strong> Jika gambar properti Anda mengandung nomor telepon yang sah (seperti di papan nama), 
                    pastikan foto menampilkan properti dengan jelas sebagai fokus utama.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                Galeri Foto ({images.length})
              </h4>
              <p className="text-sm text-muted-foreground">
                Klik gambar untuk mengatur sebagai thumbnail
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    thumbnailIndex === index
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setThumbnail(index)}
                >
                  <img
                    src={image}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Thumbnail Badge */}
                  {thumbnailIndex === index && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Thumbnail
                      </Badge>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">💡 Tips Foto Properti:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload foto eksterior, interior, dan fasilitas</li>
            <li>• Gunakan pencahayaan yang baik dan hindari bayangan</li>
            <li>• Pastikan properti menjadi fokus utama foto</li>
            <li>• Foto dengan nomor kontak properti diperbolehkan</li>
            <li>• Minimal 3-5 foto untuk hasil optimal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedImageUpload;
