import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInAppNotifications } from '@/hooks/useInAppNotifications';
import { Home, TrendingDown, MessageSquare, Calendar, Bell, Megaphone, Mail, Smartphone, Clock } from 'lucide-react';

const NotificationPreferencesPanel: React.FC = () => {
  const { preferences, isLoading, updatePreferences } = useInAppNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  const notificationTypes = [
    {
      key: 'new_listings' as const,
      icon: Home,
      title: 'New Property Listings',
      description: 'Get notified when new properties match your saved searches',
      iconColor: 'text-primary',
    },
    {
      key: 'price_changes' as const,
      icon: TrendingDown,
      title: 'Price Changes',
      description: 'Be the first to know when prices change on properties you follow',
      iconColor: 'text-green-500',
    },
    {
      key: 'messages' as const,
      icon: MessageSquare,
      title: 'Messages',
      description: 'Get notified when you receive new messages from agents or buyers',
      iconColor: 'text-blue-500',
    },
    {
      key: 'booking_updates' as const,
      icon: Calendar,
      title: 'Booking Updates',
      description: 'Receive updates for scheduled property viewings and appointments',
      iconColor: 'text-orange-500',
    },
    {
      key: 'system_alerts' as const,
      icon: Bell,
      title: 'System Alerts',
      description: 'Important system notifications and security alerts',
      iconColor: 'text-red-500',
    },
    {
      key: 'promotions' as const,
      icon: Megaphone,
      title: 'Promotions',
      description: 'Special offers, new features, and platform updates',
      iconColor: 'text-pink-500',
    },
  ];

  const deliveryChannels = [
    {
      key: 'email_enabled' as const,
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      iconColor: 'text-blue-500',
    },
    {
      key: 'sms_enabled' as const,
      icon: Smartphone,
      title: 'SMS Notifications',
      description: 'Receive notifications via SMS',
      iconColor: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>
            Choose which notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type, index) => (
            <React.Fragment key={type.key}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${type.iconColor}`}>
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={type.key} className="text-sm font-medium cursor-pointer">
                      {type.title}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={type.key}
                  checked={preferences[type.key]}
                  onCheckedChange={(checked) => updatePreferences({ [type.key]: checked })}
                />
              </div>
              {index < notificationTypes.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deliveryChannels.map((channel, index) => (
            <React.Fragment key={channel.key}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${channel.iconColor}`}>
                    <channel.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={channel.key} className="text-sm font-medium cursor-pointer">
                      {channel.title}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={channel.key}
                  checked={preferences[channel.key]}
                  onCheckedChange={(checked) => updatePreferences({ [channel.key]: checked })}
                />
              </div>
              {index < deliveryChannels.length - 1 && <Separator />}
            </React.Fragment>
          ))}
          
          <Separator />
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-purple-500">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="quiet_hours_enabled" className="text-sm font-medium cursor-pointer">
                  Quiet Hours
                </Label>
                <p className="text-xs text-muted-foreground">
                  Pause notifications during specific hours
                </p>
              </div>
            </div>
            <Switch
              id="quiet_hours_enabled"
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(checked) => updatePreferences({ quiet_hours_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferencesPanel;
