
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Palette } from 'lucide-react';
import AlertCustomizationPanel from './AlertCustomizationPanel';

const AlertConfigurationTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alert Configuration</h2>
          <p className="text-muted-foreground">
            Customize your alert system categories, notifications, and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
          <Palette className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      <AlertCustomizationPanel />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-xs text-muted-foreground">Active Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-xs text-muted-foreground">Alert Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">High Priority Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <p className="text-xs text-muted-foreground">Monitoring Status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertConfigurationTab;
