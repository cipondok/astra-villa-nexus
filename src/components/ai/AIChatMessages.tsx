
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Star } from "lucide-react";
import { Message } from "./types";
import TypingIndicator from "./TypingIndicator";
import MessageReactions from "./MessageReactions";
import MessageSmartReplies from "./MessageSmartReplies";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

interface AIChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onReaction: (messageId: string, reaction: 'positive' | 'negative') => void;
  onToggleStar?: (messageId: string) => void;
  typingStatus?: string;
  smartReplies?: string[];
  onSmartReplyClick?: (reply: string) => void;
}

const AIChatMessages = ({ messages, isLoading, messagesEndRef, onReaction, onToggleStar, typingStatus, smartReplies, onSmartReplyClick }: AIChatMessagesProps) => {
  return (
    <div className="h-96 overflow-y-auto p-4 space-y-1">
      <AnimatePresence mode="popLayout">
        {messages.map((msg, index) => (
          <motion.div 
            key={msg.id}
            layout
            initial={{ opacity: 0, x: msg.role === 'user' ? 30 : -30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              x: msg.role === 'user' ? 30 : -30,
              height: 0,
              marginBottom: 0,
              scale: 0.9,
              transition: { duration: 0.2 }
            }}
            transition={{ 
              type: "spring",
              stiffness: 350,
              damping: 30,
              layout: { duration: 0.25 }
            }}
            className={cn(
              "flex group mb-3",
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div className="relative flex-1 max-w-[85%]">
              {/* Star button */}
              {onToggleStar && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute -top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                    msg.role === 'user' ? '-left-8' : '-right-8'
                  )}
                  onClick={() => onToggleStar(msg.id)}
                >
                  <Star 
                    className={cn(
                      "h-3.5 w-3.5",
                      msg.starred ? 'fill-gold-primary text-gold-primary' : 'text-muted-foreground'
                    )}
                  />
                </Button>
              )}
              
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md shadow-md shadow-primary/10'
                  : 'bg-muted/60 text-foreground rounded-bl-md border border-border/50 backdrop-blur-sm'
              )}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icons.aiLogo className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">ASTRA AI</span>
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.content}</div>
                {msg.functionCall && (
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    ⚡ {msg.functionCall.name}
                  </Badge>
                )}
                {msg.role === 'assistant' && msg.content && (
                  <>
                    <MessageReactions 
                      messageId={msg.id} 
                      currentReaction={msg.reaction}
                      onReaction={onReaction}
                    />
                    {index === messages.length - 1 && smartReplies && smartReplies.length > 0 && onSmartReplyClick && (
                      <MessageSmartReplies 
                        suggestions={smartReplies}
                        onReplyClick={onSmartReplyClick}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && <TypingIndicator status={typingStatus} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
