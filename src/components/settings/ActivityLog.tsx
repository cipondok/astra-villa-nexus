import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { History, MapPin, Monitor, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

export const ActivityLog = () => {
  const { activityLogs, loginAlerts, isLoading, loadActivityLogs, getActivityIcon, getAlertIcon } = useActivityLogs();

  // Combine and sort all activities
  const allActivities = [
    ...activityLogs.map(log => ({
      id: log.id,
      type: 'activity',
      icon: getActivityIcon(log.activity_type),
      title: log.activity_description,
      description: log.activity_type,
      timestamp: log.created_at,
      location: log.location_data?.city || log.location_data?.country,
      ip: log.ip_address,
      device: log.user_agent,
    })),
    ...loginAlerts.map(alert => ({
      id: alert.id,
      type: 'login',
      icon: getAlertIcon(alert.alert_type),
      title: alert.message,
      description: alert.alert_type,
      timestamp: alert.created_at,
      location: alert.location_data?.city || alert.location_data?.country,
      ip: alert.ip_address,
      device: alert.device_info?.browser || alert.device_info?.os,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
        <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-semibold">Activity</span>
        </div>
        <Button variant="ghost" size="icon" onClick={loadActivityLogs} className="h-5 w-5">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {allActivities.length === 0 ? (
        <div className="text-center py-3">
          <History className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[150px]">
          <div className="space-y-1">
            {allActivities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="p-1.5 rounded-md bg-muted/20 border text-[10px]">
                <div className="flex items-start gap-1.5">
                  <span className="text-sm flex-shrink-0">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {activity.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
