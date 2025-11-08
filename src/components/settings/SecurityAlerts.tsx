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
      <Card className="professional-card border-2 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary mb-3"></div>
            <p className="text-muted-foreground text-xs">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="professional-card border-2 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-base">Security Alerts</CardTitle>
              <CardDescription className="text-xs">No security concerns</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">All Clear!</p>
            <p className="text-xs text-muted-foreground mt-1">No security alerts detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card border-2 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-base">Security Alerts</CardTitle>
              <CardDescription className="text-xs">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts reviewed'}
              </CardDescription>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs px-2 py-0.5">
              {unreadCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <ScrollArea className="h-[200px] pr-3">
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2.5 rounded-lg border transition-colors ${
                  alert.is_resolved
                    ? 'bg-muted/20 border-muted opacity-60'
                    : alert.is_read
                    ? 'bg-muted/30 border-border/50'
                    : 'bg-muted/50 border-border shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'high' ? 'text-orange-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {alert.title}
                      </p>
                      <Badge variant="outline" className={`text-xs flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">{alert.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                      <div className="flex gap-1">
                        {!alert.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                            className="h-6 px-2 text-xs"
                          >
                            Mark Read
                          </Button>
                        )}
                        {!alert.is_resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsResolved(alert.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
