
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Palette, Bell, Filter, Clock, Volume2 } from 'lucide-react';
import AlertCategoryManager from './AlertCategoryManager';

const AlertCustomizationPanel = () => {
  const [alertSettings, setAlertSettings] = useState({
    maxAlerts: 50,
    autoRefreshInterval: 10,
    soundEnabled: true,
    vibrationEnabled: true,
    priorityThreshold: 3,
    colorScheme: 'default'
  });

  const colorSchemes = [
    { id: 'default', name: 'Default', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] },
    { id: 'modern', name: 'Modern', colors: ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E'] },
    { id: 'nature', name: 'Nature', colors: ['#22C55E', '#84CC16', '#EAB308', '#F97316'] },
    { id: 'ocean', name: 'Ocean', colors: ['#0EA5E9', '#06B6D4', '#14B8A6', '#10B981'] }
  ];

  const alertPriorities = [
    { level: 1, name: 'Info', color: 'bg-blue-100 text-blue-800', description: 'General information' },
    { level: 2, name: 'Low', color: 'bg-green-100 text-green-800', description: 'Minor issues' },
    { level: 3, name: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Moderate attention needed' },
    { level: 4, name: 'High', color: 'bg-orange-100 text-orange-800', description: 'Important issues' },
    { level: 5, name: 'Critical', color: 'bg-red-100 text-red-800', description: 'Urgent action required' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Alert System Customization
          </CardTitle>
          <CardDescription>
            Customize alert appearance, behavior, and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="categories" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="timing" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Timing
              </TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories" className="mt-6">
              <AlertCategoryManager />
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Color Schemes</CardTitle>
                    <CardDescription>Choose a color scheme for alert categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {colorSchemes.map((scheme) => (
                        <div 
                          key={scheme.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            alertSettings.colorScheme === scheme.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setAlertSettings(prev => ({ ...prev, colorScheme: scheme.id }))}
                        >
                          <div className="text-sm font-medium mb-2">{scheme.name}</div>
                          <div className="flex gap-1">
                            {scheme.colors.map((color, index) => (
                              <div 
                                key={index}
                                className="w-6 h-6 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Priority Levels</CardTitle>
                    <CardDescription>Visual representation of alert priorities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alertPriorities.map((priority) => (
                        <div key={priority.level} className="flex items-center gap-3">
                          <Badge className={priority.color}>
                            Level {priority.level}
                          </Badge>
                          <span className="font-medium">{priority.name}</span>
                          <span className="text-sm text-muted-foreground">{priority.description}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notification Behavior</CardTitle>
                    <CardDescription>Configure how alerts behave and notify you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Sound Notifications</span>
                          <p className="text-sm text-muted-foreground">Play sound when new alerts arrive</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Volume2 className="h-4 w-4 mr-1" />
                          Test Sound
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Auto-refresh Interval</span>
                          <p className="text-sm text-muted-foreground">How often to check for new alerts</p>
                        </div>
                        <select className="px-3 py-1 border rounded">
                          <option value="5">5 seconds</option>
                          <option value="10">10 seconds</option>
                          <option value="30">30 seconds</option>
                          <option value="60">1 minute</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Maximum Alerts Display</span>
                          <p className="text-sm text-muted-foreground">Maximum number of alerts to show</p>
                        </div>
                        <select className="px-3 py-1 border rounded">
                          <option value="25">25 alerts</option>
                          <option value="50">50 alerts</option>
                          <option value="100">100 alerts</option>
                          <option value="200">200 alerts</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alert Filters</CardTitle>
                  <CardDescription>Set up filters to focus on specific types of alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Advanced filtering options coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timing Tab */}
            <TabsContent value="timing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alert Timing</CardTitle>
                  <CardDescription>Configure timing and scheduling for alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Timing configuration options coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertCustomizationPanel;
