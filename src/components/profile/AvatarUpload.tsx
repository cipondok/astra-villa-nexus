import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import imageCompression from 'browser-image-compression';
import ImageCropper from './ImageCropper';
import AvatarUploadGuard from './AvatarUploadGuard';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (url: string) => void;
  userEmail?: string;
  userPhone?: string;
  onEditProfile?: () => void;
}

export const AvatarUpload = ({ 
  userId, 
  currentAvatarUrl, 
  onAvatarUpdate,
  userEmail,
  userPhone,
  onEditProfile,
}: AvatarUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Security check - require email and phone before allowing upload
  const hasEmail = Boolean(userEmail && userEmail.trim().length > 0);
  const hasPhone = Boolean(userPhone && userPhone.trim().length > 0);
  const canUploadAvatar = hasEmail && hasPhone;

  const optimizeImage = async (blob: Blob): Promise<File> => {
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 512,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return file;
    }
  };

  const uploadAvatar = async (blob: Blob) => {
    setIsUploading(true);
    try {
      // Optimize the image first
      const optimizedFile = await optimizeImage(blob);
      
      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileName = `${userId}-${Date.now()}.jpg`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onAvatarUpdate(publicUrl);

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setShowCropper(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    if (!canUploadAvatar) {
      toast({
        title: "Verification Required",
        description: "Please add your phone number and email before uploading a photo.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Open cropper instead of direct upload
    setSelectedFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    uploadAvatar(croppedBlob);
  };

  const handleCropCancel = () => {
    setSelectedFile(null);
    setShowCropper(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (canUploadAvatar) {
      setIsDragging(true);
    }
  }, [canUploadAvatar]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!canUploadAvatar) {
      toast({
        title: "Verification Required",
        description: "Please add your phone number and email before uploading a photo.",
        variant: "destructive",
      });
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Open cropper
    setSelectedFile(file);
    setShowCropper(true);
  }, [canUploadAvatar, toast]);

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);
    try {
      const oldPath = currentAvatarUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${oldPath}`]);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      setPreviewUrl(null);
      onAvatarUpdate('');

      toast({
        title: "Success",
        description: "Profile picture removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (!canUploadAvatar) {
      toast({
        title: "Verification Required",
        description: "Please add your phone number and email before uploading a photo.",
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Security Guard - Show if not verified */}
      {!canUploadAvatar && (
        <AvatarUploadGuard
          hasEmail={hasEmail}
          hasPhone={hasPhone}
          onEditProfile={onEditProfile}
        />
      )}

      <div className="flex flex-col items-center">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group transition-all duration-300 ${
            isDragging ? 'scale-105' : ''
          } ${!canUploadAvatar ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className={`w-32 h-32 rounded-2xl overflow-hidden border-4 transition-all ${
            isDragging 
              ? 'border-primary shadow-xl' 
              : 'border-border shadow-lg'
          }`}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}

          {!isUploading && canUploadAvatar && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={handleUploadClick}
              >
                <Upload className="h-5 w-5" />
              </Button>
            </div>
          )}

          {previewUrl && !isUploading && canUploadAvatar && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 rounded-full w-8 h-8 shadow-lg"
              onClick={handleRemoveAvatar}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center mt-4">
          <Button
            variant="outline"
            onClick={handleUploadClick}
            disabled={isUploading || !canUploadAvatar}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {previewUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            {canUploadAvatar ? 'Drag & drop or click to upload' : 'Add email & phone first'}
          </p>
          <p className="text-xs text-muted-foreground">
            Max 10MB • JPG, PNG, WEBP
          </p>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          circularCrop={true}
        />
      )}
    </div>
  );
};
