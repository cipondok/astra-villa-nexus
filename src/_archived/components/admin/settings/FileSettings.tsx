
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
    <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
      <CardHeader className="py-2 px-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Database className="h-3.5 w-3.5 text-primary" />
          File Management
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Configure file upload and storage settings</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="maxFileSize" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Max File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => onInputChange('maxFileSize', e.target.value)}
              className="h-7 text-xs bg-background/50 border-border/50"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="allowedFileTypes" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Allowed File Types</Label>
            <Input
              id="allowedFileTypes"
              value={settings.allowedFileTypes}
              onChange={(e) => onInputChange('allowedFileTypes', e.target.value)}
              placeholder="jpg,png,pdf"
              className="h-7 text-xs bg-background/50 border-border/50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileSettings;
