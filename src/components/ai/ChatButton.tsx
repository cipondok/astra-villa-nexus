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

  // Detect scroll down for scroll-to-top functionality
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show scroll-to-top when scrolling down past 200px
      if (currentScrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageSearch = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onClick();
      console.log('Image selected for search:', file);
      // Image processing logic can be added here
    }
  };

  const baseStyles = cn(
    "fixed z-[9999]",
    "h-12 w-12 md:h-14 md:w-14 rounded-full",
    "text-white shadow-lg",
    "flex items-center justify-center",
    "transition-all duration-300 ease-out",
    !isDragging && "transform hover:scale-110",
    isDragging && "scale-105 shadow-2xl",
    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    isDragging ? "cursor-grabbing" : "cursor-grab hover:cursor-grab"
  );

  const variantStyles: Record<ChatButtonVariant, string> = {
    pulse: cn(
      "bg-gradient-to-r from-blue-600 to-purple-600",
      "hover:from-blue-700 hover:to-purple-700",
      !isDragging && "animate-subtle-pulse hover:shadow-xl"
    ),
    glow: cn(
      "bg-gradient-to-r from-purple-600 to-pink-600",
      "hover:from-purple-700 hover:to-pink-700",
      "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      "hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]"
    ),
    subtle: cn(
      "bg-slate-700 hover:bg-slate-600",
      "dark:bg-slate-800 dark:hover:bg-slate-700",
      "shadow-md hover:shadow-lg"
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

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Function Menu */}
      <AnimatePresence>
        {showFunctionMenu && !showScrollTop && !isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-[9998] flex flex-col gap-2"
            style={{
              left: `${position.x}px`,
              top: `${position.y - 160}px`,
            }}
          >
            <motion.button
              onClick={handleImageSearch}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl hover:shadow-purple-500/50 flex items-center justify-center transition-all group"
            >
              <Image className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </motion.button>
            
            <motion.button
              onClick={onClick}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl hover:shadow-blue-500/50 flex items-center justify-center transition-all group"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </motion.button>

            <motion.button
              onClick={onClick}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl hover:shadow-amber-500/50 flex items-center justify-center transition-all group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
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
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => !isDragging && setShowFunctionMenu(true)}
            onClick={() => {
              if (!isDragging && !isLongPress) {
                if (showScrollTop) {
                  scrollToTop();
                } else {
                  onClick();
                }
              }
            }}
            className={cn("group", baseStyles, variantStyles[variant], className)}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            aria-label={showScrollTop ? "Scroll to top" : (isDragging ? "Dragging chat button" : "Open AI chat assistant")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (showScrollTop) {
                  scrollToTop();
                } else {
                  onClick();
                }
              }
            }}
          >
            <div className="relative">
              {/* Main Icon with transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={showScrollTop ? 'scroll' : 'bot'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {showScrollTop ? (
                    <ArrowUp className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Bot className="h-6 w-6" aria-hidden="true" />
                    </motion.div>
                  )}
                </motion.div>
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
              {!showScrollTop && !isDragging && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showFunctionMenu ? 1 : 0.5 }}
                >
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                  <div className="w-1 h-1 rounded-full bg-white/70" />
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
