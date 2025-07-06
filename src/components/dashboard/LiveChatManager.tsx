import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Send, Clock, User, CheckCircle } from "lucide-react";

interface LiveChatManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveChatManager = ({ isOpen, onClose }: LiveChatManagerProps) => {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch live chat sessions
  const { data: chatSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['live-chat-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select(`
          id,
          customer_name,
          customer_email,
          agent_user_id,
          status,
          subject,
          priority,
          started_at,
          last_activity_at
        `)
        .in('status', ['waiting', 'active'])
        .order('last_activity_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch messages for selected session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession?.id) return [];
      
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          id,
          sender_user_id,
          sender_type,
          content,
          message_type,
          is_read,
          created_at
        `)
        .eq('session_id', selectedSession.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedSession?.id,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Take/assign chat session
  const assignChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          agent_user_id: user?.id,
          status: 'active',
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
      showSuccess("Chat Assigned", "You have successfully taken this chat session.");
    },
    onError: (error) => {
      console.error('Error assigning chat:', error);
      showError("Assignment Failed", "Failed to assign chat session.");
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert([{
          session_id: sessionId,
          sender_user_id: user?.id,
          sender_type: 'agent',
          content: content,
          message_type: 'text'
        }]);
      
      if (error) throw error;

      // Update session last activity
      await supabase
        .from('live_chat_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedSession?.id] });
      queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      showError("Send Failed", "Failed to send message.");
    },
  });

  // Close chat session
  const closeChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          status: 'resolved',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedSession(null);
      queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
      showSuccess("Chat Closed", "Chat session has been resolved and closed.");
    },
    onError: (error) => {
      console.error('Error closing chat:', error);
      showError("Close Failed", "Failed to close chat session.");
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;
    sendMessageMutation.mutate({ 
      sessionId: selectedSession.id, 
      content: newMessage.trim() 
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

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

  // Real-time subscriptions
  useEffect(() => {
    if (!isOpen) return;

    const sessionsChannel = supabase
      .channel('live-chat-sessions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_chat_sessions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
    };
  }, [isOpen, queryClient]);

  useEffect(() => {
    if (!selectedSession?.id) return;

    const messagesChannel = supabase
      .channel(`chat-messages-${selectedSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${selectedSession.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedSession.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedSession?.id, queryClient]);

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
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Active Chats</h3>
              <Badge variant="outline">
                {chatSessions.length} active
              </Badge>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {sessionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading chats...
                  </div>
                ) : chatSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active chats
                  </div>
                ) : (
                  chatSessions.map((session: any) => (
                    <div 
                      key={session.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedSession(session)}
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
                              assignChatMutation.mutate(session.id);
                            }}
                            disabled={assignChatMutation.isPending}
                            className="h-6 px-2 text-xs"
                          >
                            Take Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Chat Window */}
          <div className="lg:col-span-2 border rounded-lg flex flex-col">
            {selectedSession ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedSession.customer_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSession.customer_email || 'No email provided'} • {selectedSession.subject || 'General inquiry'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(selectedSession.status)} text-white`}>
                        {selectedSession.status}
                      </Badge>
                      {selectedSession.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => closeChatMutation.mutate(selectedSession.id)}
                          disabled={closeChatMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Close Chat
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messagesLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message: any) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs p-3 rounded-lg ${
                            message.sender_type === 'agent'
                              ? 'bg-blue-500 text-white'
                              : message.sender_type === 'system'
                              ? 'bg-gray-100 text-gray-800 text-center'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_type === 'agent' 
                                ? 'text-blue-100' 
                                : 'text-gray-500'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                {selectedSession.status === 'active' && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a chat session to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveChatManager;