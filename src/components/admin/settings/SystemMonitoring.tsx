
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
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
    <div className="space-y-3">
      {/* Real-Time Features */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Real-Time Features
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Live Metrics', desc: 'Auto-refresh 30s' },
              { label: 'Real-Time Alerts', desc: 'Instant notifications' },
              { label: 'Performance', desc: 'CPU, memory, DB' },
              { label: 'User Tracking', desc: 'Active sessions' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label className="text-[10px] font-medium text-foreground">{item.label}</Label>
                  <p className="text-[8px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked className="scale-75" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Bell className="h-3.5 w-3.5 text-accent" />
            Alert Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Refresh Interval</Label>
              <Select defaultValue="15">
                <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
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
              <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Max Alerts</Label>
              <Input type="number" defaultValue="100" className="h-7 text-xs bg-background/50 border-border/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Auto-Mark Read</Label>
              <Select defaultValue="24">
                <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
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
              <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Retention</Label>
              <Select defaultValue="30">
                <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
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
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-destructive">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Server className="h-3.5 w-3.5 text-destructive" />
            Performance Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'CPU Warning', unit: '%', defaultValue: '70' },
              { label: 'Memory Warning', unit: '%', defaultValue: '80' },
              { label: 'Response Time', unit: 'ms', defaultValue: '500' },
              { label: 'DB Load', unit: '%', defaultValue: '75' },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</Label>
                <div className="flex items-center gap-1">
                  <Input type="number" defaultValue={item.defaultValue} className="h-7 text-xs bg-background/50 border-border/50" />
                  <span className="text-[9px] text-muted-foreground">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Database className="h-3.5 w-3.5 text-secondary" />
            Current System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          {systemInfo && (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-primary/10 rounded border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Version</p>
                    <p className="text-[9px] text-muted-foreground">{systemInfo.version}</p>
                  </div>
                  <Badge className="text-[8px] h-4 px-1.5 bg-primary/20 text-primary border border-primary/30">Active</Badge>
                </div>
              </div>
              <div className="p-2 bg-accent/10 rounded border border-accent/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Active Users</p>
                    <p className="text-[9px] text-muted-foreground">{systemInfo.activeUsers} online</p>
                  </div>
                  <Badge className="text-[8px] h-4 px-1.5 bg-accent/20 text-accent border border-accent/30">Live</Badge>
                </div>
              </div>
              <div className="p-2 bg-secondary/10 rounded border border-secondary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-foreground">Properties</p>
                    <p className="text-[9px] text-muted-foreground">{systemInfo.totalProperties} listings</p>
                  </div>
                  <Badge className="text-[8px] h-4 px-1.5 bg-secondary/20 text-secondary border border-secondary/30">Updated</Badge>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-primary/10 rounded border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-foreground">Database</p>
                  <p className="text-[9px] text-muted-foreground">Connected</p>
                </div>
                <Badge className="text-[8px] h-4 px-1.5 bg-primary/20 text-primary border border-primary/30">Healthy</Badge>
              </div>
            </div>
            <div className="p-2 bg-accent/10 rounded border border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-foreground">API Services</p>
                  <p className="text-[9px] text-muted-foreground">Operational</p>
                </div>
                <Badge className="text-[8px] h-4 px-1.5 bg-accent/20 text-accent border border-accent/30">Active</Badge>
              </div>
            </div>
            <div className="p-2 bg-secondary/10 rounded border border-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-foreground">Monitoring</p>
                  <p className="text-[9px] text-muted-foreground">Real-time</p>
                </div>
                <Badge className="text-[8px] h-4 px-1.5 bg-secondary/20 text-secondary border border-secondary/30">Live</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="sm" className="h-6 text-[10px] px-2">
          <Settings className="h-2.5 w-2.5 mr-1" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" onClick={handleTestAlerts} disabled={isTestingAlerts} size="sm" className="h-6 text-[10px] px-2 bg-background/50 border-border/50">
          <Clock className="h-2.5 w-2.5 mr-1" />
          {isTestingAlerts ? 'Testing...' : 'Test Alerts'}
        </Button>
        <Button variant="outline" onClick={handleRunDiagnostics} disabled={isRunningDiagnostics} size="sm" className="h-6 text-[10px] px-2 bg-background/50 border-border/50">
          <AlertTriangle className="h-2.5 w-2.5 mr-1" />
          {isRunningDiagnostics ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>
    </div>
  );
};

export default SystemMonitoring;
