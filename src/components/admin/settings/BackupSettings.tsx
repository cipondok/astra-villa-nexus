
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backup & Recovery
        </CardTitle>
        <CardDescription>Manage system backups and data recovery</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="backupFrequency">Backup Frequency</Label>
            <select 
              id="backupFrequency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={backupSettings.backupFrequency}
              onChange={(e) => onBackupSettingChange('backupFrequency', e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <Label htmlFor="retentionDays">Retention Period (days)</Label>
            <Input
              id="retentionDays"
              type="number"
              value={backupSettings.retentionDays}
              onChange={(e) => onBackupSettingChange('retentionDays', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="autoBackup"
            checked={backupSettings.autoBackup}
            onCheckedChange={(checked) => onBackupSettingChange('autoBackup', checked)}
          />
          <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-3">Backup Operations</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={onCreateBackup} disabled={loading} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Create Backup Now
            </Button>
            <Button disabled={loading} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Latest
            </Button>
            <Button onClick={onSaveBackupSettings} disabled={loading} variant="outline" size="sm">
              Save Backup Settings
            </Button>
          </div>

          {backupSettings.lastBackup && (
            <div className="text-sm text-gray-600">
              Last backup: {new Date(backupSettings.lastBackup).toLocaleString()}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Recent Backups</h4>
          <div className="space-y-2">
            {['Database backup - 2025-06-24 10:30', 'Full system backup - 2025-06-23 10:30', 'Database backup - 2025-06-22 10:30'].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{backup}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupSettings;
