
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
    <div className="space-y-6">
      <Tabs defaultValue="property-listings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="property-listings">Properties</TabsTrigger>
          <TabsTrigger value="create-listing">Create Listing</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="schedule-viewings">Viewings</TabsTrigger>
          <TabsTrigger value="call-log">Calls</TabsTrigger>
          <TabsTrigger value="email-templates">Emails</TabsTrigger>
          <TabsTrigger value="market-analysis">Market</TabsTrigger>
        </TabsList>

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
