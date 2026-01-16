import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DollarSign, Calculator, Activity, History, Bug, RefreshCw, CreditCard } from "lucide-react";
import TransactionManagementHub from "./TransactionManagementHub";
import IndonesianTaxConfiguration from "./IndonesianTaxConfiguration";
import RealTimeTransactionMonitor from "./RealTimeTransactionMonitor";
import TransactionAuditTrail from "./TransactionAuditTrail";
import FeedbackBugSystem from "./FeedbackBugSystem";

const text = {
  en: {
    title: "Transaction Management",
    subtitle: "Complete transaction management with taxes, monitoring, and audit trails",
    transactions: "Transactions",
    taxConfig: "Tax Config",
    liveMonitor: "Live Monitor",
    auditTrail: "Audit Trail",
    feedbackBugs: "Feedback & Bugs"
  },
  id: {
    title: "Manajemen Transaksi",
    subtitle: "Manajemen transaksi lengkap dengan pajak, monitoring, dan jejak audit",
    transactions: "Transaksi",
    taxConfig: "Konfigurasi Pajak",
    liveMonitor: "Monitor Langsung",
    auditTrail: "Jejak Audit",
    feedbackBugs: "Umpan Balik & Bug"
  }
};

const TransactionManagementTabs = () => {
  const { language } = useLanguage();
  const t = text[language];
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Header - Same style as Dashboard Overview */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 via-background to-green-500/5 rounded-xl border border-border/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold">{t.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
              <span>•</span>
              <span>{t.subtitle}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-xs h-6 px-2.5 border-green-500/30 text-green-600 dark:text-green-400">
          <Activity className="h-3 w-3 mr-1" />
          Real-time Active
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-10 p-1 bg-muted/50 rounded-lg grid grid-cols-5 gap-1">
          <TabsTrigger 
            value="transactions" 
            className="h-8 text-xs rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-1.5 px-3"
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.transactions}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tax-config" 
            className="h-8 text-xs rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-1.5 px-3"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.taxConfig}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="live-monitor" 
            className="h-8 text-xs rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-1.5 px-3"
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.liveMonitor}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="audit-trail" 
            className="h-8 text-xs rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-1.5 px-3"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.auditTrail}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="feedback-bugs" 
            className="h-8 text-xs rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-1.5 px-3"
          >
            <Bug className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.feedbackBugs}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-3">
          <ErrorBoundary>
            <TransactionManagementHub />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="tax-config" className="mt-3">
          <ErrorBoundary>
            <IndonesianTaxConfiguration />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="live-monitor" className="mt-3">
          <ErrorBoundary>
            <RealTimeTransactionMonitor />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="audit-trail" className="mt-3">
          <ErrorBoundary>
            <TransactionAuditTrail />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="feedback-bugs" className="mt-3">
          <ErrorBoundary>
            <FeedbackBugSystem />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionManagementTabs;
