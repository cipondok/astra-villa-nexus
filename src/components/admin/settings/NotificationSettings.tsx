
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertTriangle, Calendar, Mail } from 'lucide-react';

interface NotificationSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const NotificationSettings = ({ settings, onInputChange }: NotificationSettingsProps) => {
  return (
    <div className="space-y-3">
      {/* General Notifications */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Bell className="h-3.5 w-3.5 text-primary" />
            General Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'emailNotifications', label: 'Email', desc: 'Via email', checked: settings.emailNotifications },
              { id: 'smsNotifications', label: 'SMS', desc: 'Via SMS', checked: settings.smsNotifications },
              { id: 'pushNotifications', label: 'Push', desc: 'Browser push', checked: settings.pushNotifications || false },
              { id: 'inAppNotifications', label: 'In-App', desc: 'Within app', checked: settings.inAppNotifications !== false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label htmlFor={item.id} className="text-[10px] font-medium text-foreground">{item.label}</Label>
                  <p className="text-[8px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Alert Categories */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-accent" />
            Admin Alert Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'systemAlerts', label: 'System', desc: 'DB, server issues', checked: settings.systemAlerts !== false },
              { id: 'securityAlerts', label: 'Security', desc: 'Login, suspicious', checked: settings.securityAlerts !== false },
              { id: 'userAlerts', label: 'User Activity', desc: 'Registrations', checked: settings.userAlerts !== false },
              { id: 'vendorAlerts', label: 'Vendor', desc: 'Service, compliance', checked: settings.vendorAlerts !== false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label htmlFor={item.id} className="text-[10px] font-medium text-foreground">{item.label}</Label>
                  <p className="text-[8px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Calendar className="h-3.5 w-3.5 text-secondary" />
            Notification Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Email Frequency</Label>
              <Select
                value={settings.emailFrequency || 'immediate'}
                onValueChange={(value) => onInputChange('emailFrequency', value)}
              >
                <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
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
              <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Quiet Hours</Label>
              <Select
                value={settings.quietHours || 'disabled'}
                onValueChange={(value) => onInputChange('quietHours', value)}
              >
                <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
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
              <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Min Priority</Label>
              <Select
                value={settings.alertPriority || 'medium'}
                onValueChange={(value) => onInputChange('alertPriority', value)}
              >
                <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
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

            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="weekendNotifications" className="text-[10px] font-medium text-foreground">Weekend</Label>
                <p className="text-[8px] text-muted-foreground">On weekends</p>
              </div>
              <Switch
                id="weekendNotifications"
                checked={settings.weekendNotifications !== false}
                onCheckedChange={(checked) => onInputChange('weekendNotifications', checked)}
                className="scale-75"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-destructive">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Mail className="h-3.5 w-3.5 text-destructive" />
            Emergency Contact Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'emergencyEmailAlerts', label: 'Emergency Email', desc: 'Critical issues via email', checked: settings.emergencyEmailAlerts !== false },
              { id: 'emergencySmsAlerts', label: 'Emergency SMS', desc: 'Critical issues via SMS', checked: settings.emergencySmsAlerts || false },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label htmlFor={item.id} className="text-[10px] font-medium text-foreground">{item.label}</Label>
                  <p className="text-[8px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                  className="scale-75"
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
