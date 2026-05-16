
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
    <Card className="bg-card/50 border-border/50 border-l-4 border-l-destructive">
      <CardHeader className="py-2 px-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Shield className="h-3.5 w-3.5 text-destructive" />
          Security Settings
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Configure security and authentication settings</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="sessionTimeout" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Session Timeout (min)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => onInputChange('sessionTimeout', e.target.value)}
              className="h-7 text-xs bg-background/50 border-border/50"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maxLoginAttempts" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Max Login Attempts</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => onInputChange('maxLoginAttempts', e.target.value)}
              className="h-7 text-xs bg-background/50 border-border/50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
