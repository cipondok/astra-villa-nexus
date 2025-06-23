import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Info, X, Eye } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

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

const AdminAlertSystem = () => {
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showSuccess } = useAlert();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminAlert[];
    },
  });

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
      showSuccess("Alert Marked", "Alert has been marked as read.");
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .delete()
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      showSuccess("Alert Deleted", "Alert has been deleted successfully.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
    },
  });

  const handleViewAlert = (alert: AdminAlert) => {
    console.log('Opening alert:', alert);
    setSelectedAlert(alert);
    setIsDialogOpen(true);
    
    // Mark as read when opened
    if (!alert.is_read) {
      markAsReadMutation.mutate(alert.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAlert(null);
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-500';
    if (type === 'error' || type === 'warning') return 'text-orange-500';
    if (type === 'success') return 'text-green-500';
    return 'text-blue-500';
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const unreadCount = alerts?.filter(alert => !alert.is_read).length || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            {isLoading ? (
              <div className="text-center py-4">Loading alerts...</div>
            ) : alerts?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts?.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        !alert.is_read ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleViewAlert(alert)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-4 w-4 mt-0.5 ${getAlertColor(alert.type, alert.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium truncate ${!alert.is_read ? 'font-semibold' : ''}`}>
                              {alert.title}
                            </h4>
                            <Badge variant={getPriorityVariant(alert.priority)} className="text-xs">
                              {alert.priority}
                            </Badge>
                            {alert.action_required && (
                              <Badge variant="outline" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAlert(alert);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedAlert && (
                  <>
                    {(() => {
                      const Icon = getAlertIcon(selectedAlert.type);
                      return <Icon className={`h-5 w-5 ${getAlertColor(selectedAlert.type, selectedAlert.priority)}`} />;
                    })()}
                    {selectedAlert.title}
                  </>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDialog}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityVariant(selectedAlert.priority)}>
                  {selectedAlert.priority} priority
                </Badge>
                <Badge variant="outline">
                  {selectedAlert.type}
                </Badge>
                {selectedAlert.action_required && (
                  <Badge variant="destructive">
                    Action Required
                  </Badge>
                )}
              </div>
              
              <Separator />
              
              <DialogDescription className="text-base leading-relaxed">
                {selectedAlert.message}
              </DialogDescription>
              
              {selectedAlert.reference_type && selectedAlert.reference_id && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <strong>Reference:</strong> {selectedAlert.reference_type} ({selectedAlert.reference_id})
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                <strong>Created:</strong> {new Date(selectedAlert.created_at).toLocaleString()}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteAlertMutation.mutate(selectedAlert.id);
                    handleCloseDialog();
                  }}
                  disabled={deleteAlertMutation.isPending}
                >
                  {deleteAlertMutation.isPending ? 'Deleting...' : 'Delete Alert'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminAlertSystem;
