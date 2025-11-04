import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";

export type ChatButtonVariant = "pulse" | "glow" | "subtle";

interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
  variant?: ChatButtonVariant;
  className?: string;
}

const ChatButton = ({ 
  onClick, 
  unreadCount = 0, 
  variant = "pulse",
  className 
}: ChatButtonProps) => {
  const baseStyles = cn(
    "fixed bottom-6 right-6 z-[9999]",
    "h-14 w-14 rounded-full",
    "text-white shadow-lg",
    "flex items-center justify-center",
    "transition-all duration-300 ease-out",
    "transform hover:scale-110 active:scale-95",
    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
    "cursor-pointer"
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

  return (
    <button
      onClick={onClick}
      className={cn(baseStyles, variantStyles[variant], className)}
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
      <Bot className="h-6 w-6" aria-hidden="true" />
      <UnreadBadge count={unreadCount} />
    </button>
  );
};

export default ChatButton;
