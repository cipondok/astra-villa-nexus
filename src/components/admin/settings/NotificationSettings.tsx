
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Calendar, Mail } from 'lucide-react';

interface NotificationSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const NotificationSettings = ({ settings, onInputChange }: NotificationSettingsProps) => {
  return (
    <div className="space-y-4">
      {/* General Notifications */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4 text-yellow-500" />
            General Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'emailNotifications', label: 'Email', desc: 'Via email', checked: settings.emailNotifications },
              { id: 'smsNotifications', label: 'SMS', desc: 'Via SMS', checked: settings.smsNotifications },
              { id: 'pushNotifications', label: 'Push', desc: 'Browser push', checked: settings.pushNotifications || false },
              { id: 'inAppNotifications', label: 'In-App', desc: 'Within app', checked: settings.inAppNotifications !== false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <Label htmlFor={item.id} className="text-xs font-medium">{item.label}</Label>
                  <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Alert Categories */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Admin Alert Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'systemAlerts', label: 'System', desc: 'DB, server issues', checked: settings.systemAlerts !== false },
              { id: 'securityAlerts', label: 'Security', desc: 'Login, suspicious', checked: settings.securityAlerts !== false },
              { id: 'userAlerts', label: 'User Activity', desc: 'Registrations', checked: settings.userAlerts !== false },
              { id: 'vendorAlerts', label: 'Vendor', desc: 'Service, compliance', checked: settings.vendorAlerts !== false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <Label htmlFor={item.id} className="text-xs font-medium">{item.label}</Label>
                  <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-purple-500" />
            Notification Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Email Frequency</Label>
              <Select
                value={settings.emailFrequency || 'immediate'}
                onValueChange={(value) => onInputChange('emailFrequency', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Quiet Hours</Label>
              <Select
                value={settings.quietHours || 'disabled'}
                onValueChange={(value) => onInputChange('quietHours', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="22-08">10 PM - 8 AM</SelectItem>
                  <SelectItem value="23-07">11 PM - 7 AM</SelectItem>
                  <SelectItem value="00-06">12 AM - 6 AM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Min Priority</Label>
              <Select
                value={settings.alertPriority || 'medium'}
                onValueChange={(value) => onInputChange('alertPriority', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="weekendNotifications" className="text-xs font-medium">Weekend</Label>
                <p className="text-[9px] text-muted-foreground">On weekends</p>
              </div>
              <Switch
                id="weekendNotifications"
                checked={settings.weekendNotifications !== false}
                onCheckedChange={(checked) => onInputChange('weekendNotifications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Mail className="h-4 w-4 text-red-500" />
            Emergency Contact Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'emergencyEmailAlerts', label: 'Emergency Email', desc: 'Critical issues via email', checked: settings.emergencyEmailAlerts !== false },
              { id: 'emergencySmsAlerts', label: 'Emergency SMS', desc: 'Critical issues via SMS', checked: settings.emergencySmsAlerts || false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <Label htmlFor={item.id} className="text-xs font-medium">{item.label}</Label>
                  <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
