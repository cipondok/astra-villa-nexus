
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Bell, 
  Clock, 
  Server, 
  Database, 
  AlertTriangle,
  Settings,
  Zap
} from 'lucide-react';

interface SystemInfo {
  version: string;
  uptime: string;
  memoryUsage: string;
  diskSpace: string;
  activeUsers: number;
  totalProperties: number;
}

interface SystemMonitoringProps {
  systemInfo?: SystemInfo;
}

const SystemMonitoring: React.FC<SystemMonitoringProps> = ({ systemInfo }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Monitoring Settings
          </CardTitle>
          <CardDescription>
            Configure system monitoring, alerts, and performance tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real-Time Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Real-Time Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label>Live Metrics Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-refresh dashboard metrics every 30 seconds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label>Real-Time Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant notifications for critical events
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label>Performance Monitoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Track CPU, memory, and database performance
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label>User Activity Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor active users and sessions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          {/* Alert Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alert Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alert Refresh Interval</Label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Max Alerts Display</Label>
                <Input type="number" defaultValue="100" min="10" max="1000" />
              </div>
              
              <div className="space-y-2">
                <Label>Auto-Mark Read After</Label>
                <Select defaultValue="24">
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Alert Retention Period</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance Thresholds */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              Performance Thresholds
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>CPU Warning Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="70" min="1" max="100" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Memory Warning Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="80" min="1" max="100" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Response Time Warning</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="500" min="1" max="10000" />
                  <span className="text-sm text-muted-foreground">ms</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Database Load Warning</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="75" min="1" max="100" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Current System Status
            </h3>
            
            {systemInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Version</p>
                        <p className="text-sm text-muted-foreground">{systemInfo.version}</p>
                      </div>
                      <Badge variant="default" className="bg-blue-500">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Active Users</p>
                        <p className="text-sm text-muted-foreground">{systemInfo.activeUsers} online</p>
                      </div>
                      <Badge variant="default" className="bg-green-500">Live</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Total Properties</p>
                        <p className="text-sm text-muted-foreground">{systemInfo.totalProperties} listings</p>
                      </div>
                      <Badge variant="default" className="bg-purple-500">Updated</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">Healthy</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Services</p>
                      <p className="text-sm text-muted-foreground">Operational</p>
                    </div>
                    <Badge variant="default" className="bg-blue-500">Active</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 dark:bg-purple-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monitoring</p>
                      <p className="text-sm text-muted-foreground">Real-time</p>
                    </div>
                    <Badge variant="default" className="bg-purple-500">Live</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Test Alerts
            </Button>
            <Button variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Run Diagnostics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
