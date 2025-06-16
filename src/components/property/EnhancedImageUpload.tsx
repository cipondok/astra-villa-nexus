
import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, X, Star, Edit, Trash2, Image as ImageIcon } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      setUploadError("User not authenticated");
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
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
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? "Lepas file di sini" : "Klik atau seret foto ke sini"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Format: JPG, PNG, WebP. Maksimal 5MB per file
              </p>
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
            <AlertDescription>{uploadError}</Alert>
          </Alert>
        )}

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Galeri Foto ({images.length})
              </h4>
              <p className="text-sm text-gray-500">
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

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">💡 Tips Foto Terbaik:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload foto eksterior, interior, dan fasilitas</li>
            <li>• Gunakan pencahayaan yang baik</li>
            <li>• Foto pertama akan menjadi thumbnail utama</li>
            <li>• Minimal 3-5 foto untuk hasil optimal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedImageUpload;
