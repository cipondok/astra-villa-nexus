
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import AdminOverview from "./AdminOverview";
import UserManagement from "./UserManagement";
import PropertyManagement from "./PropertyManagement";
import CustomerServiceTicketMan from "./CustomerServiceTicketManagement";
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
import ContentManagement from "./ContentManagement";
import SearchFiltersManagement from "./SearchFiltersManagement";
import SystemSettings from "./SystemSettings";
import BillingManagement from "./BillingManagement";
import AstraTokenManagement from "./AstraTokenManagement";
import DatabaseTableManagement from "./DatabaseTableManagement";
import SecurityMonitoring from "./SecurityMonitoring";
import SystemReports from "./SystemReports";
import SEOSettings from "./SEOSettings";

interface AdminDashboardContentProps {
  isAdmin: boolean;
  setActiveTab: (tab: string) => void;
}

const UnauthorizedAccess = () => (
  <div className="text-center p-6">
    <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
    <p className="text-gray-600">You do not have permission to view this content.</p>
  </div>
);

const AdminDashboardContent = ({ isAdmin, setActiveTab }: AdminDashboardContentProps) => {
  return (
    <>
      <TabsContent value="overview">
        <AdminOverview isAdmin={isAdmin} setActiveTab={setActiveTab} />
      </TabsContent>

      <TabsContent value="seo-settings">
        <SEOSettings />
      </TabsContent>

      {/* Core Management */}
      <TabsContent value="user-management">
        <UserManagement />
      </TabsContent>

      <TabsContent value="property-management">
        <PropertyManagement />
      </TabsContent>

      {/* Customer Service */}
      <TabsContent value="customer-service">
        <CustomerServiceTicketMan />
      </TabsContent>

      <TabsContent value="contact-management">
        <ContactManagement />
      </TabsContent>

      {/* AI & Vendor Management */}
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

      {/* Analytics & Monitoring */}
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

      {/* Content & Settings */}
      <TabsContent value="content-management">
        <ContentManagement />
      </TabsContent>

      <TabsContent value="search-filters">
        <SearchFiltersManagement />
      </TabsContent>

      {/* System Settings */}
      <TabsContent value="system-settings">
        {isAdmin ? <SystemSettings /> : <UnauthorizedAccess />}
      </TabsContent>

      <TabsContent value="billing-management">
        <BillingManagement />
      </TabsContent>

      <TabsContent value="astra-tokens">
        <AstraTokenManagement />
      </TabsContent>

      {/* Technical */}
      <TabsContent value="database-management">
        {isAdmin ? <DatabaseTableManagement /> : <UnauthorizedAccess />}
      </TabsContent>

      <TabsContent value="security-monitoring">
        <SecurityMonitoring />
      </TabsContent>

      <TabsContent value="system-reports">
        <SystemReports />
      </TabsContent>

      {/* Support tab for non-admin users */}
      <TabsContent value="support">
        <div className="grid gap-4 md:grid-cols-2">
          <CustomerServiceTicketMan />
          <ContactManagement />
        </div>
      </TabsContent>
    </>
  );
};

export default AdminDashboardContent;
