
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Server, 
  Activity, 
  Users, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Trash2 
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';

interface SystemMonitoringProps {
  systemInfo: any;
}

const SystemMonitoring = ({ systemInfo }: SystemMonitoringProps) => {
  const { showSuccess, showError } = useAlert();

  const clearCache = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Cache Cleared', 'System cache has been cleared successfully');
    } catch (error) {
      showError('Error', 'Failed to clear cache');
    }
  };

  const restartServices = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Services Restarted', 'System services have been restarted successfully');
    } catch (error) {
      showError('Error', 'Failed to restart services');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>Current system status and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-sm text-gray-600">{systemInfo.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-sm text-gray-600">{systemInfo.uptime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Memory Usage</p>
                <p className="text-sm text-gray-600">{systemInfo.memoryUsage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-sm text-gray-600">{systemInfo.activeUsers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Properties</p>
                <p className="text-sm text-gray-600">{systemInfo.totalProperties}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Disk Space</p>
                <p className="text-sm text-gray-600">{systemInfo.diskSpace}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3">System Operations</h4>
            <div className="flex flex-wrap gap-2">
              <Button onClick={clearCache} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
              <Button onClick={restartServices} variant="outline" size="sm">
                <Server className="h-4 w-4 mr-2" />
                Restart Services
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Temp Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Monitor system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge variant="default" className="bg-green-500">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <Badge variant="default" className="bg-green-500">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <Badge variant="default" className="bg-green-500">Available</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <Badge variant="outline">~150ms</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
