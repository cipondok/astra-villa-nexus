import React, { memo, useCallback } from "react";
import { Phone } from "lucide-react";
import { ChatWindowProps } from "../types/chatTypes";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/contexts/AuthContext";

const EmptyState = memo(() => (
  <div className="flex-1 flex items-center justify-center text-muted-foreground">
    <div className="text-center">
      <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Select a chat session to start messaging</p>
    </div>
  </div>
));

EmptyState.displayName = "EmptyState";

const ChatWindow = memo<ChatWindowProps>(({ 
  session, 
  messages, 
  onSendMessage, 
  onCloseSession,
  isLoading,
  isSending
}) => {
  const { user } = useAuth();

  const handlePriorityChange = useCallback((sessionId: string, priority: any) => {
    // This would typically update the session priority
    console.log('Priority change requested:', sessionId, priority);
    // You can implement this with a mutation similar to the ones in useChatSessions
  }, []);

  if (!session) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        session={session}
        onClose={onCloseSession}
        onPriorityChange={handlePriorityChange}
      />
      
      <MessageList 
        messages={messages}
        currentUserId={user?.id || null}
        isLoading={isLoading}
      />
      
      {session.status === 'active' && (
        <MessageInput 
          onSend={onSendMessage}
          disabled={isSending}
          placeholder="Type your message..."
        />
      )}
    </div>
  );
});

ChatWindow.displayName = "ChatWindow";

export default ChatWindow;