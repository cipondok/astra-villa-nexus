import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DollarSign, Calculator, Activity, History, Bug } from "lucide-react";
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
    taxConfig: "Tax Configuration",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger 
            value="transactions" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">{t.transactions}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tax-config" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">{t.taxConfig}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="live-monitor" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t.liveMonitor}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="audit-trail" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{t.auditTrail}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="feedback-bugs" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <Bug className="h-4 w-4" />
            <span className="hidden sm:inline">{t.feedbackBugs}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <ErrorBoundary>
            <TransactionManagementHub />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="tax-config" className="mt-6">
          <ErrorBoundary>
            <IndonesianTaxConfiguration />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="live-monitor" className="mt-6">
          <ErrorBoundary>
            <RealTimeTransactionMonitor />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="audit-trail" className="mt-6">
          <ErrorBoundary>
            <TransactionAuditTrail />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="feedback-bugs" className="mt-6">
          <ErrorBoundary>
            <FeedbackBugSystem />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionManagementTabs;
