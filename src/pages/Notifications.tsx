import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

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
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id)
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
      case 'property': return <Building2 className="h-5 w-5 text-blue-500" />;
      case 'user': return <User className="h-5 w-5 text-green-500" />;
      case 'system': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'message': return <Mail className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BellRing className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-xl opacity-90">Stay updated with your latest activities and alerts</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Your Notifications</h2>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-5 h-5 bg-muted rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {activeTab === "unread" ? "No unread notifications" : 
                   activeTab === "read" ? "No read notifications" : "No notifications"}
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === "unread" ? "You're all caught up!" : "Notifications will appear here when you receive them"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-all hover:shadow-md ${
                      !notification.is_read ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`font-medium mb-1 ${!notification.is_read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                                {!notification.is_read && (
                                  <Badge variant="default" className="text-xs bg-blue-500">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 px-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 px-2 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
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