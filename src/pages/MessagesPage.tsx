import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useConversations, useMessages, Conversation } from '@/hooks/useMessaging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, ArrowLeft, Home, Loader2, 
  User, Clock, CheckCheck, Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const MessagesPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const { conversations, isLoading: loadingConvs, totalUnread } = useConversations();
  const { messages, isLoading: loadingMsgs, sendMessage, isSending } = useMessages(selectedId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/?auth=true');
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedId) inputRef.current?.focus();
  }, [selectedId]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setInput('');
    await sendMessage({ content: trimmed });
  };

  const selectedConv = conversations.find(c => c.id === selectedId);

  if (loading || !user) return null;

  // Mobile: show either list or thread
  const showThread = !!selectedId;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="flex h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] overflow-hidden rounded-none sm:rounded-xl border-0 sm:border border-border/30 bg-card">
          
          {/* Conversation List */}
          <div className={cn(
            "w-full sm:w-80 lg:w-96 border-r border-border/30 flex flex-col",
            showThread && "hidden sm:flex"
          )}>
            <div className="p-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Messages
                  {totalUnread > 0 && (
                    <Badge className="text-[9px] h-4 px-1.5">{totalUnread}</Badge>
                  )}
                </h2>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {loadingConvs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Start a conversation from any property listing
                  </p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/dijual')}>
                    Browse Properties
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {conversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === selectedId}
                      currentUserId={user.id}
                      onClick={() => navigate(`/messages?id=${conv.id}`)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Thread */}
          <div className={cn(
            "flex-1 flex flex-col",
            !showThread && "hidden sm:flex"
          )}>
            {selectedConv ? (
              <>
                {/* Thread Header */}
                <div className="p-3 border-b border-border/30 flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="sm:hidden h-8 w-8 p-0"
                    onClick={() => navigate('/messages')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConv.other_user_avatar} />
                    <AvatarFallback className="text-xs">
                      {selectedConv.other_user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{selectedConv.other_user_name}</p>
                    {selectedConv.property_title && (
                      <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                        <Home className="h-2.5 w-2.5" />
                        {selectedConv.property_title}
                      </p>
                    )}
                  </div>
                  {selectedConv.property_id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-7"
                      onClick={() => navigate(`/properties/${selectedConv.property_id}`)}
                    >
                      View Property
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3">
                  {loadingMsgs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Property card at top */}
                      {selectedConv.property_title && (
                        <div 
                          className="mx-auto max-w-xs p-2.5 rounded-xl bg-muted/40 border border-border/30 cursor-pointer hover:bg-muted/60 transition-colors mb-4"
                          onClick={() => navigate(`/properties/${selectedConv.property_id}`)}
                        >
                          {selectedConv.property_image && (
                            <img 
                              src={selectedConv.property_image} 
                              alt="" 
                              className="w-full h-24 object-cover rounded-lg mb-2" 
                            />
                          )}
                          <p className="text-xs font-medium text-center">{selectedConv.property_title}</p>
                        </div>
                      )}

                      <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                          const isMe = msg.sender_id === user.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.15 }}
                              className={cn("flex", isMe ? "justify-end" : "justify-start")}
                            >
                              <div className={cn(
                                "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
                                isMe 
                                  ? "bg-primary text-primary-foreground rounded-br-md" 
                                  : "bg-muted rounded-bl-md"
                              )}>
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <div className={cn(
                                  "flex items-center gap-1 mt-1",
                                  isMe ? "justify-end" : "justify-start"
                                )}>
                                  <span className={cn(
                                    "text-[9px]",
                                    isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                                  )}>
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                  </span>
                                  {isMe && (
                                    msg.is_read 
                                      ? <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                                      : <Check className="h-3 w-3 text-primary-foreground/40" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t border-border/30">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 h-10 rounded-full bg-muted/50 border-border/30"
                      disabled={isSending}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="h-10 w-10 rounded-full p-0"
                      disabled={!input.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationItem: React.FC<{
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}> = ({ conversation, isActive, currentUserId, onClick }) => {
  const unread = conversation.buyer_id === currentUserId 
    ? conversation.buyer_unread_count 
    : conversation.agent_unread_count;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left",
        isActive && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.other_user_avatar} />
          <AvatarFallback className="text-xs bg-primary/10">
            {conversation.other_user_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className={cn("text-xs truncate", unread > 0 ? "font-bold" : "font-medium")}>
            {conversation.other_user_name}
          </p>
          <span className="text-[9px] text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
          </span>
        </div>
        {conversation.property_title && (
          <p className="text-[9px] text-primary/70 truncate flex items-center gap-0.5">
            <Home className="h-2.5 w-2.5" />
            {conversation.source === 'rental' && (
              <span className="text-[7px] px-1 py-0 rounded bg-chart-1/10 text-chart-1 font-medium mr-0.5">Rental</span>
            )}
            {conversation.property_title}
          </p>
        )}
        {conversation.last_message_preview && (
          <p className={cn(
            "text-[10px] truncate mt-0.5",
            unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {conversation.last_message_preview}
          </p>
        )}
      </div>
    </button>
  );
};

export default MessagesPage;
