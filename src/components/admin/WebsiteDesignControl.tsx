import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const WebsiteDesignControl = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Website Design Settings
        </CardTitle>
        <CardDescription>
          Website design controls are temporarily disabled for system stability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Design customization features will be available in a future update.
        </p>
      </CardContent>
    </Card>
  );
};

export default WebsiteDesignControl;