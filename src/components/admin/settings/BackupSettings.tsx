
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Database, Upload, Download, Trash2 } from 'lucide-react';

interface BackupSettingsProps {
  backupSettings: any;
  loading: boolean;
  onBackupSettingChange: (key: string, value: any) => void;
  onSaveBackupSettings: () => void;
  onCreateBackup: () => void;
}

const BackupSettings = ({ 
  backupSettings, 
  loading, 
  onBackupSettingChange, 
  onSaveBackupSettings, 
  onCreateBackup 
}: BackupSettingsProps) => {
  return (
    <div className="space-y-4">
      {/* Backup Configuration */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Database className="h-4 w-4 text-green-500" />
            Backup & Recovery
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">Manage system backups and data recovery</p>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="backupFrequency" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Backup Frequency</Label>
              <select 
                id="backupFrequency"
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={backupSettings.backupFrequency}
                onChange={(e) => onBackupSettingChange('backupFrequency', e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="retentionDays" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Retention (days)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={backupSettings.retentionDays}
                onChange={(e) => onBackupSettingChange('retentionDays', parseInt(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                id="autoBackup"
                checked={backupSettings.autoBackup}
                onCheckedChange={(checked) => onBackupSettingChange('autoBackup', checked)}
              />
              <Label htmlFor="autoBackup" className="text-xs">Enable Automatic Backups</Label>
            </div>
            <Badge variant={backupSettings.autoBackup ? "default" : "secondary"} className="text-[9px]">
              {backupSettings.autoBackup ? "Active" : "Disabled"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateBackup} disabled={loading} size="sm" className="h-7 text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Create Backup
            </Button>
            <Button disabled={loading} variant="outline" size="sm" className="h-7 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Download Latest
            </Button>
            <Button onClick={onSaveBackupSettings} disabled={loading} variant="outline" size="sm" className="h-7 text-xs">
              Save Settings
            </Button>
          </div>

          {backupSettings.lastBackup && (
            <p className="text-[10px] text-muted-foreground">
              Last backup: {new Date(backupSettings.lastBackup).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Recent Backups</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="space-y-2">
            {['Database backup - 2025-06-24 10:30', 'Full system backup - 2025-06-23 10:30', 'Database backup - 2025-06-22 10:30'].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                <span className="text-xs">{backup}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;
