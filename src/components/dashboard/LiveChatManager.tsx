import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone } from "lucide-react";
import { useChatSessions } from "./chat/hooks/useChatSessions";
import { useChatMessages } from "./chat/hooks/useChatMessages";
import ChatSessionList from "./chat/components/ChatSessionList";
import ChatWindow from "./chat/components/ChatWindow";
import { ChatSession } from "./chat/types/chatTypes";

interface LiveChatManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveChatManager = ({ isOpen, onClose }: LiveChatManagerProps) => {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  
  // Use our optimized hooks
  const { 
    sessions, 
    isLoading: sessionsLoading, 
    onAssignChat, 
    onCloseChat,
    isAssigning 
  } = useChatSessions();
  
  const { 
    messages, 
    isLoading: messagesLoading, 
    onSendMessage,
    isSending 
  } = useChatMessages(selectedSession?.id || null);

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const handleCloseSession = (sessionId: string) => {
    onCloseChat(sessionId);
    setSelectedSession(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Live Chat Manager
          </DialogTitle>
          <DialogDescription>
            Manage real-time customer conversations
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Chat Sessions List */}
          <ChatSessionList 
            sessions={sessions}
            selectedSessionId={selectedSession?.id || null}
            onSelectSession={handleSelectSession}
            onAssignSession={onAssignChat}
            isLoading={sessionsLoading}
          />
          
          {/* Chat Window */}
          <div className="lg:col-span-2 border rounded-lg flex flex-col">
            <ChatWindow 
              session={selectedSession}
              messages={messages}
              onSendMessage={onSendMessage}
              onCloseSession={handleCloseSession}
              isLoading={messagesLoading}
              isSending={isSending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveChatManager;