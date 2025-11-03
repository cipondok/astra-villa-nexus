import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, Calendar, User, MessageSquare, Search, X, Filter } from 'lucide-react';
import { format, parse } from 'date-fns';

interface MessageDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  reactionType: 'positive' | 'negative' | 'all';
  timeRange: number;
}

interface MessageDetail {
  id: string;
  message_id: string;
  message_content: string;
  reaction_type: 'positive' | 'negative';
  user_id: string | null;
  conversation_id: string | null;
  created_at: string;
  metadata: any;
}

export function MessageDetailsDialog({
  open,
  onOpenChange,
  selectedDate,
  reactionType,
  timeRange,
}: MessageDetailsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [conversationIdFilter, setConversationIdFilter] = useState('');

  const { data: messages, isLoading } = useQuery({
    queryKey: ['ai-message-details', selectedDate, reactionType, timeRange],
    queryFn: async () => {
      if (!selectedDate) return [];

      // Parse the date from "MMM dd" format
      const currentYear = new Date().getFullYear();
      const parsedDate = parse(selectedDate, 'MMM dd', new Date());
      parsedDate.setFullYear(currentYear);
      
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      let query = supabase
        .from('ai_message_reactions')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (reactionType !== 'all') {
        query = query.eq('reaction_type', reactionType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as MessageDetail[];
    },
    enabled: open && !!selectedDate,
  });

  // Filter messages based on search and filters
  const filteredMessages = useMemo(() => {
    if (!messages) return [];

    return messages.filter((message) => {
      // Search term filter - search in message content
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const contentMatch = message.message_content?.toLowerCase().includes(searchLower);
        const messageIdMatch = message.message_id?.toLowerCase().includes(searchLower);
        if (!contentMatch && !messageIdMatch) return false;
      }

      // User ID filter
      if (userIdFilter) {
        const userMatch = message.user_id?.toLowerCase().includes(userIdFilter.toLowerCase());
        if (!userMatch && userIdFilter.toLowerCase() !== 'anonymous') return false;
        if (userIdFilter.toLowerCase() === 'anonymous' && message.user_id) return false;
      }

      // Conversation ID filter
      if (conversationIdFilter) {
        const conversationMatch = message.conversation_id?.toLowerCase().includes(conversationIdFilter.toLowerCase());
        if (!conversationMatch) return false;
      }

      return true;
    });
  }, [messages, searchTerm, userIdFilter, conversationIdFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setUserIdFilter('');
    setConversationIdFilter('');
  };

  const hasActiveFilters = searchTerm || userIdFilter || conversationIdFilter;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages from {selectedDate}
          </DialogTitle>
          <DialogDescription>
            {reactionType === 'all' 
              ? 'All AI message reactions from this date'
              : `${reactionType === 'positive' ? 'Positive' : 'Negative'} reactions from this date`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="space-y-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by keyword or message ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="shrink-0"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="user-filter" className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                User ID Filter
              </Label>
              <Input
                id="user-filter"
                placeholder="Filter by user ID..."
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversation-filter" className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Conversation ID
              </Label>
              <Input
                id="conversation-filter"
                placeholder="Filter by conversation..."
                value={conversationIdFilter}
                onChange={(e) => setConversationIdFilter(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Showing {filteredMessages.length} of {messages?.length || 0} messages
            </span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Filters Active
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-[50vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="border border-border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                >
                  {/* Header with reaction and timestamp */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {message.reaction_type === 'positive' ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Positive
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Negative
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(message.created_at), 'HH:mm:ss')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      {message.user_id ? message.user_id.slice(0, 8) : 'Anonymous'}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">AI Response:</p>
                    <div className="bg-muted/50 rounded-md p-3 text-sm leading-relaxed">
                      {message.message_content || 'No message content available'}
                    </div>
                  </div>

                  {/* Metadata */}
                  {message.metadata && (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {message.conversation_id && (
                        <Badge variant="outline" className="text-xs">
                          Conversation: {message.conversation_id.slice(0, 8)}
                        </Badge>
                      )}
                      {message.metadata.property_id && (
                        <Badge variant="outline" className="text-xs">
                          Property: {message.metadata.property_id}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-1">
                {messages && messages.length > 0 ? 'No messages match your filters' : 'No messages found for this date'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs"
                >
                  Clear filters to see all messages
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
