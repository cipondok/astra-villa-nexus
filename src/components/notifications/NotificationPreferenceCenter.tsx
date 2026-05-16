import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  BellOff,
  BellRing,
  TrendingDown,
  Home,
  MessageSquare,
  Calendar,
  BarChart3,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Clock,
  Volume2,
  VolumeX,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { usePushNotifications, NotificationPreferences } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  color: string;
}

export const NotificationPreferenceCenter: React.FC = () => {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    permission,
    preferences,
    isLoading,
    subscribe,
    unsubscribe,
    updatePreferences,
    notifications,
    unreadCount,
    markAllAsRead
  } = usePushNotifications();

  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(preferences);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPrefs(preferences);
    setQuietHoursStart(preferences.quiet_start_time || '22:00');
    setQuietHoursEnd(preferences.quiet_end_time || '07:00');
  }, [preferences]);

  const notificationTypes: NotificationChannel[] = [
    {
      id: 'priceDrops',
      name: 'Price Drop Alerts',
      description: 'When properties in your favorites drop in price',
      icon: TrendingDown,
      enabled: localPrefs.priceDrops,
      color: 'text-chart-1'
    },
    {
      id: 'newMatches',
      name: 'New Property Matches',
      description: 'Properties matching your saved search criteria',
      icon: Home,
      enabled: localPrefs.newMatches,
      color: 'text-chart-4'
    },
    {
      id: 'messageAlerts',
      name: 'Messages',
      description: 'New messages from agents and property owners',
      icon: MessageSquare,
      enabled: localPrefs.messageAlerts,
      color: 'text-accent'
    },
    {
      id: 'marketUpdates',
      name: 'Market Insights',
      description: 'Weekly market reports and investment tips',
      icon: BarChart3,
      enabled: localPrefs.marketUpdates,
      color: 'text-chart-4'
    },
    {
      id: 'dailyDigest',
      name: 'Daily Digest',
      description: 'Summary of activity and new listings',
      icon: Calendar,
      enabled: localPrefs.dailyDigest,
      color: 'text-chart-3'
    }
  ];

  const handleToggle = (id: string, value: boolean) => {
    setLocalPrefs(prev => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const handleChannelToggle = (channel: 'push_enabled' | 'email_enabled', value: boolean) => {
    setLocalPrefs(prev => ({ ...prev, [channel]: value }));
    setHasChanges(true);
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    setLocalPrefs(prev => ({ ...prev, quiet_hours_enabled: enabled }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await updatePreferences({
      ...localPrefs,
      quiet_start_time: quietHoursStart,
      quiet_end_time: quietHoursEnd
    });
    
    if (success) {
      setHasChanges(false);
    }
  };

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) {
      toast.success('Push notifications enabled!');
    }
  };

  const handleDisableNotifications = async () => {
    const success = await unsubscribe();
    if (success) {
      toast.success('Push notifications disabled');
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return { icon: AlertCircle, text: 'Not Supported', color: 'text-muted-foreground' };
    }
    if (permission === 'denied') {
      return { icon: BellOff, text: 'Blocked by Browser', color: 'text-destructive' };
    }
    if (isSubscribed) {
      return { icon: BellRing, text: 'Active', color: 'text-chart-1' };
    }
    return { icon: Bell, text: 'Not Enabled', color: 'text-chart-3' };
  };

  const status = getPermissionStatus();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-muted ${status.color}`}>
                <status.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Push Notifications</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Status: <Badge variant={isSubscribed ? 'default' : 'secondary'}>{status.text}</Badge>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            {isSubscribed ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisableNotifications}
                disabled={isLoading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Disable
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={handleEnableNotifications}
                disabled={isLoading || permission === 'denied'}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </Button>
            )}
          </div>
        </CardHeader>
        
        {permission === 'denied' && (
          <CardContent className="pt-0">
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Notifications Blocked</p>
                <p className="text-xs mt-1">
                  You've blocked notifications for this site. To enable them, click the lock icon 
                  in your browser's address bar and allow notifications.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>Choose which notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => (
            <div 
              key={type.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${type.color}`}>
                  <type.icon className="h-4 w-4" />
                </div>
                <div>
                  <Label className="font-medium cursor-pointer">{type.name}</Label>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
              <Switch
                checked={type.enabled}
                onCheckedChange={(checked) => handleToggle(type.id, checked)}
                disabled={!isSubscribed && type.id !== 'marketUpdates'}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Channels</CardTitle>
          <CardDescription>How you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser and mobile push alerts</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.push_enabled}
              onCheckedChange={(checked) => handleChannelToggle('push_enabled', checked)}
              disabled={!isSubscribed}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <Mail className="h-4 w-4 text-chart-4" />
              </div>
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.email_enabled}
              onCheckedChange={(checked) => handleChannelToggle('email_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
              <CardDescription>Pause notifications during specific times</CardDescription>
            </div>
            <Switch
              checked={localPrefs.quiet_hours_enabled}
              onCheckedChange={handleQuietHoursToggle}
            />
          </div>
        </CardHeader>
        {localPrefs.quiet_hours_enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Start Time
                </Label>
                <Select value={quietHoursStart} onValueChange={(v) => { setQuietHoursStart(v); setHasChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  End Time
                </Label>
                <Select value={quietHoursEnd} onValueChange={(v) => { setQuietHoursEnd(v); setHasChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Notifications will be held and delivered after quiet hours end
            </p>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Privacy & Data</p>
        <p>
          Your notification preferences are stored securely. You can change or disable 
          notifications at any time. We never share your notification data with third parties.
          View our <a href="/privacy" className="text-primary underline">Privacy Policy</a> for more details.
        </p>
      </div>
    </div>
  );
};

export default NotificationPreferenceCenter;
