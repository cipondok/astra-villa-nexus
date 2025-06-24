
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

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
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="emailNotifications"
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => onInputChange('emailNotifications', checked)}
          />
          <Label htmlFor="emailNotifications">Email Notifications</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="smsNotifications"
            checked={settings.smsNotifications}
            onCheckedChange={(checked) => onInputChange('smsNotifications', checked)}
          />
          <Label htmlFor="smsNotifications">SMS Notifications</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
