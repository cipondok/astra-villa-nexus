
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface SecuritySettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const SecuritySettings = ({ settings, onInputChange }: SecuritySettingsProps) => {
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-red-500" />
          Security Settings
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Configure security and authentication settings</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="sessionTimeout" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Session Timeout (min)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => onInputChange('sessionTimeout', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maxLoginAttempts" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Max Login Attempts</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => onInputChange('maxLoginAttempts', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
