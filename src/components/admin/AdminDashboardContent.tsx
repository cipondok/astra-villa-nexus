import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import AdminOverview from "./AdminOverview";
import UserManagement from "./UserManagement";
import PropertyManagement from "./PropertyManagement";
import CustomerServiceTicketManagement from "./CustomerServiceTicketManagement";
import ContactManagement from "./ContactManagement";
import ComprehensiveVendorManagement from "./ComprehensiveVendorManagement";
import VendorManagement from "./VendorManagement";
import VendorServiceCategoryManagement from "./VendorServiceCategoryManagement";
import AdminVendorServiceManagement from "./AdminVendorServiceManagement";
import AdminKYCManagement from "./AdminKYCManagement";
import AdminMembershipManagement from "./AdminMembershipManagement";
import WebTrafficAnalytics from "./WebTrafficAnalytics";
import AIBotManagement from "./AIBotManagement";
import FeedbackManagement from "./FeedbackManagement";
import DailyCheckInManagement from "./DailyCheckInManagement";
import EnhancedContentManagement from "./EnhancedContentManagement";
import SearchFiltersManagement from "./SearchFiltersManagement";
import SEOSettings from "./SEOSettings";
import SystemSettings from "./SystemSettings";
import BillingManagement from "./BillingManagement";
import AstraTokenManagement from "./AstraTokenManagement";
import AstraTokenAPIConfiguration from "./AstraTokenAPIConfiguration";
import DatabaseTableManagement from "./DatabaseTableManagement";
import SecurityMonitoring from "./SecurityMonitoring";
import SystemReports from "./SystemReports";

interface AdminDashboardContentProps {
  isAdmin: boolean;
  setActiveTab: (tab: string) => void;
}

const AdminDashboardContent = ({ isAdmin, setActiveTab }: AdminDashboardContentProps) => {
  return (
    <>
      <TabsContent value="overview">
        <AdminOverview />
      </TabsContent>

      <TabsContent value="user-management">
        <UserManagement />
      </TabsContent>

      <TabsContent value="property-management">
        <PropertyManagement />
      </TabsContent>

      <TabsContent value="customer-service">
        <CustomerServiceTicketManagement />
      </TabsContent>

      <TabsContent value="contact-management">
        <ContactManagement />
      </TabsContent>

      <TabsContent value="ai-vendor-management">
        <ComprehensiveVendorManagement />
      </TabsContent>

      <TabsContent value="vendor-management">
        <VendorManagement />
      </TabsContent>

      <TabsContent value="vendor-service-categories">
        <VendorServiceCategoryManagement />
      </TabsContent>

      <TabsContent value="vendor-services">
        <AdminVendorServiceManagement />
      </TabsContent>

      <TabsContent value="kyc-management">
        <AdminKYCManagement />
      </TabsContent>

      <TabsContent value="membership-management">
        <AdminMembershipManagement />
      </TabsContent>

      <TabsContent value="analytics">
        <WebTrafficAnalytics />
      </TabsContent>

      <TabsContent value="ai-bot-management">
        <AIBotManagement />
      </TabsContent>

      <TabsContent value="feedback-management">
        <FeedbackManagement />
      </TabsContent>

      <TabsContent value="daily-checkin">
        <DailyCheckInManagement />
      </TabsContent>

      <TabsContent value="content-management">
        <EnhancedContentManagement />
      </TabsContent>

      <TabsContent value="search-filters">
        <SearchFiltersManagement />
      </TabsContent>

      <TabsContent value="seo-settings">
        <SEOSettings />
      </TabsContent>

      <TabsContent value="system-settings">
        <SystemSettings />
      </TabsContent>

      <TabsContent value="billing-management">
        <BillingManagement />
      </TabsContent>

      <TabsContent value="astra-tokens">
        <AstraTokenManagement />
      </TabsContent>

      <TabsContent value="astra-token-api">
        <AstraTokenAPIConfiguration />
      </TabsContent>

      <TabsContent value="database-management">
        <DatabaseTableManagement />
      </TabsContent>

      <TabsContent value="security-monitoring">
        <SecurityMonitoring />
      </TabsContent>

      <TabsContent value="system-reports">
        <SystemReports />
      </TabsContent>
    </>
  );
};

export default AdminDashboardContent;
