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
      <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.45s' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary mb-4"></div>
            <p className="text-muted-foreground font-medium text-sm">Loading activity logs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.45s' }}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription className="text-xs">Recent account activities</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadActivityLogs}
            className="h-7 w-7 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {allActivities.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-2">
              {allActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl flex-shrink-0 mt-0.5">{activity.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {activity.title}
                          </p>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {activity.type === 'login' ? 'Login' : 'Activity'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                          </div>
                          
                          {activity.location && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                          
                          {activity.device && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Monitor className="h-3 w-3" />
                              <span className="truncate">{activity.device}</span>
                            </div>
                          )}
                          
                          {activity.ip && (
                            <div className="text-xs text-muted-foreground/60">
                              IP: {activity.ip}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < allActivities.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
