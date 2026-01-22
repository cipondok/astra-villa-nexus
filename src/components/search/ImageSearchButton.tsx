import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImageSearchButtonProps {
  onImageSelected: (base64Image: string) => void;
  onClear?: () => void;
  isSearching?: boolean;
  hasImage?: boolean;
  className?: string;
  enableDragDrop?: boolean;
  enablePaste?: boolean;
}

export const ImageSearchButton = ({ 
  onImageSelected, 
  onClear,
  isSearching = false,
  hasImage = false,
  className,
  enableDragDrop = false,
  enablePaste = false
}: ImageSearchButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Check if user has used image search before
  useEffect(() => {
    const hasUsedImageSearch = localStorage.getItem('hasUsedImageSearch');
    if (!hasUsedImageSearch) {
      setShowPulse(true);
    }
  }, []);

  // Handle paste from clipboard
  useEffect(() => {
    if (!enablePaste) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await processImageFile(file);
            toast.success('Image pasted! Searching...');
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [enablePaste]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  const processImageFile = async (file: File) => {
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewUrl(result);
        onImageSelected(result);
        toast.success('Image uploaded! Searching for similar properties...');
        
        // Mark as used and stop pulse animation
        localStorage.setItem('hasUsedImageSearch', 'true');
        setShowPulse(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read image file');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enableDragDrop && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        setIsDragging(true);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!enableDragDrop || isSearching) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      await processImageFile(file);
    }
  };

  return (
    <div 
      className={cn("relative", className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isSearching}
      />
      
      {/* Drag and Drop Overlay */}
      {enableDragDrop && isDragging && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm animate-in fade-in duration-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/95 border-2 border-dashed border-primary rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
                  <Camera className="h-12 w-12 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground mb-1">Drop your image here</p>
                  <p className="text-sm text-muted-foreground">We'll search for similar properties</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!hasImage && !previewUrl ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSearching}
                className="p-1 flex items-center justify-center transition-colors disabled:opacity-50 relative"
              >
                <Camera className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                {showPulse && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="z-[100000] bg-card/10 backdrop-blur-sm text-foreground border border-white/20 shadow-lg px-2 py-1">
              <p className="text-[10px] font-medium">Image Search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="flex items-center gap-1">
          {previewUrl && (
            <div className="relative h-7 w-7 rounded-md overflow-hidden border border-purple-500 shadow-sm">
              <img 
                src={previewUrl} 
                alt="Search" 
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSearching}
                  className="p-1 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 text-pink-500 dark:text-pink-400 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="z-[100000] bg-card/10 backdrop-blur-sm text-foreground border border-white/20 shadow-lg px-2 py-1">
                <p className="text-[10px] font-medium">{isSearching ? "Searching..." : "Change Image"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSearching}
                  className="p-0 h-7 w-7 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="z-[100000] bg-card/10 backdrop-blur-sm text-foreground border border-white/20 shadow-lg px-2 py-1">
                <p className="text-[10px] font-medium">Clear</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
