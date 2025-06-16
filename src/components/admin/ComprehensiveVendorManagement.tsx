
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  List
} from "lucide-react";

const ComprehensiveVendorManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI-Powered Vendor Management System</h1>
        <p className="text-muted-foreground mt-2">
          Complete vendor lifecycle management with AI verification, fraud detection, and performance analytics
        </p>
      </div>

      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            AI Verification
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Fraud Detection
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            AI Matching
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendor Mgmt
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          <AIVendorVerification />
        </TabsContent>

        <TabsContent value="fraud">
          <VendorFraudDetection />
        </TabsContent>

        <TabsContent value="analytics">
          <VendorPerformanceAnalytics />
        </TabsContent>

        <TabsContent value="matching">
          <AIVendorMatching />
        </TabsContent>

        <TabsContent value="management">
          <VendorManagement />
        </TabsContent>

        <TabsContent value="categories">
          <VendorServiceCategoryManagement />
        </TabsContent>

        <TabsContent value="services">
          <AdminVendorServiceManagement />
        </TabsContent>
      </Tabs>

      {/* System Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 AI Vendor Management Architecture</CardTitle>
          <CardDescription>Technical implementation overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">🔧 Core Components</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Multi-Tier Verification:</strong> ID + Facial Recognition + Business License</li>
                <li>• <strong>AI Classification:</strong> NLP-powered service categorization</li>
                <li>• <strong>Smart Matching:</strong> ML-based vendor recommendation engine</li>
                <li>• <strong>Fraud Detection:</strong> BERT + Anomaly detection (90%+ precision)</li>
                <li>• <strong>Performance Analytics:</strong> Real-time dashboard with AI insights</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">📊 Key Metrics</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Trust Scores:</strong> 1-100 scale with confidence intervals</li>
                <li>• <strong>Matching Accuracy:</strong> Multi-factor scoring algorithm</li>
                <li>• <strong>Response Time:</strong> Real-time performance tracking</li>
                <li>• <strong>Risk Assessment:</strong> Low/Medium/High/Critical levels</li>
                <li>• <strong>AI Alerts:</strong> Proactive performance monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveVendorManagement;
