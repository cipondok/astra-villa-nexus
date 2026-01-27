import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, BellOff, TrendingDown, Home, MessageCircle, 
  BarChart3, Calendar, Smartphone, Check
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePushNotifications, NotificationPreferences } from '@/hooks/usePushNotifications';

/**
 * Notification Preferences Panel
 * Mobile-optimized settings for push notification categories
 */

const NotificationPreferencesPanel: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    preferences,
    subscribe,
    unsubscribe,
    savePreferences,
  } = usePushNotifications();

  const notificationTypes = [
    {
      key: 'priceDrops' as keyof NotificationPreferences,
      icon: TrendingDown,
      title: 'Price Drops',
      description: 'Get notified when saved properties drop in price',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      key: 'newMatches' as keyof NotificationPreferences,
      icon: Home,
      title: 'New Matches',
      description: 'Properties matching your search criteria',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      key: 'messageAlerts' as keyof NotificationPreferences,
      icon: MessageCircle,
      title: 'Messages',
      description: 'Replies to your inquiries and agent messages',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      key: 'marketUpdates' as keyof NotificationPreferences,
      icon: BarChart3,
      title: 'Market Updates',
      description: 'Weekly insights and market trends',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      key: 'dailyDigest' as keyof NotificationPreferences,
      icon: Calendar,
      title: 'Daily Digest',
      description: 'Summary of new listings and activity',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    savePreferences({ ...preferences, [key]: value });
  };

  const handleSubscribe = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 text-center">
        <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Not Supported</h3>
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-xl border",
          isSubscribed 
            ? "bg-primary/5 border-primary/30" 
            : "bg-muted/50 border-border/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isSubscribed ? "bg-primary/20" : "bg-muted"
            )}>
              {isSubscribed ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isSubscribed 
                  ? 'Receiving real-time property alerts' 
                  : 'Never miss a price drop or new match'}
              </p>
            </div>
          </div>
          
          <Button
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            onClick={handleSubscribe}
            className="h-9 active:scale-95"
          >
            {isSubscribed ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {permission === 'denied' && (
          <p className="mt-3 text-xs text-destructive flex items-center gap-1">
            <Smartphone className="h-3 w-3" />
            Notifications blocked. Enable in browser settings.
          </p>
        )}
      </motion.div>

      {/* Notification types */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground px-1">
          Notification Types
        </h4>
        
        {notificationTypes.map((type, idx) => (
          <motion.div
            key={type.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl",
              "bg-card border border-border/50",
              !isSubscribed && "opacity-50 pointer-events-none"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center",
                type.bgColor
              )}>
                <type.icon className={cn("h-4 w-4", type.color)} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">{type.title}</h4>
                <p className="text-[11px] text-muted-foreground">{type.description}</p>
              </div>
            </div>
            
            <Switch
              checked={preferences[type.key]}
              onCheckedChange={(checked) => handleToggle(type.key, checked)}
              disabled={!isSubscribed}
            />
          </motion.div>
        ))}
      </div>

      {/* Test notification */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4 border-t border-border/30"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full h-10 active:scale-95"
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Test Notification 🔔', {
                  body: 'Push notifications are working!',
                  icon: '/icon-192x192.png',
                });
              }
            }}
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationPreferencesPanel;
