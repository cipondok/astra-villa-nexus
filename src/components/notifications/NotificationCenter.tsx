/**
 * Smart Notification Center
 * Real-time notifications from Supabase with preference management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, BellOff, Settings, Check, X, Trash2, 
  TrendingDown, Home, MapPin, Sparkles, Search,
  ChevronLeft, Filter
} from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type NotificationType = 'price_drop' | 'new_match' | 'new_listing' | 'investment_opportunity' | 'saved_search' | 'message' | 'system';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  property_id?: string | null;
  metadata?: Record<string, any> | null;
}

const notificationIcons: Record<string, React.ReactNode> = {
  price_drop: <TrendingDown className="h-4 w-4 text-destructive" />,
  new_match: <Home className="h-4 w-4 text-primary" />,
  new_listing: <MapPin className="h-4 w-4 text-chart-1" />,
  investment_opportunity: <Sparkles className="h-4 w-4 text-chart-4" />,
  saved_search: <Search className="h-4 w-4 text-chart-5" />,
  message: <Bell className="h-4 w-4 text-muted-foreground" />,
  system: <Settings className="h-4 w-4 text-muted-foreground" />,
};

const notificationColors: Record<string, string> = {
  price_drop: 'border-l-destructive',
  new_match: 'border-l-primary',
  new_listing: 'border-l-chart-1',
  investment_opportunity: 'border-l-chart-4',
  saved_search: 'border-l-chart-5',
  message: 'border-l-muted-foreground',
  system: 'border-l-muted-foreground',
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch notifications from Supabase
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['in-app-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as AppNotification[];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Fetch notification preferences
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch saved search alerts
  const { data: savedSearches = [] } = useQuery({
    queryKey: ['saved-search-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('saved_search_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['in-app-notifications'] }),
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['in-app-notifications'] }),
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['in-app-notifications'] }),
  });

  // Update preferences
  const updatePrefMutation = useMutation({
    mutationFn: async (updates: Record<string, boolean>) => {
      if (!user) return;
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'in_app_notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['in-app-notifications'] });
        const n = payload.new as AppNotification;
        toast(n.title, { description: n.message });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredNotifications = filterType
    ? notifications.filter(n => n.type === filterType)
    : notifications;

  const filterOptions = [
    { type: null, label: 'All' },
    { type: 'price_drop', label: 'Price Drops' },
    { type: 'new_listing', label: 'New Listings' },
    { type: 'investment_opportunity', label: 'Investment' },
    { type: 'saved_search', label: 'Saved Searches' },
    { type: 'new_match', label: 'Matches' },
  ];

  const prefItems = [
    { key: 'price_changes', label: 'Price Drop Alerts', desc: 'When saved properties drop in price', icon: TrendingDown },
    { key: 'new_listings', label: 'New Listing Alerts', desc: 'New properties in your saved areas', icon: MapPin },
    { key: 'booking_updates', label: 'Investment Opportunities', desc: 'AI-detected investment opportunities', icon: Sparkles },
    { key: 'messages', label: 'Messages', desc: 'New messages from agents or owners', icon: Bell },
    { key: 'system_alerts', label: 'System Alerts', desc: 'Important account notifications', icon: Settings },
    { key: 'promotions', label: 'Weekly Digest', desc: 'Summary of new properties', icon: Home },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
          <SheetTitle className="text-base">
            {showSettings ? 'Notification Settings' : 'Notifications'}
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? <ChevronLeft className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          </Button>
        </SheetHeader>

        {showSettings ? (
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 space-y-4">
              {/* Channel toggles */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channels</p>
                {['push_enabled', 'email_enabled', 'sms_enabled'].map(ch => (
                  <div key={ch} className="flex items-center justify-between py-2">
                    <p className="text-sm font-medium capitalize">{ch.replace('_enabled', '').replace('_', ' ')}</p>
                    <Switch
                      checked={!!(preferences as any)?.[ch]}
                      onCheckedChange={(v) => updatePrefMutation.mutate({ [ch]: v })}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {/* Alert types */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alert Types</p>
                {prefItems.map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={!!(preferences as any)?.[key]}
                      onCheckedChange={(v) => updatePrefMutation.mutate({ [key]: v })}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              {/* Saved searches */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Saved Search Alerts ({savedSearches.length})
                </p>
                {savedSearches.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Save a search to get notified about new matching properties.
                  </p>
                ) : (
                  savedSearches.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between py-2 px-2 rounded-md bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.frequency} • {s.match_count} matches</p>
                      </div>
                      <Switch
                        checked={s.is_active}
                        onCheckedChange={async (v) => {
                          await supabase.from('saved_search_alerts').update({ is_active: v }).eq('id', s.id);
                          queryClient.invalidateQueries({ queryKey: ['saved-search-alerts'] });
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <>
            {/* Filter bar */}
            <div className="px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto">
              {filterOptions.map(f => (
                <Button
                  key={f.type || 'all'}
                  variant={filterType === f.type ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7 shrink-0"
                  onClick={() => setFilterType(f.type)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            {/* Actions bar */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 flex items-center justify-between border-b">
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => markAllReadMutation.mutate()}>
                  <Check className="h-3 w-3 mr-1" /> Mark all read
                </Button>
                <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
              </div>
            )}

            {/* Notification list */}
            <ScrollArea className="h-[calc(100vh-180px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll notify you about price drops, new listings, and investment opportunities
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors border-l-2',
                        notificationColors[n.type] || 'border-l-transparent',
                        n.is_read
                          ? 'bg-background hover:bg-muted/50'
                          : 'bg-primary/5 hover:bg-primary/10'
                      )}
                      onClick={() => {
                        if (!n.is_read) markReadMutation.mutate(n.id);
                        if (n.property_id) {
                          setIsOpen(false);
                          window.location.href = `/property/${n.property_id}`;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {notificationIcons[n.type] || <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              'text-sm truncate',
                              !n.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                            )}>
                              {n.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </span>
                            {!n.is_read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
