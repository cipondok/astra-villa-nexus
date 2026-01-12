
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyListings from "./tools/PropertyListings";
import CreatePropertyListing from "./tools/CreatePropertyListing";
import ClientManagement from "./tools/ClientManagement";
import ScheduleViewings from "./tools/ScheduleViewings";
import CallLog from "./tools/CallLog";
import EmailTemplates from "./tools/EmailTemplates";
import MarketAnalysis from "./tools/MarketAnalysis";

const AgentTools = () => {
  return (
    <div className="space-y-2 sm:space-y-4 md:space-y-6">
      <Tabs defaultValue="property-listings" className="space-y-2 sm:space-y-4">
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-4 lg:grid-cols-7 h-8 sm:h-9 md:h-10">
            <TabsTrigger value="property-listings" className="flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3">Properties</TabsTrigger>
            <TabsTrigger value="create-listing" className="flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3">Create</TabsTrigger>
            <TabsTrigger value="clients" className="flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3">Clients</TabsTrigger>
            <TabsTrigger value="schedule-viewings" className="flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3">Viewings</TabsTrigger>
            <TabsTrigger value="call-log" className="flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3">Calls</TabsTrigger>
            <TabsTrigger value="email-templates" className="flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3">Emails</TabsTrigger>
            <TabsTrigger value="market-analysis" className="flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3">Market</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="property-listings">
          <PropertyListings />
        </TabsContent>

        <TabsContent value="create-listing">
          <CreatePropertyListing />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>

        <TabsContent value="schedule-viewings">
          <ScheduleViewings />
        </TabsContent>

        <TabsContent value="call-log">
          <CallLog />
        </TabsContent>

        <TabsContent value="email-templates">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="market-analysis">
          <MarketAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentTools;
