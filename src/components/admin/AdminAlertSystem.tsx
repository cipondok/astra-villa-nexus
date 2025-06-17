
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  User, 
  Building2, 
  UserPlus, 
  AlertCircle, 
  Check, 
  X,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { formatDistanceToNow } from "date-fns";

interface AdminAlert {
  id: string;
  type: 'user_registration' | 'property_listing' | 'agent_request' | 'vendor_request' | 'kyc_verification' | 'system_issue';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
  action_required: boolean;
}

const AdminAlertSystem = () => {
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch admin alerts
  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AdminAlert[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Mark alert as read
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      showSuccess("Alert Marked", "Alert marked as read");
    },
    onError: (error) => {
      showError("Error", `Failed to mark alert as read: ${error.message}`);
    }
  });

  // Mark all alerts as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true })
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      showSuccess("All Alerts Read", "All alerts marked as read");
    }
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  const getAlertIcon = (type: AdminAlert['type']) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4" />;
      case 'property_listing':
        return <Building2 className="h-4 w-4" />;
      case 'agent_request':
        return <User className="h-4 w-4" />;
      case 'vendor_request':
        return <User className="h-4 w-4" />;
      case 'kyc_verification':
        return <CheckCircle className="h-4 w-4" />;
      case 'system_issue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: AdminAlert['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAlertClick = (alert: AdminAlert) => {
    setSelectedAlert(alert);
    if (!alert.is_read) {
      markAsReadMutation.mutate(alert.id);
    }
  };

  const handleActionRequired = (alert: AdminAlert) => {
    // Navigate to the relevant management section based on alert type
    if (alert.reference_type && alert.reference_id) {
      // This would be handled by the parent component to change tabs
      console.log(`Navigate to ${alert.reference_type} with ID ${alert.reference_id}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Admin Alerts</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread alerts
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts at this time
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-colors
                        ${alert.is_read 
                          ? 'bg-muted/50 border-muted' 
                          : 'bg-background border-primary/20 shadow-sm'
                        }
                        hover:bg-muted/70
                      `}
                      onClick={() => handleAlertClick(alert)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${getPriorityColor(alert.priority)}/10`}>
                          <div className={`${getPriorityColor(alert.priority)} rounded-full p-1`}>
                            {getAlertIcon(alert.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium truncate ${!alert.is_read ? 'font-semibold' : ''}`}>
                              {alert.title}
                            </h4>
                            {!alert.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground truncate">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {alert.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alert Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Alert Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAlert ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getAlertIcon(selectedAlert.type)}
                    <h3 className="font-semibold">{selectedAlert.title}</h3>
                    <Badge className={getPriorityColor(selectedAlert.priority)}>
                      {selectedAlert.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatDistanceToNow(new Date(selectedAlert.created_at), { addSuffix: true })}
                  </p>
                </div>

                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Message</h4>
                  <p className="text-sm">{selectedAlert.message}</p>
                </div>

                {selectedAlert.action_required && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleActionRequired(selectedAlert)}
                        className="flex-1"
                      >
                        Take Action
                      </Button>
                    </div>
                  </>
                )}

                <Separator />
                
                <div className="flex gap-2">
                  {!selectedAlert.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(selectedAlert.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark as Read
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAlert(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select an alert to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAlertSystem;
