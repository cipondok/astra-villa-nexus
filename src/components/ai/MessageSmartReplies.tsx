import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface MessageSmartRepliesProps {
  suggestions: string[];
  onReplyClick: (reply: string) => void;
}

const MessageSmartReplies = ({ suggestions, onReplyClick }: MessageSmartRepliesProps) => {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 * index }}
        >
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-3 bg-background/80 hover:bg-primary/10 hover:border-primary/50 transition-all"
            onClick={() => onReplyClick(suggestion)}
          >
            <MessageCircle className="h-3 w-3 mr-1.5" />
            {suggestion}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MessageSmartReplies;
