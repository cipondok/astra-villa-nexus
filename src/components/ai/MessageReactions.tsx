import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MessageReactionsProps {
  messageId: string;
  currentReaction?: 'positive' | 'negative' | null;
  onReaction: (messageId: string, reaction: 'positive' | 'negative') => void;
}

const MessageReactions = ({ messageId, currentReaction, onReaction }: MessageReactionsProps) => {
  const [isAnimating, setIsAnimating] = useState<'positive' | 'negative' | null>(null);

  const handleReaction = (reaction: 'positive' | 'negative') => {
    setIsAnimating(reaction);
    onReaction(messageId, reaction);
    setTimeout(() => setIsAnimating(null), 300);
  };

  return (
    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('positive')}
        className={`h-7 w-7 p-0 ${
          currentReaction === 'positive' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
            : 'hover:bg-green-50 dark:hover:bg-green-900/20'
        } ${isAnimating === 'positive' ? 'animate-macos-bounce' : ''}`}
        disabled={!!currentReaction}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('negative')}
        className={`h-7 w-7 p-0 ${
          currentReaction === 'negative' 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
            : 'hover:bg-red-50 dark:hover:bg-red-900/20'
        } ${isAnimating === 'negative' ? 'animate-macos-bounce' : ''}`}
        disabled={!!currentReaction}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default MessageReactions;
