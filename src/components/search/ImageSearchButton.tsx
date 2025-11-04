import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageSearchButtonProps {
  onImageSelected: (base64Image: string) => void;
  onClear?: () => void;
  isSearching?: boolean;
  hasImage?: boolean;
  className?: string;
}

export const ImageSearchButton = ({ 
  onImageSelected, 
  onClear,
  isSearching = false,
  hasImage = false,
  className 
}: ImageSearchButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewUrl(result);
        onImageSelected(result);
        toast.success('Image uploaded! Searching for similar properties...');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read image file');
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isSearching}
      />
      
      {!hasImage && !previewUrl ? (
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSearching}
          variant="outline"
          size="sm"
          className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Search by Image</span>
          <span className="sm:hidden">Image Search</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          {previewUrl && (
            <div className="relative h-10 w-10 rounded-lg overflow-hidden border-2 border-purple-500 shadow-md">
              <img 
                src={previewUrl} 
                alt="Search" 
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSearching}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Change
              </>
            )}
          </Button>
          
          <Button
            type="button"
            onClick={handleClear}
            disabled={isSearching}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
