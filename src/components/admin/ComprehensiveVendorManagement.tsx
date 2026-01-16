import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIVendorVerification from "./AIVendorVerification";
import VendorFraudDetection from "./VendorFraudDetection";
import VendorPerformanceAnalytics from "./VendorPerformanceAnalytics";
import AIVendorMatching from "./AIVendorMatching";
import VendorManagement from "./VendorManagement";
import VendorServiceCategoryManagement from "./VendorServiceCategoryManagement";
import AdminVendorServiceManagement from "./AdminVendorServiceManagement";
import { 
  Shield, 
  Brain, 
  TrendingUp, 
  Search, 
  Users, 
  Settings,
  List,
  Bot
} from "lucide-react";

const ComprehensiveVendorManagement = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-lg border border-violet-200/50 dark:border-violet-800/50">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">AI-Powered Vendor Management</h2>
            <Badge className="bg-violet-500/20 text-violet-700 dark:text-violet-400 text-[9px] px-1.5 py-0 h-4">AI System</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Complete vendor lifecycle with AI verification, fraud detection & analytics</p>
        </div>
      </div>

      <Tabs defaultValue="verification" className="space-y-3">
        <TabsList className="grid w-full grid-cols-7 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="verification" className="flex items-center gap-1 text-[9px] h-7 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400">
            <Shield className="h-3 w-3" />
            Verify
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-1 text-[9px] h-7 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400">
            <Brain className="h-3 w-3" />
            Fraud
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-[9px] h-7 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400">
            <TrendingUp className="h-3 w-3" />
            Perf
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex items-center gap-1 text-[9px] h-7 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400">
            <Search className="h-3 w-3" />
            Match
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-1 text-[9px] h-7 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400">
            <Users className="h-3 w-3" />
            Mgmt
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1 text-[9px] h-7 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-700 dark:data-[state=active]:text-cyan-400">
            <List className="h-3 w-3" />
            Cat
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-1 text-[9px] h-7 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
            <Settings className="h-3 w-3" />
            Svc
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="mt-3">
          <AIVendorVerification />
        </TabsContent>

        <TabsContent value="fraud" className="mt-3">
          <VendorFraudDetection />
        </TabsContent>

        <TabsContent value="analytics" className="mt-3">
          <VendorPerformanceAnalytics />
        </TabsContent>

        <TabsContent value="matching" className="mt-3">
          <AIVendorMatching />
        </TabsContent>

        <TabsContent value="management" className="mt-3">
          <VendorManagement />
        </TabsContent>

        <TabsContent value="categories" className="mt-3">
          <VendorServiceCategoryManagement />
        </TabsContent>

        <TabsContent value="services" className="mt-3">
          <AdminVendorServiceManagement />
        </TabsContent>
      </Tabs>

      {/* System Architecture Overview */}
      <Card className="border-indigo-200/50 dark:border-indigo-800/30">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center">
              <Brain className="h-3 w-3 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xs">AI Architecture Overview</CardTitle>
              <CardDescription className="text-[9px]">Technical implementation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-2 bg-muted/30 rounded-lg">
              <h3 className="text-[10px] font-semibold mb-2">🔧 Core Components</h3>
              <ul className="space-y-1 text-[9px] text-muted-foreground">
                <li>• Multi-Tier Verification: ID + Facial + License</li>
                <li>• NLP-powered service categorization</li>
                <li>• ML-based vendor recommendation</li>
                <li>• BERT + Anomaly detection (90%+ precision)</li>
              </ul>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <h3 className="text-[10px] font-semibold mb-2">📊 Key Metrics</h3>
              <ul className="space-y-1 text-[9px] text-muted-foreground">
                <li>• Trust Scores: 1-100 scale</li>
                <li>• Multi-factor scoring algorithm</li>
                <li>• Real-time performance tracking</li>
                <li>• Low/Medium/High/Critical risk levels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveVendorManagement;
