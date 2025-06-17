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
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Users, Clock, CheckCircle, Activity } from "lucide-react";

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

  const { data: sessions, isLoading: isLoadingSessions } = useQuery<ChatSession[]>({
    queryKey: ['live-chat-sessions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('live_chat_sessions')
        .select(`*, customer:profiles!customer_id ( full_name, email, avatar_url )`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ['live-chat-messages', selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession) return [];
      const { data, error } = await (supabase as any)
        .from('live_chat_messages')
        .select(`*, sender:profiles!sender_id ( full_name, avatar_url )`)
        .eq('session_id', selectedSession.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedSession,
  });
  
  const takeChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await (supabase as any)
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
        setSelectedSession({...newSelectedSession, agent_id: profile?.id || null, status: 'active'});
      }
    },
    onError: (error: any) => showError("Error", error.message),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: { session_id: string, content: string }) => {
      if (!profile?.id) throw new Error("User not authenticated.");
      const { error } = await (supabase as any)
        .from('live_chat_messages')
        .insert({ session_id: newMessage.session_id, content: newMessage.content, sender_id: profile.id });
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
    <div className="space-y-6">
      {/* Professional Customer Service Header */}
      <div className="bg-gradient-to-br from-green-900 via-teal-900 to-cyan-800 text-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
          
          <div className="relative z-10">
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Live Chat Management</h1>
                    <p className="text-blue-100 text-lg">Customer Support Control Center</p>
                  </div>
                </div>
                
                {/* Service Status */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-100 text-sm font-medium">Service Active</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-400/30">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-100 text-sm font-medium">Support Agent</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{pendingSessions?.length || 0}</div>
                    <div className="text-blue-100 text-sm">Pending Chats</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activeSessions?.length || 0}</div>
                    <div className="text-blue-100 text-sm">Active Chats</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{(sessions?.length || 0)}</div>
                    <div className="text-blue-100 text-sm">Total Sessions</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-blue-100 text-sm">Resolution Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Management Interface */}
      <div className="flex h-[70vh] gap-6">
        <Card className="w-1/3 flex flex-col shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Chat Queue
            </CardTitle>
            <CardDescription>Manage customer conversations</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Pending Requests</h3>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {pendingSessions?.length || 0}
                  </Badge>
                </div>
                {isLoadingSessions && <p className="text-center text-sm text-muted-foreground">Loading...</p>}
                {pendingSessions?.map(session => (
                  <div key={session.id} onClick={() => setSelectedSession(session)} className="p-3 mb-2 rounded-lg cursor-pointer hover:bg-muted border border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{session.customer.full_name}</p>
                      <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); takeChatMutation.mutate(session.id); }}>
                        Take Chat
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.customer.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">New</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">My Active Chats</h3>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {activeSessions?.length || 0}
                  </Badge>
                </div>
                {activeSessions?.map(session => (
                  <div key={session.id} onClick={() => setSelectedSession(session)} className={`p-3 mb-2 rounded-lg cursor-pointer transition-all border ${selectedSession?.id === session.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted border-gray-200 hover:border-gray-300'}`}>
                    <p className="font-medium">{session.customer.full_name}</p>
                    <p className="text-sm text-muted-foreground">{session.customer.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-xs bg-green-500">Active</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-2/3 flex flex-col shadow-lg border-0">
          {selectedSession ? (
            <>
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedSession.customer.avatar_url || ''} />
                    <AvatarFallback>{selectedSession.customer.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedSession.customer.full_name}</CardTitle>
                    <CardDescription>{selectedSession.customer.email}</CardDescription>
                  </div>
                  <div className="ml-auto">
                    <Badge className={selectedSession.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}>
                      {selectedSession.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-grow p-4 bg-gray-50/50">
                <div className="space-y-4">
                  {isLoadingMessages && <p className="text-center text-sm text-muted-foreground">Loading messages...</p>}
                  {messages?.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender_id !== profile?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender?.avatar_url || ''} />
                          <AvatarFallback>{msg.sender?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`rounded-lg px-4 py-2 max-w-sm shadow-sm ${msg.sender_id === profile?.id ? 'bg-primary text-primary-foreground' : 'bg-white border'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Type your message..." 
                    disabled={sendMessageMutation.isPending || !profile?.id}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sendMessageMutation.isPending || !profile?.id} className="px-6">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-gray-50/50">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium">Select a chat to start conversation</p>
              <p className="text-sm">Choose from pending or active chats to begin helping customers</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LiveChatManagement;
