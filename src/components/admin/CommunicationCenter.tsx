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
      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">Communication Center</h2>
              <Badge className="bg-chart-1/20 text-chart-1 text-[9px] px-1.5 py-0 h-4">Active</Badge>
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
          <TabsTrigger value="messages" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-chart-2/20 data-[state=active]:text-chart-2">
            <MessageSquare className="h-3 w-3" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-chart-1/20 data-[state=active]:text-chart-1">
            <Mail className="h-3 w-3" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-chart-4/20 data-[state=active]:text-chart-4">
            <Bell className="h-3 w-3" />
            Push
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-chart-3/20 data-[state=active]:text-chart-3">
            <Radio className="h-3 w-3" />
            Broadcasts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-chart-2/20 rounded flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-chart-2" />
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

            <Card className="border-border/50">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-chart-1/20 rounded flex items-center justify-center">
                    <Users className="h-3 w-3 text-chart-1" />
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
                    <span className="text-[10px] font-bold text-chart-1">94%</span>
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
          <Card className="border-border/50">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-chart-1/20 rounded flex items-center justify-center">
                  <Mail className="h-3 w-3 text-chart-1" />
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
          <Card className="border-border/50">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-chart-4/20 rounded flex items-center justify-center">
                  <Bell className="h-3 w-3 text-chart-4" />
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
          <Card className="border-border/50">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-chart-3/20 rounded flex items-center justify-center">
                  <Radio className="h-3 w-3 text-chart-3" />
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
