import { GripVertical, Settings, RotateCcw, Pin, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";
import { Icons } from "@/components/icons";
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
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const baseStyles = cn(
    "fixed z-[99999]",
    "h-[55px] w-[55px] rounded-full",
    "shadow-none",
    "transition-all duration-500 ease-out",
    "pointer-events-auto",
    !isDragging && "transform hover:scale-110 active:scale-95",
    isDragging && "scale-105",
    "focus:outline-none focus:ring-0 ring-0",
    isDragging ? "cursor-grabbing" : "cursor-grab hover:cursor-grab"
  );

  const variantStyles: Record<ChatButtonVariant, string> = {
    pulse: cn(
      "bg-background/80 backdrop-blur-sm",
      "hover:bg-background/90",
      !isDragging && "animate-chat-float md:animate-chat-float"
    ),
    glow: cn(
      "bg-background/80 backdrop-blur-sm",
      "hover:bg-background/90"
    ),
    subtle: cn(
      "bg-background/80 backdrop-blur-sm",
      "hover:bg-background/90"
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
          whileTap={{ scale: 0.95 }}
          transition={{ 
            duration: 0.1,
            ease: "easeOut"
          }}
          className={cn("group", baseStyles, variantStyles[variant], className)}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            display: 'block',
            visibility: 'visible',
            opacity: 1,
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
            variantStyles[variant]
          )}>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showScrollArrow ? 'arrow' : 'bot'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                >
                  {showScrollArrow ? (
                    <ArrowUp className="h-7 w-7 text-foreground" aria-hidden="true" />
                  ) : (
                    <Icons.aiLogo className="h-[55px] w-[55px] transition-transform duration-300 hover:rotate-12" aria-hidden="true" />
                  )}
                </motion.div>
              </AnimatePresence>
              {/* Drag handle indicator - shows on hover */}
              <GripVertical
                className={cn(
                  "absolute -bottom-1 -right-1 h-3 w-3 transition-opacity",
                  isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                )} 
                aria-hidden="true"
              />
            </div>
            {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
          </div>
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
  );
};

export default ChatButton;
