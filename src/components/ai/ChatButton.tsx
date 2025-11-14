import { Bot, GripVertical, Settings, RotateCcw, Pin, ArrowUp, Image, Search, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useImageSearch } from "@/hooks/useImageSearch";
import { ImageSearchModal } from "./ImageSearchModal";
import { ImageCropModal } from "./ImageCropModal";
import { toast } from "sonner";

export type ChatButtonVariant = "pulse" | "glow" | "subtle";

interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
  variant?: ChatButtonVariant;
  className?: string;
  onPositionReset?: () => void;
  onOpenSettings?: () => void;
  pinnedActions?: Set<string>;
  onTogglePin?: (actionId: string) => void;
}

const ChatButton = ({ 
  onClick, 
  unreadCount = 0, 
  variant = "pulse",
  className,
  onPositionReset,
  onOpenSettings,
  pinnedActions = new Set(),
  onTogglePin
}: ChatButtonProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFunctionMenu, setShowFunctionMenu] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [searchImageUrl, setSearchImageUrl] = useState<string | null>(null);
  
  // Image search hook
  const { 
    searchByImage, 
    isSearching: isImageSearching, 
    searchResults, 
    imageFeatures, 
    uploadProgress,
    clearResults 
  } = useImageSearch();

  // Load saved position on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_button_pos');
    if (saved) {
      setPosition(JSON.parse(saved));
    } else {
      // Default: bottom-right corner
      const buttonSize = window.innerWidth >= 768 ? 56 : 48;
      setPosition({
        x: window.innerWidth - buttonSize - 20,
        y: window.innerHeight - buttonSize - 20,
      });
    }
  }, []);

  // Detect scroll for scroll-to-top functionality and calculate scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = docHeight > 0 ? Math.round((currentScrollY / docHeight) * 100) : 0;
      
      setScrollProgress(scrollPercentage);
      
      // Show scroll-to-top when scrolling down past 100px
      if (currentScrollY > 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowFunctionMenu(false);
  };

  const handleImageSearch = () => {
    fileInputRef.current?.click();
    setShowFunctionMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Convert to base64 for cropping
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setOriginalImageUrl(imageUrl);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob, croppedUrl: string) => {
    setShowCropModal(false);
    setSearchImageUrl(croppedUrl);
    setShowImageSearchModal(true);

    try {
      // Convert blob to file for search
      const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      const results = await searchByImage(file);
      
      if (results.properties.length > 0) {
        toast.success(`Found ${results.properties.length} similar properties!`);
      } else {
        toast.info('No similar properties found. Try a different image.');
      }
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('Failed to search by image. Please try again.');
      setShowImageSearchModal(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setOriginalImageUrl(null);
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChatClick = () => {
    onClick();
    setShowFunctionMenu(false);
  };

  const baseStyles = cn(
    "fixed z-[9999]",
    "h-12 w-12 md:h-14 md:w-14 rounded-full",
    "text-white",
    "flex items-center justify-center",
    "transition-all duration-300 ease-out",
    !isDragging && "transform hover:scale-110",
    isDragging && "scale-105",
    "focus:outline-none",
    isDragging ? "cursor-grabbing" : "cursor-grab hover:cursor-grab",
    // Multi-color ring border effect
    "relative before:absolute before:inset-0 before:rounded-full before:p-[3px]",
    "before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-cyan-500",
    "before:animate-spin-slow before:-z-10",
    "after:absolute after:inset-[3px] after:rounded-full after:bg-background after:-z-10"
  );

  const variantStyles: Record<ChatButtonVariant, string> = {
    pulse: cn(
      "bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500",
      "hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600",
      "shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_60px_rgba(236,72,153,0.4)]",
      !isDragging && "hover:shadow-[0_0_40px_rgba(168,85,247,0.8),0_0_80px_rgba(236,72,153,0.6)]"
    ),
    glow: cn(
      "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
      "hover:from-purple-600 hover:via-pink-600 hover:to-orange-600",
      "shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_60px_rgba(236,72,153,0.4)]",
      "hover:shadow-[0_0_40px_rgba(168,85,247,0.8),0_0_80px_rgba(236,72,153,0.6)]"
    ),
    subtle: cn(
      "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800",
      "hover:from-slate-500 hover:via-slate-600 hover:to-slate-700",
      "shadow-[0_0_20px_rgba(100,116,139,0.4)]",
      "hover:shadow-[0_0_30px_rgba(100,116,139,0.6)]"
    )
  };

  // Long press to activate drag (300ms)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    pressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      setIsDragging(true);
    }, 300);
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (isDragging) {
      // Save position to localStorage
      localStorage.setItem('chat_button_pos', JSON.stringify(position));
      setIsDragging(false);
      setIsLongPress(false);
    }
    setIsLongPress(false);
  };

  const handleMouseLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setShowFunctionMenu(false);
  };

  const handleDragEnd = (_: any, info: { point: { x: number; y: number } }) => {
    const buttonSize = window.innerWidth >= 768 ? 56 : 48; // Match responsive size
    const halfSize = buttonSize / 2;
    // Constrain to viewport with 20px padding
    const newX = Math.max(20, Math.min(window.innerWidth - buttonSize - 20, info.point.x - halfSize));
    const newY = Math.max(20, Math.min(window.innerHeight - buttonSize - 20, info.point.y - halfSize));
    
    setPosition({ x: newX, y: newY });
    localStorage.setItem('chat_button_pos', JSON.stringify({ x: newX, y: newY }));
    setIsDragging(false);
  };

  const handleCloseImageSearch = () => {
    setShowImageSearchModal(false);
    setSearchImageUrl(null);
    clearResults();
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Crop Modal */}
      {originalImageUrl && (
        <ImageCropModal
          isOpen={showCropModal}
          imageUrl={originalImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Image Search Modal */}
      <ImageSearchModal
        isOpen={showImageSearchModal}
        onClose={handleCloseImageSearch}
        searchResults={searchResults}
        imageFeatures={imageFeatures}
        isSearching={isImageSearching}
        uploadProgress={uploadProgress}
        searchImageUrl={searchImageUrl}
      />

      {/* Function Menu */}
      <AnimatePresence>
        {showFunctionMenu && !showScrollTop && !isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-[9998] flex flex-col gap-3"
            style={{
              left: `${position.x}px`,
              top: `${position.y - 180}px`,
            }}
          >
            {/* Image Search */}
            <motion.button
              onClick={handleImageSearch}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 md:w-13 md:h-13 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white shadow-xl hover:shadow-purple-500/50 flex items-center justify-center transition-all group"
              aria-label="Image Search"
            >
              <Image className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute -right-20 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Image
              </span>
            </motion.button>
            
            {/* AI Search */}
            <motion.button
              onClick={onClick}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 md:w-13 md:h-13 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white shadow-xl hover:shadow-blue-500/50 flex items-center justify-center transition-all group"
              aria-label="AI Search"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -right-20 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Search
              </span>
            </motion.button>

            {/* AI Chat */}
            <motion.button
              onClick={onClick}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 md:w-13 md:h-13 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white shadow-xl hover:shadow-amber-500/50 flex items-center justify-center transition-all group"
              aria-label="AI Assistant"
            >
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -right-16 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.button
            drag={isDragging}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={handleDragEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => !isDragging && setShowFunctionMenu(true)}
            onMouseLeave={() => {
              handleMouseLeave();
              if (!isDragging) setShowFunctionMenu(false);
            }}
            onClick={() => {
              if (!isDragging && !isLongPress) {
                setShowFunctionMenu(!showFunctionMenu);
              }
            }}
            className={cn("group", baseStyles, variantStyles[variant], className)}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            aria-label={isDragging ? "Dragging chat button" : "Multi-function AI assistant"}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowFunctionMenu(!showFunctionMenu);
              }
            }}
          >
            <div className="relative">
            {/* Main Icon - Always show Sparkles */}
            <motion.div
              animate={{ 
                rotate: showFunctionMenu ? 180 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
              
              {/* Scroll Progress Indicator */}
              <AnimatePresence>
                {showScrollTop && scrollProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg whitespace-nowrap"
                  >
                    {scrollProgress}%
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Drag handle indicator */}
              <GripVertical 
                className={cn(
                  "absolute -bottom-1 -right-1 h-3 w-3 transition-opacity",
                  isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                )} 
                aria-hidden="true"
              />

              {/* Function indicator dots */}
              {!isDragging && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showFunctionMenu ? 1 : 0.5 }}
                >
                  <div className={cn("w-1 h-1 rounded-full transition-all", showFunctionMenu ? "bg-white" : "bg-white/60")} />
                  <div className={cn("w-1 h-1 rounded-full transition-all", showFunctionMenu ? "bg-white" : "bg-white/60")} />
                  <div className={cn("w-1 h-1 rounded-full transition-all", showFunctionMenu ? "bg-white" : "bg-white/60")} />
                  {showScrollTop && <div className={cn("w-1 h-1 rounded-full transition-all", showFunctionMenu ? "bg-emerald-400" : "bg-emerald-400/60")} />}
                </motion.div>
              )}
            </div>
            <UnreadBadge count={unreadCount} />

            {/* Pulse effect on hover */}
            {!isDragging && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                initial={{ scale: 1, opacity: 0 }}
                whileHover={{ scale: 1.3, opacity: 0.3 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        </ContextMenuTrigger>
      
      <ContextMenuContent className="w-56">
        {onOpenSettings && (
          <>
            <ContextMenuItem onClick={onOpenSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        
        {onPositionReset && (
          <>
            <ContextMenuItem onClick={onPositionReset} className="cursor-pointer">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Reset Position</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        
        {onTogglePin && (
          <>
            <ContextMenuItem 
              onClick={() => onTogglePin('scroll-to-top')}
              className="cursor-pointer"
            >
              <Pin className={cn("mr-2 h-4 w-4", pinnedActions.has('scroll-to-top') && "text-primary")} />
              <span>{pinnedActions.has('scroll-to-top') ? 'Unpin' : 'Pin'} Scroll to Top</span>
            </ContextMenuItem>
            
            <ContextMenuItem 
              onClick={() => onTogglePin('image-search')}
              className="cursor-pointer"
            >
              <Pin className={cn("mr-2 h-4 w-4", pinnedActions.has('image-search') && "text-primary")} />
              <span>{pinnedActions.has('image-search') ? 'Unpin' : 'Pin'} Image Search</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};

export default ChatButton;
