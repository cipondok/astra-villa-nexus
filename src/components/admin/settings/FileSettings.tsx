
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database } from 'lucide-react';

interface FileSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const FileSettings = ({ settings, onInputChange }: FileSettingsProps) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Database className="h-4 w-4 text-blue-500" />
          File Management
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Configure file upload and storage settings</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="maxFileSize" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Max File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => onInputChange('maxFileSize', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="allowedFileTypes" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Allowed File Types</Label>
            <Input
              id="allowedFileTypes"
              value={settings.allowedFileTypes}
              onChange={(e) => onInputChange('allowedFileTypes', e.target.value)}
              placeholder="jpg,png,pdf"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileSettings;
