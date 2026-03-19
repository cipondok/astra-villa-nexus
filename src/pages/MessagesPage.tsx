import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useConversations, useMessages, Conversation } from '@/hooks/useMessaging';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  MessageSquare, Send, ArrowLeft, Home, Loader2,
  User, Clock, CheckCheck, Check, Paperclip, Image,
  FileText, Calendar, Link2, Search, Filter,
  Building2, Zap, Eye, Star, MoreVertical,
  CalendarPlus, ExternalLink, MapPin, Phone,
  AlertCircle, Handshake, TrendingUp, Archive,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

// ─── Conversation Priority / Stage Logic ─────────────────────────────────────

type ConversationStage = 'general' | 'inquiry' | 'viewing' | 'negotiation' | 'closing';

function inferStage(conv: Conversation): ConversationStage {
  const preview = (conv.last_message_preview || '').toLowerCase();
  if (preview.includes('offer') || preview.includes('counter') || preview.includes('negotiat') || preview.includes('harga') || preview.includes('tawaran'))
    return 'negotiation';
  if (preview.includes('viewing') || preview.includes('visit') || preview.includes('jadwal') || preview.includes('lihat'))
    return 'viewing';
  if (preview.includes('closing') || preview.includes('deal') || preview.includes('contract') || preview.includes('akad'))
    return 'closing';
  if (conv.property_id) return 'inquiry';
  return 'general';
}

const STAGE_CONFIG: Record<ConversationStage, { label: string; color: string; icon: React.ElementType; priority: number }> = {
  closing: { label: 'Closing', color: 'text-chart-2 bg-chart-2/10 border-chart-2/30', icon: CheckCheck, priority: 4 },
  negotiation: { label: 'Negotiation', color: 'text-chart-4 bg-chart-4/10 border-chart-4/30', icon: Handshake, priority: 3 },
  viewing: { label: 'Viewing', color: 'text-primary bg-primary/10 border-primary/30', icon: Eye, priority: 2 },
  inquiry: { label: 'Inquiry', color: 'text-chart-3 bg-chart-3/10 border-chart-3/30', icon: MessageSquare, priority: 1 },
  general: { label: 'General', color: 'text-muted-foreground bg-muted/20 border-border/30', icon: MessageSquare, priority: 0 },
};

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread' | 'negotiation' | 'property';

// ─── Action Shortcuts ────────────────────────────────────────────────────────

function ActionShortcuts({ conv, onSendMessage }: {
  conv: Conversation;
  onSendMessage: (content: string) => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const scheduleViewing = () => {
    const msg = `📅 I'd like to schedule a property viewing for "${conv.property_title || 'this property'}". Could you suggest available dates and times?`;
    onSendMessage(msg);
    setOpen(false);
    toast.success('Viewing request sent');
  };

  const sharePropertyLink = () => {
    if (conv.property_id) {
      const link = `${window.location.origin}/properties/${conv.property_id}`;
      const msg = `🏠 Here's the property link: ${link}\n\n${conv.property_title || 'Property Details'}`;
      onSendMessage(msg);
      setOpen(false);
    }
  };

  const requestDocuments = () => {
    const msg = `📋 Could you share the property documents for "${conv.property_title || 'this property'}"? (Certificate, floor plan, tax records)`;
    onSendMessage(msg);
    setOpen(false);
  };

  const sendPriceInquiry = () => {
    const msg = `💰 I'm interested in the pricing details for "${conv.property_title || 'this property'}". Is the price negotiable?`;
    onSendMessage(msg);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
          <Zap className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start" side="top">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">Quick Actions</p>
        <div className="space-y-0.5">
          <button
            onClick={scheduleViewing}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-foreground">Schedule Viewing</span>
          </button>
          {conv.property_id && (
            <button
              onClick={sharePropertyLink}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
            >
              <ExternalLink className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-xs text-foreground">Share Property Link</span>
            </button>
          )}
          <button
            onClick={requestDocuments}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
          >
            <FileText className="h-3.5 w-3.5 text-chart-3" />
            <span className="text-xs text-foreground">Request Documents</span>
          </button>
          <button
            onClick={sendPriceInquiry}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
          >
            <TrendingUp className="h-3.5 w-3.5 text-chart-4" />
            <span className="text-xs text-foreground">Price Inquiry</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Attachment Button ───────────────────────────────────────────────────────

function AttachmentButton({ onSendMessage }: { onSendMessage: (content: string) => void }) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMessage(`📎 [Attachment: ${file.name}] (${(file.size / 1024).toFixed(0)} KB)`);
      toast.info('File attachment shared');
      setOpen(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
            <Paperclip className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1.5" align="start" side="top">
          <div className="space-y-0.5">
            <button
              onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 text-left"
            >
              <Image className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-xs">Photo / Image</span>
            </button>
            <button
              onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted/50 text-left"
            >
              <FileText className="h-3.5 w-3.5 text-chart-3" />
              <span className="text-xs">Document</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

// ─── Conversation Item ───────────────────────────────────────────────────────

const ConversationItem: React.FC<{
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}> = ({ conversation, isActive, currentUserId, onClick }) => {
  const unread = conversation.buyer_id === currentUserId
    ? conversation.buyer_unread_count
    : conversation.agent_unread_count;

  const stage = inferStage(conversation);
  const stageCfg = STAGE_CONFIG[stage];
  const StageIcon = stageCfg.icon;
  const isHighPriority = stage === 'negotiation' || stage === 'closing';

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-all text-left relative",
        isActive && "bg-primary/5",
        isHighPriority && !isActive && unread > 0 && "bg-chart-4/3",
      )}
    >
      {/* Priority left accent */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-all",
        isActive ? "bg-primary" : isHighPriority ? (stage === 'negotiation' ? "bg-chart-4" : "bg-chart-2") : "bg-transparent"
      )} />

      <div className="relative ml-0.5">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.other_user_avatar} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {conversation.other_user_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className={cn("text-xs truncate", unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground")}>
            {conversation.other_user_name}
          </p>
          <span className="text-[9px] text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
          </span>
        </div>

        {/* Property + Stage tags */}
        <div className="flex items-center gap-1 mt-0.5">
          {conversation.property_title && (
            <span className="text-[9px] text-primary/70 truncate flex items-center gap-0.5 max-w-[60%]">
              <Home className="h-2.5 w-2.5 flex-shrink-0" />
              {conversation.source === 'rental' && (
                <span className="text-[7px] px-1 rounded bg-chart-1/10 text-chart-1 font-medium">Rental</span>
              )}
              {conversation.property_title}
            </span>
          )}
          {stage !== 'general' && (
            <Badge variant="outline" className={cn('text-[7px] h-3.5 px-1 py-0 border', stageCfg.color)}>
              <StageIcon className="h-2 w-2 mr-0.5" />
              {stageCfg.label}
            </Badge>
          )}
        </div>

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

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg, isMe }: { msg: { id: string; content: string; created_at: string; is_read: boolean }; isMe: boolean }) {
  const isPropertyLink = msg.content.includes('/properties/');
  const isActionMsg = msg.content.startsWith('📅') || msg.content.startsWith('📋') || msg.content.startsWith('📎') || msg.content.startsWith('💰');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn("flex", isMe ? "justify-end" : "justify-start")}
    >
      <div className={cn(
        "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
        isMe
          ? "bg-primary text-primary-foreground rounded-br-lg"
          : "bg-muted/60 border border-border/30 rounded-bl-lg",
        isActionMsg && !isMe && "bg-chart-2/5 border-chart-2/20",
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
            {format(new Date(msg.created_at), 'HH:mm')}
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
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const MessagesPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const { conversations, isLoading: loadingConvs, totalUnread } = useConversations();
  const { messages, isLoading: loadingMsgs, sendMessage, isSending } = useMessages(selectedId);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
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

  const handleSend = async (content?: string) => {
    const text = content || input.trim();
    if (!text || isSending) return;
    if (!content) setInput('');
    await sendMessage({ content: text });
  };

  const selectedConv = conversations.find(c => c.id === selectedId);
  const showThread = !!selectedId;

  // Filter & sort conversations
  const filteredConversations = useMemo(() => {
    let list = conversations;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.other_user_name?.toLowerCase().includes(q) ||
        c.property_title?.toLowerCase().includes(q) ||
        c.last_message_preview?.toLowerCase().includes(q)
      );
    }

    // Tab filter
    switch (filterTab) {
      case 'unread':
        list = list.filter(c => {
          const unread = c.buyer_id === user?.id ? c.buyer_unread_count : c.agent_unread_count;
          return unread > 0;
        });
        break;
      case 'negotiation':
        list = list.filter(c => {
          const stage = inferStage(c);
          return stage === 'negotiation' || stage === 'closing';
        });
        break;
      case 'property':
        list = list.filter(c => !!c.property_id);
        break;
    }

    // Priority sort: negotiation/closing first, then by date
    return [...list].sort((a, b) => {
      const aPriority = STAGE_CONFIG[inferStage(a)].priority;
      const bPriority = STAGE_CONFIG[inferStage(b)].priority;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });
  }, [conversations, searchQuery, filterTab, user?.id]);

  // Stats
  const negotiationCount = conversations.filter(c => inferStage(c) === 'negotiation' || inferStage(c) === 'closing').length;

  if (loading || !user) return null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
          <div className="flex h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] overflow-hidden rounded-none sm:rounded-xl border-0 sm:border border-border/30 bg-card">

            {/* ── Conversation List Panel ── */}
            <div className={cn(
              "w-full sm:w-80 lg:w-[22rem] border-r border-border/30 flex flex-col",
              showThread && "hidden sm:flex"
            )}>
              {/* Header */}
              <div className="p-3 border-b border-border/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Messages
                    {totalUnread > 0 && (
                      <Badge className="text-[9px] h-4 px-1.5 bg-primary">{totalUnread}</Badge>
                    )}
                  </h2>
                  {negotiationCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-[8px] text-chart-4 border-chart-4/30 gap-0.5">
                          <Handshake className="h-2.5 w-2.5" /> {negotiationCount} Active
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">Active negotiation conversations</TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="h-8 pl-8 text-xs bg-muted/30 border-border/30 rounded-lg"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1">
                  {([
                    { key: 'all' as FilterTab, label: 'All' },
                    { key: 'unread' as FilterTab, label: `Unread${totalUnread > 0 ? ` (${totalUnread})` : ''}` },
                    { key: 'negotiation' as FilterTab, label: 'Deals' },
                    { key: 'property' as FilterTab, label: 'Property' },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterTab(tab.key)}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md transition-colors",
                        filterTab === tab.key
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation List */}
              <ScrollArea className="flex-1">
                {loadingConvs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery || filterTab !== 'all' ? 'No matching conversations' : 'No conversations yet'}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {searchQuery ? 'Try a different search term' : 'Start a conversation from any property listing'}
                    </p>
                    {!searchQuery && filterTab === 'all' && (
                      <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => navigate('/dijual')}>
                        <Building2 className="h-3.5 w-3.5 mr-1.5" /> Browse Properties
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border/10">
                    {filteredConversations.map((conv) => (
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

            {/* ── Chat Window ── */}
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
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={selectedConv.other_user_avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {selectedConv.other_user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate text-foreground">{selectedConv.other_user_name}</p>
                        {(() => {
                          const stage = inferStage(selectedConv);
                          const cfg = STAGE_CONFIG[stage];
                          const Icon = cfg.icon;
                          return stage !== 'general' ? (
                            <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5 border', cfg.color)}>
                              <Icon className="h-2.5 w-2.5 mr-0.5" />
                              {cfg.label}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                      {selectedConv.property_title && (
                        <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                          <Home className="h-2.5 w-2.5" />
                          {selectedConv.property_title}
                        </p>
                      )}
                    </div>
                    {selectedConv.property_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-7 gap-1 hidden sm:flex"
                        onClick={() => navigate(`/properties/${selectedConv.property_id}`)}
                      >
                        <Eye className="h-3 w-3" /> View Property
                      </Button>
                    )}
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {loadingMsgs ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-w-2xl mx-auto">
                        {/* Property Context Card */}
                        {selectedConv.property_title && (
                          <div
                            className="mx-auto max-w-xs p-3 rounded-xl bg-muted/30 border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors mb-4"
                            onClick={() => navigate(`/properties/${selectedConv.property_id}`)}
                          >
                            {selectedConv.property_image && (
                              <img
                                src={selectedConv.property_image}
                                alt=""
                                className="w-full h-24 object-cover rounded-lg mb-2"
                              />
                            )}
                            <p className="text-xs font-medium text-center text-foreground">{selectedConv.property_title}</p>
                            <p className="text-[9px] text-muted-foreground text-center mt-0.5 flex items-center justify-center gap-1">
                              <MapPin className="h-2.5 w-2.5" /> Tap to view details
                            </p>
                          </div>
                        )}

                        <AnimatePresence initial={false}>
                          {messages.map((msg) => (
                            <MessageBubble
                              key={msg.id}
                              msg={msg}
                              isMe={msg.sender_id === user.id}
                            />
                          ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-3 border-t border-border/30 bg-card">
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                      className="flex items-center gap-1.5 max-w-2xl mx-auto"
                    >
                      <AttachmentButton onSendMessage={(msg) => handleSend(msg)} />
                      <ActionShortcuts conv={selectedConv} onSendMessage={(msg) => handleSend(msg)} />
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-10 rounded-full bg-muted/30 border-border/30 text-sm px-4"
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
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto">
                      <MessageSquare className="h-8 w-8 text-primary/30" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Select a conversation</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose from your existing conversations or start a new one from a property listing
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MessagesPage;
