
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Wrench, Database, Server, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const MaintenancePanel = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Maintenance</h2>
          <p className="text-gray-600">System maintenance, updates, and health monitoring</p>
        </div>
        <Button>
          <Wrench className="h-4 w-4 mr-2" />
          Run Maintenance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold">98.5%</p>
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
                <p className="text-2xl font-bold">99.9%</p>
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
                <p className="text-2xl font-bold">2.4GB</p>
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
                <p className="text-2xl font-bold">2</p>
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
                  { name: 'Email Service', status: 'warning', uptime: '98.5%' },
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
                  <Switch />
                </div>
                <Button>Schedule Maintenance</Button>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenancePanel;
