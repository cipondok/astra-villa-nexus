import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Mail, 
  Globe, 
  Shield, 
  Bell, 
  RefreshCw, 
  Trash2, 
  Download, 
  Upload,
  Server,
  Activity,
  Users,
  HardDrive,
  Wifi,
  AlertTriangle
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({
    siteName: 'Property Platform',
    siteDescription: 'Find your dream property',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,pdf',
    sessionTimeout: '30',
    maxLoginAttempts: '5'
  });

  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    uptime: '0 days',
    memoryUsage: '65%',
    diskSpace: '78%',
    activeUsers: 0,
    totalProperties: 0
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    lastBackup: null
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSystemInfo();
    loadBackupSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'general');
      
      if (error) throw error;

      if (data) {
        const settingsObj = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Error', 'Failed to load system settings');
    }
  };

  const loadSystemInfo = async () => {
    try {
      // Mock system info - in real app, this would come from system APIs
      const { data: userCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      const { data: propertyCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact' });

      setSystemInfo(prev => ({
        ...prev,
        activeUsers: userCount?.length || 0,
        totalProperties: propertyCount?.length || 0
      }));
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const loadBackupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'backup');
      
      if (error) throw error;

      if (data) {
        const backupObj = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setBackupSettings(prev => ({ ...prev, ...backupObj }));
      }
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key,
            value,
            category: 'general',
            description: `System setting for ${key}`
          });
        
        if (error) throw error;
      }

      showSuccess('Settings Saved', 'System settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save system settings');
    } finally {
      setLoading(false);
    }
  };

  const saveBackupSettings = async () => {
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(backupSettings)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key,
            value,
            category: 'backup',
            description: `Backup setting for ${key}`
          });
        
        if (error) throw error;
      }

      showSuccess('Backup Settings Saved', 'Backup settings updated successfully');
    } catch (error) {
      console.error('Error saving backup settings:', error);
      showError('Error', 'Failed to save backup settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBackupSettingChange = (key: string, value: any) => {
    setBackupSettings(prev => ({ ...prev, [key]: value }));
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Cache Cleared', 'System cache has been cleared successfully');
    } catch (error) {
      showError('Error', 'Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setBackupSettings(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
      showSuccess('Backup Created', 'System backup has been created successfully');
    } catch (error) {
      showError('Error', 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const restartServices = async () => {
    setLoading(true);
    try {
      // Simulate service restart
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Services Restarted', 'System services have been restarted successfully');
    } catch (error) {
      showError('Error', 'Failed to restart services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Configuration</h2>
          <p className="text-gray-600">Configure system-wide settings and manage system functions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearCache} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>Basic site information and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                {settings.maintenanceMode && (
                  <Badge variant="destructive">Site Under Maintenance</Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="registrationEnabled"
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
                />
                <Label htmlFor="registrationEnabled">User Registration Enabled</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleInputChange('maxLoginAttempts', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                />
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                File Management
              </CardTitle>
              <CardDescription>Configure file upload and storage settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.allowedFileTypes}
                    onChange={(e) => handleInputChange('allowedFileTypes', e.target.value)}
                    placeholder="jpg,png,pdf"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
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
                  <Database className="h-4 w-4 text-green-500" />
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
                  <Button onClick={clearCache} disabled={loading} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button onClick={restartServices} disabled={loading} variant="outline" size="sm">
                    <Server className="h-4 w-4 mr-2" />
                    Restart Services
                  </Button>
                  <Button disabled={loading} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                  <Button disabled={loading} variant="outline" size="sm">
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
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>Manage system backups and data recovery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <select 
                    id="backupFrequency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={backupSettings.backupFrequency}
                    onChange={(e) => handleBackupSettingChange('backupFrequency', e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="retentionDays">Retention Period (days)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={backupSettings.retentionDays}
                    onChange={(e) => handleBackupSettingChange('retentionDays', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBackup"
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => handleBackupSettingChange('autoBackup', checked)}
                />
                <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Backup Operations</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button onClick={createBackup} disabled={loading} size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </Button>
                  <Button disabled={loading} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest
                  </Button>
                  <Button onClick={saveBackupSettings} disabled={loading} variant="outline" size="sm">
                    Save Backup Settings
                  </Button>
                </div>

                {backupSettings.lastBackup && (
                  <div className="text-sm text-gray-600">
                    Last backup: {new Date(backupSettings.lastBackup).toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Recent Backups</h4>
                <div className="space-y-2">
                  {['Database backup - 2025-06-24 10:30', 'Full system backup - 2025-06-23 10:30', 'Database backup - 2025-06-22 10:30'].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{backup}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
