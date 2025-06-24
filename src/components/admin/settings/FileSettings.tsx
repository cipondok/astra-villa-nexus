
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database } from 'lucide-react';

interface FileSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const FileSettings = ({ settings, onInputChange }: FileSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          File Management
        </CardTitle>
        <CardDescription>Configure file upload and storage settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => onInputChange('maxFileSize', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
            <Input
              id="allowedFileTypes"
              value={settings.allowedFileTypes}
              onChange={(e) => onInputChange('allowedFileTypes', e.target.value)}
              placeholder="jpg,png,pdf"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileSettings;
