
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Upload, X, Image, Edit, Star, Eye, Crop, RotateCw, ZoomIn } from "lucide-react";

interface EnhancedImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  thumbnailIndex?: number;
  onThumbnailChange?: (index: number) => void;
}

const EnhancedImageUpload = ({ 
  images, 
  onImagesChange, 
  thumbnailIndex = 0, 
  onThumbnailChange 
}: EnhancedImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useAlert();

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `property-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Upload files one by one for better control
      const uploadedUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          showError("Error", `File ${file.name} is too large. Maximum size is 5MB.`);
          continue;
        }
        
        if (!file.type.startsWith('image/')) {
          showError("Error", `File ${file.name} is not an image.`);
          continue;
        }

        const uploadedUrl = await uploadImage(file);
        uploadedUrls.push(uploadedUrl);
        showSuccess("Success", `${file.name} uploaded successfully`);
      }
      
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      showError("Error", "Failed to upload some images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Adjust thumbnail index if needed
    if (onThumbnailChange) {
      if (index === thumbnailIndex && newImages.length > 0) {
        onThumbnailChange(0);
      } else if (index < thumbnailIndex) {
        onThumbnailChange(thumbnailIndex - 1);
      }
    }
    
    showSuccess("Success", "Image removed successfully");
  };

  const setAsThumbnail = (index: number) => {
    if (onThumbnailChange) {
      onThumbnailChange(index);
      showSuccess("Success", "Thumbnail updated");
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const openImageEditor = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setCropDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Property Images
            {images.length > 0 && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {images.length} image{images.length !== 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div>
            <Label htmlFor="images">Upload Images</Label>
            <Input
              ref={fileInputRef}
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Select multiple images (JPG, PNG, etc.) - Max 5MB each
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
              <Upload className="h-4 w-4 animate-pulse" />
              <span>Uploading images...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Image Gallery</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGalleryOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Gallery
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Thumbnail Badge */}
                      {index === thumbnailIndex && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                            <Star className="h-3 w-3" />
                            Thumbnail
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openImageEditor(url)}
                          className="h-8 w-8 p-0"
                          title="Edit Image"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        {index !== thumbnailIndex && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setAsThumbnail(index)}
                            className="h-8 w-8 p-0"
                            title="Set as Thumbnail"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="h-8 w-8 p-0"
                          title="Delete Image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image Info */}
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-500">Image {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No images uploaded yet</p>
              <p className="text-sm text-gray-400">
                Click "Choose Files" above to upload property images
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Image Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {index === thumbnailIndex && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      <Star className="h-3 w-3" />
                      Thumbnail
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Editor Modal */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected for editing"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-white text-center">
                    <Crop className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Advanced editing features coming soon</p>
                    <p className="text-xs opacity-75">Crop, rotate, and enhance your images</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCropDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setCropDialogOpen(false)}>
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedImageUpload;
