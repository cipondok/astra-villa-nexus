
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Settings, Activity, BarChart, Cpu } from 'lucide-react';
import TokenConfigurationPanel from './TokenConfigurationPanel';
import TokenIntegrationStatus from './TokenIntegrationStatus';
import AstraTokenManagement from './AstraTokenManagement';
import AstraTokenAPIConfiguration from './AstraTokenAPIConfiguration';

const TokenManagementHub = () => {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            ASTRA Token Management Hub
          </CardTitle>
          <CardDescription>
            Comprehensive token system management and configuration
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            API Setup
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Integration Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <AstraTokenAPIConfiguration />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <TokenConfigurationPanel />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <AstraTokenManagement />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <TokenIntegrationStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenManagementHub;
