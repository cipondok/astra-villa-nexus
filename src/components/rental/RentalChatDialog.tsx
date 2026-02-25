import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageSquare } from "lucide-react";

interface RentalChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  propertyTitle: string;
}

interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

const RentalChatDialog = ({ open, onOpenChange, bookingId, propertyTitle }: RentalChatDialogProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["rental-chat", bookingId],
    enabled: open && !!bookingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_messages")
        .select("id, booking_id, sender_id, message, is_read, created_at, profiles:profiles!rental_messages_sender_id_fkey(full_name, avatar_url)")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data as unknown as ChatMessage[]) || [];
    },
    refetchInterval: open ? 5000 : false,
  });

  // Realtime subscription
  useEffect(() => {
    if (!open || !bookingId) return;
    const channel = supabase
      .channel(`rental-chat-${bookingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rental_messages", filter: `booking_id=eq.${bookingId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["rental-chat", bookingId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open, bookingId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (!open || !currentUserId || messages.length === 0) return;
    const unread = messages.filter(m => !m.is_read && m.sender_id !== currentUserId);
    if (unread.length > 0) {
      supabase
        .from("rental_messages")
        .update({ is_read: true })
        .in("id", unread.map(m => m.id))
        .then();
    }
  }, [open, messages, currentUserId]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.from("rental_messages").insert({
        booking_id: bookingId,
        sender_id: currentUserId!,
        message: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["rental-chat", bookingId] });
    },
  });

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || !currentUserId) return;
    sendMutation.mutate(text);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[70vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
          <DialogTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Chat — {propertyTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Messages area */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef as any}>
          <div className="py-3 space-y-2">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && messages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Belum ada pesan. Mulai percakapan!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              const senderName = msg.profiles?.full_name || "User";
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {!isMe && (
                      <p className="text-[8px] font-semibold mb-0.5 opacity-70">{senderName}</p>
                    )}
                    <p className="text-xs leading-relaxed break-words">{msg.message}</p>
                    <p className={`text-[7px] mt-0.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 border-t border-border">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="text-xs h-9"
              disabled={sendMutation.isPending}
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 p-0 flex-shrink-0"
              disabled={!newMessage.trim() || sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentalChatDialog;
