import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CalendarOff, Users } from 'lucide-react';
import AgentAvailabilityManager from './AgentAvailabilityManager';
import AgentBlockedDatesManager from './AgentBlockedDatesManager';
import AgentVisitRequests from './AgentVisitRequests';

export default function AgentCalendarTab() {
  return (
    <div className="space-y-2">
      <Tabs defaultValue="requests" className="space-y-2">
        <TabsList className="inline-flex w-full h-8 p-0.5 bg-muted/30 border border-border/50 rounded-lg gap-0.5">
          <TabsTrigger value="requests" className="flex-1 text-[9px] sm:text-[10px] px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> Requests
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex-1 text-[9px] sm:text-[10px] px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Availability
          </TabsTrigger>
          <TabsTrigger value="blocked" className="flex-1 text-[9px] sm:text-[10px] px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
            <CalendarOff className="h-3 w-3" /> Blocked
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <AgentVisitRequests />
        </TabsContent>

        <TabsContent value="availability">
          <AgentAvailabilityManager />
        </TabsContent>

        <TabsContent value="blocked">
          <AgentBlockedDatesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
