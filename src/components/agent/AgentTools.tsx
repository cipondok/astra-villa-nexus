
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CallLog from "./tools/CallLog";
import EmailTemplates from "./tools/EmailTemplates";
import ScheduleViewings from "./tools/ScheduleViewings";
import MarketAnalysis from "./tools/MarketAnalysis";

const AgentTools = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="call-log" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="call-log">Call Log</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="schedule-viewings">Schedule Viewings</TabsTrigger>
          <TabsTrigger value="market-analysis">Market Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="call-log">
          <CallLog />
        </TabsContent>

        <TabsContent value="email-templates">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="schedule-viewings">
          <ScheduleViewings />
        </TabsContent>

        <TabsContent value="market-analysis">
          <MarketAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentTools;
