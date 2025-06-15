
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";

type ChatSession = {
  id: string;
  customer_id: string;
  agent_id: string | null;
  status: 'pending' | 'active' | 'closed';
  created_at: string;
  customer: { full_name: string; email: string; avatar_url: string | null };
};

type ChatMessage = {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: { full_name: string; avatar_url: string | null };
};

const LiveChatManagement = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState("");

  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['live-chat-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select(`*, customer:profiles!customer_id ( full_name, email, avatar_url )`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['live-chat-messages', selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession) return [];
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`*, sender:profiles!sender_id ( full_name, avatar_url )`)
        .eq('session_id', selectedSession.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSession,
  });
  
  const takeChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ agent_id: profile?.id, status: 'active' })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: (_, sessionId) => {
      showSuccess("Chat taken!", "You are now handling this chat.");
      queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
      const newSelectedSession = sessions?.find(s => s.id === sessionId);
      if(newSelectedSession) {
        setSelectedSession({...newSelectedSession, agent_id: profile?.id, status: 'active'});
      }
    },
    onError: (error: any) => showError("Error", error.message),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: { session_id: string, content: string }) => {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert({ session_id: newMessage.session_id, content: newMessage.content, sender_id: profile?.id });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['live-chat-messages', selectedSession?.id] });
    },
    onError: (error: any) => showError("Error", error.message),
  });

  useEffect(() => {
    const sessionChannel = supabase
      .channel('live-chat-sessions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_chat_sessions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
      })
      .subscribe();
    
    return () => { supabase.removeChannel(sessionChannel); };
  }, [queryClient]);
  
  useEffect(() => {
    if (!selectedSession?.id) return;
    const messageChannel = supabase
      .channel(`live-chat-messages-${selectedSession.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat_messages', filter: `session_id=eq.${selectedSession.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['live-chat-messages', selectedSession.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(messageChannel); };
  }, [selectedSession?.id, queryClient]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedSession) {
      sendMessageMutation.mutate({ session_id: selectedSession.id, content: message.trim() });
    }
  };

  const pendingSessions = sessions?.filter(s => s.status === 'pending');
  const activeSessions = sessions?.filter(s => s.status === 'active' && s.agent_id === profile?.id);

  return (
    <div className="flex h-[70vh] gap-4">
      <Card className="w-1/3 flex flex-col">
        <CardHeader><CardTitle>Chat Queue</CardTitle></CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Pending ({pendingSessions?.length || 0})</h3>
            {isLoadingSessions && <p>Loading...</p>}
            {pendingSessions?.map(session => (
              <div key={session.id} onClick={() => setSelectedSession(session)} className="p-2 mb-2 rounded-lg cursor-pointer hover:bg-muted">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{session.customer.full_name}</p>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); takeChatMutation.mutate(session.id); }}>Take</Button>
                </div>
                <p className="text-sm text-muted-foreground">{session.customer.email}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">My Active Chats ({activeSessions?.length || 0})</h3>
            {activeSessions?.map(session => (
              <div key={session.id} onClick={() => setSelectedSession(session)} className={`p-2 mb-2 rounded-lg cursor-pointer hover:bg-muted ${selectedSession?.id === session.id ? 'bg-muted' : ''}`}>
                <p className="font-semibold">{session.customer.full_name}</p>
                <p className="text-sm text-muted-foreground">{session.customer.email}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-2/3 flex flex-col">
        {selectedSession ? (
          <>
            <CardHeader className="border-b">
              <CardTitle>{selectedSession.customer.full_name}</CardTitle>
              <CardDescription>{selectedSession.customer.email}</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-grow p-4">
              <div className="space-y-4">
                {isLoadingMessages && <p>Loading messages...</p>}
                {messages?.map(msg => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender_id !== profile?.id && <Avatar className="h-8 w-8"><AvatarImage src={msg.sender?.avatar_url || ''} /><AvatarFallback>{msg.sender?.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>}
                    <div className={`rounded-lg px-3 py-2 max-w-sm ${msg.sender_id === profile?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." disabled={sendMessageMutation.isPending}/>
                <Button type="submit" disabled={sendMessageMutation.isPending}><Send className="h-4 w-4" /></Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p>Select a chat to start conversation</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LiveChatManagement;
