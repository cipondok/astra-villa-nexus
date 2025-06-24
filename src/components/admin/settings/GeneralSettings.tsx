
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

interface GeneralSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const GeneralSettings = ({ settings, loading, onInputChange, onSave }: GeneralSettingsProps) => {
  return (
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
              onChange={(e) => onInputChange('siteName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => onInputChange('siteDescription', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => onInputChange('maintenanceMode', checked)}
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
            onCheckedChange={(checked) => onInputChange('registrationEnabled', checked)}
          />
          <Label htmlFor="registrationEnabled">User Registration Enabled</Label>
        </div>

        <div className="pt-4">
          <Button onClick={onSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save General Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
