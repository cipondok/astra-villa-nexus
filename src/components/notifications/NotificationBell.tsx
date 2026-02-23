import React, { useState, useMemo } from 'react';
import { Bell, Check, CheckCheck, Trash2, Home, TrendingDown, MessageSquare, Calendar, BarChart3, Star, Info, ClipboardCopy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useInAppNotifications, InAppNotification } from '@/hooks/useInAppNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type NotificationCategory = 'all' | 'system' | 'property' | 'message' | 'other';

const categorize = (n: InAppNotification): NotificationCategory => {
  if (n.type === 'system' || n.type === 'market_insight') return 'system';
  if (n.type === 'new_match' || n.type === 'price_drop' || n.type === 'favorite') return 'property';
  if (n.type === 'message' || n.type === 'appointment') return 'message';
  return 'other';
};

const getNotificationIcon = (type: InAppNotification['type']) => {
  switch (type) {
    case 'new_match':
      return <Home className="h-4 w-4 text-primary" />;
    case 'price_drop':
      return <TrendingDown className="h-4 w-4 text-chart-1" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-chart-4" />;
    case 'appointment':
      return <Calendar className="h-4 w-4 text-chart-3" />;
    case 'market_insight':
      return <BarChart3 className="h-4 w-4 text-accent-foreground" />;
    case 'favorite':
      return <Star className="h-4 w-4 text-chart-3" />;
    case 'system':
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

const NotificationItem: React.FC<{
  notification: InAppNotification;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyToClipboard: (n: InAppNotification) => void;
  onClick: () => void;
}> = ({ notification, isSelected, onToggleSelect, onMarkRead, onDelete, onCopyToClipboard, onClick }) => {
  return (
    <div
      className={cn(
        "p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0",
        !notification.is_read && "bg-primary/5",
        isSelected && "bg-primary/10"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div
          className="flex-shrink-0 mt-0.5"
          onClick={(e) => { e.stopPropagation(); onToggleSelect(notification.id); }}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(notification.id)}
            className="h-3.5 w-3.5"
          />
        </div>
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-sm line-clamp-1",
              !notification.is_read && "font-medium"
            )}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Copy to clipboard"
            onClick={(e) => {
              e.stopPropagation();
              onCopyToClipboard(notification);
            }}
          >
            <ClipboardCopy className="h-3 w-3" />
          </Button>
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDelete,
    clearAllNotifications,
  } = useInAppNotifications();

  const categoryCounts = useMemo(() => {
    const counts = { all: 0, system: 0, property: 0, message: 0, other: 0 };
    notifications.forEach(n => {
      counts.all++;
      counts[categorize(n)]++;
    });
    return counts;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => categorize(n) === activeTab);
  }, [notifications, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as NotificationCategory);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleBulkDelete = async () => {
    await bulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleCopyToClipboard = (n: InAppNotification) => {
    const text = `[${n.title}]: ${n.message}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard — paste in chat to fix');
    });
  };

  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.property_id) {
      navigate(`/properties/${notification.property_id}`);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 border-b text-xs">
            <Checkbox
              checked={selectedIds.size === filteredNotifications.length}
              onCheckedChange={toggleSelectAll}
              className="h-3.5 w-3.5"
            />
            <span className="text-muted-foreground">{selectedIds.size} selected</span>
            <Button variant="destructive" size="sm" className="h-6 text-xs ml-auto" onClick={handleBulkDelete}>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Selected
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedIds(new Set())}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Category tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-9 p-0 gap-0">
            {(['all', 'system', 'property', 'message', 'other'] as NotificationCategory[]).map(cat => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-[11px] px-2 py-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none capitalize"
              >
                {cat} ({categoryCounts[cat]})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[280px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <>
                  {selectedIds.size === 0 && filteredNotifications.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
                      <Checkbox
                        checked={false}
                        onCheckedChange={toggleSelectAll}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-[11px] text-muted-foreground">Select all</span>
                    </div>
                  )}
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isSelected={selectedIds.has(notification.id)}
                      onToggleSelect={toggleSelect}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      onCopyToClipboard={handleCopyToClipboard}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  navigate('/settings?tab=notifications');
                  setIsOpen(false);
                }}
              >
                Notification Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive"
                onClick={clearAllNotifications}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
