import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Bell, BellOff, Check, Trash2, Search, Filter,
  TrendingDown, Home, MapPin, Sparkles, Settings,
  ShieldAlert, FileText, Briefcase, Building2,
  MessageSquare, ArrowLeft, Loader2, CheckCircle2
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  property_id?: string | null;
  metadata?: Record<string, any> | null;
}

const NOTIFICATION_CATEGORIES = {
  all: { label: 'All', icon: Bell },
  investor: { label: 'Investor', icon: TrendingDown },
  transaction: { label: 'Transactions', icon: Briefcase },
  property: { label: 'Property', icon: Building2 },
  system: { label: 'System', icon: Settings },
};

const INVESTOR_TYPES = ['elite_opportunity', 'price_drop', 'watchlist_update', 'portfolio_risk', 'deal_alert', 'investment_opportunity'];
const TRANSACTION_TYPES = ['offer_received', 'negotiation_update', 'booking_confirmation', 'document_progress', 'service_request'];
const PROPERTY_TYPES = ['new_listing', 'new_match', 'listing_approved', 'project_inquiry', 'saved_search'];
const SYSTEM_TYPES = ['system', 'message'];

function categorize(type: string): string {
  if (INVESTOR_TYPES.includes(type)) return 'investor';
  if (TRANSACTION_TYPES.includes(type)) return 'transaction';
  if (PROPERTY_TYPES.includes(type)) return 'property';
  return 'system';
}

const TYPE_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  elite_opportunity: { icon: Sparkles, color: 'text-chart-3', label: 'Elite Opportunity' },
  price_drop: { icon: TrendingDown, color: 'text-destructive', label: 'Price Drop' },
  watchlist_update: { icon: Search, color: 'text-chart-2', label: 'Watchlist Update' },
  portfolio_risk: { icon: ShieldAlert, color: 'text-chart-3', label: 'Portfolio Risk' },
  deal_alert: { icon: Sparkles, color: 'text-chart-1', label: 'Deal Alert' },
  investment_opportunity: { icon: Sparkles, color: 'text-chart-4', label: 'Investment Opportunity' },
  offer_received: { icon: Briefcase, color: 'text-chart-1', label: 'Offer Received' },
  negotiation_update: { icon: MessageSquare, color: 'text-chart-2', label: 'Negotiation Update' },
  booking_confirmation: { icon: CheckCircle2, color: 'text-chart-1', label: 'Booking Confirmed' },
  document_progress: { icon: FileText, color: 'text-chart-4', label: 'Document Progress' },
  service_request: { icon: Briefcase, color: 'text-chart-5', label: 'Service Request' },
  new_listing: { icon: MapPin, color: 'text-chart-1', label: 'New Listing' },
  new_match: { icon: Home, color: 'text-primary', label: 'New Match' },
  listing_approved: { icon: CheckCircle2, color: 'text-chart-1', label: 'Listing Approved' },
  project_inquiry: { icon: Building2, color: 'text-chart-3', label: 'Project Inquiry' },
  saved_search: { icon: Search, color: 'text-chart-5', label: 'Saved Search' },
  system: { icon: Settings, color: 'text-muted-foreground', label: 'System' },
  message: { icon: MessageSquare, color: 'text-muted-foreground', label: 'Message' },
};

const NotificationsHub: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-hub', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('in_app_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-hub'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from('in_app_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', user.id).eq('is_read', false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-hub'] }),
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('in_app_notifications').delete().eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-hub'] }),
  });

  if (loading || !user) return null;

  const filtered = notifications.filter((n) => {
    const catMatch = category === 'all' || categorize(n.type) === category;
    const searchMatch = !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const unreadByCategory = {
    all: notifications.filter(n => !n.is_read).length,
    investor: notifications.filter(n => !n.is_read && categorize(n.type) === 'investor').length,
    transaction: notifications.filter(n => !n.is_read && categorize(n.type) === 'transaction').length,
    property: notifications.filter(n => !n.is_read && categorize(n.type) === 'property').length,
    system: notifications.filter(n => !n.is_read && categorize(n.type) === 'system').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> Notifications
                </h1>
                <p className="text-xs text-muted-foreground">{unreadByCategory.all} unread</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1" onClick={() => markAllRead.mutate()} disabled={unreadByCategory.all === 0}>
                <Check className="h-3 w-3" /> Mark all read
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => navigate('/messages')}>
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/30 text-sm"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {Object.entries(NOTIFICATION_CATEGORIES).map(([key, { label, icon: Icon }]) => (
              <Button
                key={key}
                variant={category === key ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8 gap-1.5 shrink-0"
                onClick={() => setCategory(key)}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {(unreadByCategory as any)[key] > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px] ml-0.5">
                    {(unreadByCategory as any)[key]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              const Icon = meta.icon;
              return (
                <Card
                  key={n.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md border-l-2',
                    n.is_read ? 'bg-card/50 border-l-transparent' : 'bg-primary/5 border-l-primary shadow-sm'
                  )}
                  onClick={() => {
                    if (!n.is_read) markRead.mutate(n.id);
                    if (n.property_id) navigate(`/property/${n.property_id}`);
                  }}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('p-2 rounded-lg shrink-0', n.is_read ? 'bg-muted/50' : 'bg-primary/10')}>
                        <Icon className={cn('h-4 w-4', meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn('text-sm truncate', !n.is_read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                              <Badge variant="outline" className="text-[9px] shrink-0">{meta.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                          {n.property_id && (
                            <Badge variant="outline" className="text-[9px] gap-0.5">
                              <Home className="h-2.5 w-2.5" /> Property
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsHub;
