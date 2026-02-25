import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, NotificationCategory } from '@/contexts/NotificationContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Heart,
  Info,
  AlertTriangle,
  CheckCircle,
  X,
  Trash2,
  Eye,
  Check,
  Home,
  Settings,
  User,
  Layers,
  KeyRound,
} from 'lucide-react';
import { formatDistanceToNow } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const CATEGORY_TABS: { value: 'all' | NotificationCategory; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'system', label: 'System', icon: Settings },
  { value: 'property', label: 'Property', icon: Home },
  { value: 'user', label: 'Rental', icon: KeyRound },
];

const NotificationDropdown: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();
  const { toggleFavorite } = useFavorites();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Infer category for older notifications that don't have one
  const inferCategory = (n: any): NotificationCategory => {
    if (n.category) return n.category;
    if (n.propertyId || n.type === 'favorite') return 'property';
    if (n.type === 'warning' || n.type === 'info') return 'system';
    if (n.type === 'success') return 'user';
    return 'general';
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => inferCategory(n) === activeTab);
  }, [notifications, activeTab]);

  // Category unread counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0, system: 0, property: 0, user: 0, general: 0 };
    notifications.forEach(n => {
      if (!n.read) {
        counts.all++;
        counts[inferCategory(n)]++;
      }
    });
    return counts;
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'favorite':
        return <Heart className="h-3.5 w-3.5 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-3.5 w-3.5 text-accent" />;
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />;
      default:
        return <Info className="h-3.5 w-3.5 text-primary" />;
    }
  };

  const getCategoryColor = (category: NotificationCategory): string => {
    switch (category) {
      case 'system': return 'bg-chart-1/10 text-chart-1';
      case 'property': return 'bg-primary/10 text-primary';
      case 'user': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.propertyId) {
      onNavigate?.(`/properties/${notification.propertyId}`);
      setIsOpen(false);
    }
  };

  const handleRemoveFromFavorites = async (e: React.MouseEvent, notification: any) => {
    e.stopPropagation();
    if (notification.propertyId) {
      const success = await toggleFavorite(notification.propertyId);
      if (success) {
        toast({ title: "Removed from favorites", description: "Property removed from your favorites list." });
        removeNotification(notification.id);
      }
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setTimeout(() => markAllAsRead(), 2000);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button variant="ghost" size="sm" onClick={toggleDropdown} className="relative p-2">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          "fixed z-[9999] bg-card border border-border rounded-xl shadow-2xl",
          "flex flex-col",
          // Mobile: full-width with margins
          "inset-x-3 top-14 bottom-auto max-h-[80vh]",
          // Tablet
          "sm:inset-x-auto sm:fixed sm:right-3 sm:top-14 sm:w-[360px] sm:max-h-[75vh]",
          // Desktop
          "md:absolute md:inset-auto md:right-0 md:top-full md:mt-1 md:w-[400px] md:max-h-[520px]",
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 px-1.5 text-[10px]">
                  <Check className="h-2.5 w-2.5 mr-0.5" />
                  Read all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-muted-foreground md:hidden"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50 bg-muted/30 shrink-0 overflow-x-auto">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = categoryCounts[tab.value] || 0;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap",
                    isActive
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={cn(
                      "text-[9px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-1",
                      isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1 min-h-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No {activeTab !== 'all' ? activeTab : ''} notifications</p>
                <p className="text-[10px] mt-0.5 text-muted-foreground/70">
                  {activeTab === 'all' ? "You're all caught up!" : `No ${activeTab} notifications yet`}
                </p>
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {filteredNotifications.map((notification) => {
                  const category = inferCategory(notification);
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all",
                        "hover:bg-muted/50 group",
                        !notification.read ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-xs font-medium text-foreground line-clamp-1 flex-1">
                            {notification.title}
                          </p>
                          <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-3.5 shrink-0", getCategoryColor(category))}>
                            {category}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {notification.propertyId && (
                          <Button variant="ghost" size="sm" onClick={() => handleNotificationClick(notification)} className="h-5 w-5 p-0">
                            <Eye className="h-2.5 w-2.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                          className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>

                      {/* Unread dot */}
                      {!notification.read && (
                        <div className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-2 py-1.5 border-t border-border shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { onNavigate?.('/saved'); setIsOpen(false); }}
                className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                View all saved
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
