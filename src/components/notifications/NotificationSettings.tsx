import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Check, 
  Settings, 
  Moon,
  Home,
  DollarSign,
  Calendar,
  MessageSquare,
  Tag,
  AlertCircle,
  Mail,
  Smartphone,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { usePushNotifications, NotificationPreferences } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationSettingsProps {
  className?: string;
  showHistory?: boolean;
}

export function NotificationSettings({ className, showHistory = true }: NotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    notifications,
    unreadCount,
    subscribe,
    unsubscribe,
    updatePreferences,
    markAsRead,
    markAllAsRead,
  } = usePushNotifications();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTogglePush = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean | string) => {
    await updatePreferences({ [key]: value });
  };

  const notificationTypes = [
    { key: 'new_listings', label: 'New Listings', icon: Home, desc: 'Properties matching your criteria' },
    { key: 'price_changes', label: 'Price Changes', icon: DollarSign, desc: 'Price drops on saved properties' },
    { key: 'booking_updates', label: 'Booking Updates', icon: Calendar, desc: 'Viewing and booking confirmations' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, desc: 'New messages from agents' },
    { key: 'promotions', label: 'Promotions', icon: Tag, desc: 'Special offers and deals' },
    { key: 'system_alerts', label: 'System Alerts', icon: AlertCircle, desc: 'Important account notifications' },
  ];

  const getNotificationIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.key === type.replace('_', ''));
    return typeConfig?.icon || Bell;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Push Notification Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Push Notifications</CardTitle>
            </div>
            {isSubscribed && (
              <Badge className="bg-green-100 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
          </div>
          <CardDescription>
            Receive instant alerts for new listings, price changes, and messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <BellOff className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Push notifications are not supported in this browser
              </p>
            </div>
          ) : permission === 'denied' ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <BellOff className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Notifications Blocked
                </p>
                <p className="text-xs text-red-600 dark:text-red-300">
                  Enable notifications in your browser settings
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get real-time updates on your device
                </p>
              </div>
              <Button
                variant={isSubscribed ? "outline" : "default"}
                onClick={handleTogglePush}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Delivery Methods */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Delivery Methods</Label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Push Notifications</span>
                </div>
                <Switch
                  checked={preferences.push_enabled}
                  onCheckedChange={(v) => handlePreferenceChange('push_enabled', v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email Notifications</span>
                </div>
                <Switch
                  checked={preferences.email_enabled}
                  onCheckedChange={(v) => handlePreferenceChange('email_enabled', v)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notificationTypes.map(({ key, label, icon: Icon, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">{label}</span>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch
                checked={preferences[key as keyof NotificationPreferences] as boolean}
                onCheckedChange={(v) => handlePreferenceChange(key as keyof NotificationPreferences, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Quiet Hours</Label>
            <Switch
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(v) => handlePreferenceChange('quiet_hours_enabled', v)}
            />
          </div>
          
          {preferences.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_start_time}
                  onChange={(e) => handlePreferenceChange('quiet_start_time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_end_time}
                  onChange={(e) => handlePreferenceChange('quiet_end_time', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {notifications.slice(0, 20).map((notification) => {
                    const Icon = getNotificationIcon(notification.notification_type);
                    return (
                      <div
                        key={notification.id}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          notification.is_read 
                            ? "bg-muted/30" 
                            : "bg-primary/5 border-l-2 border-primary"
                        )}
                      >
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            !notification.is_read && "font-medium"
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {notification.action_url && (
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
