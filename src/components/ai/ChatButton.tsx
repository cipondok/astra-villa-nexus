import { Bot, GripVertical, Settings, RotateCcw, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";
import { motion } from "framer-motion";
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
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved position on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_button_pos');
    if (saved) {
      setPosition(JSON.parse(saved));
    } else {
      // Default: bottom-right corner
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
      });
    }
  }, []);

  const baseStyles = cn(
    "fixed z-[9999]",
    "h-14 w-14 rounded-full",
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
    // Constrain to viewport with 20px padding
    const newX = Math.max(20, Math.min(window.innerWidth - 76, info.point.x - 28)); // 28 = half button size
    const newY = Math.max(20, Math.min(window.innerHeight - 76, info.point.y - 28));
    
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
          className={cn("group", baseStyles, variantStyles[variant], className)}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
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
          <div className="relative">
            <Bot className="h-6 w-6" aria-hidden="true" />
            {/* Drag handle indicator - shows on hover */}
            <GripVertical 
              className={cn(
                "absolute -bottom-1 -right-1 h-3 w-3 transition-opacity",
                isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-60"
              )} 
              aria-hidden="true"
            />
          </div>
          <UnreadBadge count={unreadCount} />
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
