import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mail, Bell, Send, Users, Radio } from 'lucide-react';

const CommunicationCenter = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">Communication Center</h2>
              <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[9px] px-1.5 py-0 h-4">Active</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Manage communication channels and messaging</p>
          </div>
        </div>
        <Button size="sm" className="h-7 text-[10px]">
          <Send className="h-3 w-3 mr-1" />
          Broadcast
        </Button>
      </div>

      <Tabs defaultValue="messages" className="space-y-3">
        <TabsList className="grid w-full grid-cols-4 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="messages" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400">
            <MessageSquare className="h-3 w-3" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400">
            <Mail className="h-3 w-3" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
            <Bell className="h-3 w-3" />
            Push
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400">
            <Radio className="h-3 w-3" />
            Broadcasts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-blue-200/50 dark:border-blue-800/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-blue-600" />
                  </div>
                  <CardTitle className="text-xs">Recent Messages</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {['User inquiry about property', 'Vendor registration request', 'General support question'].map((msg, i) => (
                    <div key={i} className="p-2 bg-muted/30 rounded-lg">
                      <div className="text-[10px] font-medium">{msg}</div>
                      <div className="text-[9px] text-muted-foreground">2 hours ago</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200/50 dark:border-green-800/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                    <Users className="h-3 w-3 text-green-600" />
                  </div>
                  <CardTitle className="text-xs">Statistics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">Today's Messages</span>
                    <span className="text-[10px] font-bold">47</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">Response Rate</span>
                    <span className="text-[10px] font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">Avg Response Time</span>
                    <span className="text-[10px] font-bold">2.5 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emails" className="mt-3">
          <Card className="border-green-200/50 dark:border-green-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                  <Mail className="h-3 w-3 text-green-600" />
                </div>
                <CardTitle className="text-xs">Email Templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {['Welcome Email', 'Property Approval', 'Vendor Verification', 'Password Reset'].map((template) => (
                  <div key={template} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">{template}</span>
                    <Button size="sm" variant="outline" className="h-6 text-[9px] px-2">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-3">
          <Card className="border-purple-200/50 dark:border-purple-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                  <Bell className="h-3 w-3 text-purple-600" />
                </div>
                <CardTitle className="text-xs">Push Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-32 flex items-center justify-center text-[10px] text-muted-foreground bg-muted/30 rounded-lg">
                Push Notification Management
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="mt-3">
          <Card className="border-orange-200/50 dark:border-orange-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
                  <Radio className="h-3 w-3 text-orange-600" />
                </div>
                <CardTitle className="text-xs">Broadcast Messages</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-32 flex items-center justify-center text-[10px] text-muted-foreground bg-muted/30 rounded-lg">
                Broadcast Management Interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenter;
