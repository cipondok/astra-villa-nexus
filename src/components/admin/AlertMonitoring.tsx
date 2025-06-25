
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Bell, Settings } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  category: string;
}

const AlertMonitoring = () => {
  const { showSuccess, showError } = useAlert();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    loadAlerts();
    // Set up real-time subscription for alerts
    const subscription = supabase
      .channel('alerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'system_alerts' },
        () => loadAlerts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      // Mock data since we don't have system_alerts table yet
      const mockAlerts: AlertItem[] = [
        {
          id: '1',
          type: 'error',
          title: 'Database Connection Error',
          message: 'Failed to connect to primary database',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          resolved: false,
          category: 'database'
        },
        {
          id: '2',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Server memory usage is at 85%',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          resolved: false,
          category: 'performance'
        },
        {
          id: '3',
          type: 'success',
          title: 'Backup Completed',
          message: 'Daily backup completed successfully',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: true,
          category: 'backup'
        },
        {
          id: '4',
          type: 'info',
          title: 'Maintenance Scheduled',
          message: 'System maintenance scheduled for tonight',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          resolved: false,
          category: 'maintenance'
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      showError('Error', 'Failed to load system alerts');
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
      showSuccess('Alert Resolved', 'Alert has been marked as resolved');
    } catch (error) {
      console.error('Error resolving alert:', error);
      showError('Error', 'Failed to resolve alert');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const criticalAlertsCount = alerts.filter(a => a.type === 'error' && !a.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Monitoring</h2>
          <p className="text-gray-600">Real-time system alerts and notifications</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure Alerts
        </Button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlertsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold">{criticalAlertsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{alerts.filter(a => a.resolved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(value: 'all' | 'active' | 'resolved') => setFilter(value)}>
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="active">Active ({activeAlertsCount})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No alerts found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={getAlertBadgeVariant(alert.type)}>
                            {alert.type}
                          </Badge>
                          <Badge variant="outline">{alert.category}</Badge>
                          {alert.resolved && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {!alert.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertMonitoring;
