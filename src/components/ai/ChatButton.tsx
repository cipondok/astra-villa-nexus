import { Bot, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";

export type ChatButtonVariant = "pulse" | "glow" | "subtle";

interface ChatButtonProps {
  onClick: () => void;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  isDragging?: boolean;
  position?: { x: number; y: number };
  unreadCount?: number;
  variant?: ChatButtonVariant;
  className?: string;
}

const ChatButton = ({ 
  onClick, 
  onDragStart,
  isDragging = false,
  position,
  unreadCount = 0, 
  variant = "pulse",
  className 
}: ChatButtonProps) => {
  const baseStyles = cn(
    "fixed z-[9999]",
    "h-14 w-14 rounded-full",
    "text-white shadow-lg",
    "flex items-center justify-center",
    "transition-all duration-300 ease-out",
    !isDragging && "transform hover:scale-110 active:scale-95",
    isDragging && "scale-105 cursor-grabbing shadow-2xl",
    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    "cursor-grab hover:cursor-grab active:cursor-grabbing"
  );

  const variantStyles: Record<ChatButtonVariant, string> = {
    pulse: cn(
      "bg-gradient-to-r from-blue-600 to-purple-600",
      "hover:from-blue-700 hover:to-purple-700",
      "animate-subtle-pulse hover:shadow-xl"
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

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if not dragging
    if (!isDragging) {
      onClick();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn("group", baseStyles, variantStyles[variant], className)}
      style={position ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        right: 'auto',
      } : undefined}
      aria-label="Open AI chat assistant (drag to reposition)"
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
        {/* Drag handle indicator */}
        <GripVertical 
          className={cn(
            "absolute -bottom-1 -right-1 h-3 w-3 opacity-0 transition-opacity",
            "group-hover:opacity-60"
          )} 
          aria-hidden="true"
        />
      </div>
      <UnreadBadge count={unreadCount} />
    </button>
  );
};

export default ChatButton;
