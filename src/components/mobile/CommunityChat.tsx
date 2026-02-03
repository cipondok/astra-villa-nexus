import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, Send, Users, MapPin, Image, 
  Home, ArrowLeft, Plus, Search, Pin
} from "lucide-react";

interface CommunityChatProps {
  neighborhoodId?: string;
}

const CommunityChat = ({ neighborhoodId }: CommunityChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(neighborhoodId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch neighborhoods
  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["neighborhoods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_neighborhoods")
        .select("*")
        .eq("is_active", true)
        .order("member_count", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch user memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ["neighborhood-memberships", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("mobile_neighborhood_members")
        .select("neighborhood_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(m => m.neighborhood_id);
    },
    enabled: !!user
  });

  // Fetch messages for selected neighborhood
  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", selectedNeighborhood],
    queryFn: async () => {
      if (!selectedNeighborhood) return [];
      const { data, error } = await supabase
        .from("mobile_chat_messages")
        .select("*, profiles(full_name, avatar_url)")
        .eq("neighborhood_id", selectedNeighborhood)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedNeighborhood,
    refetchInterval: 3000 // Poll for new messages
  });

  // Get current neighborhood details
  const currentNeighborhood = neighborhoods.find(n => n.id === selectedNeighborhood);
  const isMember = memberships.includes(selectedNeighborhood || "");

  // Join neighborhood mutation
  const joinNeighborhood = useMutation({
    mutationFn: async (neighborhoodId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("mobile_neighborhood_members").insert({
        neighborhood_id: neighborhoodId,
        user_id: user.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["neighborhood-memberships"] });
      queryClient.invalidateQueries({ queryKey: ["neighborhoods"] });
      toast({ title: "Joined community!" });
    }
  });

  // Leave neighborhood mutation
  const leaveNeighborhood = useMutation({
    mutationFn: async (neighborhoodId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("mobile_neighborhood_members")
        .delete()
        .eq("neighborhood_id", neighborhoodId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["neighborhood-memberships"] });
      queryClient.invalidateQueries({ queryKey: ["neighborhoods"] });
      toast({ title: "Left community" });
    }
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !selectedNeighborhood) throw new Error("Not ready");
      const { error } = await supabase.from("mobile_chat_messages").insert({
        neighborhood_id: selectedNeighborhood,
        sender_id: user.id,
        content,
        message_type: "text"
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedNeighborhood] });
      setMessage("");
    }
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!selectedNeighborhood) return;

    const channel = supabase
      .channel(`chat-${selectedNeighborhood}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mobile_chat_messages",
          filter: `neighborhood_id=eq.${selectedNeighborhood}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedNeighborhood] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedNeighborhood, queryClient]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message.trim());
  };

  // Neighborhood list view
  if (!selectedNeighborhood) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background border-b p-4 z-10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Community Chat
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect with neighbors and property seekers
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* My Communities */}
          {memberships.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                My Communities
              </h2>
              <div className="space-y-2">
                {neighborhoods
                  .filter(n => memberships.includes(n.id))
                  .map((neighborhood) => (
                    <Card 
                      key={neighborhood.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-primary/30"
                      onClick={() => setSelectedNeighborhood(neighborhood.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{neighborhood.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {neighborhood.member_count} members
                            </p>
                          </div>
                          <Badge variant="secondary">Joined</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Discover */}
          <div>
            <h2 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
              Discover Communities
            </h2>
            <div className="space-y-2">
              {neighborhoods
                .filter(n => !memberships.includes(n.id))
                .map((neighborhood) => (
                  <Card 
                    key={neighborhood.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      if (user) {
                        joinNeighborhood.mutate(neighborhood.id);
                        setSelectedNeighborhood(neighborhood.id);
                      } else {
                        toast({ 
                          title: "Sign in required", 
                          description: "Please sign in to join communities" 
                        });
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {neighborhood.cover_image_url ? (
                          <img 
                            src={neighborhood.cover_image_url}
                            alt={neighborhood.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{neighborhood.name}</h3>
                          <p className="text-sm text-muted-foreground">{neighborhood.city}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {neighborhood.member_count} members
                          </p>
                        </div>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </div>
                      {neighborhood.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {neighborhood.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Chat header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedNeighborhood(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold">{currentNeighborhood?.name}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {currentNeighborhood?.member_count} members
            </p>
          </div>
          {isMember && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => leaveNeighborhood.mutate(selectedNeighborhood)}
            >
              Leave
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const profile = msg.profiles as any;
            
            return (
              <div 
                key={msg.id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${isOwn ? "items-end" : ""}`}>
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {profile?.full_name || "Anonymous"}
                    </p>
                  )}
                  <div 
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    {msg.is_pinned && (
                      <Pin className="h-3 w-3 inline mr-1" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No messages yet</p>
            <p className="text-sm">Be the first to say hello!</p>
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      {isMember && user ? (
        <div className="border-t p-4 bg-background">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Image className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1"
            />
            <Button 
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t p-4 bg-background text-center">
          {!user ? (
            <Button onClick={() => window.location.href = "/auth"}>
              Sign in to chat
            </Button>
          ) : (
            <Button onClick={() => joinNeighborhood.mutate(selectedNeighborhood)}>
              Join to start chatting
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityChat;
