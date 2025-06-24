
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface SecuritySettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const SecuritySettings = ({ settings, onInputChange }: SecuritySettingsProps) => {
  return (
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
              onChange={(e) => onInputChange('sessionTimeout', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => onInputChange('maxLoginAttempts', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
