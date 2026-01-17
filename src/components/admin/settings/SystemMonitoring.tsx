
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  const [isTestingAlerts, setIsTestingAlerts] = React.useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleTestAlerts = async () => {
    setIsTestingAlerts(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTestingAlerts(false);
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunningDiagnostics(false);
  };

  return (
    <div className="space-y-4">
      {/* Real-Time Features */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-yellow-500" />
            Real-Time Features
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Live Metrics', desc: 'Auto-refresh 30s' },
              { label: 'Real-Time Alerts', desc: 'Instant notifications' },
              { label: 'Performance', desc: 'CPU, memory, DB' },
              { label: 'User Tracking', desc: 'Active sessions' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <Label className="text-xs font-medium">{item.label}</Label>
                  <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4 text-blue-500" />
            Alert Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Refresh Interval</Label>
              <Select defaultValue="15">
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Max Alerts</Label>
              <Input type="number" defaultValue="100" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Auto-Mark Read</Label>
              <Select defaultValue="24">
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Retention</Label>
              <Select defaultValue="30">
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
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
        </CardContent>
      </Card>

      {/* Performance Thresholds */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Server className="h-4 w-4 text-red-500" />
            Performance Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'CPU Warning', unit: '%', defaultValue: '70' },
              { label: 'Memory Warning', unit: '%', defaultValue: '80' },
              { label: 'Response Time', unit: 'ms', defaultValue: '500' },
              { label: 'DB Load', unit: '%', defaultValue: '75' },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</Label>
                <div className="flex items-center gap-1">
                  <Input type="number" defaultValue={item.defaultValue} className="h-8 text-xs" />
                  <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Database className="h-4 w-4 text-green-500" />
            Current System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {systemInfo && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Version</p>
                    <p className="text-[10px] text-muted-foreground">{systemInfo.version}</p>
                  </div>
                  <Badge className="text-[9px] bg-blue-500">Active</Badge>
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Active Users</p>
                    <p className="text-[10px] text-muted-foreground">{systemInfo.activeUsers} online</p>
                  </div>
                  <Badge className="text-[9px] bg-green-500">Live</Badge>
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Properties</p>
                    <p className="text-[10px] text-muted-foreground">{systemInfo.totalProperties} listings</p>
                  </div>
                  <Badge className="text-[9px] bg-purple-500">Updated</Badge>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Database</p>
                  <p className="text-[10px] text-muted-foreground">Connected</p>
                </div>
                <Badge className="text-[9px] bg-green-500">Healthy</Badge>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">API Services</p>
                  <p className="text-[10px] text-muted-foreground">Operational</p>
                </div>
                <Badge className="text-[9px] bg-blue-500">Active</Badge>
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Monitoring</p>
                  <p className="text-[10px] text-muted-foreground">Real-time</p>
                </div>
                <Badge className="text-[9px] bg-purple-500">Live</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="sm" className="h-8 text-xs">
          <Settings className="h-3 w-3 mr-1" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" onClick={handleTestAlerts} disabled={isTestingAlerts} size="sm" className="h-8 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {isTestingAlerts ? 'Testing...' : 'Test Alerts'}
        </Button>
        <Button variant="outline" onClick={handleRunDiagnostics} disabled={isRunningDiagnostics} size="sm" className="h-8 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {isRunningDiagnostics ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>
    </div>
  );
};

export default SystemMonitoring;
