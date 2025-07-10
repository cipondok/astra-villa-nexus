
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, AlertTriangle, Users, Calendar } from 'lucide-react';

interface NotificationSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const NotificationSettings = ({ settings, onInputChange }: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>Configure system notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Notification Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            General Notifications
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => onInputChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => onInputChange('smsNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications || false}
                onCheckedChange={(checked) => onInputChange('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">Show notifications within the app</p>
              </div>
              <Switch
                id="inAppNotifications"
                checked={settings.inAppNotifications || true}
                onCheckedChange={(checked) => onInputChange('inAppNotifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Admin Alert Categories */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Admin Alert Categories
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="systemAlerts">System Alerts</Label>
                <p className="text-xs text-muted-foreground">Database errors, server issues</p>
              </div>
              <Switch
                id="systemAlerts"
                checked={settings.systemAlerts !== false}
                onCheckedChange={(checked) => onInputChange('systemAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="securityAlerts">Security Alerts</Label>
                <p className="text-xs text-muted-foreground">Login attempts, suspicious activity</p>
              </div>
              <Switch
                id="securityAlerts"
                checked={settings.securityAlerts !== false}
                onCheckedChange={(checked) => onInputChange('securityAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="userAlerts">User Activity Alerts</Label>
                <p className="text-xs text-muted-foreground">New registrations, account issues</p>
              </div>
              <Switch
                id="userAlerts"
                checked={settings.userAlerts !== false}
                onCheckedChange={(checked) => onInputChange('userAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vendorAlerts">Vendor Alerts</Label>
                <p className="text-xs text-muted-foreground">Service submissions, compliance issues</p>
              </div>
              <Switch
                id="vendorAlerts"
                checked={settings.vendorAlerts !== false}
                onCheckedChange={(checked) => onInputChange('vendorAlerts', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notification Timing */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Notification Timing
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailFrequency">Email Frequency</Label>
              <Select
                value={settings.emailFrequency || 'immediate'}
                onValueChange={(value) => onInputChange('emailFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quietHours">Quiet Hours</Label>
              <Select
                value={settings.quietHours || 'disabled'}
                onValueChange={(value) => onInputChange('quietHours', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quiet hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="22-08">10 PM - 8 AM</SelectItem>
                  <SelectItem value="23-07">11 PM - 7 AM</SelectItem>
                  <SelectItem value="00-06">12 AM - 6 AM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alertPriority">Minimum Alert Priority</Label>
              <Select
                value={settings.alertPriority || 'medium'}
                onValueChange={(value) => onInputChange('alertPriority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekendNotifications">Weekend Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications on weekends</p>
              </div>
              <Switch
                id="weekendNotifications"
                checked={settings.weekendNotifications !== false}
                onCheckedChange={(checked) => onInputChange('weekendNotifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Emergency Contact Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emergencyEmailAlerts">Emergency Email Alerts</Label>
                <p className="text-xs text-muted-foreground">Critical system issues via email</p>
              </div>
              <Switch
                id="emergencyEmailAlerts"
                checked={settings.emergencyEmailAlerts !== false}
                onCheckedChange={(checked) => onInputChange('emergencyEmailAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emergencySmsAlerts">Emergency SMS Alerts</Label>
                <p className="text-xs text-muted-foreground">Critical system issues via SMS</p>
              </div>
              <Switch
                id="emergencySmsAlerts"
                checked={settings.emergencySmsAlerts || false}
                onCheckedChange={(checked) => onInputChange('emergencySmsAlerts', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
