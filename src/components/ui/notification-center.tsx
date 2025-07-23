
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Bell, BellOff, Check, Trash2, X, Eye } from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailPosition, setDetailPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const detailRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showSuccess } = useAlert();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (detailRef.current) {
      setIsDragging(true);
      const rect = detailRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && detailRef.current) {
      setDetailPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const openDetailPopup = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const closeDetailPopup = () => {
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </DialogTitle>
          <DialogDescription>
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          )}
          
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">Loading notifications...</div>
              ) : notifications?.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications?.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                             <h4 className="font-medium">{notification.title}</h4>
                             {!notification.is_read && (
                               <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                             )}
                           </div>
                           <p className="text-sm text-muted-foreground mb-2">
                             {notification.message}
                           </p>
                           <p className="text-xs text-muted-foreground">
                             {new Date(notification.created_at).toLocaleString()}
                           </p>
                         </div>
                         <div className="flex gap-1">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               openDetailPopup(notification);
                             }}
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               deleteNotificationMutation.mutate(notification.id);
                             }}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
      
      {/* Draggable Detail Popup */}
      {selectedNotification && (
        <div 
          ref={detailRef}
          className="fixed bg-background border rounded-lg shadow-lg p-6 min-w-96 max-w-2xl z-[60]"
          style={{
            left: detailPosition.x,
            top: detailPosition.y,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <div 
            className="flex justify-between items-start mb-4 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getNotificationIcon(selectedNotification.type)}</span>
              <h3 className="text-lg font-semibold">{selectedNotification.title}</h3>
              {!selectedNotification.is_read && (
                <Badge className="bg-blue-500 text-white text-xs">New</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDetailPopup}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Message</h4>
              <p className="text-foreground">{selectedNotification.message}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Type:</span>
                <p className="capitalize">{selectedNotification.type}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Status:</span>
                <p>{selectedNotification.is_read ? 'Read' : 'Unread'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Created:</span>
                <p>{new Date(selectedNotification.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Updated:</span>
                <p>{new Date(selectedNotification.updated_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              {!selectedNotification.is_read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    markAsReadMutation.mutate(selectedNotification.id);
                    setSelectedNotification({...selectedNotification, is_read: true});
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteNotificationMutation.mutate(selectedNotification.id);
                  closeDetailPopup();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default NotificationCenter;
