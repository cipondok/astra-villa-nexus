
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Star } from "lucide-react";
import { Message } from "./types";
import TypingIndicator from "./TypingIndicator";
import MessageReactions from "./MessageReactions";
import MessageSmartReplies from "./MessageSmartReplies";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <div className="h-96 overflow-y-auto p-4">
      <AnimatePresence mode="popLayout">
        {messages.map((msg, index) => (
          <motion.div 
            key={msg.id}
            layout
            initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              x: msg.role === 'user' ? 50 : -50,
              height: 0,
              marginBottom: 0,
              scale: 0.8,
              transition: { duration: 0.2 }
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
              layout: { duration: 0.3 }
            }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group mb-4`}
          >
            <div className="relative flex-1 max-w-xs">
              {/* Star button - always visible */}
              {onToggleStar && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute -top-2 ${msg.role === 'user' ? '-left-8' : '-right-8'} h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10`}
                  onClick={() => onToggleStar(msg.id)}
                >
                  <Star 
                    className={`h-3.5 w-3.5 ${msg.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                </Button>
              )}
              
              <div className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/70 text-gray-900 dark:bg-gray-800 dark:text-white'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-line">{msg.content}</div>
                {msg.functionCall && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    Action: {msg.functionCall.name}
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
