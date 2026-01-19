import { Settings, RotateCcw, Pin, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";
import { Icons } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useChatbotLogo } from "@/hooks/useChatbotLogo";
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
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chatbot logo from admin settings
  const { logoUrl: chatbotLogoUrl } = useChatbotLogo();

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
  const isButtonActive = isHovered || isActive || isScrolling || unreadCount > 0;

  const baseStyles = cn(
    "relative z-[99999]",
    "h-[55px] w-[55px] rounded-full",
    "transition-all duration-500 ease-out",
    "pointer-events-auto",
    "transform hover:scale-110 active:scale-95",
    "focus:outline-none focus:ring-0 ring-0",
    "cursor-pointer"
  );

  // Premium glassy royal styling with active/inactive states
  const getVariantStyles = () => {
    const activeStyles = cn(
      "bg-gradient-to-br from-background/90 via-background/80 to-primary/20",
      "shadow-[0_4px_24px_hsla(var(--primary),0.3),0_8px_40px_hsla(var(--primary),0.2)]",
      "border-2 border-primary/50",
      "backdrop-blur-xl",
      "animate-chat-float md:animate-chat-float"
    );

    const inactiveStyles = cn(
      "bg-gradient-to-br from-background/70 via-background/60 to-muted/40",
      "shadow-[0_2px_12px_hsla(var(--primary),0.1)]",
      "border border-primary/20",
      "backdrop-blur-lg"
    );

    if (isButtonActive) {
      return activeStyles;
    }
    return inactiveStyles;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  const handleMouseLeave = () => {
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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.button
          onClick={handleClick}
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
          aria-label="Open AI chat assistant"
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
            "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
            "border border-primary/20"
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
                  ) : (
                    <Icons.aiLogo 
                      logoUrl={chatbotLogoUrl}
                      className={cn(
                        "h-[55px] w-[55px] transition-all duration-500",
                        isButtonActive 
                          ? "drop-shadow-[0_0_8px_hsla(var(--primary),0.5)]" 
                          : "opacity-70",
                        isButtonActive && "hover:rotate-12"
                      )} 
                      aria-hidden="true" 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
          </div>
          
          {/* Glow ring effect when active */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none border-2 border-primary/30"
            animate={{
              boxShadow: isButtonActive 
                ? [
                    "0 0 0 0 hsla(var(--primary), 0)",
                    "0 0 0 8px hsla(var(--primary), 0.15)",
                    "0 0 0 0 hsla(var(--primary), 0)"
                  ]
                : "0 0 0 0 hsla(var(--primary), 0)"
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
