import { GripVertical, Settings, RotateCcw, Pin, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";
import { Icons } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  showScrollArrow?: boolean;
}

const ChatButton = ({ 
  onClick, 
  unreadCount = 0, 
  variant = "pulse",
  className,
  onPositionReset,
  onOpenSettings,
  pinnedActions = new Set(),
  onTogglePin,
  showScrollArrow = false
}: ChatButtonProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch chatbot logo from system settings
  const { data: chatbotLogoUrl } = useQuery({
    queryKey: ["system-setting", "chatbotLogo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "general")
        .eq("key", "chatbotLogo")
        .maybeSingle();
      if (error) return null;
      return (data?.value as string) || null;
    },
    staleTime: 5_000,
    refetchOnMount: "always",
  });

  // Load saved position on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_button_pos');
    if (saved) {
      const savedPos = JSON.parse(saved);
      // Ensure position is within viewport bounds
      const buttonSize = window.innerWidth >= 768 ? 56 : 48;
      const maxX = window.innerWidth - buttonSize - 12;
      const maxY = window.innerHeight - buttonSize - 12;
      setPosition({
        x: Math.min(Math.max(12, savedPos.x), maxX),
        y: Math.min(Math.max(12, savedPos.y), maxY),
      });
    } else {
      // Default: bottom-right corner with mobile-safe margins
      const buttonSize = window.innerWidth >= 768 ? 56 : 48;
      setPosition({
        x: window.innerWidth - buttonSize - 20,
        y: window.innerHeight - buttonSize - 20,
      });
    }
  }, []);

  // Scroll detection - activate button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      setIsActive(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to deactivate after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        if (!isHovered) {
          setIsActive(false);
        }
      }, 1500); // Stay active for 1.5s after scroll stops
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isHovered]);

  // Determine if button should be in active state
  const isButtonActive = isHovered || isActive || isScrolling || isDragging || unreadCount > 0;

  const baseStyles = cn(
    "fixed z-[99999]",
    "h-[55px] w-[55px] rounded-full",
    "transition-all duration-500 ease-out",
    "pointer-events-auto",
    !isDragging && "transform hover:scale-110 active:scale-95",
    isDragging && "scale-105",
    "focus:outline-none focus:ring-0 ring-0",
    isDragging ? "cursor-grabbing" : "cursor-grab hover:cursor-grab"
  );

  // Premium gold-orange styling with active/inactive states
  const getVariantStyles = () => {
    const activeStyles = cn(
      "bg-gradient-to-br from-gold-primary via-accent to-orange-primary",
      "shadow-[0_4px_20px_hsla(48,100%,50%,0.4),0_8px_40px_hsla(33,100%,50%,0.3)]",
      "border border-gold-primary/30",
      !isDragging && "animate-chat-float md:animate-chat-float"
    );

    const inactiveStyles = cn(
      "bg-gradient-to-br from-gold-primary/30 via-accent/20 to-orange-primary/30",
      "shadow-[0_2px_10px_hsla(48,100%,50%,0.1),0_4px_20px_hsla(33,100%,50%,0.08)]",
      "border border-gold-primary/10",
      "backdrop-blur-sm"
    );

    if (isButtonActive) {
      return activeStyles;
    }
    return inactiveStyles;
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
    } else if (!isLongPress) {
      // Short click - open chat
      onClick();
    }
    setIsLongPress(false);
  };

  const handleMouseLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setIsHovered(false);
    // Only deactivate if not scrolling
    if (!isScrolling) {
      setIsActive(false);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsActive(true);
  };

  const handleDragEnd = (_: any, info: { point: { x: number; y: number } }) => {
    const buttonSize = window.innerWidth >= 768 ? 56 : 48;
    const halfSize = buttonSize / 2;
    // Constrain to viewport with 20px padding
    const newX = Math.max(20, Math.min(window.innerWidth - buttonSize - 20, info.point.x - halfSize));
    const newY = Math.max(20, Math.min(window.innerHeight - buttonSize - 20, info.point.y - halfSize));
    
    setPosition({ x: newX, y: newY });
    localStorage.setItem('chat_button_pos', JSON.stringify({ x: newX, y: newY }));
    setIsDragging(false);
  };

  return (
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
          onMouseEnter={handleMouseEnter}
          whileTap={{ scale: 0.95 }}
          animate={{
            opacity: isButtonActive ? 1 : 0.5,
            scale: isButtonActive ? 1 : 0.95,
          }}
          transition={{ 
            duration: 0.4,
            ease: "easeOut"
          }}
          className={cn("group", baseStyles, getVariantStyles(), className)}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            display: 'block',
            visibility: 'visible',
          }}
          aria-label={isDragging ? "Dragging chat button" : "Open AI chat assistant (long press to reposition, right-click for options)"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <div className={cn(
            "h-full w-full rounded-full flex items-center justify-center",
            "transition-all duration-500",
            isButtonActive 
              ? "bg-gradient-to-br from-gold-primary/20 to-orange-primary/20" 
              : "bg-transparent"
          )}>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showScrollArrow ? 'arrow' : 'bot'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: isButtonActive ? 1 : 0.6 
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                >
                  {showScrollArrow ? (
                    <ArrowUp className={cn(
                      "h-7 w-7 transition-colors duration-300",
                      isButtonActive ? "text-foreground" : "text-foreground/60"
                    )} aria-hidden="true" />
                  ) : chatbotLogoUrl ? (
                    <img 
                      src={chatbotLogoUrl}
                      alt="AI Assistant"
                      className={cn(
                        "h-[55px] w-[55px] rounded-full object-cover transition-all duration-500",
                        isButtonActive 
                          ? "drop-shadow-[0_0_8px_hsla(48,100%,50%,0.5)]" 
                          : "opacity-70",
                        !isDragging && isButtonActive && "hover:rotate-12"
                      )} 
                      aria-hidden="true" 
                    />
                  ) : (
                    <Icons.aiLogo 
                      className={cn(
                        "h-[55px] w-[55px] transition-all duration-500",
                        isButtonActive 
                          ? "drop-shadow-[0_0_8px_hsla(48,100%,50%,0.5)]" 
                          : "opacity-70",
                        !isDragging && isButtonActive && "hover:rotate-12"
                      )} 
                      aria-hidden="true" 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {/* Drag handle indicator - shows on hover */}
              <GripVertical
                className={cn(
                  "absolute -bottom-1 -right-1 h-3 w-3 transition-opacity duration-300",
                  isDragging ? "opacity-100 text-gold-primary" : "opacity-0 group-hover:opacity-60"
                )} 
                aria-hidden="true"
              />
            </div>
            {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
          </div>
          
          {/* Glow ring effect when active */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: isButtonActive 
                ? [
                    "0 0 0 0 hsla(48, 100%, 50%, 0)",
                    "0 0 0 8px hsla(48, 100%, 50%, 0.15)",
                    "0 0 0 0 hsla(48, 100%, 50%, 0)"
                  ]
                : "0 0 0 0 hsla(48, 100%, 50%, 0)"
            }}
            transition={{
              duration: 2,
              repeat: isButtonActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </motion.button>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-56 glass-popup">
        {onOpenSettings && (
          <>
            <ContextMenuItem onClick={onOpenSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-gold-primary" />
              <span>Settings</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        
        {onPositionReset && (
          <>
            <ContextMenuItem onClick={onPositionReset} className="cursor-pointer">
              <RotateCcw className="mr-2 h-4 w-4 text-gold-primary" />
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
              <Pin className={cn("mr-2 h-4 w-4", pinnedActions.has('scroll-to-top') && "text-gold-primary")} />
              <span>{pinnedActions.has('scroll-to-top') ? 'Unpin' : 'Pin'} Scroll to Top</span>
            </ContextMenuItem>
            
            <ContextMenuItem 
              onClick={() => onTogglePin('image-search')}
              className="cursor-pointer"
            >
              <Pin className={cn("mr-2 h-4 w-4", pinnedActions.has('image-search') && "text-gold-primary")} />
              <span>{pinnedActions.has('image-search') ? 'Unpin' : 'Pin'} Image Search</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatButton;
