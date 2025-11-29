import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSecurityAlerts } from '@/hooks/useSecurityAlerts';
import { Shield, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SecurityAlerts = () => {
  const { alerts, isLoading, unreadCount, markAsRead, markAsResolved, getSeverityColor } = useSecurityAlerts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary"></div>
        <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-7 h-7 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">All Clear</p>
          <p className="text-[10px] text-muted-foreground">No security alerts</p>
        </div>
        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
          Secure
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs font-semibold">Security Alerts</span>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
            {unreadCount}
          </Badge>
        )}
      </div>
      <ScrollArea className="h-[120px]">
        <div className="space-y-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-1.5 rounded-md border text-[10px] ${
                alert.is_resolved ? 'opacity-50' : alert.is_read ? 'bg-muted/20' : 'bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className={`h-3 w-3 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'text-red-500' :
                  alert.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
                }`} />
                <span className="font-medium truncate flex-1">{alert.title}</span>
                <div className="flex gap-0.5">
                  {!alert.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)} className="h-5 px-1 text-[9px]">
                      Read
                    </Button>
                  )}
                  {!alert.is_resolved && (
                    <Button variant="ghost" size="sm" onClick={() => markAsResolved(alert.id)} className="h-5 w-5 p-0">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
