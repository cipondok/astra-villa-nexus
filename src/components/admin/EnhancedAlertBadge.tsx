
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  BellRing, 
  Users, 
  Building2, 
  AlertTriangle, 
  MessageSquare, 
  Shield, 
  Settings,
  Flag,
  Wrench,
  CreditCard,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  action_required: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
  alert_category: string;
  urgency_level: number;
  metadata: any;
}

const EnhancedAlertBadge = () => {
  const [showAlerts, setShowAlerts] = useState(false);

  // Fetch unread alert count by category
  const { data: alertStats = {} } = useQuery({
    queryKey: ['admin-alerts-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('alert_category, urgency_level, is_read, action_required')
        .eq('is_read', false);
      
      if (error) {
        console.error('Error fetching alert stats:', error);
        return {};
      }

      const stats = data.reduce((acc: any, alert) => {
        const category = alert.alert_category || 'general';
        if (!acc[category]) {
          acc[category] = { count: 0, urgent: 0, actionRequired: 0 };
        }
        acc[category].count++;
        if (alert.urgency_level >= 4) acc[category].urgent++;
        if (alert.action_required) acc[category].actionRequired++;
        return acc;
      }, {});

      const totalCount = Object.values(stats).reduce((sum: number, cat: any) => sum + cat.count, 0);
      const urgentCount = Object.values(stats).reduce((sum: number, cat: any) => sum + cat.urgent, 0);

      return { ...stats, total: totalCount, urgent: urgentCount };
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  // Fetch all alerts for the dialog
  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-alerts-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('urgency_level', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }
      return data as AdminAlert[] || [];
    },
    enabled: showAlerts,
  });

  const totalUnreadCount = alertStats.total || 0;
  const urgentCount = alertStats.urgent || 0;

  const getCategoryIcon = (category: string, size = 16) => {
    const iconProps = { size, className: "text-white" };
    switch (category) {
      case 'users': return <Users {...iconProps} />;
      case 'properties': return <Building2 {...iconProps} />;
      case 'support': return <MessageSquare {...iconProps} />;
      case 'security': return <Shield {...iconProps} />;
      case 'moderation': return <Flag {...iconProps} />;
      case 'vendors': return <Wrench {...iconProps} />;
      case 'payment': return <CreditCard {...iconProps} />;
      case 'system': return <Settings {...iconProps} />;
      case 'performance': return <Activity {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  const getAlertIcon = (type: string, urgency = 1) => {
    const iconClass = urgency >= 4 ? "text-red-500" : urgency >= 3 ? "text-orange-500" : "text-blue-500";
    
    switch (type) {
      case 'user_registration': return <Users className={`h-4 w-4 ${iconClass}`} />;
      case 'property_listing': return <Building2 className={`h-4 w-4 ${iconClass}`} />;
      case 'customer_complaint': return <AlertTriangle className={`h-4 w-4 ${iconClass}`} />;
      case 'inquiry': return <MessageSquare className={`h-4 w-4 ${iconClass}`} />;
      case 'report': return <Flag className={`h-4 w-4 ${iconClass}`} />;
      case 'security': return <Shield className={`h-4 w-4 ${iconClass}`} />;
      case 'vendor_request': return <Wrench className={`h-4 w-4 ${iconClass}`} />;
      default: return <Bell className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority: string, urgency: number) => {
    if (urgency >= 5) return 'bg-red-600 text-white';
    if (urgency >= 4) return 'bg-red-500 text-white';
    if (urgency >= 3) return 'bg-orange-500 text-white';
    if (urgency >= 2) return 'bg-yellow-500 text-black';
    return 'bg-blue-500 text-white';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const groupAlertsByCategory = (alerts: AdminAlert[]) => {
    return alerts.reduce((acc: any, alert) => {
      const category = alert.alert_category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(alert);
      return acc;
    }, {});
  };

  const handleAlertClick = () => {
    console.log('Enhanced alert badge clicked, opening alerts dialog...');
    setShowAlerts(true);
  };

  return (
    <>
      <Button
        onClick={handleAlertClick}
        variant="ghost"
        className="relative p-2 hover:bg-white/20"
      >
        {totalUnreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-white animate-pulse" />
        ) : (
          <Bell className="h-5 w-5 text-white" />
        )}
        
        {totalUnreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex flex-col items-center gap-1">
            <Badge 
              variant="destructive" 
              className="h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-bounce"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
            {urgentCount > 0 && (
              <Badge 
                className="h-3 w-3 p-0 bg-red-600 animate-pulse"
                title={`${urgentCount} urgent alerts`}
              />
            )}
          </div>
        )}
        
        <span className="sr-only">
          {totalUnreadCount > 0 ? `${totalUnreadCount} unread alerts` : 'View alerts'}
        </span>
      </Button>

      {/* Enhanced Alerts Dialog */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Real-Time Alert Center
              {totalUnreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalUnreadCount} unread
                </Badge>
              )}
              {urgentCount > 0 && (
                <Badge className="ml-1 bg-red-600 animate-pulse">
                  {urgentCount} urgent
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Comprehensive monitoring of system activities and user interactions
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                All ({totalUnreadCount})
              </TabsTrigger>
              <TabsTrigger value="urgent" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgent ({urgentCount})
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Users ({alertStats.users?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Support ({alertStats.support?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Security ({alertStats.security?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Properties ({alertStats.properties?.count || 0})
              </TabsTrigger>
            </TabsList>

            {/* All Alerts Tab */}
            <TabsContent value="all">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No alerts at this time</p>
                      <p className="text-sm">System is running smoothly</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          !alert.is_read 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type, alert.urgency_level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${!alert.is_read ? 'font-semibold' : ''}`}>
                                {alert.title}
                              </h4>
                              <Badge 
                                className={`text-xs ${getPriorityColor(alert.priority, alert.urgency_level)}`}
                              >
                                {alert.priority} (L{alert.urgency_level})
                              </Badge>
                              {alert.action_required && (
                                <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                  Action Required
                                </Badge>
                              )}
                              {!alert.is_read && (
                                <Badge variant="default" className="text-xs bg-blue-500">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-2 whitespace-pre-wrap">
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(alert.created_at)}</span>
                              <span className="text-blue-600">Category: {alert.alert_category}</span>
                              {alert.reference_type && alert.reference_id && (
                                <span>Ref: {alert.reference_type}#{alert.reference_id.slice(0, 8)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Category-specific tabs */}
            {['urgent', 'users', 'support', 'security', 'properties'].map((category) => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {alerts
                      .filter(alert => 
                        category === 'urgent' 
                          ? alert.urgency_level >= 4 
                          : alert.alert_category === category
                      )
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            !alert.is_read 
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type, alert.urgency_level)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-medium ${!alert.is_read ? 'font-semibold' : ''}`}>
                                  {alert.title}
                                </h4>
                                <Badge 
                                  className={`text-xs ${getPriorityColor(alert.priority, alert.urgency_level)}`}
                                >
                                  {alert.priority} (L{alert.urgency_level})
                                </Badge>
                                {alert.action_required && (
                                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                    Action Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3 mb-2 whitespace-pre-wrap">
                                {alert.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{formatTimeAgo(alert.created_at)}</span>
                                <span className="text-blue-600">Type: {alert.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>

          {alerts.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Real-time monitoring active • Last updated: {new Date().toLocaleTimeString()}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAlerts(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedAlertBadge;
