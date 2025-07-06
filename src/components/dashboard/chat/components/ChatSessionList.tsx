import React, { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { User, Clock, Search } from "lucide-react";
import { ChatSession, ChatSessionListProps } from "../types/chatTypes";

const ChatSessionItem = memo(({ 
  session, 
  isSelected, 
  onSelect, 
  onAssign,
  isAssigning 
}: {
  session: ChatSession;
  isSelected: boolean;
  onSelect: (session: ChatSession) => void;
  onAssign: (sessionId: string) => void;
  isAssigning: boolean;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'resolved': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
          : 'hover:bg-muted'
      }`}
      onClick={() => onSelect(session)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">{session.customer_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge className={`${getStatusColor(session.status)} text-white text-xs`}>
            {session.status}
          </Badge>
          <Badge className={`${getPriorityColor(session.priority)} text-white text-xs`}>
            {session.priority}
          </Badge>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-2">
        {session.subject || 'General inquiry'}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Started: {formatTime(session.started_at)}</span>
        {session.status === 'waiting' && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAssign(session.id);
            }}
            disabled={isAssigning}
            className="h-6 px-2 text-xs"
          >
            Take Chat
          </Button>
        )}
      </div>
    </div>
  );
});

ChatSessionItem.displayName = "ChatSessionItem";

const ChatSessionList = memo<ChatSessionListProps>(({ 
  sessions, 
  selectedSessionId, 
  onSelectSession, 
  onAssignSession,
  isLoading 
}) => {
  // Memoize the selected session to prevent unnecessary re-renders
  const selectedSession = useMemo(() => 
    sessions.find(session => session.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  // Memoize waiting sessions count for badge
  const waitingCount = useMemo(() => 
    sessions.filter(session => session.status === 'waiting').length,
    [sessions]
  );

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Active Chats</h3>
        <Badge variant="outline">
          {sessions.length} active
          {waitingCount > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full px-1 text-xs">
              {waitingCount} waiting
            </span>
          )}
        </Badge>
      </div>
      
      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading chats...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active chats
            </div>
          ) : (
            sessions.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                isSelected={session.id === selectedSessionId}
                onSelect={onSelectSession}
                onAssign={onAssignSession}
                isAssigning={false} // Will be passed from parent
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

ChatSessionList.displayName = "ChatSessionList";

export default ChatSessionList;