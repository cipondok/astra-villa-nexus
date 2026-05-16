
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <div className="space-y-3">
      {/* Backup Configuration */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Database className="h-3.5 w-3.5 text-primary" />
            Backup & Recovery
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">Manage system backups and data recovery</p>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="backupFrequency" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Backup Frequency</Label>
              <Select 
                value={backupSettings.backupFrequency}
                onValueChange={(value) => onBackupSettingChange('backupFrequency', value)}
              >
                <SelectTrigger className="h-7 text-xs bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="retentionDays" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Retention (days)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={backupSettings.retentionDays}
                onChange={(e) => onBackupSettingChange('retentionDays', parseInt(e.target.value))}
                className="h-7 text-xs bg-background/50 border-border/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
            <div className="flex items-center gap-2">
              <Switch
                id="autoBackup"
                checked={backupSettings.autoBackup}
                onCheckedChange={(checked) => onBackupSettingChange('autoBackup', checked)}
                className="scale-75"
              />
              <Label htmlFor="autoBackup" className="text-[10px] text-muted-foreground">Enable Automatic Backups</Label>
            </div>
            <Badge 
              className={`text-[8px] h-4 px-1.5 ${backupSettings.autoBackup ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}
            >
              {backupSettings.autoBackup ? "Active" : "Disabled"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateBackup} disabled={loading} size="sm" className="h-6 text-[10px] px-2">
              <Upload className="h-2.5 w-2.5 mr-1" />
              Create Backup
            </Button>
            <Button disabled={loading} variant="outline" size="sm" className="h-6 text-[10px] px-2 bg-background/50 border-border/50">
              <Download className="h-2.5 w-2.5 mr-1" />
              Download Latest
            </Button>
            <Button onClick={onSaveBackupSettings} disabled={loading} variant="outline" size="sm" className="h-6 text-[10px] px-2 bg-background/50 border-border/50">
              Save Settings
            </Button>
          </div>

          {backupSettings.lastBackup && (
            <p className="text-[9px] text-muted-foreground">
              Last backup: {new Date(backupSettings.lastBackup).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-semibold text-foreground">Recent Backups</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="space-y-1.5">
            {['Database backup - 2025-06-24 10:30', 'Full system backup - 2025-06-23 10:30', 'Database backup - 2025-06-22 10:30'].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/30">
                <span className="text-[10px] text-muted-foreground">{backup}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                    <Download className="h-2.5 w-2.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/20">
                    <Trash2 className="h-2.5 w-2.5" />
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
