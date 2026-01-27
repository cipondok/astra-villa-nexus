/**
 * Notification Center Component
 * Displays notifications and manages preferences
 */

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Check, X, ChevronRight, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import pushNotificationService, { NotificationPreferences } from '@/services/notifications/PushNotificationService';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'price_drop' | 'new_match' | 'message' | 'system';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    priceDrops: true,
    newMatches: true,
    messages: true,
    marketUpdates: false,
    systemAlerts: true,
    weeklyDigest: false
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadPreferences();
      checkSubscription();
    }
  }, [user]);

  const loadNotifications = () => {
    // Load from localStorage for demo
    const stored = localStorage.getItem(`notifications_${user?.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    }
  };

  const loadPreferences = () => {
    if (user) {
      const prefs = pushNotificationService.getPreferences(user.id);
      setPreferences(prefs);
    }
  };

  const checkSubscription = async () => {
    if (user) {
      const status = await pushNotificationService.getSubscriptionStatus(user.id);
      setIsSubscribed(status.isSubscribed);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      await pushNotificationService.initialize();
      await pushNotificationService.subscribe(user.id);
      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;
    
    try {
      await pushNotificationService.unsubscribe(user.id);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;
    
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    pushNotificationService.updatePreferences(user.id, updated);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    saveNotifications();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    saveNotifications();
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    saveNotifications();
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications();
  };

  const saveNotifications = () => {
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_drop': return '📉';
      case 'new_match': return '🏠';
      case 'message': return '💬';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between pb-4">
          <SheetTitle>Notifications</SheetTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {showSettings ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(false)}
                className="flex items-center gap-1"
              >
                ← Back
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {isSubscribed ? 'Enabled on this device' : 'Not enabled'}
                  </p>
                </div>
                <Button
                  variant={isSubscribed ? 'outline' : 'default'}
                  size="sm"
                  onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                >
                  {isSubscribed ? <BellOff className="h-4 w-4 mr-1" /> : <Bell className="h-4 w-4 mr-1" />}
                  {isSubscribed ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Notification Types</p>
                
                {[
                  { key: 'priceDrops', label: 'Price Drops', desc: 'When saved properties drop in price' },
                  { key: 'newMatches', label: 'New Matches', desc: 'New properties matching your criteria' },
                  { key: 'messages', label: 'Messages', desc: 'New messages from agents or owners' },
                  { key: 'marketUpdates', label: 'Market Updates', desc: 'Weekly market insights' },
                  { key: 'systemAlerts', label: 'System Alerts', desc: 'Important account notifications' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of new properties' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={preferences[key as keyof NotificationPreferences] as boolean}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange(key as keyof NotificationPreferences, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {notifications.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}

            <ScrollArea className="h-[calc(100vh-200px)]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll notify you about price drops, new matches, and more
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.read 
                          ? 'bg-background hover:bg-muted/50' 
                          : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${!notification.read && 'text-primary'}`}>
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.body}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
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
