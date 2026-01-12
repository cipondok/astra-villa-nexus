import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellRing,
  Mail,
  CheckCircle,
  Clock,
  User,
  Building2,
  AlertTriangle,
  Trash2,
  CheckCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { validateUUIDWithLogging } from "@/utils/uuid-validation-logger";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
}

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();

  // Fetch user notifications
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['user-notifications', user?.id],
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

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (!error) {
      refetch();
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || !validateUUIDWithLogging(user.id, 'Notifications.markAllAsRead', {
      operation: 'mark_all_read'
    })) {
      console.error('Invalid user ID for marking notifications as read');
      return;
    }

    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    if (!error) {
      refetch();
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);
    
    if (!error) {
      refetch();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'property': return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'user': return <User className="h-4 w-4 text-green-500" />;
      case 'system': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'message': return <Mail className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.is_read;
    if (activeTab === "read") return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <BellRing className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Notifications</h1>
                <p className="text-[10px] sm:text-xs opacity-80 hidden sm:block">Stay updated with your activities</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-primary-foreground text-[10px] sm:text-xs px-2 py-0.5">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        {/* Actions Row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Your Notifications</h2>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="ghost" size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 gap-1">
              <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Mark All Read</span>
              <span className="xs:hidden">Read All</span>
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-4 h-8 sm:h-9">
            <TabsTrigger value="all" className="text-[10px] sm:text-xs px-1 sm:px-3">
              All <span className="ml-1 opacity-70">({notifications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-[10px] sm:text-xs px-1 sm:px-3">
              Unread <span className="ml-1 opacity-70">({unreadCount})</span>
            </TabsTrigger>
            <TabsTrigger value="read" className="text-[10px] sm:text-xs px-1 sm:px-3">
              Read <span className="ml-1 opacity-70">({notifications.length - unreadCount})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-border/50">
                    <CardContent className="p-2.5 sm:p-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 bg-muted rounded shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-3 bg-muted rounded mb-1.5 w-3/4"></div>
                          <div className="h-2.5 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-sm sm:text-base font-semibold mb-1 text-foreground">
                  {activeTab === "unread" ? "No unread notifications" : 
                   activeTab === "read" ? "No read notifications" : "No notifications"}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {activeTab === "unread" ? "You're all caught up!" : "Notifications will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-all border-border/50 hover:border-border ${
                      !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <CardContent className="p-2.5 sm:p-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-0.5 shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <h4 className={`text-xs sm:text-sm truncate ${!notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-muted-foreground/70">
                                <div className="flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </div>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="capitalize">{notification.type}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-0.5 shrink-0">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-primary" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;
