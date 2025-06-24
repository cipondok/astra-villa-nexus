
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

const AdminAlertBadge = () => {
  const [showAlerts, setShowAlerts] = useState(false);

  // Fetch unread alert count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-alerts-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (error) {
        console.error('Error fetching alert count:', error);
        return 0;
      }
      return data || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch all alerts for the dialog
  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }
      return data as AdminAlert[] || [];
    },
    enabled: showAlerts, // Only fetch when dialog is open
  });

  const handleAlertClick = () => {
    console.log('Alert badge clicked, opening alerts dialog...');
    setShowAlerts(true);
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'property':
        return '🏠';
      case 'user':
        return '👤';
      case 'vendor':
        return '🔧';
      case 'security':
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <>
      <Button
        onClick={handleAlertClick}
        variant="ghost"
        className="relative p-2 hover:bg-white/20"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-white" />
        ) : (
          <Bell className="h-5 w-5 text-white" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        <span className="sr-only">
          {unreadCount > 0 ? `${unreadCount} unread alerts` : 'View alerts'}
        </span>
      </Button>

      {/* Alerts Dialog */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Admin Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              System alerts and notifications
            </DialogDescription>
          </DialogHeader>
          
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
                      <span className="text-lg mt-0.5">
                        {getAlertIcon(alert.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${!alert.is_read ? 'font-semibold' : ''}`}>
                            {alert.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(alert.priority)}`}
                          >
                            {alert.priority}
                          </Badge>
                          {!alert.is_read && (
                            <Badge variant="default" className="text-xs bg-blue-500">
                              New
                            </Badge>
                          )}
                          {alert.action_required && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimeAgo(alert.created_at)}</span>
                          <span className="text-blue-600">Type: {alert.type}</span>
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

          {alerts.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Showing {alerts.length} recent alerts
              </span>
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

export default AdminAlertBadge;
