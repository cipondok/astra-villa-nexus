

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Construction, AlertTriangle } from 'lucide-react';


interface GeneralSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const GeneralSettings = ({ settings, loading, onInputChange, onSave }: GeneralSettingsProps) => {
  return (
    <div className="space-y-3">
      {/* Maintenance Mode - prominent at top */}
      <Card className={`border-l-4 ${settings.maintenanceMode ? 'bg-destructive/5 border-l-destructive border-destructive/30' : 'bg-card/50 border-border/50 border-l-chart-3'}`}>
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Construction className={`h-3.5 w-3.5 ${settings.maintenanceMode ? 'text-destructive' : 'text-chart-3'}`} />
            Maintenance Mode
            {settings.maintenanceMode && (
              <Badge variant="destructive" className="text-[8px] h-4 px-1.5 ml-auto animate-pulse">ACTIVE</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          {settings.maintenanceMode && (
            <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-[10px] text-destructive">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>Site is currently offline for visitors. Admins can still access the dashboard.</span>
            </div>
          )}
          <div className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/30">
            <div>
              <Label htmlFor="maintenanceMode" className="text-[10px] font-medium text-foreground">Enable Maintenance Mode</Label>
              <p className="text-[8px] text-muted-foreground">Block public access to the site</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode || false}
              onCheckedChange={(checked) => onInputChange('maintenanceMode', checked)}
              className="scale-75"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maintenanceMessage" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Custom Message (shown to visitors)</Label>
            <Textarea
              id="maintenanceMessage"
              value={settings.maintenanceMessage || ''}
              onChange={(e) => onInputChange('maintenanceMessage', e.target.value)}
              placeholder="Kami sedang melakukan pemeliharaan sistem. Mohon kembali beberapa saat lagi."
              rows={2}
              className="text-xs min-h-[40px] bg-background/50 border-border/50"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onSave} disabled={loading} size="sm" className={`h-6 text-[10px] px-2 ${settings.maintenanceMode ? 'bg-destructive hover:bg-destructive/90' : ''}`}>
              {loading ? 'Saving...' : settings.maintenanceMode ? 'Save & Keep Active' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Site Configuration */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Globe className="h-3.5 w-3.5 text-primary" />
            Basic Site Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <div className="space-y-1">
            <Label htmlFor="siteName" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName || ''}
              onChange={(e) => onInputChange('siteName', e.target.value)}
              placeholder="Enter your site name"
              className="h-7 text-xs bg-background/50 border-border/50"
            />
          </div>
          
          <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
            <div>
              <Label htmlFor="registrationEnabled" className="text-[10px] font-medium text-foreground">User Registration</Label>
              <p className="text-[8px] text-muted-foreground">Allow new users</p>
            </div>
            <Switch
              id="registrationEnabled"
              checked={settings.registrationEnabled !== false}
              onCheckedChange={(checked) => onInputChange('registrationEnabled', checked)}
              className="scale-75"
            />
          </div>
        </CardContent>
      </Card>


      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={loading} size="sm" className="h-6 text-[10px] px-2">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
