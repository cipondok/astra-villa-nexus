
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, Database, Server, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const MaintenancePanel = () => {
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    health: 98.5,
    uptime: 99.9,
    dbSize: '2.4GB',
    issues: 2
  });
  const { showSuccess, showError } = useAlert();

  const runMaintenance = async () => {
    setIsRunningMaintenance(true);
    try {
      // Simulate maintenance tasks
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        health: 99.2,
        issues: 0
      }));
      
      showSuccess('Maintenance Complete', 'System maintenance completed successfully');
    } catch (error) {
      showError('Maintenance Failed', 'System maintenance encountered an error');
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    try {
      await supabase
        .from('system_settings')
        .upsert({
          key: 'maintenance_mode',
          value: enabled,
          category: 'system',
          description: 'Maintenance mode status'
        });
      
      setMaintenanceMode(enabled);
      showSuccess(
        enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        enabled ? 'Website is now in maintenance mode' : 'Website is now live'
      );
    } catch (error) {
      showError('Update Failed', 'Failed to update maintenance mode');
    }
  };

  const createBackup = async () => {
    try {
      // In a real implementation, this would trigger a database backup
      await supabase
        .from('system_settings')
        .upsert({
          key: `backup_${Date.now()}`,
          value: { created_at: new Date().toISOString(), type: 'manual' },
          category: 'backups',
          description: 'Manual backup created'
        });
      
      showSuccess('Backup Created', 'Database backup created successfully');
    } catch (error) {
      showError('Backup Failed', 'Failed to create backup');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Maintenance</h2>
          <p className="text-gray-600">System maintenance, updates, and health monitoring</p>
        </div>
        <Button onClick={runMaintenance} disabled={isRunningMaintenance}>
          <Wrench className="h-4 w-4 mr-2" />
          {isRunningMaintenance ? 'Running...' : 'Run Maintenance'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold">{systemStatus.health}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">{systemStatus.uptime}%</p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database Size</p>
                <p className="text-2xl font-bold">{systemStatus.dbSize}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issues</p>
                <p className="text-2xl font-bold">{systemStatus.issues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Mode</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="updates">System Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>System Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Web Server', status: 'healthy', uptime: '99.9%' },
                  { name: 'Database', status: 'healthy', uptime: '99.8%' },
                  { name: 'Email Service', status: systemStatus.issues > 0 ? 'warning' : 'healthy', uptime: '98.5%' },
                  { name: 'File Storage', status: 'healthy', uptime: '99.9%' }
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {service.status === 'healthy' ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> :
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      }
                      <span>{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{service.uptime}</span>
                      <Badge variant={service.status === 'healthy' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Maintenance Mode</div>
                    <div className="text-sm text-gray-500">Display maintenance page to users</div>
                  </div>
                  <Switch 
                    checked={maintenanceMode}
                    onCheckedChange={toggleMaintenanceMode}
                  />
                </div>
                <Button onClick={runMaintenance} disabled={isRunningMaintenance}>
                  {isRunningMaintenance ? 'Running Maintenance...' : 'Run Scheduled Maintenance'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>System Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="mb-4">
                  <Button onClick={createBackup}>
                    Create Manual Backup
                  </Button>
                </div>
                {['Database backup - 2024-01-15', 'File backup - 2024-01-14', 'Full system backup - 2024-01-13'].map((backup, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <span>{backup}</span>
                    <Button size="sm" variant="outline">Download</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates">
          <Card>
            <CardHeader>
              <CardTitle>System Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded bg-blue-50">
                  <div className="font-medium">Security Update Available</div>
                  <div className="text-sm text-gray-600">Critical security patches ready for installation</div>
                  <Button size="sm" className="mt-2">Install Now</Button>
                </div>
                <div className="p-4 border rounded bg-green-50">
                  <div className="font-medium">System Up to Date</div>
                  <div className="text-sm text-gray-600">All components are running the latest versions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenancePanel;
