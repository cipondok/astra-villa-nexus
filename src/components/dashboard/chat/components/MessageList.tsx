import React, { memo, useEffect, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageListProps, ChatMessage } from "../types/chatTypes";

const MessageItem = memo(({ 
  message, 
  isFromCurrentUser 
}: { 
  message: ChatMessage; 
  isFromCurrentUser: boolean;
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getMessageStyle = () => {
    if (message.sender_type === 'system') {
      return 'bg-gray-100 text-gray-800 text-center';
    }
    if (isFromCurrentUser) {
      return 'bg-blue-500 text-white';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getTextStyle = () => {
    if (message.sender_type === 'system') {
      return 'text-gray-800';
    }
    if (isFromCurrentUser) {
      return 'text-blue-100';
    }
    return 'text-gray-500';
  };

  return (
    <div 
      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-xs p-3 rounded-lg ${getMessageStyle()}`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${getTextStyle()}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

const MessageList = memo<MessageListProps>(({ 
  messages, 
  currentUserId, 
  isLoading 
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoize processed messages to prevent unnecessary re-renders
  const processedMessages = useMemo(() => {
    return messages.map(message => ({
      ...message,
      isFromCurrentUser: message.sender_user_id === currentUserId && message.sender_type === 'agent'
    }));
  }, [messages, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="text-center py-8 text-muted-foreground">
          Loading messages...
        </div>
      </ScrollArea>
    );
  }

  if (processedMessages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="text-center py-8 text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div className="space-y-3">
        {processedMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isFromCurrentUser={message.isFromCurrentUser}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});

MessageList.displayName = "MessageList";

export default MessageList;