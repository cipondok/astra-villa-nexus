import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import { formatDistanceToNow } from '@/utils/dateUtils';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'favorite':
        return <Heart className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.propertyId) {
      navigate(`/properties/${notification.propertyId}`);
      setIsOpen(false);
    }
  };

  const handleRemoveFromFavorites = async (e: React.MouseEvent, notification: any) => {
    e.stopPropagation();
    
    if (notification.propertyId) {
      const success = await toggleFavorite(notification.propertyId);
      if (success) {
        toast({
          title: "Removed from favorites",
          description: "Property removed from your favorites list.",
        });
        removeNotification(notification.id);
      }
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark notifications as read when opening dropdown
      setTimeout(() => markAllAsRead(), 1000);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className="relative p-2"
      >
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-96">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Property Image */}
                          {notification.propertyImage && (
                            <div className="mt-2">
                              <img
                                src={notification.propertyImage}
                                alt="Property"
                                className="w-12 h-8 object-cover rounded"
                              />
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-2">
                          {notification.type === 'favorite' && notification.propertyId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleRemoveFromFavorites(e, notification)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              title="Remove from favorites"
                            >
                              <Heart className="h-3 w-3 fill-current" />
                            </Button>
                          )}
                          
                          {notification.propertyId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNotificationClick(notification)}
                              className="h-6 w-6 p-0"
                              title="View property"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            title="Remove notification"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/saved');
                  setIsOpen(false);
                }}
                className="w-full text-sm"
              >
                View all saved properties
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;