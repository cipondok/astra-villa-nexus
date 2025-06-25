
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  Bell, 
  Users, 
  Link,
  Play,
  Pause,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bot,
  Workflow
} from "lucide-react";

const AutomationFeaturesDashboard = () => {
  const [automationEnabled, setAutomationEnabled] = useState(true);

  // Mock automation data
  const workflowAutomation = [
    { 
      name: 'Property Approval Workflow', 
      status: 'Active', 
      triggers: 47, 
      success: 95, 
      lastRun: '2 minutes ago',
      description: 'Automatically approve properties that meet criteria'
    },
    { 
      name: 'Vendor Onboarding', 
      status: 'Active', 
      triggers: 23, 
      success: 87, 
      lastRun: '15 minutes ago',
      description: 'Streamlined vendor registration and verification'
    },
    { 
      name: 'Customer Support Routing', 
      status: 'Paused', 
      triggers: 156, 
      success: 92, 
      lastRun: '1 hour ago',
      description: 'Route support tickets to appropriate departments'
    }
  ];

  const smartNotifications = [
    { 
      type: 'High Priority Alerts', 
      enabled: true, 
      frequency: 'Immediate', 
      recipients: 5,
      description: 'Critical system alerts and security notifications'
    },
    { 
      type: 'Property Updates', 
      enabled: true, 
      frequency: 'Daily Digest', 
      recipients: 12,
      description: 'New property listings and status changes'
    },
    { 
      type: 'Vendor Performance', 
      enabled: false, 
      frequency: 'Weekly', 
      recipients: 3,
      description: 'Vendor performance metrics and ratings'
    }
  ];

  const bulkOperations = [
    { 
      operation: 'User Email Update', 
      status: 'Completed', 
      records: 1247, 
      progress: 100,
      startTime: '2024-06-25 10:00',
      duration: '45 minutes'
    },
    { 
      operation: 'Property Price Adjustment', 
      status: 'In Progress', 
      records: 856, 
      progress: 67,
      startTime: '2024-06-25 14:30',
      duration: '12 minutes'
    }
  ];

  const integrations = [
    { 
      name: 'Zapier Webhooks', 
      status: 'Connected', 
      lastSync: '5 minutes ago', 
      events: 234,
      description: 'Automate workflows with 3000+ apps'
    },
    { 
      name: 'Slack Notifications', 
      status: 'Connected', 
      lastSync: '1 hour ago', 
      events: 67,
      description: 'Team notifications and alerts'
    },
    { 
      name: 'Email Marketing', 
      status: 'Disconnected', 
      lastSync: 'Never', 
      events: 0,
      description: 'Automated email campaigns'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'connected':
      case 'completed':
        return 'bg-green-500';
      case 'paused':
      case 'in progress':
        return 'bg-yellow-500';
      case 'disconnected':
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Automation Features Dashboard
          </h2>
          <p className="text-muted-foreground">
            Workflow automation, smart notifications, bulk operations, and integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Master Automation</span>
          <Switch 
            checked={automationEnabled} 
            onCheckedChange={setAutomationEnabled}
          />
        </div>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Workflow Automation</TabsTrigger>
          <TabsTrigger value="notifications">Smart Notifications</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="integrations">Integration Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Automated Approval Processes
                </CardTitle>
                <CardDescription>Configure and monitor automated workflow processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowAutomation.map((workflow) => (
                    <div key={workflow.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{workflow.triggers} triggers</span>
                          <span>{workflow.success}% success rate</span>
                          <span>Last run: {workflow.lastRun}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          {workflow.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Create New Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                AI-Powered Alert Prioritization
              </CardTitle>
              <CardDescription>Configure smart notification rules and priorities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartNotifications.map((notification) => (
                  <div key={notification.type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.type}</h3>
                        <Switch checked={notification.enabled} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Frequency: {notification.frequency}</span>
                        <span>{notification.recipients} recipients</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button>
                  <Bot className="h-4 w-4 mr-2" />
                  Configure AI Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mass Data Management Tools
              </CardTitle>
              <CardDescription>Monitor and manage bulk operations across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bulkOperations.map((operation) => (
                  <div key={operation.operation} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{operation.operation}</h3>
                      <Badge className={getStatusColor(operation.status)}>
                        {operation.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{operation.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${operation.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{operation.records} records</span>
                        <span>Started: {operation.startTime}</span>
                        <span>Duration: {operation.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Start New Bulk Operation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Third-Party Service Integrations
              </CardTitle>
              <CardDescription>Manage connections with external services and APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Last sync: {integration.lastSync}</span>
                        <span>{integration.events} events processed</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant={integration.status === 'Connected' ? 'destructive' : 'default'}>
                        {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button>
                  <Link className="h-4 w-4 mr-2" />
                  Add New Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationFeaturesDashboard;
